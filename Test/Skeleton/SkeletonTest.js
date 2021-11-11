"use strict";
var AnimationTest;
(function (AnimationTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    async function init() {
        const gltf = await ƒ.GLTFLoader.load("animated_arm.gltf");
        gltf.cameras[0].clrBackground = ƒ.Color.CSS("grey");
        gltf.scene.getChildrenByName("Arm")[0].getChild(0).addComponent(new ƒ.ComponentMaterial(new ƒ.Material("UniColor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red")))));
        console.log(gltf);
        const canvas = document.querySelector("canvas");
        const node = initAnimatedQuad();
        const camera = new ƒ.ComponentCamera();
        camera.mtxPivot.translateX(-10);
        camera.mtxPivot.rotateZ(180);
        node.addComponent(camera);
        //gltf.scene.addComponent(camera);
        const viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", node, camera, canvas);
        //viewport.initialize("Viewport", gltf.scene, camera, canvas);
        viewport.draw();
        console.log(viewport);
        ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, () => viewport.draw());
        ƒ.Loop.start();
    }
    class MeshQuadSkin extends ƒ.MeshSkin {
        constructor() {
            super();
            this.ƒvertices = Float32Array.from([
                -1, -1, -2,
                1, -1, -2,
                -1, 1, -2,
                1, 1, -2,
                -1, -1, 0,
                1, -1, 0,
                -1, 1, 0,
                1, 1, 0,
                -1, -1, 2,
                1, -1, 2,
                -1, 1, 2,
                1, 1, 2 // 11
            ]);
            this.ƒiBones = Uint8Array.from([
                0, 1, 0, 0,
                0, 1, 0, 0,
                0, 1, 0, 0,
                0, 1, 0, 0,
                0, 1, 0, 0,
                0, 1, 0, 0,
                0, 1, 0, 0,
                0, 1, 0, 0,
                0, 1, 0, 0,
                0, 1, 0, 0,
                0, 1, 0, 0,
                0, 1, 0, 0
            ]);
            this.ƒweights = Float32Array.from([
                1.0, 0.0, 0, 0,
                1.0, 0.0, 0, 0,
                1.0, 0.0, 0, 0,
                1.0, 0.0, 0, 0,
                0.5, 0.5, 0, 0,
                0.5, 0.5, 0, 0,
                0.5, 0.5, 0, 0,
                0.5, 0.5, 0, 0,
                0.0, 1.0, 0, 0,
                0.0, 1.0, 0, 0,
                0.0, 1.0, 0, 0,
                0.0, 1.0, 0, 0
            ]);
            this.ƒindices = Uint16Array.from([
                0, 1, 2,
                2, 3, 1,
                0, 1, 4,
                4, 5, 1,
                4, 5, 8,
                8, 9, 5,
                1, 2, 5,
                5, 6, 2,
                5, 6, 9,
                9, 10, 6,
                2, 3, 6,
                6, 7, 3,
                6, 7, 10,
                10, 11, 7,
                3, 0, 7,
                7, 4, 0,
                7, 4, 11,
                11, 8, 4,
                8, 9, 10,
                10, 11, 9
            ]);
        }
    }
    function initAnimatedQuad() {
        const zylinder = new ƒ.Node("AnimatedQuad");
        const skeleton = new ƒ.Skeleton("Skeleton");
        skeleton.addChild(new ƒ.Bone("LowerBone", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Z(-2))));
        skeleton.bones[0].addChild(new ƒ.Bone("UpperBone", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Z(2))));
        //console.log(ƒ.Serializer.serialize(skeleton));
        const cmpSkeleton = new ƒ.ComponentSkeleton(skeleton);
        zylinder.addComponent(cmpSkeleton);
        const mesh = new MeshQuadSkin();
        const cmpMesh = new ƒ.ComponentMeshSkin(mesh, cmpSkeleton);
        zylinder.addComponent(cmpMesh);
        const material = new ƒ.Material("Grey", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("Grey")));
        const cmpMaterial = new ƒ.ComponentMaterial(material);
        zylinder.addComponent(cmpMaterial);
        const sequence = new ƒ.AnimationSequence();
        sequence.addKey(new ƒ.AnimationKey(0, 0));
        sequence.addKey(new ƒ.AnimationKey(5000, 45));
        const animationStructure = {
            components: {
                ComponentSkeleton: [{ "ƒ.ComponentSkeleton": {
                            mtxBoneLocals: {
                                1: {
                                    rotation: {
                                        z: sequence
                                    }
                                }
                            }
                        } }]
            }
        };
        const animation = new ƒ.Animation("Animation", animationStructure);
        const cmpAnimator = new ƒ.ComponentAnimator(animation);
        zylinder.addComponent(cmpAnimator);
        console.log(zylinder);
        return zylinder;
    }
})(AnimationTest || (AnimationTest = {}));
//# sourceMappingURL=SkeletonTest.js.map