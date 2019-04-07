namespace Events {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    let mutator: ƒ.Mutator;
    let angle: number = 0;

    function init(): void {
        Scenes.createMiniScene();
        let node: ƒ.Node = Scenes.node;
        let child: ƒ.Node = node.getChildren()[0];
        console.log(child);
        node.addEventListener("testBubble", Test);
        child.dispatchEvent(new Event("testBubble"));
        node.addEventListener("testCapture", Test, true);
        child.dispatchEvent(new Event("testCapture"));
        child.addEventListener("testBroadcast", Test, true);
        node.broadcastEvent(new Event("testBroadcast"));
    } 

    function Test(_event: Event): void {
        console.group(_event.type);
        console.log(_event);
        console.groupEnd();
    }

    /*
        mutator = Scenes.node.cmpTransform.getMutatorForAnimation();
        console.log("Mutator: ", mutator);
        let serialization: ƒ.Serialization = Scenes.node.cmpTransform.serialize();
        console.log("Serialization: ", serialization);

        animate();
    }

    function animate(): void {
        window.requestAnimationFrame(animate);
        angle += 0.03;
        (mutator.matrix as ƒ.Matrix4x4).data[12] = 50 * Math.sin(angle);
        (mutator.matrix as ƒ.Matrix4x4).data[5] = Math.cos(1.7 * angle);
        Scenes.viewPort.drawScene();
    }
    */
}