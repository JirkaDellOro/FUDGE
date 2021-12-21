"use strict";
///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
var SkeletonTest;
///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
(function (SkeletonTest) {
    var ƒ = FudgeCore;
    window.addEventListener("load", init);
    async function init() {
        const canvas = document.querySelector("canvas");
        // setup scene
        const scene = new ƒ.Node("Scene");
        const rotatorX = new ƒ.Node("RotatorX");
        rotatorX.addComponent(new ƒ.ComponentTransform());
        const rotatorY = new ƒ.Node("RotatorY");
        rotatorY.addComponent(new ƒ.ComponentTransform());
        const zylinder = await createAnimatedCylinder();
        console.log(zylinder);
        scene.addChild(rotatorX);
        rotatorX.addChild(rotatorY);
        rotatorY.addChild(zylinder);
        // setup camera
        const camera = new ƒ.Node("Camera");
        camera.addComponent(new ƒ.ComponentCamera());
        camera.addComponent(new ƒ.ComponentTransform());
        camera.mtxLocal.translateZ(10);
        camera.mtxLocal.showTo(ƒ.Vector3.ZERO(), camera.mtxLocal.getY());
        scene.addChild(camera);
        // setup light
        const cmpLightDirectional = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0.5, 0.5, 0.5)));
        cmpLightDirectional.mtxPivot.rotateY(180);
        scene.addComponent(cmpLightDirectional);
        const cmpLightAmbient = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(0.5, 0.5, 0.5)));
        scene.addComponent(cmpLightAmbient);
        // setup viewport
        const viewport = new ƒ.Viewport();
        viewport.initialize("Viewport", scene, camera.getComponent(ƒ.ComponentCamera), canvas);
        viewport.draw();
        console.log(viewport);
        // run loop
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, () => update(viewport, rotatorX.mtxLocal, rotatorY.mtxLocal));
        ƒ.Loop.start();
    }
    class MeshSkinCylinder extends ƒ.MeshSkin {
        constructor() {
            super();
            const meshSource = new ƒ.MeshRotation("MeshExtrusion", [
                new ƒ.Vector2(0, 4),
                new ƒ.Vector2(1, 4),
                new ƒ.Vector2(1, 3),
                new ƒ.Vector2(1, 2),
                new ƒ.Vector2(1, 1),
                new ƒ.Vector2(1, 0),
                new ƒ.Vector2(0, 0)
            ], 6);
            this.ƒvertices = meshSource.vertices;
            this.ƒindices = meshSource.indices;
            const iBones = [];
            const weights = [];
            for (let iVertex = 0; iVertex < this.ƒvertices.length; iVertex += 3) {
                iBones.push(MeshSkinCylinder.skeleton.indexOfBone("LowerBone"), MeshSkinCylinder.skeleton.indexOfBone("UpperBone"), 0, 0);
                weights.push(1 - this.ƒvertices[iVertex + 1] / 4, this.ƒvertices[iVertex + 1] / 4, 0, 0);
            }
            this.ƒiBones = new Uint8Array(iBones);
            this.ƒweights = new Float32Array(weights);
        }
        static #skeleton;
        static get skeleton() {
            if (!this.#skeleton) {
                this.#skeleton = new ƒ.Skeleton("SkeletonCylinder");
                this.#skeleton.addChild(new ƒ.Bone("LowerBone", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(0))));
                this.#skeleton.bones.LowerBone.addChild(new ƒ.Bone("UpperBone", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(1))));
                console.log(ƒ.Serializer.serialize(this.#skeleton));
            }
            return this.#skeleton;
        }
    }
    async function createAnimatedCylinder() {
        const zylinder = new ƒ.Node("AnimatedCylinder");
        // setup skeleton and its animation
        const skeleton = await ƒ.SkeletonInstance.CREATE(MeshSkinCylinder.skeleton);
        const sequence0 = new ƒ.AnimationSequence();
        sequence0.addKey(new ƒ.AnimationKey(0, -0.5));
        sequence0.addKey(new ƒ.AnimationKey(1000, 0.5));
        sequence0.addKey(new ƒ.AnimationKey(2000, -0.5));
        const sequence1 = new ƒ.AnimationSequence();
        sequence1.addKey(new ƒ.AnimationKey(0, 0));
        sequence1.addKey(new ƒ.AnimationKey(1000, 90));
        sequence1.addKey(new ƒ.AnimationKey(2000, 0));
        const animationStructure = {
            bones: {
                LowerBone: {
                    components: {
                        ComponentTransform: [{ "ƒ.ComponentTransform": {
                                    mtxLocal: {
                                        translation: {
                                            y: sequence0
                                        }
                                    }
                                } }]
                    }
                }
            },
            mtxBoneLocals: {
                UpperBone: {
                    rotation: {
                        z: sequence1
                    }
                }
            }
        };
        const animation = new ƒ.Animation("Animation", animationStructure);
        const cmpAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP);
        skeleton.addComponent(cmpAnimator);
        cmpAnimator.activate(true);
        zylinder.addChild(skeleton);
        // setup component mesh
        const mesh = new MeshSkinCylinder();
        const cmpMesh = new ƒ.ComponentMesh(mesh);
        cmpMesh.mtxPivot.translateY(-2);
        cmpMesh.skeleton = skeleton;
        cmpMesh.skeleton.addComponent(new ƒ.ComponentTransform());
        cmpMesh.skeleton.mtxLocal.scale(ƒ.Vector3.ONE(2));
        zylinder.addComponent(cmpMesh);
        // setup component material
        const material = new ƒ.Material("Grey", ƒ.ShaderFlatSkin, new ƒ.CoatColored(ƒ.Color.CSS("Grey")));
        const cmpMaterial = new ƒ.ComponentMaterial(material);
        zylinder.addComponent(cmpMaterial);
        return zylinder;
    }
    function update(_viewport, _mtxRotatorX, _mtxRotatorY) {
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT]))
            _mtxRotatorY.rotateY(3);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP]))
            _mtxRotatorX.rotateX(-3);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT]))
            _mtxRotatorY.rotateY(-3);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN]))
            _mtxRotatorX.rotateX(3);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
            _mtxRotatorX.set(ƒ.Matrix4x4.IDENTITY());
            _mtxRotatorY.set(ƒ.Matrix4x4.IDENTITY());
        }
        _viewport.draw();
    }
})(SkeletonTest || (SkeletonTest = {}));
//# sourceMappingURL=SkeletonTest.js.map