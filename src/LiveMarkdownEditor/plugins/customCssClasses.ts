import { Range } from '@codemirror/state';
import { EditorView, Decoration, ViewUpdate, ViewPlugin, DecorationSet } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

import { NodeName } from '../types';

const inlineCodeMark = Decoration.mark({ class: 'cm-inline-code' });

class CustomCssClassesPlugin {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.getDecorations(view);
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
                    switch (node.name as NodeName) {
                        case 'InlineCode':
                            decorations.push(inlineCodeMark.range(node.from, node.to));
                            break;
                        default:
                            break;
                    }
                },
            });
        });

        return Decoration.set(decorations);
    }
}

export const customCssClasses = ViewPlugin.fromClass(CustomCssClassesPlugin, {
    decorations: (value) => value.decorations,
});
