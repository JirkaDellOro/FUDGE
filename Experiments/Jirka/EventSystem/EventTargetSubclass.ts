namespace EventTargetSubclass {
    export interface Listeners {
        [eventType: string]: EventListenerOrEventListenerObject[];
    }

    class Node extends EventTarget {
        name: string = "";
        parent: Node = null;
        children: Node[];
        listeners: Listeners;
        captures: Listeners;

        constructor() {
            super();
        }

        addEventListener(_type: string, _handler: EventListenerOrEventListenerObject, _capture?: boolean | AddEventListenerOptions): void {
            if (_capture) {
                if (!this.captures[_type])
                    this.captures[_type] = [];
                this.captures[_type].push(_handler);
            }
            else {
                if (!this.listeners[_type])
                    this.listeners[_type] = [];
                this.listeners[_type].push(_handler);
            }
        }
    }
}