import { Range, Line } from '@codemirror/state';
import { EditorView, Decoration } from '@codemirror/view';

import { SyntaxNode, NodeName, SimpleRange } from '../../types';
import { hiddenMarkDecoration } from './decorations';

export const markRangeOffsets: Partial<Record<NodeName, SimpleRange>> = {
    HeaderMark: {
        from: 0,
        to: 1,
    },
    ListMark: {
        from: 0,
        to: 1,
    },
    QuoteMark: {
        from: 0,
        to: 1,
    },
};

export const getMarkRangeWithOffset = (node: SyntaxNode): SimpleRange => {
    const offset = markRangeOffsets[node.name];

    return offset
        ? {
              from: node.from + offset.from,
              to: node.to + offset.to,
          }
        : {
              from: node.from,
              to: node.to,
          };
};

export const getUrlNode = (parentNode: SyntaxNode): SyntaxNode | undefined => {
    for (let childNode = parentNode.firstChild; childNode != null; childNode = childNode.nextSibling) {
        if (childNode.name === 'URL') {
            return childNode;
        }
    }

    return undefined;
};

export const getUrl = (urlNode: SyntaxNode, view: EditorView): string | undefined => {
    if (urlNode.name === 'URL') {
        return view.state.doc.sliceString(urlNode.from, urlNode.to);
    }

    return undefined;
};

export const getHiddenChildrenDecorations = (node: SyntaxNode, children: Set<NodeName>): Range<Decoration>[] => {
    const decorations: Range<Decoration>[] = [];

    for (let child = node.firstChild; child != null; child = child.nextSibling) {
        if (children.has(child.name)) {
            const { from, to } = getMarkRangeWithOffset(child);
            decorations.push(hiddenMarkDecoration.range(from, to));
        }
    }

    return decorations;
};

export const markLine = (pos: number, view: EditorView, className: string): Range<Decoration> => {
    const line = view.state.doc.lineAt(pos);
    const decoration = Decoration.line({ class: className });
    return decoration.range(line.from);
};

type ForEachLineCallback = (line: Line, index: number, total: number) => Range<Decoration> | undefined;

export const forEachLine = (
    from: number,
    to: number,
    view: EditorView,
    cb: ForEachLineCallback,
): Range<Decoration>[] => {
    const decorations: Range<Decoration>[] = [];

    const firstIndex = view.state.doc.lineAt(from).number;
    const lastIndex = view.state.doc.lineAt(to).number;
    const total = lastIndex - firstIndex + 1;

    for (let pos = from; pos <= to; ) {
        const line = view.state.doc.lineAt(pos);
        const decoration = cb(line, line.number - firstIndex, total);

        if (decoration) {
            decorations.push(decoration);
        }

        pos = line.to + 1;
    }

    return decorations;
};

export type LineClassNames = {
    every?: string;
    first?: string;
    last?: string;
};

export const markEachLine = (
    from: number,
    to: number,
    view: EditorView,
    classNames: LineClassNames,
): Range<Decoration>[] => {
    return forEachLine(from, to, view, (line, index, total) => {
        let lineClassNames = '';

        if (index === 0 && classNames.first) {
            lineClassNames += ` ${classNames.first}`;
        }
        if (classNames.every) {
            lineClassNames += ` ${classNames.every}`;
        }
        if (index === total - 1 && classNames.last) {
            lineClassNames += ` ${classNames.last}`;
        }
        lineClassNames = lineClassNames.trimStart();

        return lineClassNames ? markLine(line.from, view, lineClassNames) : undefined;
    });
};
