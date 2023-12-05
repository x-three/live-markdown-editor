import { EditorView, Decoration, DecorationSet, keymap } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';

/** Decorator */
const underlineMark = Decoration.mark({ class: 'cm-underline' });

/** Styles */
const underlineTheme = EditorView.baseTheme({
    '.cm-underline': { textDecoration: 'underline 3px red' },
});

type UnderlineValue = {
    from: number;
    to: number;
};

/** Event */
const addUnderline = StateEffect.define<UnderlineValue>({
    map: (value, change) => ({ from: change.mapPos(value.from), to: change.mapPos(value.to) }),
});

/** State */
const underlineField = StateField.define<DecorationSet>({
    create() {
        return Decoration.none;
    },

    update(underlines, transaction) {
        underlines = underlines.map(transaction.changes);

        for (let effect of transaction.effects) {
            if (effect.is(addUnderline)) {
                underlines = underlines.update({
                    add: [underlineMark.range(effect.value.from, effect.value.to)],
                });
            }
        }

        return underlines;
    },

    provide: (field) => EditorView.decorations.from(field),
});

/** Handler */
const underlineSelection = (view: EditorView) => {
    const effects: StateEffect<unknown>[] = view.state.selection.ranges
        .filter((range) => !range.empty)
        .map(({ from, to }) => addUnderline.of({ from, to }));

    if (!effects.length) {
        return false;
    }

    if (!view.state.field(underlineField, false)) {
        effects.push(StateEffect.appendConfig.of([underlineField, underlineTheme]));
    }

    view.dispatch({ effects });

    return true;
};

/** Extension */
export const underlineKeymap = keymap.of([
    {
        key: 'Mod-h',
        preventDefault: true,
        run: underlineSelection,
    },
]);
