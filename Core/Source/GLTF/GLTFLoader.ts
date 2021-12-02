namespace FudgeCore {
  export interface GLTFLoaderResponse {
    scene: Graph;
    scenes: Array<Graph>;
    cameras: Array<ComponentCamera>;
    animations: Array<Animation>;
  }

  enum ComponentType {
    BYTE = 5120,
    UNSIGNED_BYTE = 5121,
    SHORT = 5122,
    UNSIGNED_SHORT = 5123,
    INT = 5124,
    UNSIGNED_INT = 5125,
    FLOAT = 5126
  }

  interface AnimationSequenceVector3 {
    x: AnimationSequence;
    y: AnimationSequence;
    z: AnimationSequence;
  }

  interface AnimationSequenceMatrix4x4 {
    rotation?: AnimationSequenceVector3;
    scale?: AnimationSequenceVector3;
    translation?: AnimationSequenceVector3;
  }

  type TransformationType = "rotation" | "scale" | "translation";

  export class GLTFLoader {

    public readonly gltf: GLTF.GlTf;
    
    private readonly buffers: Array<ArrayBuffer>;

    private scenes: Array<Graph>;
    private nodes: Array<Node>;
    private cameras: Array<ComponentCamera>;
    private animations: Array<Animation>;
    private skeletalAnimations: Map<Skeleton, Animation> = new Map();
    private meshes: Array<Mesh>;
    private skeletons: Array<Skeleton>;

    private constructor(_gltf: GLTF.GlTf, _buffers: Array<ArrayBuffer>) {
      this.gltf = _gltf;
      this.buffers = _buffers;
    }

    public static async load(_uri: string): Promise<GLTFLoaderResponse> {
      const loader: GLTFLoader = await this.createLoader(_uri);

      loader.createNodes();
      loader.appendNodeChildren();
      loader.createScenes();
      loader.createCameras();
      loader.createMeshes();
      loader.createSkeletons();
      loader.createAnimations();
      loader.appendNodeComponents();

      return {
        scene: loader.scenes[loader.gltf.scene],
        scenes: loader.scenes,
        cameras: loader.cameras,
        animations: loader.animations
      } as GLTFLoaderResponse;
    }

    private static async createLoader(_uri: string): Promise<GLTFLoader> {
      // load gltf
      const response: Response = await fetch(_uri);
      const gltf: GLTF.GlTf = await response.json();

      // load buffers
      const buffers: Array<ArrayBuffer> = [];
      if (gltf.buffers)
        for (const buffer of gltf.buffers) {
          const response: Response = await fetch(buffer.uri);
          const blob: Blob = await response.blob();
          buffers.push(await blob.arrayBuffer());
        }
      
      return new GLTFLoader(gltf, buffers);
    }

    public getUint8Array(_iAccessor: number): Uint8Array {
      this.assertCmpTypeMatches(_iAccessor, ComponentType.UNSIGNED_BYTE);
      return this.getBufferData(_iAccessor) as Uint8Array;
    }

    public getUint16Array(_iAccessor: number): Uint16Array {
      this.assertCmpTypeMatches(_iAccessor, ComponentType.UNSIGNED_SHORT);
      return this.getBufferData(_iAccessor) as Uint16Array;
    }

    public getFloat32Array(_iAccessor: number): Float32Array {
      this.assertCmpTypeMatches(_iAccessor, ComponentType.FLOAT);
      return this.getBufferData(_iAccessor) as Float32Array;
    }

    private createNodes(): void {
      // get bone indices to determine which nodes are bones of a skeleton
      const iBones: Array<number> = this.gltf.skins?.flatMap(gltfSkin => gltfSkin.joints) || [];

      this.nodes = this.gltf.nodes?.map((gltfNode, iNode) => {
        const node: Node =
          iBones.includes(iNode)
          ? new Bone(gltfNode.name)
          : new Node(gltfNode.name);

        return node;
      }) || [];
    }

    private createScenes(): void {
      this.scenes = this.gltf.scenes?.map(gltfScene => {
        const scene: Graph = new Graph(gltfScene.name);

        gltfScene.nodes?.forEach(nodeIndex => {
          scene.addChild(this.nodes[nodeIndex]);
        });

        return scene;
      }) || [];
    }

    private createCameras(): void {
      this.cameras = this.gltf.cameras.map(cltfCamera => {
        const camera: ComponentCamera = new ComponentCamera();

        if (cltfCamera.perspective)
          camera.projectCentral(
            cltfCamera.perspective.aspectRatio,
            cltfCamera.perspective.yfov * 180 / Math.PI,
            null,
            cltfCamera.perspective.znear,
            cltfCamera.perspective.zfar
          );
        else
          camera.projectOrthographic(
            -cltfCamera.orthographic.xmag,
            cltfCamera.orthographic.xmag,
            -cltfCamera.orthographic.ymag,
            cltfCamera.orthographic.ymag
          );

        return camera;
      }) || [];
    }

    private createMeshes(): void {
      this.meshes = this.gltf.meshes?.map(gltfMesh => {
        // check if the mesh refers to joints to determine whether its a normal mesh or a mesh skin
        const mesh: Mesh =
          gltfMesh.primitives[0].attributes.JOINTS_0 != undefined
          ? new MeshSkin(gltfMesh, this)
          : new MeshGLTF(gltfMesh, this);
        
        return mesh;
      }) || [];
    }

    private createSkeletons(): void {
      this.skeletons = this.gltf.skins?.map(gltfSkin => {
        const name: string = gltfSkin.name;
        const rootBone: Bone = this.nodes[gltfSkin.joints[0]];

        // convert float array to array of matrices
        const mtxBindInverses: Array<Matrix4x4> = new Array();
        const floatArray: Float32Array = this.getFloat32Array(gltfSkin.inverseBindMatrices);
        const span: number = 16;
        for (let i: number = 0; i <= floatArray.length - span; i += span) {
          const mtx: Matrix4x4 = new Matrix4x4();
          mtx.set(floatArray.subarray(i, i + span));
          mtxBindInverses.push(mtx);
        }

        return new Skeleton(name, rootBone, mtxBindInverses);
      }) || [];
    }

    private appendNodeChildren(): void {
      this.gltf.nodes?.forEach((gltfNode, iNode) => {
        const node: Node = this.nodes[iNode];

        gltfNode.children?.forEach(iNode => {
          const child: Node = this.nodes[iNode];
          if (!(child instanceof Bone && !(node instanceof Bone)))
            node.addChild(child);
        });
      });
    }

    private createAnimations(): void {
      this.animations = this.gltf.animations?.map(gltfAnimation => {
        const animatedNodes: Array<Node> = gltfAnimation.channels.map(channel => this.nodes[channel.target.node]);

        // check if the animation is a skeletal animation
        if (animatedNodes.every(node => node instanceof Bone)) {
          // find the skeleton of the bones
          const skeleton: Skeleton =
            animatedNodes
            .map(node => node.getParent())
            .find(parent => parent instanceof Skeleton) as Skeleton;

          // map channels to 4 by 4 matrix animation sequences indexed by the bone indices
          const boneSequences: {[iBone: number]: AnimationSequenceMatrix4x4} = gltfAnimation.channels.reduce(
            (boneSequences, channel) => {
              const iBone: number = skeleton.bones.indexOf(this.nodes[channel.target.node]);
              
              // create new 4 by 4 matrix animation sequence if there is no entry for index iBone
              if (!boneSequences[iBone]) boneSequences[iBone] = {};

              // set the vector 3 animation sequence of the entry refered by the channel target path
              const transformationType: TransformationType = channel.target.path as TransformationType;
              if (transformationType)
                boneSequences[iBone][transformationType] = this.getAnimationSequenceVector3(gltfAnimation.samplers[channel.sampler]);

              return boneSequences;
            },
            {} as {[iBone: number]: AnimationSequenceMatrix4x4}
          );

          const animationStructure: AnimationStructure = {
            components: {
              ComponentMesh: [{ "ƒ.ComponentMesh": {
                skeleton: {
                  mtxBoneLocals: boneSequences
                }
              }}]
            }
          };

          const animation: Animation = new Animation(gltfAnimation.name, animationStructure);
          this.skeletalAnimations.set(skeleton, animation);

          return animation;
        }
        else throw new Error("Non-skeletal animations are not supported yet.");
      }) || [];
    }

    private appendNodeComponents(): void {
      this.gltf.nodes?.forEach((gltfNode, iNode) => {
        const node: Node = this.nodes[iNode];

        // check for transformation
        if (gltfNode.matrix || gltfNode.rotation || gltfNode.scale || gltfNode.translation) {
          if (!node.getComponent(ComponentTransform)) 
            node.addComponent(new ComponentTransform());
          if (gltfNode.matrix) {
            node.mtxLocal.set(Float32Array.from(gltfNode.matrix));
          }
          else {
            if (gltfNode.rotation)
              node.mtxLocal.rotate(new Vector3(...gltfNode.rotation.map(rotation => rotation * 180 / Math.PI)));
            if (gltfNode.scale)
              node.mtxLocal.scale(new Vector3(...gltfNode.scale));
            if (gltfNode.translation)
              node.mtxLocal.translate(new Vector3(...gltfNode.translation));
          }
        }

        // check for camera
        if (gltfNode.camera != undefined) {
          node.addComponent(this.cameras[gltfNode.camera]);
        }

        // check for mesh
        if (gltfNode.mesh != undefined) {
          node.addComponent(new ComponentMesh(this.meshes[gltfNode.mesh]));
        }

        // check for skeleton        
        if (gltfNode.skin != undefined) {
          node.getComponent(ComponentMesh).skeleton.set(this.skeletons[gltfNode.skin]);
          const skeletalAnimation: Animation = this.skeletalAnimations.get(this.skeletons[gltfNode.skin]);
          if (skeletalAnimation) node.addComponent(new ComponentAnimator(skeletalAnimation));
        }
      });
    }

    private assertCmpTypeMatches(_iAccessor: number, _cmpType: ComponentType): void {
      const accessorCmpType: ComponentType = this.gltf.accessors[_iAccessor]?.componentType;
      if (accessorCmpType != _cmpType) throw new Error(
        `Type missmatch. Expected component type ${ComponentType[_cmpType]} but was ${ComponentType[accessorCmpType]}.`
      );
    }

    private getBufferData(_iAccessor: number): Uint8Array | Uint16Array | Float32Array {
      const accessor: GLTF.Accessor = this.gltf.accessors[_iAccessor];
      if (!accessor)
        throw new Error("Couldn't find accessor");

      const bufferView: GLTF.BufferView = this.gltf.bufferViews[accessor.bufferView];
      if (!bufferView)
        throw new Error("Couldn't find buffer view");

      const buffer: ArrayBuffer = this.buffers[bufferView.buffer];
      if (!buffer)
        throw new Error("Couldn't find buffer");

      const byteOffset: number = bufferView.byteOffset || 0;
      const byteLength: number = bufferView.byteLength || 0;

      switch (accessor.componentType) {
        case ComponentType.UNSIGNED_BYTE:
          return new Uint8Array(buffer, byteOffset, byteLength / Uint8Array.BYTES_PER_ELEMENT);

        case ComponentType.UNSIGNED_SHORT:
          return new Uint16Array(buffer, byteOffset, byteLength / Uint16Array.BYTES_PER_ELEMENT);

        case ComponentType.FLOAT:
          return new Float32Array(buffer, byteOffset, byteLength / Float32Array.BYTES_PER_ELEMENT);

        default: throw new Error(`Unsupported component type: ${accessor.componentType}.`);
      }
    }

    private getAnimationSequenceVector3(_sampler: GLTF.Sampler): AnimationSequenceVector3 {
      const input: Float32Array = this.getFloat32Array(_sampler.input);
      const output: Float32Array = this.getFloat32Array(_sampler.output);

      const sequenceX: AnimationSequence = new AnimationSequence();
      const sequenceY: AnimationSequence = new AnimationSequence();
      const sequenceZ: AnimationSequence = new AnimationSequence();

      for (let i: number = 0; i < input.length; ++i) {
        sequenceX.addKey(new AnimationKey(input[i], output[i * 3]));
        sequenceY.addKey(new AnimationKey(input[i], output[i * 3 + 1]));
        sequenceZ.addKey(new AnimationKey(input[i], output[i * 3 + 2]));
      }

      return {
        x: sequenceX,
        y: sequenceY,
        z: sequenceZ
      };
    }

  }
}