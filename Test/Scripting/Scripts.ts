namespace Scripts {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    class Test extends ƒ.ComponentScript {
        public name: string;

        constructor() {
            super();
            this.addEventListener(ƒ.EVENT.COMPONENT_ADDED, this.hndComponentEvent);
            ƒ.Loop.addEventListener(ƒ.EVENT.ANIMATION_FRAME, this.hndAnimationFrame.bind(this)); // when using concentional function
            // Loop.addEventListener(ƒ.EVENT.ANIMATION_FRAME, this.hndAnimationFrame;  // when using arrow-function
        }

        hndComponentEvent(_event: Event): void {
            console.log("Component event", _event);
            console.log("Container", this.getContainer());
            console.log("Target is this?", _event.target == this, this.name);
            this.getContainer().addEventListener(ƒ.EVENT.CHILD_ADDED, this.hndNodeEvent);
            this.getContainer().addEventListener(ƒ.EVENT.CHILD_REMOVED, this.hndNodeEvent);
        }

        hndNodeEvent(_event: Event): void {
            console.log("Node event", _event);
        }

        //hndAnimationFrame = (_event: Event) => {
        hndAnimationFrame(_event: Event): void {
            console.count(this.name);
        }
    }


    function init(): void {
        Scenes.createMiniScene();
        let node: ƒ.Node = Scenes.node;
        let child: ƒ.Node = node.getChildren()[0];

        let test: Test = new Test();
        test.name = "Test_1";
        let test2: Test = new Test();
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
}