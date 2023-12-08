import { Range } from '@codemirror/state';
import { EditorView, Decoration } from '@codemirror/view';

import { SyntaxNode, NodeName, NodeNameTree } from '../../types';
import { ImageWidget, hiddenMarkDecoration } from './decorations';
import {
    LineClassNames,
    forEachLine,
    getHiddenChildrenDecorations,
    getMarkRangeWithOffset,
    getUrl,
    getUrlNode,
    markEachLine,
    markLine,
} from './utils';

type Decorator = (
    this: CustomNodeDecorator,
    node: SyntaxNode,
    selected: boolean,
    view: EditorView,
) => Range<Decoration>[];

class CustomNodeDecorator {
    protected decorator: Decorator;

    constructor(readonly nodeName: NodeName, decorator: Decorator) {
        this.decorator = decorator;
    }

    protected shouldDecorated(node: SyntaxNode, selected: boolean, view: EditorView): boolean {
        return node.name === this.nodeName;
    }

    getDecorations(node: SyntaxNode, selected: boolean, view: EditorView): Range<Decoration>[] {
        if (this.shouldDecorated(node, selected, view)) {
            return this.decorator(node, selected, view);
        }

        return [];
    }
}

class HiddenMarksDecorator extends CustomNodeDecorator {
    constructor(nodeName: NodeName, hiddenChildren: NodeName[], lineClassName?: string) {
        const hiddenChildrenSet = new Set(hiddenChildren);

        super(nodeName, (node, selected, view) => {
            const decorations: Range<Decoration>[] = [];
            selected = selected && view.hasFocus;

            if (lineClassName) {
                const className = selected ? `${lineClassName} cm-selected` : lineClassName;
                decorations.push(markLine(node.from, view, className));
            }

            if (!selected) {
                decorations.push(...getHiddenChildrenDecorations(node, hiddenChildrenSet));
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

        super(nodeName, (node, selected, view) => {
            const decorations: Range<Decoration>[] = [];
            selected = selected && view.hasFocus;

            if (lineClassNames) {
                decorations.push(
                    ...markEachLine(node.from, node.to, view, {
                        ...lineClassNames,
                        ...(selected && {
                            every: lineClassNames.every ? `${lineClassNames.every} cm-selected` : 'cm-selected',
                        }),
                    }),
                );
            }

            if (!selected) {
                decorations.push(...getChildrenDecorations(node, hiddenChildren));
            }

            return decorations;
        });
    }
}

class OrderedListDecorator extends MultilineDecorator {
    constructor(nodeName: NodeName, hiddenChildren: NodeNameTree, lineClassNames?: LineClassNames) {
        super(nodeName, hiddenChildren, lineClassNames);

        const multilineDecorator = this.decorator;

        this.decorator = (node, selected, view) => {
            const indexes: Record<number, string> = {};

            for (let child = node.firstChild; child != null; child = child.nextSibling) {
                if (child.name === 'ListItem' && child.firstChild.name === 'ListMark') {
                    const marker = child.firstChild;
                    const index = view.state.doc.sliceString(marker.from, marker.to);
                    const line = view.state.doc.lineAt(marker.from);

                    indexes[line.number] = index;
                }
            }

            const indexDecorations = forEachLine(node.from, node.to, view, (line) => {
                const decoration = Decoration.line({
                    attributes: { 'data-index': indexes[line.number] },
                });

                return decoration.range(line.from);
            });

            return [...indexDecorations, ...multilineDecorator.call(this, node, selected, view)];
        };
    }
}

export const decorators: Partial<Record<NodeName, CustomNodeDecorator>> = {
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
    InlineCode: new HiddenMarksDecorator('InlineCode', ['CodeMark']),
    HorizontalRule: new HiddenMarksDecorator('HorizontalRule', [], 'cm-horizontal-rule'),

    Image: new CustomNodeDecorator('Image', (node, selected, view) => {
        const urlNode = getUrlNode(node)!;
        const url = getUrl(urlNode, view)!;
        const widget = new ImageWidget(url);

        if (ImageWidget.failedLoadingSources.has(url)) {
            const decoration = Decoration.mark({ class: 'cm-link-error' });
            return [decoration.range(urlNode.from, urlNode.to)];
        }

        if (selected && view.hasFocus) {
            const decoration = Decoration.widget({ widget, side: 1 });
            return [decoration.range(node.to)];
        }

        const decoration = Decoration.replace({ widget });
        return [decoration.range(node.from, node.to)];
    }),

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

    OrderedList: new OrderedListDecorator(
        'OrderedList',
        {
            ListItem: {
                ListMark: true,
            },
        },
        {
            every: 'cm-orderedList-line',
            first: 'cm-orderedList-firstLine',
            last: 'cm-orderedList-lastLine',
        },
    ),
};
