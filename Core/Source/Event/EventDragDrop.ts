namespace FudgeCore {
    export const enum EVENT_DRAGDROP {
        DRAG = "ƒdrag",
        DROP = "ƒdrop",
        START = "ƒdragstart",
        END = "ƒdragend",
        OVER = "ƒdragover"
    }
    /**
     * a subclass of DragEvent .A event that represents a drag and drop interaction
     */
    export class EventDragDrop extends DragEvent {
        public pointerX: number;
        public pointerY: number;
        public canvasX: number;
        public canvasY: number;
        public clientRect: ClientRect;

        constructor(type: string, _event: EventDragDrop) {
            super(type, _event);
            let target: HTMLElement = <HTMLElement>_event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
}