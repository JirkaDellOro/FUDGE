/**
 * Is it feasable to use custom HTML-Elements as nodes of a scenegraph?
 * Advantage is the exitisting implementation of the parent-child-hierarchy and the event system.
 * Disadvantage might be the amount of unnessecary information. the preference for a serialization using XML-Format
 * and possibly performance issues. To be checked. (Also not supported by Edge yet. And look into Polymer by Google)
 */
namespace DomScene {
    window.addEventListener("load", init);

    class FudgeNode extends HTMLElement {
        name: string;
        count: number;

        constructor(_name: string = "") {
            super();
            this.name = _name;
            this.count = 0;
        }
    }

    function init(_event: Event): void {
        // register a custom element
        window.customElements.define("fudge-node", FudgeNode);

        // now it's possible to create nodes as extensions of HTMLElement
        let parent: FudgeNode = new FudgeNode("Parent");
        parent.id = "Parent";
        console.dir(parent); 
        let child: FudgeNode = new FudgeNode("Child");
        child.id = "Child";
        console.dir(child);

        // create a minimal hierarchy
        parent.appendChild(child);
        console.log(parent);

        // send an event around and listen on capture, target and bubbling phase
        parent.addEventListener("fudge-event", printEventInfo, false);
        parent.addEventListener("fudge-event", printEventInfo, true);
        child.addEventListener("fudge-event", printEventInfo, false);

        let e: Event = new Event("fudge-event", { bubbles: true });
        let startTime: number = performance.now();
        for (let i: number = 0; i < 10000; i++)
            child.dispatchEvent(e);
        let endTime: number = performance.now();
        console.log(endTime - startTime);
        console.log(child.count);
        console.log(parent.count);
    }

    function printEventInfo(_event: Event): void {
        //console.log(_event);
        (<FudgeNode>_event.target).count++;
    }
}