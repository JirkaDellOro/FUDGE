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

        let mttCamera: ƒ.Mutator;
        mttCamera = Scenes.camera.getComponent(ƒ.ComponentCamera).getMutator();
        console.log("mttCamera: ", mttCamera);
        let mttCameraTypes: ƒ.MutatorAttributeTypes;
        mttCameraTypes = Scenes.camera.getComponent(ƒ.ComponentCamera).getMutatorAttributeTypes(mttCamera);
        console.log("mttCameraTypes: ", mttCameraTypes);
        let srlCamera: ƒ.Serialization = Scenes.camera.getComponent(ƒ.ComponentCamera).serialize();
        console.log("srlCamera: ", srlCamera);

        let srlNode: ƒ.Serialization = Scenes.node.serialize();
        console.log("srlNode: ", srlNode);

        animate();
    }

    function animate(): void {
        window.requestAnimationFrame(animate);

        angle += 0.03;

        mutator.translation["x"] = 5 * Math.sin(angle);
        mutator.scaling["y"] = Math.cos(1.7 * angle);

        cmpTransform.mutate(mutator);

        ƒ.RenderManager.update();
        Scenes.viewPort.draw();
    }
}