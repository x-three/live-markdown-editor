import { SyntaxNode as OriginalSyntaxNode } from '@lezer/common/dist';

export type SimpleRange = {
    from: number;
    to: number;
};

export type SyntaxNode = Omit<
    OriginalSyntaxNode,
    'name' | 'firstChild' | 'lastChild' | 'prevSibling' | 'nextSibling'
> & {
    name: NodeName;
    firstChild: SyntaxNode;
    lastChild: SyntaxNode;
    prevSibling: SyntaxNode;
    nextSibling: SyntaxNode;
};

export type NodeName =
    | 'ATXHeading1'
    | 'ATXHeading2'
    | 'ATXHeading3'
    | 'ATXHeading4'
    | 'ATXHeading5'
    | 'ATXHeading6'
    | 'Paragraph'
    | 'HeaderMark'
    | 'Emphasis'
    | 'StrongEmphasis'
    | 'EmphasisMark'
    | 'Strikethrough'
    | 'StrikethroughMark'
    | 'Link'
    | 'Image'
    | 'LinkMark'
    | 'URL'
    | 'BulletList'
    | 'OrderedList'
    | 'ListItem'
    | 'ListMark'
    | 'InlineCode'
    | 'FencedCode'
    | 'CodeMark'
    | 'CodeInfo'
    | 'Blockquote'
    | 'QuoteMark'
    | 'HorizontalRule';

export type NodeNameTree = Partial<{
    [K in NodeName]: true | NodeNameTree;
}>;
