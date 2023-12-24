import { Extension, StateEffect } from '@codemirror/state';
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

export type SwitchExtension<T> = {
    extension: Extension;
    getUpdateEffect: (newValue: T) => StateEffect<unknown>;
};

export type SwitchExtensionCreator<T> = (initialValue: T) => SwitchExtension<T>;

export type InlineWidgetCallback = (value: string) => HTMLElement | null;

export type InlineWidget = {
    name: string;
    regexp: RegExp;
    firstChar?: string;
    cb: InlineWidgetCallback;
};
