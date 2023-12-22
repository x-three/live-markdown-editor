import React, { useEffect, useRef, useCallback } from 'react';
import { EditorView, dropCursor, keymap } from '@codemirror/view';
import { Extension } from '@codemirror/state';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { Strikethrough, Autolink } from '@lezer/markdown';

import { liveMarkdownPlugin } from './extensions/liveMarkdown/liveMarkdown';
import { clickableLinks } from './extensions/clickableLinks';
import { markdownHighlighter } from './extensions/markdownHighlighter';
import { getReadOnlySwitch } from './extensions/readOnly';
import { getPlaceholderSwitch } from './extensions/placeholder';
import { getSpellCheckSwitch } from './extensions/spellCheck';
import { OnChange, getUpdateListener, updateEditorValue } from './utils/helpers';
import { useSwitchExtension } from './hooks';

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
    placeholder?: string;
    spellcheck?: boolean;
};

export const LiveMarkdownEditor: React.FC<Props> = React.memo(
    ({
        editorRef,
        className = '',
        extensions,
        value,
        onChange,
        disabled = false,
        placeholder = '',
        spellcheck = false,
    }) => {
        const editorLocalRef = useRef<EditorView>();

        const readOnlyExtension = useSwitchExtension({
            editorRef: editorLocalRef,
            getSwitch: getReadOnlySwitch,
            value: disabled,
        });

        const placeholderExtension = useSwitchExtension({
            editorRef: editorLocalRef,
            getSwitch: getPlaceholderSwitch,
            value: placeholder,
        });

        const spellCheckExtension = useSwitchExtension({
            editorRef: editorLocalRef,
            getSwitch: getSpellCheckSwitch,
            value: spellcheck,
        });

        const setWrapperRef = useCallback(
            (target: HTMLDivElement): void => {
                if (editorLocalRef.current) {
                    if (editorRef) {
                        editorRef.current = undefined;
                    }
                    editorLocalRef.current.destroy();
                    editorLocalRef.current = undefined;
                }

                const viewExtensions = [
                    ...defaultExtensions,
                    readOnlyExtension,
                    placeholderExtension,
                    spellCheckExtension,
                ];

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
            // Skip: value, disabled, readOnlyExtension, placeholderExtension, spellCheckExtension
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [editorRef, extensions, onChange],
        );

        useEffect(() => updateEditorValue(editorLocalRef.current, value), [value]);

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
