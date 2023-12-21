import React, { useEffect, useRef, useCallback } from 'react';
import { EditorView, dropCursor, keymap } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { Strikethrough, Autolink } from '@lezer/markdown';

import { liveMarkdownPlugin } from './plugins/liveMarkdown/liveMarkdown';
import { clickableLinks } from './plugins/clickableLinks';
import {
    OnChange,
    getUpdateListener,
    markdownHighlighter,
    updateEditorValue,
    getReadOnlySwitch,
    ReadOnlySwitch,
} from './utils/helpers';

const defaultExtensions = [
    EditorView.lineWrapping,
    history(),
    dropCursor(),
    keymap.of([...defaultKeymap, ...historyKeymap]),

    syntaxHighlighting(markdownHighlighter),
    markdown({
        codeLanguages: languages,
        extensions: [Strikethrough, Autolink],
    }),
    liveMarkdownPlugin,
    clickableLinks,
];

type Props = {
    editorRef?: React.MutableRefObject<EditorView | undefined>;
    className?: string;
    extensions?: Extension;
    value?: string;
    onChange?: OnChange;
    disabled?: boolean;
};

export const LiveMarkdownEditor: React.FC<Props> = React.memo(
    ({ editorRef, className = '', extensions, value, onChange, disabled = false }) => {
        const editorLocalRef = useRef<EditorView>();
        const readOnlySwitchRef = useRef<ReadOnlySwitch>();

        const setWrapperRef = useCallback(
            (target: HTMLDivElement): void => {
                if (editorLocalRef.current) {
                    if (editorRef) {
                        editorRef.current = undefined;
                    }
                    editorLocalRef.current.destroy();
                    editorLocalRef.current = undefined;
                }

                const viewExtensions = [...defaultExtensions];

                if (extensions) {
                    if (extensions instanceof Array) {
                        viewExtensions.push(...extensions);
                    } else {
                        viewExtensions.push(extensions);
                    }
                }

                if (onChange) {
                    viewExtensions.push(getUpdateListener(onChange));
                }

                readOnlySwitchRef.current = getReadOnlySwitch(disabled);
                viewExtensions.push(readOnlySwitchRef.current);

                const view = new EditorView({
                    doc: value,
                    extensions: viewExtensions,
                    parent: target,
                });

                if (editorRef) {
                    editorRef.current = view;
                }
                editorLocalRef.current = view;
            },
            // Skip: value, disabled
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [editorRef, extensions, onChange],
        );

        useEffect(() => updateEditorValue(editorLocalRef.current, value), [value]);

        useEffect(() => {
            if (editorLocalRef.current && readOnlySwitchRef.current) {
                editorLocalRef.current.dispatch({
                    effects: readOnlySwitchRef.current.getUpdateEffect(disabled),
                });
            }
        }, [disabled]);

        let wrapperClassName = `cm-editor-wrapper`;
        if (disabled) {
            wrapperClassName += ' cm-disabled';
        }
        if (className) {
            wrapperClassName += ` ${className}`;
        }

        return <div ref={setWrapperRef} className={wrapperClassName} />;
    },
);
