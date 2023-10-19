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
        node = new ƒAid.Node("Test", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("texture", ƒ.ShaderLitTextured, new ƒ.CoatTextured()), new ƒ.MeshCube("Cube"));
        root.appendChild(node);
        viewport = ƒAid.Viewport.create(root);
        viewport.draw();
        initAnim();
        document.body.addEventListener("change", initAnim);
        document.querySelector("button[id=jump]").addEventListener("click", jump);
        function jump(_event) {
            console.log("Jump");
            let cmpAnimator = node.getComponent(ƒ.ComponentAnimator);
            cmpAnimator.jumpToLabel("jump");
        }
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, update);
        ƒ.Loop.start();
    }
    function initAnim() {
        console.log("%cStart over", "color: red;");
        let form = document.forms[0];
        let formData = new FormData(document.forms[0]);
        let time0 = parseInt(form.querySelector("input[name=time0]").value);
        let time1 = parseInt(form.querySelector("input[name=time1]").value);
        let value0 = parseInt(form.querySelector("input[name=value0]").value);
        let value1 = parseInt(form.querySelector("input[name=value1]").value);
        let animseq = new ƒ.AnimationSequence();
        animseq.addKey(new ƒ.AnimationKey(time0, value0));
        animseq.addKey(new ƒ.AnimationKey(time1, value1));
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
        let fpsInput = document.querySelector("input[name=fps]");
        let fps = parseInt(fpsInput.value);
        let animation = new ƒ.Animation("testAnimation", animStructure, fps);
        animation.setEvent("event", parseInt(form.querySelector("input[name=event]").value));
        animation.labels["jump"] = parseInt(form.querySelector("input[name=label]").value);
        let playmode = String(formData.get("mode"));
        let quantization = String(formData.get("back"));
        let cmpAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE[playmode], ƒ.ANIMATION_QUANTIZATION[quantization]);
        cmpAnimator.scale = 1;
        cmpAnimator.addEventListener("event", (_event) => {
            let time = _event.target.time;
            console.log(`Event fired at ${time}`, _event);
        });
        if (node.getComponent(ƒ.ComponentAnimator)) {
            node.removeComponent(node.getComponent(ƒ.ComponentAnimator));
        }
        node.addComponent(cmpAnimator);
        cmpAnimator.activate(true);
        console.log("Component", cmpAnimator);
    }
    function update() {
        viewport.draw();
    }
})(AnimatorControleTest || (AnimatorControleTest = {}));
//# sourceMappingURL=AnimationTest.js.map