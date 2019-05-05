var Mutable;
(function (Mutable) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    let mutator;
    let angle = 0;
    let cmpTransform;
    function init() {
        Scenes.createMiniScene();
        Scenes.createViewport();
        cmpTransform = Scenes.node.cmpTransform;
        mutator = cmpTransform.getMutatorForAnimation();
        console.log("Mutator: ", mutator);
        let serialization = Scenes.node.cmpTransform.serialize();
        console.log("Serialization: ", serialization);
        animate();
    }
    function animate() {
        window.requestAnimationFrame(animate);
        angle += 0.03;
        mutator.local.data[12] = 5 * Math.sin(angle);
        mutator.local.data[5] = Math.cos(1.7 * angle);
        cmpTransform.mutate(mutator);
        ƒ.RenderManager.recalculateAllNodeTransforms();
        Scenes.viewPort.draw();
    }
})(Mutable || (Mutable = {}));
//# sourceMappingURL=Mutable.js.map