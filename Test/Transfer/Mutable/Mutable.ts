namespace Mutable {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    let mutator: ƒ.Mutator;
    let angle: number = 0;
    let cmpTransform: ƒ.ComponentTransform;

    function init(): void {
        Scenes.createMiniScene();
        Scenes.createViewport();

        cmpTransform = Scenes.node.cmpTransform;
        mutator = cmpTransform.getMutatorForAnimation();
        console.log("Mutator: ", mutator);
        let serialization: ƒ.Serialization = Scenes.node.cmpTransform.serialize();
        console.log("Serialization: ", serialization);

        animate();
    }

    function animate(): void {
        window.requestAnimationFrame(animate);
        
        angle += 0.03;
        (mutator.local as ƒ.Matrix4x4).data[12] = 5 * Math.sin(angle);
        (mutator.local as ƒ.Matrix4x4).data[5] = Math.cos(1.7 * angle);
        cmpTransform.mutate(mutator);

        ƒ.RenderManager.recalculateAllNodeTransforms();
        Scenes.viewPort.draw();
    }
}