import { Range } from '@codemirror/state';
import { EditorView, Decoration, ViewUpdate, ViewPlugin, DecorationSet } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

import { NodeName, SyntaxNode } from '../types';
import { isMac, isMobile } from '../utils/env';

class ClickableLinksPlugin {
    private static readonly className = 'cm-clickable-link';

    private readonly hint: string;

    decorations: DecorationSet;

    constructor(readonly view: EditorView) {
        this.hint = `${view.state.phrase('Follow link')} (${isMac ? 'Cmd' : 'Ctrl'} + Click)`;
        this.decorations = this.getDecorations(view);

        if (!isMobile) {
            view.dom.addEventListener('click', this.handleClick, true);
        }
    }

    destroy(): void {
        this.view.dom.removeEventListener('click', this.handleClick, true);
    }

    update(update: ViewUpdate): void {
        if (update.docChanged) {
            this.decorations = this.getDecorations(update.view);
        }
    }

    private getDecorations(view: EditorView): DecorationSet {
        const decorations: Range<Decoration>[] = [];

        view.visibleRanges.forEach(({ from, to }) => {
            syntaxTree(view.state).iterate({
                from,
                to,
                enter: (node) => {
                    if ((node.name as NodeName) === 'URL') {
                        const url = view.state.doc.sliceString(node.from, node.to);
                        const parent = node.node.parent as SyntaxNode | null;
                        const { from, to } = parent?.name === 'Link' ? parent : node;

                        const link = Decoration.mark({
                            class: ClickableLinksPlugin.className,
                            tagName: 'a',
                            attributes: {
                                href: url,
                                ...(!isMobile && {
                                    title: this.hint,
                                }),
                            },
                        });

                        decorations.push(link.range(from, to));
                    }
                },
            });
        });

        return Decoration.set(decorations);
    }

    private handleClick = (ev: MouseEvent): void => {
        const selector = `a.${ClickableLinksPlugin.className}`;
        const link = (ev.target as HTMLElement).closest(selector) as HTMLAnchorElement | null;

        if (link && ((isMac && ev.metaKey) || (!isMac && ev.ctrlKey))) {
            window.open(link.href, '_blank');
            ev.preventDefault();
        }
    };
}

export const clickableLinks = ViewPlugin.fromClass(ClickableLinksPlugin, {
    decorations: (value) => value.decorations,
});
