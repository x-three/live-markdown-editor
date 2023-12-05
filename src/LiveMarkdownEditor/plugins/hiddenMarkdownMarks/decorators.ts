import { Range } from '@codemirror/state';
import { EditorView, Decoration } from '@codemirror/view';
import { SyntaxNode } from '@lezer/common/dist';

import { NodeName } from '../../types';
import { HorizontalRuleWidget, ImageWidget, hiddenMarkDecoration } from './decorations';
import { getMarkRangeWithOffset, getUrl, getUrlNode } from './utils';

type Decorator = (node: SyntaxNode, selected: boolean, view: EditorView) => Range<Decoration>[];

class NodeDecorator {
    private readonly decorator: Decorator;

    constructor(nodeName: NodeName, childrenForHiding: NodeName[]);
    constructor(nodeName: NodeName, decorator: Decorator);

    constructor(readonly nodeName: NodeName, decorator: NodeName[] | Decorator) {
        this.decorator = typeof decorator === 'function' ? decorator : this.createDecoratorForHiding(decorator);
    }

    private createDecoratorForHiding(childrenForHiding: NodeName[]): Decorator {
        const childrenSet = new Set(childrenForHiding);

        return (node, selected, view) => {
            const decorations: Range<Decoration>[] = [];

            if ((node.name === this.nodeName && childrenSet.size > 0 && !selected) || !view.hasFocus) {
                for (let childNode = node.firstChild; childNode != null; childNode = childNode.nextSibling) {
                    if (childrenSet.has(childNode.name as NodeName)) {
                        const { from, to } = getMarkRangeWithOffset(childNode);
                        decorations.push(hiddenMarkDecoration.range(from, to));
                    }
                }
            }

            return decorations;
        };
    }

    getDecorations(node: SyntaxNode, selected: boolean, view: EditorView): Range<Decoration>[] {
        return this.decorator(node, selected, view);
    }
}

export const decorators: Partial<Record<NodeName, NodeDecorator>> = {
    ATXHeading1: new NodeDecorator('ATXHeading1', ['HeaderMark']),
    ATXHeading2: new NodeDecorator('ATXHeading2', ['HeaderMark']),
    ATXHeading3: new NodeDecorator('ATXHeading3', ['HeaderMark']),
    ATXHeading4: new NodeDecorator('ATXHeading4', ['HeaderMark']),
    ATXHeading5: new NodeDecorator('ATXHeading5', ['HeaderMark']),
    ATXHeading6: new NodeDecorator('ATXHeading6', ['HeaderMark']),
    Emphasis: new NodeDecorator('Emphasis', ['EmphasisMark']),
    StrongEmphasis: new NodeDecorator('StrongEmphasis', ['EmphasisMark']),
    Strikethrough: new NodeDecorator('Strikethrough', ['StrikethroughMark']),
    Link: new NodeDecorator('Link', ['LinkMark', 'URL']),
    InlineCode: new NodeDecorator('InlineCode', ['CodeMark']),

    Image: new NodeDecorator('Image', (node, selected, view) => {
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

    HorizontalRule: new NodeDecorator('HorizontalRule', (node, selected, view) => {
        if (!(selected && view.hasFocus)) {
            const widget = new HorizontalRuleWidget();
            const decoration = Decoration.replace({ widget });
            return [decoration.range(node.from, node.to)];
        }

        return [];
    }),
};
