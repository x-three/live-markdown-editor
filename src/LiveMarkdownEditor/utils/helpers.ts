import { EditorView, ViewUpdate } from '@codemirror/view';
import { Extension, StateEffect, Annotation, Compartment } from '@codemirror/state';
import { tagHighlighter, tags } from '@lezer/highlight';

export const markdownHighlighter = tagHighlighter([
    { tag: tags.strong, class: 'cm-strong' },
    { tag: tags.emphasis, class: 'cm-emphasis' },
    { tag: tags.strikethrough, class: 'cm-strike-through' },
    { tag: tags.link, class: 'cm-link' },
]);

const External = Annotation.define<boolean>();

export type OnChange = (value: string) => void;

export const getUpdateListener = (cb: OnChange) => {
    return EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged && !update.transactions.some((tr) => tr.annotation(External))) {
            const value = update.state.doc.toString();
            cb(value);
        }
    });
};

export const updateEditorValue = (view?: EditorView, newValue?: string): void => {
    if (view == null || newValue == null) {
        return;
    }

    const currentValue = view.state.doc.toString();

    if (newValue !== currentValue) {
        view.dispatch({
            changes: { from: 0, to: currentValue.length, insert: newValue },
            annotations: [External.of(true)],
        });
    }
};

export type ReadOnlySwitch = {
    extension: Extension;
    getUpdateEffect: (newValue: boolean) => StateEffect<unknown>;
};

export const getReadOnlySwitch = (initialValue: boolean): ReadOnlySwitch => {
    const compartment = new Compartment();

    return {
        extension: compartment.of(EditorView.editable.of(!initialValue)),

        getUpdateEffect: (newValue: boolean) => {
            return compartment.reconfigure(EditorView.editable.of(!newValue));
        },
    };
};
