import React from 'react';
// import { highlightSpecialChars, drawSelection, highlightActiveLine } from '@codemirror/view';
// import { highlightSelectionMatches } from '@codemirror/search';
// import { bracketMatching } from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { syntaxHighlighting } from '@codemirror/language';
import { tagHighlighter, tags } from '@lezer/highlight';
import { LiveMarkdownEditor, ReplaceWithWidget } from './LiveMarkdownEditor';

import { sampleMarkdownText } from './sampleMarkdownText';
import './index.css';
import './LiveMarkdownEditor/styles.css';

const fencedCodeHighlighter = tagHighlighter([
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

const extensions = [
    // drawSelection(),
    // bracketMatching(),
    // highlightSpecialChars(),
    // highlightActiveLine(),
    // highlightSelectionMatches(),

    syntaxHighlighting(fencedCodeHighlighter),

    EditorState.phrases.of({
        'liveMarkdownPlugin.followLink': 'Follow link',
    }),
];

const textToFontAwesomeSymbol = (text: string): string => {
    const firstSymbol = 0xf000;
    const lastSymbol = 0xf23a;
    const maxSymbols = lastSymbol - firstSymbol + 1;
    let symbolCode = 0;

    for (let i = 0; i < text.length; i++) {
        symbolCode += text.charCodeAt(i);
    }
    symbolCode = (symbolCode % maxSymbols) + firstSymbol;

    return String.fromCharCode(symbolCode);
};

const replaceWithWidget: ReplaceWithWidget[] = [
    {
        nodeName: 'Emoji',
        regexp: /:([a-z0-9_]+):/,
        firstChar: ':',

        cb: (value) => {
            const name = value.substring(1, value.length - 1);
            const emoji = document.createElement('span');

            emoji.innerText = textToFontAwesomeSymbol(name);
            emoji.className = `cm-emoji cm-emoji-${name}`;

            return emoji;
        },
    },
];

export const App: React.FC = () => (
    <LiveMarkdownEditor
        value={sampleMarkdownText}
        extensions={extensions}
        placeholder="Placeholder"
        replaceWithWidget={replaceWithWidget}
    />
);
