namespace Fudge {
    // export interface Listeners {
    //     [eventType: string]: Function[];
    // }
    export interface Listeners {
        [eventType: string]: EventListener[];
    }

    export enum NODE_EVENT {
        ANIMATION_FRAME = "animationFrame",
        COMPONENT_ADDED = "componentAdded",
        COMPONENT_REMOVED = "componentRemoved",
        CHILD_ADDED = "childAdded",
        CHILD_REMOVED = "childRemoved"
    }
}