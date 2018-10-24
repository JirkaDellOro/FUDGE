/**
 * Performance tests for various types of nodes that my build a 3D-scene
 */
namespace TestNodes {
    window.addEventListener("load", init);

    function init(_event: Event): void {
        let parent: NodeSimple = new NodeSimple("Parent");
        console.dir(parent);
        let child: NodeSimple = new NodeSimple("Child");
        console.dir(child);
        let child2: NodeSimple = new NodeSimple("Child2");
        console.dir(child2);

        // create a minimal hierarchy
        parent.appendChild(child);
        parent.appendChild(child2);
        console.log(parent);

        // send an event around and listen on capture, target and bubbling phase
        parent.addEventListener("fudge-event", printEventInfo, false);
        parent.addEventListener("fudge-event", printEventInfo, true);
        child.addEventListener("fudge-event", printEventInfo, false);
        child.addEventListener("fudge-event", printEventInfo, true);
        child2.addEventListener("fudge-event", printEventInfo, false);
        child2.addEventListener("fudge-event", printEventInfo, true);

        {
            let e: EventSimple = new EventSimple("fudge-event", { bubbles: true });
            let startTime: number = performance.now();
            for (let i: number = 0; i < 10000; i++)
                child.dispatchEvent(e);
            let endTime: number = performance.now();
            console.log(endTime - startTime);
            console.log(child.count);
            console.log(parent.count);
        }
        {
            let e: EventSimple = new EventSimple("fudge-event", { bubbles: true });
            let startTime: number = performance.now();
            for (let i: number = 0; i < 10000; i++)
                parent.broadcastEvent(e);
            let endTime: number = performance.now();
            console.log(endTime - startTime);
            console.log(child.count);
            console.log(child2.count);
            console.log(parent.count);
        }
    }

    function printEventInfo(_event: EventSimple): void {
        //console.log(_target);
        _event.targetEx.count++;
    }

    interface Listeners {
        [type: string]: Function[];
    }

    class NodeSimple {
        name: string;
        count: number;
        parent: NodeSimple;
        children: NodeSimple[];
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

        appendChild(_child: NodeSimple): void {
            this.children.push(_child);
            _child.parent = this;
        }

        addEventListener(_type: string, _handler: Function, _capture: boolean): void {
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

        dispatchEvent(_event: EventSimple): void {
            let ancestors: NodeSimple[] = [];
            let upcoming: NodeSimple = this;
            _event.targetEx = this;

            while (upcoming.parent)
                ancestors.push(upcoming = upcoming.parent);

            // capture phase
            for (let i: number = ancestors.length - 1; i >= 0; i--)
                for (let handler of ancestors[i].captures[_event.type] || [])
                    handler(_event);

            // target phase
            for (let handler of this.listeners[_event.type] || [])
                handler(_event);

            // bubble phase
            for (let i: number = 0; i < ancestors.length; i++) {
                for (let handler of ancestors[i].listeners[_event.type] || [])
                    handler(_event);
            }
        }

        broadcastEvent(_event: EventSimple): void {
            if (!_event.targetEx)
                _event.targetEx = this;

            // capture phase only
            for (let handler of this.captures[_event.type] || [])
                handler(_event);

            // same for children
            for (let child of this.children) {
                child.broadcastEvent(_event);
            }
        }

    }

    class EventSimple extends Event {
        targetEx: NodeSimple;
    }
}
