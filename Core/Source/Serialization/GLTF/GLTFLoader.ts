namespace FudgeCore {
  /**
   * Asset loader for gl Transfer Format files.
   * @authors Matthias Roming, HFU, 2022 | Jonas Plotzky, HFU, 2023
   */
  export class GLTFLoader {

    private static loaders: { [url: string]: GLTFLoader};
    private static defaultMaterial: Material;
    private static defaultSkinMaterial: Material;

    public readonly gltf: GLTF.GlTf;
    public readonly url: string;

    #scenes: Graph[];
    #nodes: Node[];
    #cameras: ComponentCamera[];
    #animations: Animation[];
    #meshes: MeshImport[];
    #skeletons: Skeleton[];
    #buffers: ArrayBuffer[];

    private constructor(_gltf: GLTF.GlTf, _url: string) {
      this.gltf = _gltf;
      this.url = _url;
    }

    public static async LOAD(_url: string): Promise<GLTFLoader> {
      if (!this.loaders)
        this.loaders = {};
      if (!this.loaders[_url]) {      
        const response: Response = await fetch(_url);
        const gltf: GLTF.GlTf = await response.json();
        this.loaders[_url] = new GLTFLoader(gltf, _url);
      }
      return this.loaders[_url];
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
      return await Project.createGraphInstance(this.#scenes[_iScene]);
    }

    public async getNode(_name: string): Promise<Node> {
      const iNode: number = this.gltf.nodes.findIndex(node => node.name == _name);
      if (iNode == -1)
        throw new Error(`Couldn't find name ${_name} in gltf nodes.`);
      return await this.getNodeByIndex(iNode);
    }

    public async getNodeByIndex(_iNode: number, _skeleton: boolean = false): Promise<Node> {
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
              node.mtxLocal.rotate(new Vector3(...gltfNode.rotation.map(rotation => rotation * Calc.rad2deg)));
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
          let iSkeleton: number = this.gltf.skins[gltfNode.skin].joints[0];
          node.getComponent(ComponentMesh).skeleton = <SkeletonInstance>await this.getNodeByIndex(iSkeleton);
        }

        // check for animation
        // let iAnimation: number = this.gltf.animations.findIndex(animation => 
        //   animation.channels.some(channel => this.gltf.skins[iSkeleton].joints.includes(channel.target.node)));
        // if (iAnimation >= 0)
        //   skeletonInstance.addComponent(new ComponentAnimator(await this.getAnimationByIndex(iAnimation)));

        this.#nodes[_iNode] = node;

        // check if node is a skeleton, replace it with skeleton instance
        let iSkeleton: number = this.gltf.skins?.findIndex(skin => skin.joints[0] == _iNode);
        if (iSkeleton >= 0) {
          let skeletonInstance: SkeletonInstance = await SkeletonInstance.CREATE(await this.getSkeletonByIndex(iSkeleton));
          // let iAnimation: number = this.gltf.animations.findIndex(animation => 
          //   animation.channels.some(channel => this.gltf.skins[iSkeleton].joints.includes(channel.target.node)));
          // if (iAnimation >= 0)
          //   skeletonInstance.addComponent(new ComponentAnimator(await this.getAnimationByIndex(iAnimation)));
          this.#nodes = this.#nodes.map(_node => skeletonInstance.bones[_node.name] || _node);
          this.#nodes[_iNode] = skeletonInstance;
        }
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
            gltfCamera.perspective.yfov * Calc.rad2deg,
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

        let mapNodeToGltfChannels: Map<Node, GLTF.AnimationChannel[]> = new Map();
        for (const gltfChannel of gltfAnimation.channels) {
          if (gltfChannel.target.node == undefined)
            continue;
          let node: Node = await this.getNodeByIndex(gltfChannel.target.node);

          // since the actual gltf skeleton root bone got replaced by a skeleton instance with the root bone as child, 
          // the channels need to be correctly associated with said root bone
          if (node instanceof SkeletonInstance)
            node = node.getChild(0);

          if (!mapNodeToGltfChannels.has(node))
            mapNodeToGltfChannels.set(node, []);

          mapNodeToGltfChannels.get(node).push(gltfChannel);
        }
        
        // find the common ancestor of all nodes in animation, TODO: might need to create a common ancestor if none is found
        let ancestor: Node = [...mapNodeToGltfChannels.keys()].reduce((_ancestor, _node) => {
          let pathNode: Node[] = _node.getPath();
          let pathAncestor: Node[] = _ancestor.getPath();
          return pathAncestor.find(_n => pathNode.includes(_n));
        });

        if (ancestor == undefined)
          Debug.warn(`${GLTFLoader.name}: Animation ${gltfAnimation.name}: No common ancestor found. FUDGE currently only supports animations which are rooted in a common ancestor`);

        const generateAnimationStructure = async (_node: Node, _structure: AnimationStructure = {}) => {
          if (_node instanceof SkeletonInstance) {
            // map channels to an animation structure for animating the local bone matrices
            const mtxBoneLocals: { [boneName: string]: AnimationStructureMatrix4x4 } = {};
            
            for (const boneName in _node.bones) {
              // create new 4 by 4 matrix animation structure if there is no entry for the bone name
              if (!mtxBoneLocals[boneName]) mtxBoneLocals[boneName] = {};

              let gltfChannels: GLTF.AnimationChannel[] = mapNodeToGltfChannels.get(_node.bones[boneName]);
              for (const gltfChannel of gltfChannels)
                mtxBoneLocals[boneName][gltfChannel.target.path] =
                  await this.getAnimationSequenceVector3(gltfAnimation.samplers[gltfChannel.sampler], gltfChannel.target.path);
            }
            _structure.mtxBoneLocals = mtxBoneLocals;
            
            return _structure;
          }

          const gltfChannels: GLTF.AnimationChannel[] = mapNodeToGltfChannels.get(_node);
          if (gltfChannels) {
            const mtxLocal: AnimationStructureMatrix4x4 = {};
            for (const gltfChannel of gltfChannels)
              mtxLocal[gltfChannel.target.path] = 
                await this.getAnimationSequenceVector3(gltfAnimation.samplers[gltfChannel.sampler], gltfChannel.target.path);
            _structure.components = {
              ComponentTransform: [
                { mtxLocal: mtxLocal }
              ]
            };
          }

          const children: Node[] = _node?.getChildren();
          if (children?.length > 0) {
            _structure.children = {};
            for (const child of children) {
              // recurse through all children since some nodes in our hierarchy might have no corresponding gltf animation node, e.g. animation could target a grand child
              const structureChild: AnimationStructure = await generateAnimationStructure(child);
              if (Object.keys(structureChild).length > 0)
                _structure.children[child.name] = structureChild;
            }
          }

          return _structure;
        }

        this.#animations[_iAnimation] = new Animation(gltfAnimation.name, await generateAnimationStructure(ancestor, {}));
      }
      return this.#animations[_iAnimation];
    }

    public async getMesh(_name: string): Promise<MeshImport> {
      const iMesh: number = this.gltf.meshes.findIndex(mesh => mesh.name == _name);
      if (iMesh == -1)
        throw new Error(`Couldn't find name ${_name} in gltf meshes.`);
      return await this.getMeshByIndex(iMesh);
    }

    public async getMeshByIndex(_iMesh: number): Promise<MeshImport> {
      if (!this.#meshes)
        this.#meshes = [];
      if (!this.#meshes[_iMesh]) {
        const gltfMesh: GLTF.Mesh = this.gltf.meshes[_iMesh];
        this.#meshes[_iMesh] = await (
          gltfMesh.primitives[0].attributes.JOINTS_0 != undefined ?
            new MeshSkin() :
            new MeshImport()
        ).load(MeshLoaderGLTF, this.url, gltfMesh);
      }
      return this.#meshes[_iMesh];
    }

    public async getSkeleton(_name: string): Promise<Skeleton> {
      const iSkeleton: number = this.gltf.skins.findIndex(skeleton => skeleton.name == _name);
      if (iSkeleton == -1)
        throw new Error(`Couldn't find name ${_name} in gltf skins.`);
      return await this.getSkeletonByIndex(iSkeleton);
    }

    public async getSkeletonByIndex(_iSkeleton: number): Promise<Skeleton> {
      if (!this.#skeletons)
        this.#skeletons = [];
      if (!this.#skeletons[_iSkeleton]) {
        const gltfSkeleton: GLTF.Skin = this.gltf.skins[_iSkeleton];
        const skeleton: Skeleton = new Skeleton(gltfSkeleton.name);

        // add all bones as children/descendants by adding the root bone
        skeleton.addChild(await this.getNodeByIndex(gltfSkeleton.joints[0], true));

        // convert float array to array of matrices and register bones
        const floatArray: Float32Array = await this.getFloat32Array(gltfSkeleton.inverseBindMatrices);
        const span: number = 16;
        for (let iFloat: number = 0, iBone: number = 0; iFloat < floatArray.length; iFloat += span, iBone++) {
          const mtxBindInverse: Matrix4x4 = new Matrix4x4();
          mtxBindInverse.set(floatArray.subarray(iFloat, iFloat + span));
          skeleton.registerBone(this.#nodes[gltfSkeleton.joints[iBone]], mtxBindInverse);
        }
        // skeleton.setDefaultPose(); // TODO: this destroys animation
        Project.register(skeleton);
        this.#skeletons[_iSkeleton] = skeleton;
      }
      return this.#skeletons[_iSkeleton];
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
        this.#buffers[gltfBufferView.buffer] = await response.arrayBuffer();
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

    private async getAnimationSequenceVector3(_sampler: GLTF.AnimationSampler, _transformationType: GLTF.AnimationChannelTarget["path"]): Promise<AnimationStructureVector3 | AnimationStructureVector4> {
      const input: Float32Array = await this.getFloat32Array(_sampler.input);
      const output: Float32Array = await this.getFloat32Array(_sampler.output);
      const millisPerSecond: number = 1000;
      const isRotation: boolean = _transformationType == "rotation";

      const sequences: AnimationStructureVector3 | AnimationStructureVector4 = {};
      sequences.x = new AnimationSequence();
      sequences.y = new AnimationSequence();
      sequences.z = new AnimationSequence();
      if (isRotation) 
        sequences.w = new AnimationSequence();

      for (let iInput: number = 0; iInput < input.length; ++iInput) {
        let iOutput: number = iInput * (_transformationType == "rotation" ? 4 : 3); // output buffer either contains data for quaternion or vector3
        let time: number = millisPerSecond * input[iInput];
        sequences.x.addKey(new AnimationKey(time, output[iOutput + 0]));
        sequences.y.addKey(new AnimationKey(time, output[iOutput + 1]));
        sequences.z.addKey(new AnimationKey(time, output[iOutput + 2]));
        if (isRotation)
          (<AnimationStructureVector4>sequences).w.addKey(new AnimationKey(time, output[iOutput + 3]))
      }

      return sequences;
    }

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

  type TypedArray = Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Int32Array | Float32Array | Float64Array;

  // type TransformationType = "rotation" | "scale" | "translation";
}