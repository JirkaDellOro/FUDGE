namespace Scripts {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    class Test extends ƒ.ComponentScript {
        protected text: string;

        constructor() {
            super();
            this.text = "Hallo";
            this.addEventListener(ƒ.EVENT.COMPONENT_ADDED, this.hndComponentEvent);
        }

        hndComponentEvent(_event: Event): void {
            console.log("Component event", _event);
            console.log("Container", this.getContainer());
            console.log("Target is this?", _event.target == this, this.text);
            this.getContainer().addEventListener(ƒ.EVENT.CHILD_ADDED, this.hndNodeEvent);
            this.getContainer().addEventListener(ƒ.EVENT.CHILD_REMOVED, this.hndNodeEvent);
        }

        hndNodeEvent(_event: Event): void {
            console.log("Node event", _event);
        }
    }

    function init(): void {
        Scenes.createMiniScene();
        let node: ƒ.Node = Scenes.node;
        let child: ƒ.Node = node.getChildren()[0];

        let test: Test = new Test();
        node.addComponent(test);
        console.log("Test-scripts attached after add", node.getComponents(Test));
        node.removeComponent(test);
        console.log("Test-scripts attached after remove", node.getComponents(Test));

        node.removeChild(child);
        console.log("Children attached after remove", node.getChildren());
        node.appendChild(child);
        console.log("Children attached after append", node.getChildren());
    }
}