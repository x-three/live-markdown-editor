import React, { useEffect, useRef, useCallback } from 'react';
import { EditorView, ViewUpdate, dropCursor, keymap } from '@codemirror/view';
import { Extension, Annotation } from '@codemirror/state';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { syntaxHighlighting } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { Strikethrough, Autolink } from '@lezer/markdown';
import { tagHighlighter, tags } from '@lezer/highlight';

import { liveMarkdownPlugin } from './plugins/liveMarkdown/liveMarkdown';
import { clickableLinks } from './plugins/clickableLinks';

const External = Annotation.define<boolean>();

const markdownHighlighter = tagHighlighter([
    { tag: tags.strong, class: 'cm-strong' },
    { tag: tags.emphasis, class: 'cm-emphasis' },
    { tag: tags.strikethrough, class: 'cm-strike-through' },
    { tag: tags.link, class: 'cm-link' },
]);

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

type OnChange = (value: string) => void;

const getUpdateListener = (cb: OnChange) => {
    return EditorView.updateListener.of((update: ViewUpdate) => {
        if (update.docChanged && !update.transactions.some((tr) => tr.annotation(External))) {
            const value = update.state.doc.toString();
            cb(value);
        }
    });
};

type Props = {
    editorRef?: React.MutableRefObject<EditorView | undefined>;
    className?: string;
    extensions?: Extension;
    value?: string;
    onChange?: OnChange;
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

export const LiveMarkdownEditor: React.FC<Props> = React.memo(
    ({ editorRef, className = '', extensions, value, onChange }) => {
        const editorLocalRef = useRef<EditorView>();

        useEffect(() => updateEditorValue(editorLocalRef.current, value), [value]);

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
            // Skip: value
            // eslint-disable-next-line react-hooks/exhaustive-deps
            [editorRef, extensions, onChange],
        );

        className = `cm-editor-wrapper ${className}`.trim();

        return <div ref={setWrapperRef} className={className} />;
    },
);
