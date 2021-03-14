var Scripts;
(function (Scripts) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    class Test extends ƒ.ComponentScript {
        constructor() {
            super();
            this.count = 0;
            this.hndMutation = (_event) => {
                console.log("Mutation", this);
            };
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndComponentAdd);
            this.hndLoopFrame = this.hndLoopFrame.bind(this); // when using conventional function
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.hndLoopFrame); // when using arrow-function
            this.addEventListener(ƒ.EVENT.MUTATE, this.hndMutation);
        }
        async mutate(_mutator) {
            super.mutate(_mutator);
        }
        hndComponentAdd(_event) {
            console.log("Component event", _event);
            console.log("Container", this.getContainer());
            console.log("Target is this?", _event.target == this, this.name);
            this.getContainer().addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndNodeEvent);
            this.getContainer().addEventListener(ƒ.EVENT.CHILD_REMOVE, this.hndNodeEvent);
        }
        hndNodeEvent(_event) {
            console.log("Node event", _event);
        }
        hndLoopFrame(_event) {
            //hndAnimationFrame(_event: Event): void {
            console.log(this.name, this.count++);
            if (this.count > 20)
                ƒ.Loop.removeEventListener(_event.type, this.hndLoopFrame);
        }
    }
    function init() {
        let node = new ƒ.Node("Node");
        let child = new ƒ.Node("Child");
        node.addChild(child);
        let test = new Test();
        test.name = "Test_1";
        let test2 = new Test();
        test2.name = "Test_2";
        node.addComponent(test);
        console.log("Test-scripts attached after add", node.getComponents(Test));
        node.removeComponent(test);
        console.log("Test-scripts attached after remove", node.getComponents(Test));
        node.removeChild(child);
        console.log("Children attached after remove", node.getChildren());
        node.addChild(child);
        console.log("Children attached after append", node.getChildren());
        ƒ.Loop.start();
        let mutator = test.getMutator();
        console.log("Mutator", mutator);
        let mutatorTypes = test.getMutatorAttributeTypes(mutator);
        console.log("MutatorTypes", mutatorTypes);
        setTimeout(mutate, 160);
        function mutate() {
            mutator.name = "Test_1 has mutated!!";
            test.mutate(mutator);
        }
        console.groupCollapsed("Properties");
        for (let name in test) {
            let value = test[name];
            console.log("Name %s, Funktion %s, Object %s", name, value instanceof Function, value instanceof Object);
        }
        console.groupEnd();
        console.log("Serialization", test.serialize());
    }
})(Scripts || (Scripts = {}));
//# sourceMappingURL=Scripts.js.map