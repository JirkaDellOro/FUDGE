namespace Mutable {
    import ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);

    let mutator: ƒ.Mutator;
    let angle: number = 0;
    let cmpTransform: ƒ.ComponentTransform;

    function init(): void {
        Scenes.createMiniScene();
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
        (mutator.matrix as ƒ.Matrix4x4).data[12] = 50 * Math.sin(angle);
        (mutator.matrix as ƒ.Matrix4x4).data[5] = Math.cos(1.7 * angle);
        cmpTransform.mutate(mutator);

        Scenes.viewPort.drawScene();
    }
}