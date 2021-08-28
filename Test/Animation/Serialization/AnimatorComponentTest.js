var AnimatorComponentTest;
(function (AnimatorComponentTest) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("DOMContentLoaded", init);
    let node;
    let root;
    let viewport;
    function init() {
        root = new ƒ.Node("Root");
        node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("Texture", ƒ.ShaderTexture, new ƒ.CoatTextured()), new ƒ.MeshCube("Cube"));
        root.appendChild(node);
        viewport = ƒAid.Viewport.create(root);
        viewport.draw();
        initAnim();
    }
    async function initAnim() {
        let animseq = new ƒ.AnimationSequence();
        animseq.addKey(new ƒ.AnimationKey(0, 0));
        animseq.addKey(new ƒ.AnimationKey(5000, 45));
        let animStructure = {
            components: {
                ComponentTransform: [
                    {
                        "ƒ.ComponentTransform": {
                            mtxLocal: {
                                rotation: {
                                    x: animseq,
                                    y: animseq
                                }
                            }
                        }
                    }
                ]
            }
        };
        let animation = new ƒ.Animation("testAnimation", animStructure, 1);
        animation.labels["test"] = 3000;
        animation.setEvent("eventStart", 0);
        animation.setEvent("eventAfterStart", 1);
        animation.setEvent("eventMiddle", 2500);
        animation.setEvent("eventBeforeEnd", 4999);
        animation.setEvent("eventEnd", 5000);
        let cmpAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
        cmpAnimator.speed = 2;
        // #region serialisation
        console.group("Serialization");
        console.log(animation);
        let serialisation = animation.serialize();
        console.log(ƒ.Serializer.stringify(serialisation));
        console.log(cmpAnimator);
        serialisation = cmpAnimator.serialize();
        console.log(ƒ.Serializer.stringify(serialisation));
        console.groupEnd();
        console.group("Reconstruction");
        let cmpAnimatorReconstructed = new ƒ.ComponentAnimator();
        await cmpAnimatorReconstructed.deserialize(serialisation);
        console.log(cmpAnimatorReconstructed);
        serialisation = cmpAnimatorReconstructed.serialize();
        console.log(ƒ.Serializer.stringify(serialisation));
        console.groupEnd();
        // #endregion
        // override component with reconstruction for testing. Deactivate to test original
        cmpAnimator = cmpAnimatorReconstructed;
        cmpAnimator.addEventListener("eventStart", hndlEv);
        cmpAnimator.addEventListener("eventAfterStart", hndlEv);
        cmpAnimator.addEventListener("eventMiddle", hndlEv);
        cmpAnimator.addEventListener("eventBeforeEnd", hndlEv);
        cmpAnimator.addEventListener("eventEnd", hndlEv);
        // cmpAnimation.playmode = ƒ.ANIMATION_PLAYMODE.REVERSELOOP;
        node.addComponent(cmpAnimator);
        cmpAnimator.jumpTo(animation.labels["test"]);
        cmpAnimator.activate(true);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, frame);
        ƒ.Loop.start();
        let timer = new ƒ.Timer(ƒ.Time.game, 2000, 1, () => node.removeComponent(cmpAnimator));
        // let timer: ƒ.Timer = new ƒ.Timer(ƒ.Time.game, 2000, 1, () => root.removeChild(node));
    }
    function frame() {
        viewport.draw();
    }
    function hndlEv(_e) {
        console.log(_e.type);
    }
})(AnimatorComponentTest || (AnimatorComponentTest = {}));
//# sourceMappingURL=AnimatorComponentTest.js.map