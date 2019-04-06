namespace Fudge {
    export interface Listeners {
        [eventType: string]: Function[];
    }

    export enum NODE_EVENT {
        ANIMATION_FRAME = "animationFrame",
        POINTER_DOWN = "pointerDown",
        POINTER_UP = "pointerUp"
    }

    export class FudgeEvent extends Event {
        node: Node;
    }
}