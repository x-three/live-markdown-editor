export type SimpleRange = {
    from: number;
    to: number;
};

export type NodeName =
    | 'ATXHeading1'
    | 'ATXHeading2'
    | 'ATXHeading3'
    | 'ATXHeading4'
    | 'ATXHeading5'
    | 'ATXHeading6'
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
    | 'ListItem' // todo
    | 'ListMark'
    | 'InlineCode'
    | 'FencedCode' // todo
    | 'CodeMark'
    | 'CodeInfo'
    | 'Blockquote' // todo
    | 'QuoteMark'
    | 'HorizontalRule';
