namespace Scripts {
    import ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);

    class Test extends ƒ.ComponentScript {
        public name: string;
        private count: number = 0;

        constructor() {
            super();
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndComponentAdd);
            this.hndLoopFrame = this.hndLoopFrame.bind(this); // when using conventional function
            ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, this.hndLoopFrame);  // when using arrow-function
            this.addEventListener(ƒ.EVENT.MUTATE, this.hndMutation);
        }


        public async mutate(_mutator: ƒ.Mutator): Promise<void> {
            super.mutate(_mutator);
        }

        private hndMutation = (_event: Event): void => {
            console.log("Mutation", this);
        }

        private hndComponentAdd(_event: Event): void {
            console.log("Component event", _event);
            console.log("Container", this.getContainer());
            console.log("Target is this?", _event.target == this, this.name);
            this.getContainer().addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndNodeEvent);
            this.getContainer().addEventListener(ƒ.EVENT.CHILD_REMOVE, this.hndNodeEvent);
        }

        private hndNodeEvent(_event: Event): void {
            console.log("Node event", _event);
        }

        private hndLoopFrame(_event: Event): void {
            //hndAnimationFrame(_event: Event): void {
            console.log(this.name, this.count++);
            if (this.count > 20)
                ƒ.Loop.removeEventListener(_event.type, this.hndLoopFrame);
        }
    }


    function init(): void {
        let node: ƒ.Node = new ƒ.Node("Node");
        let child: ƒ.Node = new ƒ.Node("Child");
        node.addChild(child);

        let test: Test = new Test();
        test.name = "Test_1";
        let test2: Test = new Test();
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

        let mutator: ƒ.Mutator = test.getMutator();
        console.log("Mutator", mutator);
        let mutatorTypes: ƒ.MutatorAttributeTypes = test.getMutatorAttributeTypes(mutator);
        console.log("MutatorTypes", mutatorTypes);

        setTimeout(mutate, 160);
        function mutate(): void {
            mutator.name = "Test_1 has mutated!!";
            test.mutate(mutator);
        }

        console.groupCollapsed("Properties");
        for (let name in test) {
            let value: Object = test[name];
            console.log("Name %s, Funktion %s, Object %s", name, value instanceof Function, value instanceof Object);
        }
        console.groupEnd();

        console.log("Serialization", test.serialize());
    }
}