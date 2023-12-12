import { Range, StateEffect } from '@codemirror/state';
import { EditorView, Decoration, ViewUpdate, ViewPlugin, DecorationSet } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import { SyntaxNodeRef } from '@lezer/common';

import { SyntaxNode } from '../../types';
import { decorators } from './decorators';
import { ImageWidget, hiddenMarkClassName } from './decorations';

type DecoratedNodesMap = Map<string, { node: SyntaxNode; focused: boolean }>;

class LiveMarkdownPlugin {
    private static needUpdateEffect = StateEffect.define();

    /** Находимся в процессе выделения текста мышкой. Не меняем отображение элементов, чтобы текст не прыгал по экрану. */
    private selecting = false;

    private prevDecoratedNodesMap: DecoratedNodesMap | null = null;

    decorations: DecorationSet;

    constructor(readonly view: EditorView) {
        this.decorations = this.getDecorations(view);
        window.addEventListener('mousedown', this.startSelection, true);
    }

    destroy(): void {
        window.removeEventListener('mousedown', this.startSelection, true);
    }

    private startSelection = (ev: MouseEvent): void => {
        if (ev.button === 0) {
            this.selecting = true;
            window.addEventListener('mouseup', this.stopSelection, true);
        }
    };

    private stopSelection = (): void => {
        this.selecting = false;
        window.removeEventListener('mouseup', this.stopSelection, true);

        this.view.dispatch({
            effects: LiveMarkdownPlugin.needUpdateEffect.of(null),
        });
    };

    update(update: ViewUpdate): void {
        if (
            update.selectionSet ||
            update.focusChanged ||
            update.viewportChanged ||
            update.transactions.some((transaction) => {
                return transaction.effects.some((effect) => {
                    return effect.is(ImageWidget.loadingStateChanged) || effect.is(LiveMarkdownPlugin.needUpdateEffect);
                });
            })
        ) {
            this.decorations = this.getDecorations(update.view);
        }
    }

    private getDecorations(view: EditorView): DecorationSet {
        const decoratedNodesMap: DecoratedNodesMap = new Map();

        const getNodeKey = (node: SyntaxNodeRef) => `${node.from}-${node.to}-${node.name}`;

        view.visibleRanges.forEach(({ from, to }) => {
            syntaxTree(view.state).iterate({
                from,
                to,
                enter: (node) => {
                    if (node.name in decorators) {
                        decoratedNodesMap.set(getNodeKey(node), {
                            node: node.node as SyntaxNode,
                            focused: false,
                        });
                    }
                },
            });
        });

        if (this.selecting && this.prevDecoratedNodesMap) {
            for (const [key, prevItem] of this.prevDecoratedNodesMap.entries()) {
                const curItem = decoratedNodesMap.get(key);

                if (curItem && prevItem.focused) {
                    curItem.focused = prevItem.focused;
                }
            }
        } else {
            view.state.selection.ranges.forEach(({ from, to }) => {
                syntaxTree(view.state).iterate({
                    from,
                    to,
                    enter: (node) => {
                        const item = decoratedNodesMap.get(getNodeKey(node));

                        if (item) {
                            item.focused = true;
                        }
                    },
                });
            });
        }

        const allDecorations: Range<Decoration>[] = [];

        for (const item of decoratedNodesMap.values()) {
            const decorator = decorators[item.node.name];
            const nodeDecorations = decorator!.getDecorations({
                node: item.node,
                focused: item.focused && view.hasFocus,
                view,
            });
            allDecorations.push(...nodeDecorations);
        }

        allDecorations.sort((a, b) => {
            const from = a.from - b.from;
            return from !== 0 ? from : a.value.startSide - b.value.startSide;
        });

        if (!this.selecting) {
            this.prevDecoratedNodesMap = decoratedNodesMap;
        }

        return Decoration.set(allDecorations);
    }
}

const hiddenMarkTheme = EditorView.baseTheme({
    [hiddenMarkClassName]: { display: 'none' },
});

export const liveMarkdownPlugin = ViewPlugin.fromClass(LiveMarkdownPlugin, {
    decorations: (value) => value.decorations,
    provide: () => [hiddenMarkTheme],
});
