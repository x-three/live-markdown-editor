import { Range } from '@codemirror/state';
import { EditorView, Decoration } from '@codemirror/view';

import { SyntaxNode, NodeName, NodeNameTree, InlineWidget, InlineWidgetCallback } from '../../types';
import { /* ImageWidget, */ hiddenMarkDecoration, CaretHolder, CustomInlineWidget } from './decorations';
import {
    LineClassNames,
    forEachLine,
    hideChildren,
    getMarkRangeWithOffset,
    // getUrl,
    // getUrlNode,
    markEachLine,
    markLine,
} from './utils';

const focusedClassName = 'cm-focused';

type DecoratorParams = {
    node: SyntaxNode;
    focused: boolean;
    view: EditorView;
};

type Decorator = (this: CustomNodeDecorator, params: DecoratorParams) => Range<Decoration>[];

class CustomNodeDecorator {
    protected decorator: Decorator;

    constructor(readonly nodeName: NodeName, decorator: Decorator) {
        this.decorator = decorator;
    }

    protected shouldDecorated({ node }: DecoratorParams): boolean {
        return node.name === this.nodeName;
    }

    getDecorations(params: DecoratorParams): Range<Decoration>[] {
        if (this.shouldDecorated(params)) {
            return this.decorator(params);
        }

        return [];
    }
}

class HiddenMarksDecorator extends CustomNodeDecorator {
    constructor(nodeName: NodeName, hiddenChildren: NodeName[], lineClassName?: string) {
        const hiddenChildrenSet = new Set(hiddenChildren);

        super(nodeName, ({ node, focused, view }) => {
            const decorations: Range<Decoration>[] = [];

            if (lineClassName) {
                const className = focused ? `${lineClassName} ${focusedClassName}` : lineClassName;
                decorations.push(markLine(node.from, view, className));
            }

            if (!focused) {
                decorations.push(...hideChildren(node, hiddenChildrenSet));
            }

            return decorations;
        });
    }
}

class HorizontalRuleDecorator extends CustomNodeDecorator {
    constructor() {
        const lineClassName = 'cm-horizontal-rule';

        super('HorizontalRule', ({ node, focused, view }) => {
            const decorations: Range<Decoration>[] = [];
            const className = focused ? `${lineClassName} ${focusedClassName}` : lineClassName;
            decorations.push(markLine(node.from, view, className));

            if (!focused) {
                const widget = new CaretHolder();
                decorations.push(Decoration.replace({ widget }).range(node.from, node.to));
            }

            return decorations;
        });
    }
}

class MultilineDecorator extends CustomNodeDecorator {
    constructor(nodeName: NodeName, hiddenChildren: NodeNameTree, lineClassNames?: LineClassNames) {
        const getChildrenDecorations = (node: SyntaxNode, tree: NodeNameTree): Range<Decoration>[] => {
            const decorations: Range<Decoration>[] = [];

            for (let child = node.firstChild; child != null; child = child.nextSibling) {
                const subtree = tree[child.name];

                if (subtree) {
                    if (subtree === true) {
                        const { from, to } = getMarkRangeWithOffset(child);
                        decorations.push(hiddenMarkDecoration.range(from, to));
                    } else {
                        decorations.push(...getChildrenDecorations(child, subtree));
                    }
                }
            }

            return decorations;
        };

        super(nodeName, ({ node, focused, view }) => {
            const decorations: Range<Decoration>[] = [];

            if (lineClassNames) {
                decorations.push(
                    ...markEachLine(node.from, node.to, view, {
                        ...lineClassNames,
                        ...(focused && {
                            every: lineClassNames.every
                                ? `${lineClassNames.every} ${focusedClassName}`
                                : focusedClassName,
                        }),
                    }),
                );
            }

            if (!focused) {
                decorations.push(...getChildrenDecorations(node, hiddenChildren));
            }

            return decorations;
        });
    }
}

class InlineCodeDecorator extends HiddenMarksDecorator {
    constructor() {
        super('InlineCode', ['CodeMark']);

        const hiddenMarksDecorator = this.decorator;

        this.decorator = (params) => {
            const decoration = Decoration.mark({ class: 'cm-inline-code' });
            const { from, to } = params.node;

            return [
                decoration.range(from, to), //
                ...hiddenMarksDecorator.call(this, params),
            ];
        };
    }
}

class FencedCodeDecorator extends CustomNodeDecorator {
    constructor() {
        super('FencedCode', ({ node, focused, view }) => {
            const decorations: Range<Decoration>[] = [];
            const commonClassNames = focused ? focusedClassName : '';
            const commonAttributes = { spellcheck: 'false' };

            const firstLine = view.state.doc.lineAt(node.from);
            const lastLine = view.state.doc.lineAt(node.to);
            const maxLineNumber = lastLine.number - firstLine.number - 1;
            const maxDigits = String(maxLineNumber).length;

            decorations.push(
                ...forEachLine(node.from, node.to, view, (line, index, total) => {
                    let decoration: Decoration;

                    if (index === 0) {
                        decoration = Decoration.line({
                            class: `cm-fencedCode-firstLine ${commonClassNames}`,
                            attributes: commonAttributes,
                        });
                    } else if (index === total - 1) {
                        decoration = Decoration.line({
                            class: `cm-fencedCode-lastLine ${commonClassNames}`,
                            attributes: commonAttributes,
                        });
                    } else {
                        decoration = Decoration.line({
                            class: `cm-fencedCode-middleLine ${commonClassNames}`,
                            attributes: {
                                ...commonAttributes,
                                'data-index': String(index),
                                'data-max-digits': String(maxDigits),
                            },
                        });
                    }

                    return decoration.range(line.from);
                }),
            );

            return decorations;
        });
    }
}

