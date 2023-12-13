import React, { useEffect, useRef, useState } from 'react';
import { EditorView, ViewUpdate } from '@codemirror/view';
import { Extension, Annotation } from '@codemirror/state';
import { dropCursor, keymap } from '@codemirror/view';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { Strikethrough, Autolink } from '@lezer/markdown';

import { liveMarkdownPlugin } from './plugins/liveMarkdown/liveMarkdown';
import { clickableLinks } from './plugins/clickableLinks';

const External = Annotation.define<boolean>();

const defaultExtensions = [
    EditorView.lineWrapping,
    history(),
    dropCursor(),
    keymap.of([...defaultKeymap, ...historyKeymap]),

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
    className?: string;
    extensions: Extension;
    value?: string;
    onChange?: OnChange;
};

export const LiveMarkdownEditor: React.FC<Props> = ({ className = '', extensions, value, onChange }) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [view, setView] = useState<EditorView>();

    useEffect(() => {
        if (!wrapperRef.current) {
            return;
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
            parent: wrapperRef.current,
        });

        setView(view);

        return () => {
            view.destroy();
            setView(undefined);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [extensions, onChange]);

    useEffect(() => {
        if (value == null || view == null) {
            return;
        }

        const currentValue = view.state.doc.toString();

        if (value !== currentValue) {
            view.dispatch({
                changes: { from: 0, to: currentValue.length, insert: value },
                annotations: [External.of(true)],
            });
        }
    }, [value, view]);

    return <div className={`cm-editor-wrapper ${className}`} ref={wrapperRef} />;
};
