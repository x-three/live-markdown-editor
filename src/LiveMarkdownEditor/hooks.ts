import { useEffect, useRef } from 'react';
import { EditorView } from 'codemirror';

import { SwitchExtensionCreator, SwitchExtension } from './types';

type Props<T> = {
    editorRef: React.MutableRefObject<EditorView | undefined>;
    getSwitch: SwitchExtensionCreator<T>;
    value: T;
};

export const useSwitchExtension = <T>({ editorRef, getSwitch, value }: Props<T>): SwitchExtension<T>['extension'] => {
    const switchRef = useRef<SwitchExtension<T>>();

    if (!switchRef.current) {
        switchRef.current = getSwitch(value);
    }

    useEffect(() => {
        if (editorRef.current && switchRef.current) {
            editorRef.current.dispatch({
                effects: switchRef.current.getUpdateEffect(value),
            });
        }
        // Skip: editorRef
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [value]);

    return switchRef.current.extension;
};
