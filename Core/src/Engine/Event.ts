namespace Fudge {
    export interface MapEventTypeToListener {
        [eventType: string]: EventListener[];
    }

    /**
     * Types of events specific to Fudge, in addition to the standard DOM/Browser-Types and custom strings
     */
    export enum EVENT {
         /** dispatched to targets registered at [[Loop]], when requested animation frame starts */
        ANIMATION_FRAME = "animationFrame",        
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