/**
 * Performance tests for various types of nodes that my build a 3D-scene
 */
var TestNodes;
(function (TestNodes) {
    window.addEventListener("load", init);
    function init(_event) {
        let parent = new NodeSimple("Parent");
        console.dir(parent);
        let child = new NodeSimple("Child");
        console.dir(child);
        let child2 = new NodeSimple("Child2");
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
            let e = new EventSimple("fudge-event", { bubbles: true });
            let startTime = performance.now();
            for (let i = 0; i < 10000; i++)
                child.dispatchEvent(e);
            let endTime = performance.now();
            console.log(endTime - startTime);
            console.log(child.count);
            console.log(parent.count);
        }
        {
            let e = new EventSimple("fudge-event", { bubbles: true });
            let startTime = performance.now();
            for (let i = 0; i < 10000; i++)
                parent.broadcastEvent(e);
            let endTime = performance.now();
            console.log(endTime - startTime);
            console.log(child.count);
            console.log(child2.count);
            console.log(parent.count);
        }
    }
    function printEventInfo(_event) {
        //console.log(_target);
        _event.targetEx.count++;
    }
    class NodeSimple {
        constructor(_name) {
            this.name = _name;
            this.count = 0;
            this.children = [];
            this.listeners = {};
            this.captures = {};
            parent = null;
        }
        appendChild(_child) {
            this.children.push(_child);
            _child.parent = this;
        }
        addEventListener(_type, _handler, _capture) {
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
        dispatchEvent(_event) {
            let ancestors = [];
            let upcoming = this;
            _event.targetEx = this;
            while (upcoming.parent)
                ancestors.push(upcoming = upcoming.parent);
            // capture phase
            for (let i = ancestors.length - 1; i >= 0; i--)
                for (let handler of ancestors[i].captures[_event.type] || [])
                    handler(_event);
            // target phase
            for (let handler of this.listeners[_event.type] || [])
                handler(_event);
            // bubble phase
            for (let i = 0; i < ancestors.length; i++) {
                for (let handler of ancestors[i].listeners[_event.type] || [])
                    handler(_event);
            }
        }
        broadcastEvent(_event) {
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
    }
})(TestNodes || (TestNodes = {}));
//# sourceMappingURL=Main.js.map