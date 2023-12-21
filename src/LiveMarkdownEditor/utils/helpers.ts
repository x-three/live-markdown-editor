import { EditorView, ViewUpdate } from '@codemirror/view';
import { Annotation } from '@codemirror/state';

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
