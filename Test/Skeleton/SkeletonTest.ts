///<reference path="./../../Core/Build/FudgeCore.d.ts"/>
namespace SkeletonTest {
  import ƒ = FudgeCore;

  window.addEventListener("load", init);

  async function init(): Promise<void> {
    const gltf: ƒ.GLTFLoaderResponse = await ƒ.GLTFLoader.load("animated_arm.gltf");
    gltf.cameras[0].clrBackground = ƒ.Color.CSS("grey");
    gltf.scene.getChildrenByName("Arm")[0].getChild(0).addComponent(
      new ƒ.ComponentMaterial(new ƒ.Material("UniColor", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("red"))))
    );
    console.log(gltf);

    const canvas: HTMLCanvasElement = document.querySelector("canvas");

    const node: ƒ.Node = await initAnimatedCuboid();

    const camera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    camera.mtxPivot.translateX(-10);
    camera.mtxPivot.translateY(10);
    camera.mtxPivot.showTo(ƒ.Vector3.ZERO(), camera.mtxPivot.getZ());
    node.addComponent(camera);
    //gltf.scene.addComponent(camera);

    const light: ƒ.ComponentLight = new ƒ.ComponentLight();
    light.setType(ƒ.LightDirectional);
    light.mtxPivot.set(camera.mtxPivot);
    node.addComponent(light);

    const viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", node, camera, canvas);
    //viewport.initialize("Viewport", gltf.scene, camera, canvas);
/*    
    ƒ.Render.prepare(node);
    const cmpMesh: ƒ.ComponentMesh = node.getComponent(ƒ.ComponentMesh);
    cmpMesh.skeleton.mtxBones.forEach((mtxBone, iBone) =>
      console.log(`mtxBone[${iBone}]${mtxBone.toString()}`)
    );
    for (let iVertex: number = 0; iVertex < cmpMesh.mesh.vertices.length / 3; iVertex++) {
      const pos: ƒ.Vector3 = cmpMesh.getVertexPosition(iVertex);
      cmpMesh.mesh.vertices[iVertex * 3 + 0] = pos.x;
      cmpMesh.mesh.vertices[iVertex * 3 + 1] = pos.y;
      cmpMesh.mesh.vertices[iVertex * 3 + 2] = pos.z;
    }
*/
    viewport.draw();
    console.log(viewport);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, () => viewport.draw());
    ƒ.Loop.start();
  }

  class MeshCuboidSkin extends ƒ.MeshSkin {
    constructor() {
      super();
      this.ƒvertices = Float32Array.from([
       -1, -1, -2, // 0
        1, -1, -2, // 1
       -1,  1, -2, // 2
        1,  1, -2, // 3

       -1, -1,  0, // 4
        1, -1,  0, // 5
       -1,  1,  0, // 6
        1,  1,  0, // 7

       -1, -1,  2, // 8
        1, -1,  2, // 9
       -1,  1,  2, // 10
        1,  1,  2  // 11
      ]);
      this.ƒindices = Uint16Array.from([
        0,  2,  3, // bottom
        3,  1,  0,

        0,  1,  5, // back-bottom
        5,  4,  0,
        4,  5,  9, // back-top
        9,  8,  4,

        1,  3,  7, // right-bottom
        7,  5,  1,
        5,  7, 11, // right-top
       11,  9,  5,

        3,  2,  6, // front-bottom
        6,  7,  3,
        7,  6, 10, // front-top
       10, 11,  7,

        2,  0,  4, // left-bottom
        4,  6,  2,
        6,  4,  8, // left-top
        8, 10,  6,

        8,  9, 11, // top
       11, 10,  8
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
    }
  }

  async function initAnimatedCuboid(): Promise<ƒ.Node> {
    const zylinder: ƒ.Node = new ƒ.Node("AnimatedCuboid");

    const skeleton: ƒ.Skeleton = new ƒ.Skeleton("Skeleton");
    skeleton.addChild(new ƒ.Bone("LowerBone", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Z(-2))));
    skeleton.bones[0].addChild(new ƒ.Bone("UpperBone", ƒ.Matrix4x4.TRANSLATION(ƒ.Vector3.Z(2))));
    //console.log(ƒ.Serializer.serialize(skeleton));

    const mesh: ƒ.MeshSkin = new MeshCuboidSkin();
    const cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
    await cmpMesh.skeleton.set(skeleton);
    zylinder.addComponent(cmpMesh);

    const material: ƒ.Material = new ƒ.Material("Grey", ƒ.ShaderFlatSkin, new ƒ.CoatColored(ƒ.Color.CSS("Grey")));
    const cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(material);
    zylinder.addComponent(cmpMaterial);

    cmpMesh.skeleton.mtxBoneLocals[1].rotateX(45);
    
    const sequence: ƒ.AnimationSequence = new ƒ.AnimationSequence();
    sequence.addKey(new ƒ.AnimationKey(0, 0));
    sequence.addKey(new ƒ.AnimationKey(5000, 45));

    const animationStructure: ƒ.AnimationStructure = {
      components: {
        ComponentSkeleton: [ { "ƒ.ComponentSkeleton": {
          mtxBoneLocals: {
            1: {
              rotation: {
                z: sequence
              }
            }
          }
        }}]
      }
    };

    const animation: ƒ.Animation = new ƒ.Animation("Animation", animationStructure);
    const cmpAnimator: ƒ.ComponentAnimator = new ƒ.ComponentAnimator(animation);
    //zylinder.addComponent(cmpAnimator);

    console.log(zylinder);
    return zylinder;
  }
}