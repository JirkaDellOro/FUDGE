var Scripts;
(function (Scripts) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    class Test extends ƒ.ComponentScript {
        constructor() {
            super();
            this.text = "Hallo";
            this.addEventListener(ƒ.NODE_EVENT.COMPONENT_ADDED, this.hndComponentEvent);
        }
        hndComponentEvent(_event) {
            console.log("Component event", _event);
            console.log("Container", this.getContainer());
            console.log("Target is this?", _event.target == this, this.text);
            this.getContainer().addEventListener(ƒ.NODE_EVENT.CHILD_ADDED, this.hndNodeEvent);
            this.getContainer().addEventListener(ƒ.NODE_EVENT.CHILD_REMOVED, this.hndNodeEvent);
        }
        hndNodeEvent(_event) {
            console.log("Node event", _event);
        }
    }
    function init() {
        Scenes.createMiniScene();
        let node = Scenes.node;
        let child = node.getChildren()[0];
        let test = new Test();
        node.addComponent(test);
        console.log("Test-scripts attached after add", node.getComponents(Test));
        node.removeComponent(test);
        console.log("Test-scripts attached after remove", node.getComponents(Test));
        node.removeChild(child);
        console.log("Children attached after remove", node.getChildren());
        node.appendChild(child);
        console.log("Children attached after append", node.getChildren());
    }
})(Scripts || (Scripts = {}));
//# sourceMappingURL=Scripts.js.map