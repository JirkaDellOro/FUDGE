/**
 * Is it feasable to use custom HTML-Elements as nodes of a scenegraph?
 * Advantage is the exitisting implementation of the parent-child-hierarchy and the event system.
 * Disadvantage might be the amount of unnessecary information. the preference for a serialization using XML-Format
 * and possibly performance issues. To be checked. (Also not supported by Edge yet. And look into Polymer by Google)
 */
var DomScene;
(function (DomScene) {
    window.addEventListener("load", init);
    function init(_event) {
        // register a custom element
        window.customElements.define("fudge-node", FudgeNode);
        // now it's possible to create nodes as extensions of HTMLElement
        let parent = new FudgeNode("Parent");
        parent.id = "Parent";
        console.dir(parent);
        let child = new FudgeNode("Child");
        child.id = "Child";
        console.dir(child);
        // create a minimal hierarchy
        parent.appendChild(child);
        console.log(parent);
        // send an event around and listen on capture, target and bubbling phase
        parent.addEventListener("fudge-event", printEventInfo, false);
        parent.addEventListener("fudge-event", printEventInfo, true);
        child.addEventListener("fudge-event", printEventInfo, false);
        let e = new Event("fudge-event", { bubbles: true });
        let startTime = performance.now();
        for (let i = 0; i < 10000; i++)
            child.dispatchEvent(e);
        let endTime = performance.now();
        console.log(endTime - startTime);
        console.log(child.count);
        console.log(parent.count);
    }
    function printEventInfo(_event) {
        //console.log(_event);
        _event.target.count++;
    }
    class FudgeNode extends HTMLElement {
        constructor(_name) {
            super();
            this.name = _name;
            this.count = 0;
        }
    }
})(DomScene || (DomScene = {}));
//# sourceMappingURL=Main.js.map