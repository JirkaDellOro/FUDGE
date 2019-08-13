/**
 * Performance tests for various types of nodes that my build a 3D-scene
 */
var EventSystem;
(function (EventSystem) {
    window.addEventListener("load", init);
    let NODE_EVENT;
    (function (NODE_EVENT) {
        NODE_EVENT["ANIMATION_FRAME"] = "animationFrame";
        NODE_EVENT["POINTER_DOWN"] = "pointerDown";
        NODE_EVENT["POINTER_UP"] = "pointerUp";
    })(NODE_EVENT || (NODE_EVENT = {}));
    class FudgeEvent extends Event {
    }
    class Node {
        constructor(_name) {
            this.name = _name;
            this.count = 0;
            this.children = [];
            this.listeners = new Map();
            this.captures = new Map();
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
            _event.node = this;
            while (upcoming.parent)
                ancestors.push(upcoming = upcoming.parent);
            // capture phase
            for (let i = ancestors.length - 1; i >= 0; i--) {
                let captures = ancestors[i].captures[_event.type] || [];
                for (let handler of captures)
                    handler(_event);
            }
            // target phase
            let listeners = this.listeners[_event.type] || [];
            for (let handler of listeners)
                handler(_event);
            // bubble phase
            for (let i = 0; i < ancestors.length; i++) {
                let listeners = ancestors[i].listeners[_event.type] || [];
                for (let handler of listeners)
                    handler(_event);
            }
        }
        broadcastEvent(_event) {
            _event.node = this;
            this.broadcastEventRecursive(_event);
        }
        broadcastEventRecursive(_event) {
            // capture phase only
            let captures = this.captures[_event.type] || [];
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
    function init(_event) {
        let root = new Node("Root");
        root.addEventListener("fudge", handleEvent, false);
        root.addEventListener("fudge", handleEvent, true);
        let final = createHierarchy(root, 3, 10);
        final.addEventListener("fudge", handleEvent, false);
        final.addEventListener("fudge", handleEvent, true);
        console.log(root);
        {
            let e = new FudgeEvent("fudge", { bubbles: true });
            let startTime = performance.now();
            for (let i = 0; i < 10000; i++)
                final.dispatchEvent(e);
            let endTime = performance.now();
            console.log("Event on final: " + (endTime - startTime));
            console.log("Count of final:" + final.count);
            console.log("Count of root:" + root.count);
        }
        {
            let e = new FudgeEvent("fudge", { bubbles: true });
            let startTime = performance.now();
            for (let i = 0; i < 10000; i++)
                root.broadcastEvent(e);
            let endTime = performance.now();
            console.log("Event on final: " + (endTime - startTime));
            console.log("Count of final:" + final.count);
            console.log("Count of root:" + root.count);
        }
    }
    function createHierarchy(_root, _levels, _nChildren) {
        let level = _levels - 1;
        let child = _root;
        for (let i = 0; i < _nChildren; i++) {
            child = new Node(_root.name + "|" + i);
            _root.appendChild(child);
            if (level > 0)
                child = createHierarchy(child, level, _nChildren);
        }
        return child;
    }
    function handleEvent(_event) {
        //console.log(_target);
        _event.node.count++;
    }
})(EventSystem || (EventSystem = {}));
//# sourceMappingURL=Main.js.map