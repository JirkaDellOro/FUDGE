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
        node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("Uni", ƒ.ShaderUniColor, new ƒ.CoatColored()), new ƒ.MeshCube("Cube"));
        root.appendChild(node);
        viewport = ƒAid.Viewport.create(root);
        viewport.draw();
        initAnim();
    }
    function initAnim() {
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
        let cmpAnimation = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
        cmpAnimation.speed = 2;
        // #region serialisation
        console.group("before");
        console.log(cmpAnimation);
        let serialisation = cmpAnimation.serialize();
        console.log(ƒ.Serializer.stringify(serialisation));
        console.groupEnd();
        console.group("after");
        let cmpAnimationReconstructed = new ƒ.ComponentAnimator();
        cmpAnimationReconstructed.deserialize(serialisation);
        console.log(cmpAnimationReconstructed);
        console.groupEnd();
        // #endregion
        // override component with reconstruction for testing. Deactivate to test original
        // cmpAnimation = cmpAnimationReconstructed;
        cmpAnimation.addEventListener("eventStart", hndlEv);
        cmpAnimation.addEventListener("eventAfterStart", hndlEv);
        cmpAnimation.addEventListener("eventMiddle", hndlEv);
        cmpAnimation.addEventListener("eventBeforeEnd", hndlEv);
        cmpAnimation.addEventListener("eventEnd", hndlEv);
        cmpAnimation.playmode = ƒ.ANIMATION_PLAYMODE.REVERSELOOP;
        node.addComponent(cmpAnimation);
        cmpAnimation.jumpTo(animation.labels["test"]);
        cmpAnimation.activate(true);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, frame);
        ƒ.Loop.start();
        // let timer: ƒ.Timer = new ƒ.Timer(ƒ.Time.game, 2000, 1, () => node.removeComponent(cmpAnimation));
        let timer = new ƒ.Timer(ƒ.Time.game, 2000, 1, () => root.removeChild(node));
    }
    function frame() {
        viewport.draw();
    }
    function hndlEv(_e) {
        console.log(_e.type);
    }
})(AnimatorComponentTest || (AnimatorComponentTest = {}));
//# sourceMappingURL=AnimatorComponentTest.js.map