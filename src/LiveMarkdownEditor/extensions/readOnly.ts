import { EditorView } from '@codemirror/view';
import { Compartment } from '@codemirror/state';

import { SwitchExtensionCreator } from '../types';

export const getReadOnlySwitch: SwitchExtensionCreator<boolean> = (initialValue) => {
    const compartment = new Compartment();

    return {
        extension: compartment.of(EditorView.editable.of(!initialValue)),

        getUpdateEffect: (newValue) => compartment.reconfigure(EditorView.editable.of(!newValue)),
    };
};
