/**
 * Performance tests for various types of nodes that my build a 3D-scene
 */
namespace EventSystem {
    window.addEventListener("load", init);
    // interface Listeners {
    //     [type: string]: Function[];
    // }

    export interface Listeners {
        [eventType: string]: Function[];
    }

    enum NODE_EVENT {
        ANIMATION_FRAME = "animationFrame",
        POINTER_DOWN = "pointerDown",
        POINTER_UP = "pointerUp"
    }

    class FudgeEvent extends Event {
        node: Node;
    }

    class Node {
        name: string;
        count: number;
        parent: Node;
        children: Node[];
        listeners: Listeners;
        captures: Listeners;

        constructor(_name: string) {
            this.name = _name;
            this.count = 0;
            this.children = [];
            this.listeners = {};
            this.captures = {};
            parent = null;
        }

        appendChild(_child: Node): void {
            this.children.push(_child);
            _child.parent = this;
        }

        addEventListener(_type: NODE_EVENT | string, _handler: Function, _capture: boolean): void {
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

        dispatchEvent(_event: FudgeEvent): void {
            let ancestors: Node[] = [];
            let upcoming: Node = this;
            _event.node = this;

            while (upcoming.parent)
                ancestors.push(upcoming = upcoming.parent);

            // capture phase
            for (let i: number = ancestors.length - 1; i >= 0; i--) {
                let captures: Function[] = ancestors[i].captures[_event.type] || [];
                for (let handler of captures)
                    handler(_event);
            }

            // target phase
            let listeners: Function[] = this.listeners[_event.type] || [];
            for (let handler of listeners)
                handler(_event);

            // bubble phase
            for (let i: number = 0; i < ancestors.length; i++) {
                let listeners: Function[] = ancestors[i].listeners[_event.type] || [];
                for (let handler of listeners)
                    handler(_event);
            }
        }

        broadcastEvent(_event: FudgeEvent): void {
            _event.node = this;
            this.broadcastEventRecursive(_event);
        }

        private broadcastEventRecursive(_event: FudgeEvent): void {
            // capture phase only
            let captures: Function[] = this.captures[_event.type] || [];
            for (let handler of captures)
                handler(_event);
            // slower...
            // captures.forEach(function (handler: Function): void {
            //     handler(_event);
            // });

            // same for children
            for (let child of this.children) {
                child.broadcastEventRecursive(_event);
            }
        }
    }

    function init(_event: Event): void {
        let root: Node = new Node("Root");
        root.addEventListener("fudge", handleEvent, false);
        root.addEventListener("fudge", handleEvent, true);
        let final: Node = createHierarchy(root, 3, 10);
        final.addEventListener("fudge", handleEvent, false);
        final.addEventListener("fudge", handleEvent, true);
        console.log(root);

        {
            let e: FudgeEvent = new FudgeEvent("fudge", { bubbles: true });
            let startTime: number = performance.now();
            for (let i: number = 0; i < 10000; i++)
                final.dispatchEvent(e);
            let endTime: number = performance.now();
            console.log("Event on final: " + (endTime - startTime));
            console.log("Count of final:" + final.count);
            console.log("Count of root:" + root.count);
        }

        {
            let e: FudgeEvent = new FudgeEvent("fudge", { bubbles: true });
            let startTime: number = performance.now();
            for (let i: number = 0; i < 10000; i++)
                root.broadcastEvent(e);
            let endTime: number = performance.now();
            console.log("Event on final: " + (endTime - startTime));
            console.log("Count of final:" + final.count);
            console.log("Count of root:" + root.count);
        }
    }

    function createHierarchy(_root: Node, _levels: number, _nChildren: number): Node {
        let level: number = _levels - 1;
        let child: Node = _root;

        for (let i: number = 0; i < _nChildren; i++) {
            child = new Node(_root.name + "|" + i);
            _root.appendChild(child);
            if (level > 0)
                child = createHierarchy(child, level, _nChildren);
        }
        return child;
    }

    function handleEvent(_event: FudgeEvent): void {
        //console.log(_target);
        _event.node.count++;
    }

}
