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

  type TypedArray = Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array;

  interface GLTFLoaderList {
    [uri: string]: GLTFLoader;
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

  type TransformationType = "rotation" | "scale" | "translation";

  export class GLTFLoader {

    private static loaders: GLTFLoaderList;
    private static defaultMaterial: Material;
    private static defaultSkinMaterial: Material;

    public readonly gltf: GLTF.GlTf;
    public readonly uri: string;

    #scenes: Graph[];
    #nodes: Node[];
    #cameras: ComponentCamera[];
    #animations: Animation[];
    #meshes: MeshGLTF[];
    #skeletons: Skeleton[];
    #buffers: ArrayBuffer[];

    private constructor(_gltf: GLTF.GlTf, _uri: string) {
      this.gltf = _gltf;
      this.uri = _uri;
    }

    public static async LOAD(_uri: string): Promise<GLTFLoader> {
      if (!this.loaders)
        this.loaders = {};
      if (!this.loaders[_uri]) {      
        const response: Response = await fetch(_uri);
        const gltf: GLTF.GlTf = await response.json();
        this.loaders[_uri] = new GLTFLoader(gltf, _uri);
      }
      return this.loaders[_uri];
    }

    public async getScene(_name?: string): Promise<GraphInstance> {
      const iScene: number = _name ? this.gltf.scenes.findIndex(scene => scene.name == _name) : this.gltf.scene;
      if (iScene == -1)
        throw new Error(`Couldn't find name ${_name} in gltf scenes.`);
      return await this.getSceneByIndex(iScene);
    }

    public async getSceneByIndex(_iScene: number = this.gltf.scene): Promise<GraphInstance> {
      if (!this.#scenes)
        this.#scenes = [];
      if (!this.#scenes[_iScene]) {
        const gltfScene: GLTF.Scene = this.gltf.scenes[_iScene];
        const scene: Graph = new Graph(gltfScene.name);
        for (const iNode of gltfScene.nodes)
          scene.addChild(await this.getNodeByIndex(iNode));
        Project.register(scene);
        this.#scenes[_iScene] = scene;
      }
      return Project.createGraphInstance(this.#scenes[_iScene]);
    }

    public async getNode(_name: string): Promise<Node> {
      const iNode: number = this.gltf.nodes.findIndex(node => node.name == _name);
      if (iNode == -1)
        throw new Error(`Couldn't find name ${_name} in gltf nodes.`);
      return await this.getNodeByIndex(iNode);
    }

    public async getNodeByIndex(_iNode: number): Promise<Node> {
      if (!this.#nodes)
        this.#nodes = [];
      if (!this.#nodes[_iNode]) {
        const gltfNode: GLTF.Node = this.gltf.nodes[_iNode];
        const node: Node = new Node(gltfNode.name);

        // check for children
        if (gltfNode.children)
          for (const iNode of gltfNode.children)
            node.addChild(await this.getNodeByIndex(iNode));
        
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
          node.addComponent(await this.getCameraByIndex(gltfNode.camera));
        }

        // check for mesh
        if (gltfNode.mesh != undefined) {
          node.addComponent(new ComponentMesh(await this.getMeshByIndex(gltfNode.mesh)));
          if (node.getComponent(ComponentMesh).mesh instanceof MeshSkin) {
            if (!GLTFLoader.defaultSkinMaterial)
              GLTFLoader.defaultSkinMaterial = new Material("GLTFDefaultSkinMaterial", ShaderGouraudSkin, new CoatRemissive(Color.CSS("white")));
            node.addComponent(new ComponentMaterial(GLTFLoader.defaultSkinMaterial));
          }
          else {
            if (!GLTFLoader.defaultMaterial)
              GLTFLoader.defaultMaterial = new Material("GLTFDefaultMaterial", ShaderGouraud, new CoatRemissive(Color.CSS("white")));
            node.addComponent(new ComponentMaterial(GLTFLoader.defaultMaterial));
          }
        }

        // check for skeleton        
        if (gltfNode.skin != undefined) {
          const skeleton: SkeletonInstance = await this.getSkeletonByIndex(gltfNode.skin);
          node.addChild(skeleton);
          if (node.getComponent(ComponentMesh))
            node.getComponent(ComponentMesh).bindSkeleton(skeleton);
          for (const iAnimation of this.findSkeletalAnimationIndices(gltfNode.skin)) {
            skeleton.addComponent(new ComponentAnimator(await this.getAnimationByIndex(iAnimation)));
          }
        }

        this.#nodes[_iNode] = node;
      }
      return this.#nodes[_iNode];
    }

    public async getCamera(_name: string): Promise<ComponentCamera> {
      const iCamera: number = this.gltf.cameras.findIndex(camera => camera.name == _name);
      if (iCamera == -1)
        throw new Error(`Couldn't find name ${_name} in gltf cameras.`);
      return await this.getCameraByIndex(iCamera);
    }

    public async getCameraByIndex(_iCamera: number): Promise<ComponentCamera> {
      if (!this.#cameras)
        this.#cameras = [];
      if (!this.#cameras[_iCamera]) {
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
      return this.#cameras[_iCamera];
    }

    public async getAnimation(_name: string): Promise<Animation> {
      const iAnimation: number = this.gltf.animations.findIndex(animation => animation.name == _name);
      if (iAnimation == -1)
        throw new Error(`Couldn't find name ${_name} in gltf animations.`);
      return await this.getAnimationByIndex(iAnimation);
    }

    public async getAnimationByIndex(_iAnimation: number): Promise<Animation> {
      if (!this.#animations)
        this.#animations = [];
      if (!this.#animations[_iAnimation]) {
        const gltfAnimation: GLTF.Animation = this.gltf.animations[_iAnimation];

        if (this.isSkeletalAnimation(gltfAnimation)) {
          // map channels to an animation structure for animating the local bone matrices
          const animationStructure: {
            mtxBoneLocals: {
              [boneName: string]: AnimationStructureMatrix4x4
            }
          } = { mtxBoneLocals: {} };
          for (const gltfChannel of gltfAnimation.channels) {
            const boneName: string = this.#nodes[gltfChannel.target.node].name;
            
            // create new 4 by 4 matrix animation structure if there is no entry for the bone name
            if (!animationStructure.mtxBoneLocals[boneName]) animationStructure.mtxBoneLocals[boneName] = {};

            // set the vector 3 animation structure of the entry refered by the channel target path
            const transformationType: TransformationType = gltfChannel.target.path as TransformationType;
            if (transformationType)
              animationStructure.mtxBoneLocals[boneName][transformationType] =
                await this.getAnimationSequenceVector3(gltfAnimation.samplers[gltfChannel.sampler], transformationType);
          }

          this.#animations[_iAnimation] = new Animation(gltfAnimation.name, animationStructure);
        }
        else
          throw new Error("Non-skeletal animations are not supported yet.");
      }
      return this.#animations[_iAnimation];
    }

    public async getMesh(_name: string): Promise<MeshGLTF> {
      const iMesh: number = this.gltf.meshes.findIndex(mesh => mesh.name == _name);
      if (iMesh == -1)
        throw new Error(`Couldn't find name ${_name} in gltf meshes.`);
      return await this.getMeshByIndex(iMesh);
    }

    public async getMeshByIndex(_iMesh: number): Promise<MeshGLTF> {
      if (!this.#meshes)
        this.#meshes = [];
      if (!this.#meshes[_iMesh]) {
        const gltfMesh: GLTF.Mesh = this.gltf.meshes[_iMesh];
        this.#meshes[_iMesh] = await (
          gltfMesh.primitives[0].attributes.JOINTS_0 != undefined ?
          new MeshSkin().load(this, _iMesh) :
          new MeshGLTF().load(this, _iMesh)
        );
      }
      return this.#meshes[_iMesh];
    }

    public async getSkeleton(_name: string): Promise<SkeletonInstance> {
      const iSkeleton: number = this.gltf.skins.findIndex(skeleton => skeleton.name == _name);
      if (iSkeleton == -1)
        throw new Error(`Couldn't find name ${_name} in gltf skins.`);
      return await this.getSkeletonByIndex(iSkeleton);
    }

    public async getSkeletonByIndex(_iSkeleton: number): Promise<SkeletonInstance> {
      if (!this.#skeletons)
        this.#skeletons = [];
      if (!this.#skeletons[_iSkeleton]) {
        const gltfSkeleton: GLTF.Skin = this.gltf.skins[_iSkeleton];
        const skeleton: Skeleton = new Skeleton(gltfSkeleton.name);

        // add all bones as children/descendants by adding the root bone
        skeleton.addChild(await this.getNodeByIndex(gltfSkeleton.joints[0]));

        // convert float array to array of matrices and register bones
        const floatArray: Float32Array = await this.getFloat32Array(gltfSkeleton.inverseBindMatrices);
        const span: number = 16;
        for (let iFloat: number = 0, iBone: number = 0; iFloat < floatArray.length; iFloat += span, iBone++) {
          const mtxBindInverse: Matrix4x4 = new Matrix4x4();
          mtxBindInverse.set(floatArray.subarray(iFloat, iFloat + span));
          skeleton.registerBone(this.#nodes[gltfSkeleton.joints[iBone]], mtxBindInverse);
        }
        Project.register(skeleton);
        this.#skeletons[_iSkeleton] = skeleton;
      }
      return await SkeletonInstance.CREATE(this.#skeletons[_iSkeleton]);
    }

    public async getUint8Array(_iAccessor: number): Promise<Uint8Array> {
      const array: TypedArray = await this.getBufferData(_iAccessor);
      if (this.gltf.accessors[_iAccessor]?.componentType == ComponentType.UNSIGNED_BYTE)
        return array as Uint8Array;
      else {
        console.warn(`Expected component type UNSIGNED_BYTE but was ${ComponentType[this.gltf.accessors[_iAccessor]?.componentType]}.`);
        return Uint8Array.from(array);
      }
    }

    public async getUint16Array(_iAccessor: number): Promise<Uint16Array> {
      const array: TypedArray = await this.getBufferData(_iAccessor);
      if (this.gltf.accessors[_iAccessor]?.componentType == ComponentType.UNSIGNED_SHORT)
        return array as Uint16Array;
      else {
        console.warn(`Expected component type UNSIGNED_SHORT but was ${ComponentType[this.gltf.accessors[_iAccessor]?.componentType]}.`);
        return Uint16Array.from(array);
      }
    }

    public async getUint32Array(_iAccessor: number): Promise<Uint32Array> {
      const array: TypedArray = await this.getBufferData(_iAccessor);
      if (this.gltf.accessors[_iAccessor]?.componentType == ComponentType.UNSIGNED_INT)
        return array as Uint32Array;
      else {
        console.warn(`Expected component type UNSIGNED_INT but was ${ComponentType[this.gltf.accessors[_iAccessor]?.componentType]}.`);
        return Uint32Array.from(array);
      }
    }

    public async getFloat32Array(_iAccessor: number): Promise<Float32Array> {
      const array: TypedArray = await this.getBufferData(_iAccessor);
      if (this.gltf.accessors[_iAccessor]?.componentType == ComponentType.FLOAT)
        return array as Float32Array;
      else {
        console.warn(`Expected component type FLOAT but was ${ComponentType[this.gltf.accessors[_iAccessor]?.componentType]}.`);
        return Float32Array.from(array);
      }
    }

    private async getBufferData(_iAccessor: number): Promise<TypedArray> {
      const gltfAccessor: GLTF.Accessor = this.gltf.accessors[_iAccessor];
      if (!gltfAccessor)
        throw new Error("Couldn't find accessor");

      const gltfBufferView: GLTF.BufferView = this.gltf.bufferViews[gltfAccessor.bufferView];
      if (!gltfBufferView)
        throw new Error("Couldn't find buffer view");

      const gltfBuffer: GLTF.Buffer = this.gltf.buffers[gltfBufferView.buffer];
      if (!gltfBuffer)
        throw new Error("Couldn't find buffer");

      if (!this.#buffers)
        this.#buffers = [];
      if (!this.#buffers[gltfBufferView.buffer]) {
        const response: Response = await fetch(gltfBuffer.uri);
        const blob: Blob = await response.blob();
        this.#buffers[gltfBufferView.buffer] = await blob.arrayBuffer();
      }

      const buffer: ArrayBuffer = this.#buffers[gltfBufferView.buffer];
      const byteOffset: number = gltfBufferView.byteOffset || 0;
      const byteLength: number = gltfBufferView.byteLength || 0;

      switch (gltfAccessor.componentType) {
        case ComponentType.UNSIGNED_BYTE:
          return new Uint8Array(buffer, byteOffset, byteLength / Uint8Array.BYTES_PER_ELEMENT);

        case ComponentType.BYTE:
          return new Int8Array(buffer, byteOffset, byteLength / Int8Array.BYTES_PER_ELEMENT);

        case ComponentType.UNSIGNED_SHORT:
          return new Uint16Array(buffer, byteOffset, byteLength / Uint16Array.BYTES_PER_ELEMENT);

        case ComponentType.SHORT:
          return new Int16Array(buffer, byteOffset, byteLength / Int16Array.BYTES_PER_ELEMENT);

        case ComponentType.UNSIGNED_INT:
          return new Uint32Array(buffer, byteOffset, byteLength / Uint32Array.BYTES_PER_ELEMENT);

        case ComponentType.INT:
          return new Int32Array(buffer, byteOffset, byteLength / Int32Array.BYTES_PER_ELEMENT);

        case ComponentType.FLOAT:
          return new Float32Array(buffer, byteOffset, byteLength / Float32Array.BYTES_PER_ELEMENT);

        default:
          throw new Error(`Unsupported component type: ${gltfAccessor.componentType}.`);
      }
    }

    private isSkeletalAnimation(_animation: GLTF.Animation): boolean {
      return _animation.channels.every(channel => this.isBoneIndex(channel.target.node));
    }

    private findSkeletalAnimationIndices(_iSkeleton: number): number[] {
      return this.gltf.animations
        .filter(animation => animation.channels.every(channel => this.gltf.skins[_iSkeleton].joints.includes(channel.target.node)))
        .map((_, iAnimation) => iAnimation);
    }

    private isBoneIndex(_iNode: number): boolean {
      return this.gltf.skins?.flatMap(gltfSkin => gltfSkin.joints).includes(_iNode);
    }

    private async getAnimationSequenceVector3(_sampler: GLTF.Sampler, _transformationType: TransformationType): Promise<AnimationStructureVector3> {
      const input: Float32Array = await this.getFloat32Array(_sampler.input);
      const output: Float32Array = await this.getFloat32Array(_sampler.output);
      const millisPerSecond: number = 1000;

      const sequenceX: AnimationSequence = new AnimationSequence();
      const sequenceY: AnimationSequence = new AnimationSequence();
      const sequenceZ: AnimationSequence = new AnimationSequence();

      for (let i: number = 0; i < input.length; ++i) {
        const vector: { x: number, y: number, z: number } =
          _transformationType == "rotation" ?
          new Quaternion(output[i * 4 + 0], output[i * 4 + 1], output[i * 4 + 2], output[i * 4 + 3]).toDegrees() :
          { x: output[i * 3 + 0], y: output[i * 3 + 1], z: output[i * 3 + 2] };

        sequenceX.addKey(new AnimationKey(millisPerSecond * input[i], vector.x));
        sequenceY.addKey(new AnimationKey(millisPerSecond * input[i], vector.y));
        sequenceZ.addKey(new AnimationKey(millisPerSecond * input[i], vector.z));
      }

      return {
        x: sequenceX,
        y: sequenceY,
        z: sequenceZ
      };
    }

  }
}