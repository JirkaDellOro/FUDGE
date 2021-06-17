///<reference path="../../../../Aid/Build/FudgeAid.d.ts"/>
var AnimatorComponentTest;
///<reference path="../../../../Aid/Build/FudgeAid.d.ts"/>
(function (AnimatorComponentTest) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("DOMContentLoaded", init);
    let node;
    let viewport = new ƒ.Viewport();
    let startTime = Date.now();
    function init() {
        let child = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("Red", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red"))), new ƒ.MeshCube());
        child.mtxLocal.scaleX(2);
        node.addChild(child);
        let camera = new ƒ.ComponentCamera();
        camera.mtxPivot.translate(new ƒ.Vector3(1, 1, 10));
        camera.mtxPivot.lookAt(ƒ.Vector3.ZERO());
        let canvas = ƒAid.Canvas.create();
        document.body.appendChild(canvas);
        viewport.initialize("TestViewport", node, camera, canvas);
        viewport.showSceneGraph();
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
        animation.labels["test"] = 3000;
        animation.setEvent("startEvent", 0);
        animation.setEvent("almostStartEvent", 1);
        animation.setEvent("middleEvent", 2500);
        animation.setEvent("almostEndEvent", 4999);
        animation.setEvent("endEvent", 5000);
        let cmpAnimation = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS);
        // cmpAnimation.speed = 0.1;
        // node.addComponent(cmpAnimation);
        // cmpAnimation.speed = 10;
        // cmpAnimation.jumpTo(animation.labels["test"]);
        // #region serialisation
        console.group("before");
        console.log(cmpAnimation);
        let serialisation = cmpAnimation.serialize();
        console.log(ƒ.Serializer.stringify(serialisation));
        console.groupEnd();
        console.group("after");
        let animFromSeri = new ƒ.ComponentAnimator();
        animFromSeri.deserialize(serialisation);
        console.log(animFromSeri);
        console.groupEnd();
        node.addComponent(animFromSeri);
        // #endregion
        cmpAnimation.addEventListener("startEvent", hndlEv);
        cmpAnimation.addEventListener("almostStartEvent", hndlEv);
        cmpAnimation.addEventListener("middleEvent", hndlEv);
        cmpAnimation.addEventListener("almostEndEvent", hndlEv);
        cmpAnimation.addEventListener("endEvent", hndlEv);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, frame);
        ƒ.Loop.start();
    }
    function frame() {
        viewport.draw();
    }
    function hndlEv(_e) {
        console.log(_e.type /*, (<ƒ.ComponentAnimator>_e.target).getContainer().name*/);
    }
})(AnimatorComponentTest || (AnimatorComponentTest = {}));
//# sourceMappingURL=AnimatorComponentTest.js.map