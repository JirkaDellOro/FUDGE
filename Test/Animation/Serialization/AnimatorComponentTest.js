var AnimatorComponentTest;
(function (AnimatorComponentTest) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("DOMContentLoaded", init);
    let viewport;
    function init() {
        let root = new ƒ.Node("Root");
        viewport = ƒAid.Viewport.create(root);
        document.body.addEventListener("change", createTest);
        createTest();
    }
    async function createTest() {
        console.log("%cStart over", "color: red;");
        let root = new ƒ.Node("Root");
        let node;
        node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("Texture", ƒ.ShaderLitTextured, new ƒ.CoatTextured()), new ƒ.MeshCube("Cube"));
        root.appendChild(node);
        viewport.setBranch(root);
        viewport.draw();
        let animseq = new ƒ.AnimationSequence();
        animseq.addKey(new ƒ.AnimationKey(0, 0));
        animseq.addKey(new ƒ.AnimationKey(5000, 45));
        let animStructure = {
            components: {
                ComponentTransform: [
                    {
                        mtxLocal: {
                            rotation: {
                                x: animseq,
                                y: animseq
                            }
                        }
                    }
                ]
            }
        };
        let animation = new ƒ.Animation("testAnimation", animStructure, 1);
        animation.labels["test"] = 2000;
        animation.setEvent("event", 3000);
        let cmpAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_QUANTIZATION.CONTINOUS);
        cmpAnimator.scale = 2;
        // #region serialisation
        console.groupCollapsed("Animation");
        let serialisation = animation.serialize();
        console.log("Animation", ƒ.Serializer.stringify(serialisation));
        console.groupEnd();
        console.groupCollapsed("Serialization");
        console.log(cmpAnimator);
        serialisation = cmpAnimator.serialize();
        let txtOriginal = ƒ.Serializer.stringify(serialisation);
        console.log("ComponentAnimator original", txtOriginal);
        console.groupEnd();
        console.groupCollapsed("Reconstruction");
        let cmpAnimatorReconstructed = new ƒ.ComponentAnimator();
        await cmpAnimatorReconstructed.deserialize(serialisation);
        // console.log(cmpAnimatorReconstructed);
        serialisation = cmpAnimatorReconstructed.serialize();
        let txtReconstruction = ƒ.Serializer.stringify(serialisation);
        console.log(txtReconstruction);
        console.groupEnd();
        // #endregion
        if (txtOriginal == txtReconstruction)
            console.log("Serialization strings of original and reconstruction match");
        else
            console.error("Serialization strings of original and reconstruction don't match");
        let formdata = new FormData(document.forms[0]);
        if (formdata.get("use") == "reconstruction")
            cmpAnimator = cmpAnimatorReconstructed;
        cmpAnimator.addEventListener("event", hndlEv);
        if (formdata.get("jump"))
            cmpAnimator.addEventListener("event", (_event) => cmpAnimator.jumpTo(animation.labels["test"]));
        node.addComponent(cmpAnimator);
        cmpAnimator.activate(true);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, frame);
        ƒ.Loop.start();
        if (formdata.get("destroy") == "detach")
            console.log(new ƒ.Timer(ƒ.Time.game, 8000, 1, () => node.removeComponent(cmpAnimator)));
        if (formdata.get("destroy") == "remove")
            console.log(new ƒ.Timer(ƒ.Time.game, 8000, 1, () => root.removeChild(node)));
    }
    function frame() {
        viewport.draw();
    }
    function hndlEv(_e) {
        console.log("Event handled", _e);
    }
})(AnimatorComponentTest || (AnimatorComponentTest = {}));
//# sourceMappingURL=AnimatorComponentTest.js.map