import React, { useEffect, useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { highlightSpecialChars, dropCursor, drawSelection, highlightActiveLine, keymap } from '@codemirror/view';
import { syntaxHighlighting, bracketMatching } from '@codemirror/language';
import { history, defaultKeymap, historyKeymap } from '@codemirror/commands';
import { highlightSelectionMatches } from '@codemirror/search';
import { markdown } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { Strikethrough, Autolink } from '@lezer/markdown';
import { tagHighlighter, tags, Highlighter } from '@lezer/highlight';

import { liveMarkdownPlugin } from './plugins/liveMarkdown/liveMarkdown';
import { clickableLinks } from './plugins/clickableLinks';
import { sampleMarkdownText } from './debug/sampleMarkdownText';
import './markdown.css';

const additionalClassHighlighter = tagHighlighter([
    // markdown
    { tag: tags.strong, class: 'cm-strong' },
    { tag: tags.emphasis, class: 'cm-emphasis' },
    { tag: tags.strikethrough, class: 'cm-strike-through' },
    { tag: tags.link, class: 'cm-link' },
    // json
    { tag: tags.propertyName, class: 'hljs-attr' },
    { tag: tags.string, class: 'hljs-string' },
    { tag: tags.number, class: 'hljs-number' },
    { tag: tags.bool, class: 'hljs-literal' },
    // typescript
    { tag: tags.typeName, class: 'hljs-title' },
    { tag: tags.variableName, class: 'hljs-attr' },
    { tag: tags.definitionKeyword, class: 'hljs-keyword' },
    { tag: tags.operatorKeyword, class: 'hljs-built_in' },
    { tag: tags.controlKeyword, class: 'hljs-keyword' },
    { tag: tags.lineComment, class: 'hljs-comment' },
    { tag: tags.blockComment, class: 'hljs-comment' },
    // java
    { tag: tags.modifier, class: 'hljs-keyword' },
    { tag: tags.keyword, class: 'hljs-keyword' },
    // html
    { tag: tags.documentMeta, class: 'hljs-meta' },
    { tag: tags.tagName, class: 'hljs-name' },
    { tag: tags.character, class: 'hljs-symbol' },
    // css
    { tag: tags.className, class: 'hljs-selector-class' },
    { tag: tags.derefOperator, class: 'hljs-selector-id' },
    { tag: tags.labelName, class: 'hljs-selector-id' },
    { tag: tags.unit, class: 'hljs-number' },
    { tag: tags.color, class: 'hljs-number' },
]);

const testClassHighlighter: Highlighter = (() => {
    const tagsMap = Object.keys(tags).map((tagName) => ({ tag: (tags as any)[tagName], class: `cm-test-${tagName}` }));
    return tagHighlighter(tagsMap);
})();

const extensions = [
    EditorView.lineWrapping,
    history(),
    dropCursor(),
    // drawSelection(),
    // bracketMatching(),
    syntaxHighlighting(testClassHighlighter),
    syntaxHighlighting(additionalClassHighlighter),
    // highlightSpecialChars(),
    // highlightActiveLine(),
    // highlightSelectionMatches(),
    keymap.of([...defaultKeymap, ...historyKeymap]),

    markdown({
        codeLanguages: languages,
        extensions: [Strikethrough, Autolink],
    }),
    liveMarkdownPlugin,
    clickableLinks,
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
