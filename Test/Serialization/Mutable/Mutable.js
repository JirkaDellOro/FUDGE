var Mutable;
(function (Mutable) {
    window.addEventListener("DOMContentLoaded", init);
    let mutator;
    let angle = 0;
    function init() {
        Scenes.createMiniScene();
        mutator = Scenes.node.cmpTransform.getMutatorForAnimation();
        console.log("Mutator: ", mutator);
        let serialization = Scenes.node.cmpTransform.serialize();
        console.log("Serialization: ", serialization);
        animate();
    }
    function animate() {
        window.requestAnimationFrame(animate);
        angle += 0.03;
        mutator.matrix.data[12] = 50 * Math.sin(angle);
        mutator.matrix.data[5] = Math.cos(1.7 * angle);
        Scenes.viewPort.drawScene();
    }
})(Mutable || (Mutable = {}));
//# sourceMappingURL=Mutable.js.map