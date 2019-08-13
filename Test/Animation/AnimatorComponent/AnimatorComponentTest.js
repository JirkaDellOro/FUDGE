var AnimatorComponentTest;
(function (AnimatorComponentTest) {
    var ƒ = Fudge;
    window.addEventListener("DOMContentLoaded", init);
    let node;
    let startTime = Date.now();
    function init() {
        Scenes.createMiniScene();
        Scenes.createViewport();
        Scenes.viewPort.draw();
        node = Scenes.node;
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
        let animation = new ƒ.Animation("testAnimation", animStructure, 10);
        animation.labels["test"] = 3000;
        animation.events["myEvent"] = 0;
        //#region serialisation
        // console.group("before");
        // console.log(animation);
        // let serialisation: ƒ.Serialization = animation.serialize();
        // console.log(ƒ.Serializer.stringify(serialisation));
        // console.groupEnd();
        // console.group("after");
        // let animFromSeri: ƒ.Animation = new ƒ.Animation(null);
        // animFromSeri.deserialize(serialisation);
        // console.log(animFromSeri);
        // console.groupEnd();
        //#endregion
        let cmpAnimation = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP, ƒ.ANIMATION_PLAYBACK.FRAMEBASED);
        node.addComponent(cmpAnimation);
        // cmpAnimation.speed = 10;
        cmpAnimation.addEventListener("myEvent", hndlEv);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, frame);
        ƒ.Loop.start();
    }
    function frame() {
        ƒ.RenderManager.update();
        Scenes.viewPort.draw();
    }
    function hndlEv(_e) {
        console.log("event!");
    }
})(AnimatorComponentTest || (AnimatorComponentTest = {}));
//# sourceMappingURL=AnimatorComponentTest.js.map