class OrderedListDecorator extends MultilineDecorator {
    constructor(lineClassNames?: LineClassNames) {
        super(
            'OrderedList',
            {
                ListItem: {
                    ListMark: true,
                },
            },
            lineClassNames,
        );

        const multilineDecorator = this.decorator;

        this.decorator = (params) => {
            const { node, view } = params;
            const indexes: Record<number, string> = {};

            for (let child = node.firstChild; child != null; child = child.nextSibling) {
                if (child.name === 'ListItem' && child.firstChild.name === 'ListMark') {
                    const marker = child.firstChild;
                    const index = view.state.doc.sliceString(marker.from, marker.to);
                    const line = view.state.doc.lineAt(marker.from);

                    indexes[line.number] = index;
                }
            }

            const maxDigits = Object.values(indexes).reduce(
                (maxDigits, strIndex) => Math.max(maxDigits, strIndex.length - 1),
                0,
            );

            const indexDecorations = forEachLine(node.from, node.to, view, (line) => {
                const decoration = Decoration.line({
                    attributes: {
                        'data-index': indexes[line.number],
                        'data-max-digits': String(maxDigits),
                    },
                });

                return decoration.range(line.from);
            });

            return [
                ...indexDecorations, //
                ...multilineDecorator.call(this, params),
            ];
        };
    }
}

class InlineWidgetDecorator extends CustomNodeDecorator {
    constructor(nodeName: string, cb: InlineWidgetCallback) {
        super(nodeName as any, ({ node, focused, view }) => {
            if (!focused) {
                const nodeText = view.state.doc.sliceString(node.from, node.to);
                const widget = new CustomInlineWidget(node.name, nodeText, cb);
                const decoration = Decoration.replace({ widget });

                return [decoration.range(node.from, node.to)];
            }

            return [];
        });
    }
}

export type Decorators = Partial<Record<NodeName, CustomNodeDecorator>>;

const defaultDecorators: Decorators = {
    ATXHeading1: new HiddenMarksDecorator('ATXHeading1', ['HeaderMark'], 'cm-heading cm-heading-1'),
    ATXHeading2: new HiddenMarksDecorator('ATXHeading2', ['HeaderMark'], 'cm-heading cm-heading-2'),
    ATXHeading3: new HiddenMarksDecorator('ATXHeading3', ['HeaderMark'], 'cm-heading cm-heading-3'),
    ATXHeading4: new HiddenMarksDecorator('ATXHeading4', ['HeaderMark'], 'cm-heading cm-heading-4'),
    ATXHeading5: new HiddenMarksDecorator('ATXHeading5', ['HeaderMark'], 'cm-heading cm-heading-5'),
    ATXHeading6: new HiddenMarksDecorator('ATXHeading6', ['HeaderMark'], 'cm-heading cm-heading-6'),
    Emphasis: new HiddenMarksDecorator('Emphasis', ['EmphasisMark']),
    StrongEmphasis: new HiddenMarksDecorator('StrongEmphasis', ['EmphasisMark']),
    Strikethrough: new HiddenMarksDecorator('Strikethrough', ['StrikethroughMark']),
    Link: new HiddenMarksDecorator('Link', ['LinkMark', 'URL']),
    HorizontalRule: new HorizontalRuleDecorator(),
    InlineCode: new InlineCodeDecorator(),
    FencedCode: new FencedCodeDecorator(),

    /* Image: new CustomNodeDecorator('Image', ({ node, focused, view }) => {
        const urlNode = getUrlNode(node)!;
        const url = getUrl(urlNode, view)!;
        const widget = new ImageWidget(url);

        if (ImageWidget.failedLoadingSources.has(url)) {
            const decoration = Decoration.mark({ class: 'cm-link-error' });
            return [decoration.range(urlNode.from, urlNode.to)];
        }

        if (focused) {
            const decoration = Decoration.widget({ widget, side: 1 });
            return [decoration.range(node.to)];
        }

        const decoration = Decoration.replace({ widget });
        return [decoration.range(node.from, node.to)];
    }), */

    Blockquote: new MultilineDecorator(
        'Blockquote',
        {
            QuoteMark: true,
            Paragraph: {
                QuoteMark: true,
            },
        },
        {
            every: 'cm-blockquote-line',
            first: 'cm-blockquote-firstLine',
            last: 'cm-blockquote-lastLine',
        },
    ),

    BulletList: new MultilineDecorator(
        'BulletList',
        {
            ListItem: {
                ListMark: true,
            },
        },
        {
            every: 'cm-bulletList-line',
            first: 'cm-bulletList-firstLine',
            last: 'cm-bulletList-lastLine',
        },
    ),

    OrderedList: new OrderedListDecorator({
        every: 'cm-orderedList-line',
        first: 'cm-orderedList-firstLine',
        last: 'cm-orderedList-lastLine',
    }),
};

export type InlineWidgetsParam = Pick<InlineWidget, 'name' | 'cb'>[];

export const getDecorators = (inlineWidgets: InlineWidgetsParam = []): Decorators => {
    const inlineWidgetDecorators = Object.fromEntries(
        inlineWidgets.map(({ name, cb }) => {
            return [name, new InlineWidgetDecorator(name, cb)];
        }),
    );

    return { ...defaultDecorators, ...inlineWidgetDecorators };
};
