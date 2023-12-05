import React, { useEffect, useRef } from 'react';
import { EditorView } from 'codemirror';
import { highlightSpecialChars, dropCursor, drawSelection, highlightActiveLine, keymap } from '@codemirror/view';
import { syntaxHighlighting, bracketMatching } from '@codemirror/language';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { highlightSelectionMatches } from '@codemirror/search';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { Strikethrough, Autolink } from '@lezer/markdown';
import { tagHighlighter, tags, Highlighter } from '@lezer/highlight';

import { hiddenMarkdownMarks } from './plugins/hiddenMarkdownMarks/hiddenMarkdownMarks';
import { clickableLinks } from './plugins/clickableLinks';
import { customCssClasses } from './plugins/customCssClasses';
import { sampleMarkdownText } from './debug/sampleMarkdownText';
import './markdown.css';

const additionalClassHighlighter = tagHighlighter([
    { tag: tags.heading1, class: 'cm-heading cm-heading-1' },
    { tag: tags.heading2, class: 'cm-heading cm-heading-2' },
    { tag: tags.heading3, class: 'cm-heading cm-heading-3' },
    { tag: tags.heading4, class: 'cm-heading cm-heading-4' },
    { tag: tags.heading5, class: 'cm-heading cm-heading-5' },
    { tag: tags.heading6, class: 'cm-heading cm-heading-6' },
    { tag: tags.strong, class: 'cm-strong' },
    { tag: tags.emphasis, class: 'cm-emphasis' },
    { tag: tags.strikethrough, class: 'cm-strike-through' },
    { tag: tags.link, class: 'cm-link' },
    { tag: tags.contentSeparator, class: 'cm-horizontal-rule' },
]);

const testClassHighlighter: Highlighter = (() => {
    const tagsMap = Object.keys(tags).map((tagName) => ({ tag: (tags as any)[tagName], class: `cm-test-${tagName}` }));
    return tagHighlighter(tagsMap);
})();

const extensions = [
    EditorView.lineWrapping,
    history(),
    dropCursor(),
    // todo
    // drawSelection(),
    bracketMatching(),
    syntaxHighlighting(testClassHighlighter),
    syntaxHighlighting(additionalClassHighlighter),
    highlightSpecialChars(),
    highlightActiveLine(),
    highlightSelectionMatches(),
    keymap.of([...defaultKeymap, ...historyKeymap]),

    markdown({
        codeLanguages: languages,
        extensions: [Strikethrough, Autolink],
    }),
    hiddenMarkdownMarks,
    clickableLinks,
    customCssClasses,
];

export const LiveMarkdownEditor: React.FC = () => {
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!wrapperRef.current) {
            return;
        }

        const editor = new EditorView({
            doc: sampleMarkdownText,
            extensions,
            parent: wrapperRef.current,
        });

        return () => {
            editor.destroy();
        };
    }, []);

    return <div ref={wrapperRef} />;
};
