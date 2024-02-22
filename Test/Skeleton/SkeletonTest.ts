namespace SkeletonTest {
  import ƒ = FudgeCore;

  window.addEventListener("load", init);

  async function init(): Promise<void> {
    const canvas: HTMLCanvasElement = document.querySelector("canvas");

    // setup scene
    const scene: ƒ.Node = new ƒ.Node("Scene");

    const rotatorX: ƒ.Node = new ƒ.Node("RotatorX");
    rotatorX.addComponent(new ƒ.ComponentTransform());

    const rotatorY: ƒ.Node = new ƒ.Node("RotatorY");
    rotatorY.addComponent(new ƒ.ComponentTransform());

    const cylinder: ƒ.Node = await createAnimatedCylinder();
    console.log(cylinder);

    scene.addChild(rotatorX);
    rotatorX.addChild(rotatorY);
    rotatorY.addChild(cylinder);

    // setup camera
    const camera: ƒ.Node = new ƒ.Node("Camera");
    camera.addComponent(new ƒ.ComponentCamera());
    camera.addComponent(new ƒ.ComponentTransform());
    camera.getComponent(ƒ.ComponentCamera).clrBackground.setHex("4472C4FF");
    camera.mtxLocal.translateZ(10);
    camera.mtxLocal.lookAt(ƒ.Vector3.ZERO(), camera.mtxLocal.getY());
    scene.addChild(camera);

    // setup light
    const cmpLightDirectional: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightDirectional(new ƒ.Color(0.5, 0.5, 0.5)));
    cmpLightDirectional.mtxPivot.rotateY(180);
    scene.addComponent(cmpLightDirectional);

    const cmpLightAmbient: ƒ.ComponentLight = new ƒ.ComponentLight(new ƒ.LightAmbient(new ƒ.Color(0.5, 0.5, 0.5)));
    scene.addComponent(cmpLightAmbient);

    // setup viewport
    const viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", scene, camera.getComponent(ƒ.ComponentCamera), canvas);
    viewport.draw();
    console.log(viewport);

    // run loop
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, () =>
      update(viewport, rotatorX.mtxLocal, rotatorY.mtxLocal, cylinder.getComponent(ƒ.ComponentMaterial).material));
    ƒ.Loop.start();
  }

  class MeshSkinCylinder extends ƒ.Mesh {
    static #skeleton: ƒ.Node;

    public constructor() {
      super();
      const meshSource: ƒ.Mesh = new ƒ.MeshRotation(
        "MeshRotation",
        [
          new ƒ.Vector2(0, 4),
          new ƒ.Vector2(1, 4),
          new ƒ.Vector2(1, 3),
          new ƒ.Vector2(1, 2),
          new ƒ.Vector2(1, 1),
          new ƒ.Vector2(1, 0),
          new ƒ.Vector2(0, 0)
        ],
        6
      );

      this.vertices = Reflect.get(meshSource, "vertices");
      this.faces = Reflect.get(meshSource, "faces");

      for (let vertex of this.vertices.originals) {
        let cmpSkeleton: ƒ.ComponentSkeleton = MeshSkinCylinder.skeleton.getComponent(ƒ.ComponentSkeleton);
        vertex.bones = [
          { index: cmpSkeleton.indexOf("LowerBone"), weight: 1 - vertex.position.y / 4 },
          { index: cmpSkeleton.indexOf("UpperBone"), weight: vertex.position.y / 4 },
          { index: 0, weight: 0 },
          { index: 0, weight: 0 }
        ];
      }
    }

    public static get skeleton(): ƒ.Node {
      if (!this.#skeleton) {
        // setup skeleton with a skeleton transform test
        this.#skeleton = new ƒ.Node("SkeletonCylinder");
        this.#skeleton.addComponent(new ƒ.ComponentTransform(ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2))));

        let upperBone: ƒ.Node = new ƒ.Node("UpperBone");
        upperBone.addComponent(new ƒ.ComponentTransform());
        let lowerBone: ƒ.Node = new ƒ.Node("LowerBone");
        lowerBone.addComponent(new ƒ.ComponentTransform());
        this.#skeleton.addChild(lowerBone);
        lowerBone.addChild(upperBone);

        let cmpSkeleton: ƒ.ComponentSkeleton = new ƒ.ComponentSkeleton();
        cmpSkeleton.addBone(lowerBone, ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(0)));
        cmpSkeleton.addBone(upperBone, ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Y(-1)));
        this.#skeleton.addComponent(cmpSkeleton);
      }
      return this.#skeleton;
    }
  }

  async function createAnimatedCylinder(): Promise<ƒ.Node> {
    const cylinder: ƒ.Node = new ƒ.Node("CylinderAnimated");

    // skeleton serialization test
    const serialization: ƒ.Serialization = ƒ.Serializer.serialize(MeshSkinCylinder.skeleton);
    console.log(serialization);
    const skeleton: ƒ.Node = await ƒ.Serializer.deserialize(serialization) as ƒ.Node;
    // const skeletonInstance: ƒ.SkeletonInstance = await ƒ.SkeletonInstance.CREATE(skeleton);

    // setup skeleton animator
    const sequenceRotation: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    sequenceRotation.addKey(new ƒ.AnimationKey(0, 0));
    sequenceRotation.addKey(new ƒ.AnimationKey(1000, 90));
    sequenceRotation.addKey(new ƒ.AnimationKey(2000, 0));
    const sequenceScaling: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    sequenceScaling.addKey(new ƒ.AnimationKey(0, 1));
    sequenceScaling.addKey(new ƒ.AnimationKey(1000, 1.25));
    sequenceScaling.addKey(new ƒ.AnimationKey(2000, 1));
    const sequenceTranslation: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    sequenceTranslation.addKey(new ƒ.AnimationKey(0, -0.5));
    sequenceTranslation.addKey(new ƒ.AnimationKey(1000, 0.5));
    sequenceTranslation.addKey(new ƒ.AnimationKey(2000, -0.5));
    const animation: ƒ.Animation = new ƒ.Animation("AnimationSkeletonCylinder", {
      children: {
        LowerBone: {
          components: {
            ComponentTransform: {
              0: {
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
            }
          },
          children: {
            UpperBone: {
              components: {
                ComponentTransform: {
                  0: {
                    mtxLocal: {
                      rotation: {
                        z: sequenceRotation
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      // mtxBoneLocals: {
      //   UpperBone: {
      //     rotation: {
      //       z: sequenceRotation
      //     }
      //   }
      // },
      // bones: {
      //   LowerBone: {
      //     components: {
      //       ComponentTransform: [
      //         {
      //           mtxLocal: {
      //             scaling: {
      //               x: sequenceScaling,
      //               y: sequenceScaling,
      //               z: sequenceScaling
      //             },
      //             translation: {
      //               y: sequenceTranslation
      //             }
      //           }
      //         }
      //       ]
      //     }
      //   }
      // }
    });
    const cmpAnimator: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation, ƒ.ANIMATION_PLAYMODE.LOOP);
    skeleton.addComponent(cmpAnimator);
    cmpAnimator.activate(true);
    cylinder.addChild(skeleton);

    // setup component mesh
    const mesh: ƒ.Mesh = new MeshSkinCylinder();
    const cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
    cmpMesh.mtxPivot.translateY(-2);
    cmpMesh.skeleton = skeleton.getComponent(ƒ.ComponentSkeleton);
    cylinder.addComponent(cmpMesh);

    // setup component material 
    const material: ƒ.Material = new ƒ.Material("MaterialCylinder", ƒ.ShaderFlatSkin, new ƒ.CoatRemissive(ƒ.Color.CSS("White")));
    const cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(material);
    cylinder.addComponent(cmpMaterial);

    return cylinder;
  }

  function update(_viewport: ƒ.Viewport, _mtxRotatorX: ƒ.Matrix4x4, _mtxRotatorY: ƒ.Matrix4x4, _material: ƒ.Material): void {
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_RIGHT])) _mtxRotatorY.rotateY(3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_UP])) _mtxRotatorX.rotateX(-3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_LEFT])) _mtxRotatorY.rotateY(-3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.ARROW_DOWN])) _mtxRotatorX.rotateX(3);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.SPACE])) {
      _mtxRotatorX.set(ƒ.Matrix4x4.IDENTITY());
      _mtxRotatorY.set(ƒ.Matrix4x4.IDENTITY());
    }
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.F])) _material.setShader(ƒ.ShaderFlatSkin);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.G])) _material.setShader(ƒ.ShaderGouraudSkin);
    if (ƒ.Keyboard.isPressedOne([ƒ.KEYBOARD_CODE.H])) _material.setShader(ƒ.ShaderPhongSkin);
    _viewport.draw();
  }
}