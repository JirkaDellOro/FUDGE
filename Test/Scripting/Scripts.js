var Scripts;
(function (Scripts) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    class Test extends ƒ.ComponentScript {
        constructor() {
            super();
            this.addEventListener(ƒ.EVENT.COMPONENT_ADDED, this.hndComponentEvent);
            ƒ.Loop.addEventListener(ƒ.EVENT.ANIMATION_FRAME, this.hndAnimationFrame.bind(this)); // when using concentional function
            // Loop.addEventListener(ƒ.EVENT.ANIMATION_FRAME, this.hndAnimationFrame;  // when using arrow-function
        }
        hndComponentEvent(_event) {
            console.log("Component event", _event);
            console.log("Container", this.getContainer());
            console.log("Target is this?", _event.target == this, this.name);
            this.getContainer().addEventListener(ƒ.EVENT.CHILD_ADDED, this.hndNodeEvent);
            this.getContainer().addEventListener(ƒ.EVENT.CHILD_REMOVED, this.hndNodeEvent);
        }
        hndNodeEvent(_event) {
            console.log("Node event", _event);
        }
        //hndAnimationFrame = (_event: Event) => {
        hndAnimationFrame(_event) {
            console.count(this.name);
        }
    }
    function init() {
        Scenes.createMiniScene();
        let node = Scenes.node;
        let child = node.getChildren()[0];
        let test = new Test();
        test.name = "Test_1";
        let test2 = new Test();
        test2.name = "Test_2";
        console.count(test.name);
        console.count(test2.name);
        node.addComponent(test);
        console.log("Test-scripts attached after add", node.getComponents(Test));
        node.removeComponent(test);
        console.log("Test-scripts attached after remove", node.getComponents(Test));
        node.removeChild(child);
        console.log("Children attached after remove", node.getChildren());
        node.appendChild(child);
        console.log("Children attached after append", node.getChildren());
        ƒ.Loop.start();
    }
})(Scripts || (Scripts = {}));
//# sourceMappingURL=Scripts.js.map