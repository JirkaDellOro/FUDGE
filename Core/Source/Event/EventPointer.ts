namespace FudgeCore {
    export const enum EVENT_POINTER {
        UP = "ƒpointerup",
        DOWN = "ƒpointerdown",
        MOVE = "ƒpointermove",
        OVER = "ƒpointerover",
        ENTER = "ƒpointerenter",
        CANCEL = "ƒpointercancel",
        OUT = "ƒpointerout",
        LEAVE = "ƒpointerleave",
        GOTCAPTURE = "ƒgotpointercapture",
        LOSTCAPTURE = "ƒlostpointercapture"
    }
    /**  
     * a subclass of PointerEvent. The state of a DOM event produced by a pointer such as the geometry of the contact point
     * */
    export class EventPointer extends PointerEvent {
        public pointerX: number;
        public pointerY: number;
        public canvasX: number;
        public canvasY: number;
        public clientRect: ClientRect;

        constructor(type: string, _event: EventPointer) {
            super(type, _event);
            let target: HTMLElement = <HTMLElement>_event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }
}