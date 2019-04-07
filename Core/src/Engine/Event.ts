namespace Fudge {
    // export interface Listeners {
    //     [eventType: string]: Function[];
    // }
    export interface Listeners {
        [eventType: string]: EventListener[];
    }

    export enum NODE_EVENT {
        ANIMATION_FRAME = "animationFrame",
        POINTER_DOWN = "pointerDown",
        POINTER_UP = "pointerUp"
    }
}