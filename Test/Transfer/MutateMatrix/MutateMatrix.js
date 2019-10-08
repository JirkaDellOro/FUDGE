var MutateMatrixTest;
(function (MutateMatrixTest) {
    var ƒ = FudgeCore;
    document.addEventListener("DOMContentLoaded", init);
    let cmpTransform;
    let i = 0;
    function init() {
        console.log("init");
        Scenes.createMiniScene();
        Scenes.createViewport(document.getElementsByTagName("canvas")[0]);
        cmpTransform = Scenes.node.getComponent(ƒ.ComponentTransform);
        console.log(cmpTransform);
        let orgMutator = cmpTransform.getMutator();
        console.log(orgMutator);
        // let mutator: ƒ.Mutator = matTest.getMutator();
        // let newMutator: ƒ.Mutator = {
        //   rotation: {
        //     x: 10
        //   }
        // };
        // cmpTransform.mutate(newMutator);
        ƒ.Debug.log(cmpTransform.getMutator());
        // console.log(matTest);
        // Scenes.viewPort.draw();
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, nextFrame);
        ƒ.Loop.start();
    }
    function nextFrame() {
        let newMutator = {
            rotation: {
                x: i
            }
        };
        i++;
        cmpTransform.mutate(newMutator);
        ƒ.RenderManager.update();
        Scenes.viewport.draw();
    }
})(MutateMatrixTest || (MutateMatrixTest = {}));
//# sourceMappingURL=MutateMatrix.js.map