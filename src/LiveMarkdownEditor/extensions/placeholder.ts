import { placeholder } from '@codemirror/view';
import { Compartment } from '@codemirror/state';

import { SwitchExtensionCreator } from '../types';

export const getPlaceholderSwitch: SwitchExtensionCreator<string> = (initialValue) => {
    const compartment = new Compartment();

    return {
        extension: compartment.of(placeholder(initialValue)),

        getUpdateEffect: (newValue) => compartment.reconfigure(placeholder(newValue)),
    };
};
