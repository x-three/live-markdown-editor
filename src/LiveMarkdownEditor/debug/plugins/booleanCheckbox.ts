import { ChangeSpec, Range } from '@codemirror/state';
import { WidgetType, EditorView, Decoration, ViewUpdate, ViewPlugin, DecorationSet } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

class CheckboxWidget extends WidgetType {
    constructor(readonly checked: boolean) {
        super();
    }

    eq(other: CheckboxWidget) {
        return other.checked === this.checked;
    }

    toDOM() {
        const wrap = document.createElement('span');
        wrap.setAttribute('aria-hidden', 'true');
        wrap.className = 'cm-boolean-toggle';

        const box = wrap.appendChild(document.createElement('input'));
        box.type = 'checkbox';
        box.checked = this.checked;

        return wrap;
    }

    ignoreEvent() {
        return false;
    }
}

const toggleBoolean = (view: EditorView, pos: number) => {
    const textBefore = view.state.doc.sliceString(Math.max(0, pos - 5), pos);
    let change: ChangeSpec;

    if (textBefore === 'false') {
        change = { from: pos - 5, to: pos, insert: 'true' };
    } else if (textBefore.endsWith('true')) {
        change = { from: pos - 4, to: pos, insert: 'false' };
    } else {
        return false;
    }

    view.dispatch({ changes: change });
    return true;
};

class CheckboxPlugin {
    decorations: DecorationSet;

    constructor(view: EditorView) {
        this.decorations = this.getCheckboxes(view);
    }

    update(update: ViewUpdate) {
        if (update.docChanged || update.viewportChanged) {
            this.decorations = this.getCheckboxes(update.view);
        }
    }

    getCheckboxes(view: EditorView) {
        const widgets: Range<Decoration>[] = [];

        for (let { from, to } of view.visibleRanges) {
            syntaxTree(view.state).iterate({
                from,
                to,
                enter: (node) => {
                    if (node.name === 'CodeInfo') {
                        const isTrue = view.state.doc.sliceString(node.from, node.to) === 'true';
                        const widget = Decoration.widget({
                            widget: new CheckboxWidget(isTrue),
                            side: 1,
                        });
                        widgets.push(widget.range(node.to));
                    }
                },
            });
        }

        return Decoration.set(widgets);
    }
}

/** Extension */
export const checkboxPlugin = ViewPlugin.fromClass(CheckboxPlugin, {
    decorations: (value) => value.decorations,

    eventHandlers: {
        mousedown: (event, view) => {
            const target = event.target as HTMLElement;

            if (target.nodeName === 'INPUT' && target.parentElement?.classList.contains('cm-boolean-toggle')) {
                return toggleBoolean(view, view.posAtDOM(target));
            }
        },
    },
});
