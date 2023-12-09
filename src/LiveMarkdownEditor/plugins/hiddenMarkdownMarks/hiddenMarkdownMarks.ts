import { Range } from '@codemirror/state';
import { EditorView, Decoration, ViewUpdate, ViewPlugin, DecorationSet } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNodeRef } from '@lezer/common';

import { SyntaxNode } from '../../types';
import { decorators } from './decorators';
import { ImageWidget } from './decorations';

const hiddenMarkTheme = EditorView.baseTheme({
    '.cm-hidden-mark': { display: 'none' },
});

class HidingMarkdownMarksPlugin {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.getDecorations(view);
    }

    update(update: ViewUpdate): void {
        if (
            update.selectionSet ||
            update.focusChanged ||
            update.viewportChanged ||
            update.transactions.some((transaction) =>
                transaction.effects.some((effect) => effect.is(ImageWidget.loadingStateChanged)),
            )
        ) {
            this.decorations = this.getDecorations(update.view);
        }
    }

    private getDecorations(view: EditorView): DecorationSet {
        const decoratedNodesMap = new Map<string, { node: SyntaxNode; selected: boolean }>();

        const getNodeKey = (node: SyntaxNodeRef) => `${node.from}-${node.to}-${node.name}`;

        view.visibleRanges.forEach(({ from, to }) => {
            syntaxTree(view.state).iterate({
                from,
                to,
                enter: (node) => {
                    if (node.name in decorators) {
                        decoratedNodesMap.set(getNodeKey(node), {
                            node: node.node as SyntaxNode,
                            selected: false,
                        });
                    }
                },
            });
        });

        view.state.selection.ranges.forEach(({ from, to }) => {
            syntaxTree(view.state).iterate({
                from,
                to,
                enter: (node) => {
                    const item = decoratedNodesMap.get(getNodeKey(node));

                    if (item) {
                        item.selected = true;
                    }
                },
            });
        });

        const allDecorations: Range<Decoration>[] = [];

        for (const item of decoratedNodesMap.values()) {
            const decorator = decorators[item.node.name];
            const nodeDecorations = decorator!.getDecorations(item.node, item.selected, view);
            allDecorations.push(...nodeDecorations);
        }

        allDecorations.sort((a, b) => {
            const from = a.from - b.from;
            return from !== 0 ? from : a.value.startSide - b.value.startSide;
        });

        return Decoration.set(allDecorations);
    }
}

export const hiddenMarkdownMarks = ViewPlugin.fromClass(HidingMarkdownMarksPlugin, {
    decorations: (value) => value.decorations,
    provide: () => [hiddenMarkTheme],
});
