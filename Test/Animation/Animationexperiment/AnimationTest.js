var AnimatorControleTest;
(function (AnimatorControleTest) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("DOMContentLoaded", init);
    let node;
    let root;
    let viewport;
    function init() {
        root = new ƒ.Node("Root");
        node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("texture", ƒ.ShaderTexture, new ƒ.CoatTextured()), new ƒ.MeshCube("Cube"));
        root.appendChild(node);
        viewport = ƒAid.Viewport.create(root);
        viewport.draw();
        document.querySelector("button[id=start]").addEventListener("click", initAnim);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, frame);
        ƒ.Loop.start();
    }
    function initAnim() {
        let form = document.forms[0];
        let formData = new FormData(document.forms[0]);
        let time1 = parseInt(form.querySelector("input[name=keytime1]").value);
        let time2 = parseInt(form.querySelector("input[name=keytime2]").value);
        let value1 = parseInt(form.querySelector("input[name=value1]").value);
        let value2 = parseInt(form.querySelector("input[name=value2]").value);
        let animseq = new ƒ.AnimationSequence();
        animseq.addKey(new ƒ.AnimationKey(time1, value1));
        animseq.addKey(new ƒ.AnimationKey(time2, value2));
        let test = "rotation";
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
        let fpsInput = document.querySelector("input[name=fps]");
        let fps = parseInt(fpsInput.value);
        let animation = new ƒ.Animation("testAnimation", animStructure, fps);
        let playmode = String(formData.get("mode"));
        let playback = String(formData.get("back"));
        let cmpAnimation = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE[playmode], ƒ.ANIMATION_PLAYBACK[playback]);
        cmpAnimation.speed = 1;
        if (node.getComponent(ƒ.ComponentAnimator)) {
            node.removeComponent(node.getComponent(ƒ.ComponentAnimator));
        }
        node.addComponent(cmpAnimation);
        cmpAnimation.activate(true);
        console.log(cmpAnimation);
    }
    function frame() {
        viewport.draw();
    }
})(AnimatorControleTest || (AnimatorControleTest = {}));
//# sourceMappingURL=AnimationTest.js.map