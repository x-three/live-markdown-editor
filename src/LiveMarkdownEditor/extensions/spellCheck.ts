import { EditorView } from '@codemirror/view';
import { Compartment } from '@codemirror/state';

import { SwitchExtensionCreator } from '../types';

export const getSpellCheckSwitch: SwitchExtensionCreator<boolean> = (initialValue) => {
    const compartment = new Compartment();

    return {
        extension: compartment.of(EditorView.contentAttributes.of({ spellcheck: String(initialValue) })),

        getUpdateEffect: (newValue) =>
            compartment.reconfigure(EditorView.contentAttributes.of({ spellcheck: String(newValue) })),
    };
};
