namespace Fudge {
    export interface MapEventTypeToListener {
        [eventType: string]: EventListener[];
    }

    /**
     * Types of events specific to Fudge, in addition to the standard DOM/Browser-Types and custom strings
     */
    export const enum EVENT {
        /** dispatched to targets registered at [[Loop]], when requested animation frame starts */
        LOOP_FRAME = "loopFrame",
        /** dispatched to a [[Component]] when its being added to a [[Node]] */
        COMPONENT_ADD = "componentAdd",
        /** dispatched to a [[Component]] when its being removed from a [[Node]] */
        COMPONENT_REMOVE = "componentRemove",
        /** dispatched to a child [[Node]] and its ancestors after it was appended to a parent */
        CHILD_APPEND = "childAdd",
        /** dispatched to a child [[Node]] and its ancestors just before its being removed from its parent */
        CHILD_REMOVE = "childRemove",
        /** dispatched to a [[Mutable]] when its being mutated */
        MUTATE = "mutate"
    }

    /**
     * Mappings of standard DOM/Browser-Events as passed from a canvas to the viewport
     */
    export const enum EVENT_KEYBOARD {
        UP = "ƒkeyup",
        DOWN = "ƒkeydown"
    }
    export const enum EVENT_POINTER {
        UP = "ƒpointerup",
        DOWN = "ƒpointerdown"
    }
    export const enum EVENT_DRAGDROP {
        DRAG = "ƒdrag",
        DROP = "ƒdrop",
        START = "ƒdragstart",
        END = "ƒdragend",
        OVER = "ƒdragover"
    }
    export const enum EVENT_WHEEL {
        WHEEL = "ƒwheel"
    }

    export class KeyboardEventƒ extends KeyboardEvent {
        constructor(type: string, _event: KeyboardEventƒ) {
            super(type, _event);
        }
    }

    export class PointerEventƒ extends PointerEvent {
        public pointerX: number;
        public pointerY: number;
        public canvasX: number;
        public canvasY: number;
        public clientRect: ClientRect;

        constructor(type: string, _event: PointerEventƒ) {
            super(type, _event);
            let target: HTMLElement = <HTMLElement>_event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }

    export class DragDropEventƒ extends DragEvent {
        public pointerX: number;
        public pointerY: number;
        public canvasX: number;
        public canvasY: number;
        public clientRect: ClientRect;

        constructor(type: string, _event: DragDropEventƒ) {
            super(type, _event);
            let target: HTMLElement = <HTMLElement>_event.target;
            this.clientRect = target.getClientRects()[0];
            this.pointerX = _event.clientX - this.clientRect.left;
            this.pointerY = _event.clientY - this.clientRect.top;
        }
    }

    export class WheelEventƒ extends WheelEvent {
        constructor(type: string, _event: WheelEventƒ) {
            super(type, _event);
        }
    }

    /**
     * Base class for EventTarget singletons, which are fixed entities in the structure of Fudge, such as the core loop 
     */
    export class EventTargetStatic extends EventTarget {
        protected static targetStatic: EventTargetStatic = new EventTargetStatic();

        protected constructor() {
            super();
        }

        public static addEventListener(_type: string, _handler: EventListener): void {
            EventTargetStatic.targetStatic.addEventListener(_type, _handler);
        }
        public static removeEventListener(_type: string, _handler: EventListener): void {
            EventTargetStatic.targetStatic.removeEventListener(_type, _handler);
        }
        public static dispatchEvent(_event: Event): boolean {
            EventTargetStatic.targetStatic.dispatchEvent(_event);
            return true;
        }
    }
}