import { tagHighlighter, tags } from '@lezer/highlight';

export const markdownHighlighter = tagHighlighter([
    { tag: tags.strong, class: 'cm-strong' },
    { tag: tags.emphasis, class: 'cm-emphasis' },
    { tag: tags.strikethrough, class: 'cm-strike-through' },
    { tag: tags.link, class: 'cm-link' },
]);
