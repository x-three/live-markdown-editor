import { EditorView } from '@codemirror/view';
import { SyntaxNode } from '@lezer/common/dist';

import { NodeName, SimpleRange } from '../../types';

export const markRangeOffsets: Partial<Record<NodeName, SimpleRange>> = {
    HeaderMark: {
        from: 0,
        to: 1,
    },
};

export const getMarkRangeWithOffset = (node: SyntaxNode): SimpleRange => {
    const offset = markRangeOffsets[node.name as NodeName];

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
        if ((childNode.name as NodeName) === 'URL') {
            return childNode;
        }
    }

    return undefined;
};

export const getUrl = (urlNode: SyntaxNode, view: EditorView): string | undefined => {
    if ((urlNode.name as NodeName) === 'URL') {
        return view.state.doc.sliceString(urlNode.from, urlNode.to);
    }

    return undefined;
};
