import { EditorView, WidgetType, Decoration } from '@codemirror/view';
import { StateEffect } from '@codemirror/state';

export const hiddenMarkDecoration = Decoration.mark({ class: 'cm-hidden-mark' });

export class ImageWidget extends WidgetType {
    static readonly loadingStateChanged = StateEffect.define<string>();

    static readonly failedLoadingSources = new Set<string>();

    constructor(readonly src: string) {
        super();
    }

    eq(widget: ImageWidget) {
        return widget.src === this.src;
    }

    toDOM(view: EditorView) {
        const img = document.createElement('img');
        img.src = this.src;
        img.classList.add('cm-image');

        if (!img.complete) {
            img.onload = () => {
                const failed = img.naturalHeight <= 1 && img.naturalWidth <= 1;

                // Если при загрузке изображения произошла ошибка или при очередной загрузке после ошибки произошла
                // удачная загрузка, то отправляем эффект, который предотвращает скрытие markdown разметки изображения
                // при наличии ошибки. Т.е. чтобы при перемещении курсора не оставалось пустого места без разметки
                // и без изображения.
                if (failed) {
                    ImageWidget.failedLoadingSources.add(this.src);
                    view.dispatch({ effects: [ImageWidget.loadingStateChanged.of(this.src)] });
                } else if (ImageWidget.failedLoadingSources.has(this.src)) {
                    ImageWidget.failedLoadingSources.delete(this.src);
                    view.dispatch({ effects: [ImageWidget.loadingStateChanged.of(this.src)] });
                } else {
                    view.requestMeasure();
                }
            };
        }

        // Дополнительная обёртка нужна, чтобы не было большого курсора во всю высоту изображения
        const wrapper = document.createElement('span');
        wrapper.appendChild(img);

        return wrapper;
    }

    ignoreEvent(ev: Event): boolean {
        return ev.type !== 'mousedown';
    }
}
