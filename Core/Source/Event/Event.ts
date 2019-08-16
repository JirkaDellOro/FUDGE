namespace FudgeCore {
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
        /** dispatched to a [[Component]] when its being activated */
        COMPONENT_ACTIVATE = "componentActivate",
        /** dispatched to a [[Component]] when its being deactivated */
        COMPONENT_DEACTIVATE = "componentDeactivate",
        /** dispatched to a child [[Node]] and its ancestors after it was appended to a parent */
        CHILD_APPEND = "childAdd",
        /** dispatched to a child [[Node]] and its ancestors just before its being removed from its parent */
        CHILD_REMOVE = "childRemove",
        /** dispatched to a [[Mutable]] when its being mutated */
        MUTATE = "mutate",
        /** dispatched to [[Viewport]] when it gets the focus to receive keyboard input */
        FOCUS_IN = "focusin",
        /** dispatched to [[Viewport]] when it loses the focus to receive keyboard input */
        FOCUS_OUT = "focusout",
        /** dispatched to [[Node]] when it's done serializing */
        NODE_SERIALIZED = "nodeSerialized",
        /** dispatched to [[Node]] when it's done deserializing, so all components, children and attributes are available */
        NODE_DESERIALIZED = "nodeDeserialized",
        /** dispatched to [[NodeResourceInstance]] when it's content is set according to a serialization of a [[NodeResource]]  */
        NODERESOURCE_INSTANTIATED = "nodeResourceInstantiated",
        /** dispatched to [[Time]] when it's scaling changed  */
        TIME_SCALED = "timeScaled",
        /** dispatched to [[FileIo]] when a list of files has been loaded  */
        FILE_LOADED = "fileLoaded",
        /** dispatched to [[FileIo]] when a list of files has been saved */
        FILE_SAVED = "fileSaved"
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