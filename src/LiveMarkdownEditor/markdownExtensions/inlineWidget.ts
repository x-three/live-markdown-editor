import { MarkdownConfig } from '@lezer/markdown';

import { InlineWidget } from '../types';

type InlineWidgetParserParams = Omit<InlineWidget, 'cb'>;

export const getInlineWidgetParser = ({ name, regexp, firstChar }: InlineWidgetParserParams): MarkdownConfig => {
    const matcher = new RegExp(regexp, 'y');
    const firstCharCode = firstChar ? firstChar.charCodeAt(0) : undefined;

    return {
        defineNodes: [name],
        parseInline: [
            {
                name: 'InlineWidget',
                parse(cx, next, absPos) {
                    if (firstCharCode != null && firstCharCode !== next) {
                        return -1;
                    }

                    const pos = absPos - cx.offset;
                    matcher.lastIndex = pos;
                    const match = matcher.exec(cx.text);

                    if (!match) {
                        return -1;
                    }

                    const start = cx.offset + match.index;
                    const end = start + match[0].length;
                    cx.addElement(cx.elt(name, start, end));

                    return end;
                },
            },
        ],
    };
};
