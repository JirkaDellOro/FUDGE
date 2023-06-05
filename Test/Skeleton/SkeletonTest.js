var SkeletonTest;
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
        const cylinder = await createAnimatedCylinder();
        console.log(cylinder);
        scene.addChild(rotatorX);
        rotatorX.addChild(rotatorY);
        rotatorY.addChild(cylinder);
        // setup camera
        const camera = new ƒ.Node("Camera");
        camera.addComponent(new ƒ.ComponentCamera());
        camera.addComponent(new ƒ.ComponentTransform());
        camera.getComponent(ƒ.ComponentCamera).clrBackground.setHex("4472C4FF");
        camera.mtxLocal.translateZ(10);
        camera.mtxLocal.lookAt(ƒ.Vector3.ZERO(), camera.mtxLocal.getY());
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
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, () => update(viewport, rotatorX.mtxLocal, rotatorY.mtxLocal, cylinder.getComponent(ƒ.ComponentMaterial).material));
        ƒ.Loop.start();
    }
    class MeshSkinCylinder extends ƒ.MeshSkin {
        static ƒskeleton;
        constructor() {
            super();
            const meshSource = new ƒ.MeshRotation("MeshRotation", [
                new ƒ.Vector2(0, 4),
                new ƒ.Vector2(1, 4),
                new ƒ.Vector2(1, 3),
                new ƒ.Vector2(1, 2),
                new ƒ.Vector2(1, 1),
                new ƒ.Vector2(1, 0),
                new ƒ.Vector2(0, 0)
            ], 6);
            this.vertices = Reflect.get(meshSource, "vertices");
            this.faces = Reflect.get(meshSource, "faces");
            for (let vertex of this.vertices.originals) {
                vertex.bones = [
                    { index: MeshSkinCylinder.skeleton.indexOfBone("LowerBone"), weight: 1 - vertex.position.y / 4 },
                    { index: MeshSkinCylinder.skeleton.indexOfBone("UpperBone"), weight: vertex.position.y / 4 },
                    { index: 0, weight: 0 },
                    { index: 0, weight: 0 }
                ];
            }
        }
        static get skeleton() {
            if (!this.ƒskeleton) {
                // setup skeleton with a skeleton transform test
                this.ƒskeleton = new ƒ.Skeleton("SkeletonCylinder");
                this.ƒskeleton.addBone(new ƒ.Node("LowerBone"), this.ƒskeleton.name, ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(0)));
                this.ƒskeleton.addBone(new ƒ.Node("UpperBone"), "LowerBone", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(1)));
                this.ƒskeleton.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2))));
            }
            return this.ƒskeleton;
        }
    }
    async function createAnimatedCylinder() {
        const cylinder = new ƒ.Node("CylinderAnimated");
        // skeleton serialization test
        const serialization = ƒ.Serializer.serialize(MeshSkinCylinder.skeleton);
        console.log(serialization);
        const skeleton = await ƒ.Serializer.deserialize(serialization);
        const skeletonInstance = await ƒ.SkeletonInstance.CREATE(skeleton);
        // setup skeleton animator
        const sequenceRotation = new ƒ.AnimationSequence();
        sequenceRotation.addKey(new ƒ.AnimationKey(0, 0));
        sequenceRotation.addKey(new ƒ.AnimationKey(1000, 90));
        sequenceRotation.addKey(new ƒ.AnimationKey(2000, 0));
        const sequenceScaling = new ƒ.AnimationSequence();
        sequenceScaling.addKey(new ƒ.AnimationKey(0, 1));
        sequenceScaling.addKey(new ƒ.AnimationKey(1000, 1.25));
        sequenceScaling.addKey(new ƒ.AnimationKey(2000, 1));
        const sequenceTranslation = new ƒ.AnimationSequence();
        sequenceTranslation.addKey(new ƒ.AnimationKey(0, -0.5));
        sequenceTranslation.addKey(new ƒ.AnimationKey(1000, 0.5));
        sequenceTranslation.addKey(new ƒ.AnimationKey(2000, -0.5));
        const animation = new ƒ.Animation("AnimationSkeletonCylinder", {
            mtxBoneLocals: {
                UpperBone: {
                    rotation: {
                        z: sequenceRotation
                    }
                }
            },
            bones: {
                LowerBone: {
                    components: {
                        ComponentTransform: [
                            {
                                mtxLocal: {
                                    scaling: {
                                        x: sequenceScaling,
                                        y: sequenceScaling,
                                        z: sequenceScaling
                                    },
                                    translation: {
                                        y: sequenceTranslation
                                    }
                                }
                            }
                        ]
                    }
                }
            }
        });
        const cmpAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP);
        skeletonInstance.addComponent(cmpAnimator);
        cmpAnimator.activate(true);
        cylinder.addChild(skeletonInstance);
        // setup component mesh
        const mesh = new MeshSkinCylinder();
        const cmpMesh = new ƒ.ComponentMesh(mesh);
        cmpMesh.mtxPivot.translateY(-2);
        cmpMesh.skeleton = skeletonInstance;
        cylinder.addComponent(cmpMesh);
        // setup component material 
        const material = new ƒ.Material("MaterialCylinder", ƒ.ShaderFlatSkin, new ƒ.CoatRemissive(ƒ.Color.CSS("White")));
        const cmpMaterial = new ƒ.ComponentMaterial(material);
        cylinder.addComponent(cmpMaterial);
        return cylinder;
    }
    function update(_viewport, _mtxRotatorX, _mtxRotatorY, _material) {
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
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.F]))
            _material.setShader(ƒ.ShaderFlatSkin);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.G]))
            _material.setShader(ƒ.ShaderGouraudSkin);
        if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.H]))
            _material.setShader(ƒ.ShaderPhongSkin);
        _viewport.draw();
    }
})(SkeletonTest || (SkeletonTest = {}));
//# sourceMappingURL=SkeletonTest.js.map