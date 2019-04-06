namespace Fudge {
    export interface Listeners {
        [eventType: string]: Function[];
    }

    export enum NODE_EVENT {
        ANIMATION_FRAME = "animationFrame",
        POINTER_DOWN = "pointerDown",
        POINTER_UP = "pointerUp"
    }

    /*
    export class Eventƒ extends Event {
        node: Node;
        public setTarget(_node: Node): void {    
            this.node = _node;   
        }
    }
    */
    // function setEventTarget(_node: Node): void {}
}