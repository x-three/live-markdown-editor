import { MarkdownConfig } from '@lezer/markdown';

import { ReplaceWithWidget } from '../types';

type ReplaceWithWidgetParserParams = Omit<ReplaceWithWidget, 'cb'>;

export const getReplaceWithWidgetParser = ({
    nodeName,
    regexp,
    firstChar,
}: ReplaceWithWidgetParserParams): MarkdownConfig => {
    const matcher = new RegExp(regexp, 'y');
    const firstCharCode = firstChar ? firstChar.charCodeAt(0) : undefined;

    return {
        defineNodes: [nodeName],
        parseInline: [
            {
                name: 'ReplaceWithWidget',
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
                    cx.addElement(cx.elt(nodeName, start, end));

                    return end;
                },
            },
        ],
    };
};
