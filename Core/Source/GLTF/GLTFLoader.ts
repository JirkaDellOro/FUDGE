namespace FudgeCore {
  enum ComponentType {
    BYTE = 5120,
    UNSIGNED_BYTE = 5121,
    SHORT = 5122,
    UNSIGNED_SHORT = 5123,
    INT = 5124,
    UNSIGNED_INT = 5125,
    FLOAT = 5126
  }

  interface AnimationStructureVector3 {
    x: AnimationSequence;
    y: AnimationSequence;
    z: AnimationSequence;
  }

  interface AnimationStructureMatrix4x4 {
    rotation?: AnimationStructureVector3;
    scale?: AnimationStructureVector3;
    translation?: AnimationStructureVector3;
  }

  interface AnimationStructureBoneMatrix4x4List {
    [boneName: string]: AnimationStructureMatrix4x4;
  }

  type TransformationType = "rotation" | "scale" | "translation";

  export class GLTFLoader {

    public readonly gltf: GLTF.GlTf; 
    public readonly uri: string;   

    private readonly scenes: Array<Graph> = [];
    private readonly nodes: Array<Node> = [];
    private readonly iBones: Array<number>;
    private readonly cameras: Array<ComponentCamera> = [];
    private readonly animations: Array<Animation> = [];
    private readonly skeletalAnimations: Map<Skeleton, Animation> = new Map();
    private readonly meshes: Array<Mesh> = [];
    private readonly skeletons: Array<Skeleton> = [];
    private readonly buffers: Array<ArrayBuffer> = [];

    private constructor(_gltf: GLTF.GlTf, _uri: string) {
      this.gltf = _gltf;
      this.uri = _uri;
      this.iBones = this.gltf.skins?.flatMap(gltfSkin => gltfSkin.joints) || [];
    }

    public static async LOAD(_uri: string): Promise<GLTFLoader> {
      const response: Response = await fetch(_uri);
      const gltf: GLTF.GlTf = await response.json();
      return new GLTFLoader(gltf, _uri);
    }

    public async getScene(_iScene: number = this.gltf.scene): Promise<Graph> {
      if (!this.scenes[_iScene]) {
        const gltfScene: GLTF.Scene = this.gltf.scenes[_iScene];
        const scene: Node = new Node(gltfScene.name);
        for (const iNode of gltfScene.nodes)
          scene.addChild(await this.getNode(iNode));
        this.scenes[_iScene] = await Project.registerAsGraph(scene);
      }
      return this.scenes[_iScene];
    }

    public async getNode(_iNode: number): Promise<Node> {
      if (!this.nodes[_iNode]) {
        const gltfNode: GLTF.Node = this.gltf.nodes[_iNode];
        const node: Node = this.iBones.includes(_iNode) ? new Bone(gltfNode.name) : new Node(gltfNode.name);

        // check for children
        if (gltfNode.children)
          for (const iNode of gltfNode.children)
            node.addChild(await this.getNode(iNode));
        
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
          node.addComponent(await this.getCamera(gltfNode.camera));
        }

        // check for mesh
        if (gltfNode.mesh != undefined) {
          node.addComponent(new ComponentMesh(this.meshes[gltfNode.mesh]));
        }

        // check for skeleton        
        if (gltfNode.skin != undefined) {
          await node.getComponent(ComponentMesh).skeleton.set(this.skeletons[gltfNode.skin]);
          const skeletalAnimation: Animation = this.skeletalAnimations.get(this.skeletons[gltfNode.skin]);
          if (skeletalAnimation)
            node.getComponent(ComponentMesh).skeleton.addComponent(new ComponentAnimator(skeletalAnimation));
        }

        this.nodes[_iNode] = node;
      }
      return this.nodes[_iNode];
    }

    public async getCamera(_iCamera: number): Promise<ComponentCamera> {
      if (!this.cameras[_iCamera]) {
        const gltfCamera: GLTF.Camera = this.gltf.cameras[_iCamera];
        const camera: ComponentCamera = new ComponentCamera();

        if (gltfCamera.perspective)
          camera.projectCentral(
            gltfCamera.perspective.aspectRatio,
            gltfCamera.perspective.yfov * 180 / Math.PI,
            null,
            gltfCamera.perspective.znear,
            gltfCamera.perspective.zfar
          );
        else
          camera.projectOrthographic(
            -gltfCamera.orthographic.xmag,
            gltfCamera.orthographic.xmag,
            -gltfCamera.orthographic.ymag,
            gltfCamera.orthographic.ymag
          );

        return camera;
      }
      return this.cameras[_iCamera];
    }

    public async getMesh(_iMesh: number): Promise<Mesh> {
      if (!this.meshes[_iMesh]) {
        const gltfMesh: GLTF.Mesh = this.gltf.meshes[_iMesh];
        this.meshes[_iMesh] = await (
          gltfMesh.primitives[0].JOINTS_0 != undefined ?
          MeshSkin.LOAD(this, _iMesh) :
          MeshGLTF.LOAD(this, _iMesh)
        );
      }
      return this.meshes[_iMesh];
    }

    public async getSkeleton(_iSkeleton: number): Promise<Skeleton> {
      if (!this.skeletons[_iSkeleton]) {
        const gltfSkeleton: GLTF.Skin = this.gltf.skins[_iSkeleton];
        const name: string = gltfSkeleton.name;
        const rootBone: Bone = await this.getNode(gltfSkeleton.joints[0]);

        // convert float array to array of matrices
        const mtxBindInverses: BoneMatrix4x4List = {};
        const floatArray: Float32Array = await this.getFloat32Array(gltfSkeleton.inverseBindMatrices);
        const span: number = 16;
        for (let i: number = 0; i <= floatArray.length - span; i += span) {
          const boneName: string = this.gltf.nodes[gltfSkeleton.joints[i]].name;
          mtxBindInverses[boneName] = new Matrix4x4();
          mtxBindInverses[boneName].set(floatArray.subarray(i, i + span));
        }

        return new Skeleton(name, rootBone, mtxBindInverses);
      }
      return this.skeletons[_iSkeleton];
    }

    public async getAnimation(_iAniamtion: number): Promise<Animation> {
      if (!this.animations[_iAniamtion]) {
        const gltfAnimation: GLTF.Animation = this.gltf.animations[_iAniamtion];

        // check if the animation is a skeletal animation
        if (gltfAnimation.channels.every(channel => this.iBones.includes(channel.target.node))) {
          // map channels to an animation structure for animating the local bone matrices
          const animationStructure: AnimationStructure = {};
          for (const gltfChannel of gltfAnimation.channels) {
            const boneName: string = this.nodes[gltfChannel.target.node].name;
            
            // create new 4 by 4 matrix animation structure if there is no entry for the bone name
            if (!animationStructure[boneName]) animationStructure[boneName] = {};

            // set the vector 3 animation structure of the entry refered by the channel target path
            const transformationType: TransformationType = gltfChannel.target.path as TransformationType;
            if (transformationType)
              (animationStructure.mtxBoneLocals as AnimationStructureBoneMatrix4x4List)[boneName][transformationType] =
                await this.getAnimationSequenceVector3(gltfAnimation.samplers[gltfChannel.sampler]);
          }

          return new Animation(gltfAnimation.name, animationStructure);
        }
        else throw new Error("Non-skeletal animations are not supported yet.");
      }
    }

    public async getUint8Array(_iAccessor: number): Promise<Uint8Array> {
      this.assertCmpTypeMatches(_iAccessor, ComponentType.UNSIGNED_BYTE);
      return await this.getBufferData(_iAccessor) as Uint8Array;
    }

    public async getUint16Array(_iAccessor: number): Promise<Uint16Array> {
      this.assertCmpTypeMatches(_iAccessor, ComponentType.UNSIGNED_SHORT);
      return await this.getBufferData(_iAccessor) as Uint16Array;
    }

    public async getFloat32Array(_iAccessor: number): Promise<Float32Array> {
      this.assertCmpTypeMatches(_iAccessor, ComponentType.FLOAT);
      return await this.getBufferData(_iAccessor) as Float32Array;
    }

    private assertCmpTypeMatches(_iAccessor: number, _cmpType: ComponentType): void {
      const accessorCmpType: ComponentType = this.gltf.accessors[_iAccessor]?.componentType;
      if (accessorCmpType != _cmpType) throw new Error(
        `Type missmatch. Expected component type ${ComponentType[_cmpType]} but was ${ComponentType[accessorCmpType]}.`
      );
    }

    private async getBufferData(_iAccessor: number): Promise<Uint8Array | Uint16Array | Float32Array> {
      const gltfAccessor: GLTF.Accessor = this.gltf.accessors[_iAccessor];
      if (!gltfAccessor)
        throw new Error("Couldn't find accessor");

      const gltfBufferView: GLTF.BufferView = this.gltf.bufferViews[gltfAccessor.bufferView];
      if (!gltfBufferView)
        throw new Error("Couldn't find buffer view");

      const gltfBuffer: GLTF.Buffer = this.gltf.buffers[gltfBufferView.buffer];
      if (!gltfBuffer)
        throw new Error("Couldn't find buffer");

      if (!this.buffers[gltfBufferView.buffer]) {
        const response: Response = await fetch(gltfBuffer.uri);
        const blob: Blob = await response.blob();
        this.buffers[gltfBufferView.buffer] = await blob.arrayBuffer();
      }

      const buffer: ArrayBuffer = this.buffers[gltfBufferView.buffer];
      const byteOffset: number = gltfBufferView.byteOffset || 0;
      const byteLength: number = gltfBufferView.byteLength || 0;

      switch (gltfAccessor.componentType) {
        case ComponentType.UNSIGNED_BYTE:
          return new Uint8Array(buffer, byteOffset, byteLength / Uint8Array.BYTES_PER_ELEMENT);

        case ComponentType.UNSIGNED_SHORT:
          return new Uint16Array(buffer, byteOffset, byteLength / Uint16Array.BYTES_PER_ELEMENT);

        case ComponentType.FLOAT:
          return new Float32Array(buffer, byteOffset, byteLength / Float32Array.BYTES_PER_ELEMENT);

        default: throw new Error(`Unsupported component type: ${gltfAccessor.componentType}.`);
      }
    }

    private async getAnimationSequenceVector3(_sampler: GLTF.Sampler): Promise<AnimationStructureVector3> {
      const input: Float32Array = await this.getFloat32Array(_sampler.input);
      const output: Float32Array = await this.getFloat32Array(_sampler.output);

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