namespace FudgeCore {
  /**
   * Asset loader for gl Transfer Format files.
   * @authors Matthias Roming, HFU, 2022 | Jonas Plotzky, HFU, 2023
   */
  export class GLTFLoader {
    private static loaders: { [url: string]: GLTFLoader };

    static #defaultMaterial: Material;
    static #defaultSkinMaterial: Material;

    public readonly gltf: GLTF.GlTf;
    public readonly url: string;

    #scenes: Graph[];
    #nodesGraph: Node[] = [];
    #nodesSkeleton: Node[] = [];
    #cameras: ComponentCamera[];
    #animations: Animation[];
    #meshes: MeshImport[][];
    #materials: Material[];
    #textures: Texture[];
    #skeletons: Skeleton[];
    #buffers: ArrayBuffer[];

    private constructor(_gltf: GLTF.GlTf, _url: string) {
      this.gltf = _gltf;
      this.url = _url;
    }

    private static get defaultMaterial(): Material {
      if (!this.#defaultMaterial)
        this.#defaultMaterial = new Material("GLTFDefaultMaterial", ShaderFlat, new CoatRemissive(Color.CSS("white"), 1, 0.5));
      return this.#defaultMaterial;
    }

    private static get defaultSkinMaterial(): Material {
      if (!this.#defaultSkinMaterial)
        this.#defaultSkinMaterial = new Material("GLTFDefaultSkinMaterial", ShaderFlatSkin, new CoatRemissive(Color.CSS("white"), 1, 0.5));
      return this.#defaultSkinMaterial;
    }

    /**
     * Returns a {@link GLTFLoader} instance for the given url.
     */
    public static async LOAD(_url: string): Promise<GLTFLoader> {
      const url: string = new URL(_url, Project.baseURL).toString();

      if (!this.loaders)
        GLTFLoader.loaders = {};

      if (!this.loaders[url]) {
        const response: Response = await fetch(url);
        const gltf: GLTF.GlTf = await response.json();

        GLTFLoader.checkCompatibility(gltf, url);
        GLTFLoader.preProcess(gltf, url);

        GLTFLoader.loaders[url] = new GLTFLoader(gltf, url);
      }

      return GLTFLoader.loaders[url];
    }

    private static checkCompatibility(_gltf: GLTF.GlTf, _url: string): void {
      if (_gltf.asset.version != "2.0")
        Debug.warn(`${GLTFLoader.name} | ${_url}: This loader was developed for glTF 2.0. It may not work as intended with version ${_gltf.asset.version}.`);
      if (_gltf.asset.minVersion != undefined && _gltf.asset.minVersion != "2.0")
        throw new Error(`${GLTFLoader.name} | ${_url}: This loader was developed for glTF 2.0. It does not work with required min version ${_gltf.asset.minVersion}.`);
      if (_gltf.extensionsUsed?.length > 0)
        Debug.warn(`${GLTFLoader.name} | ${_url}: This loader does not support glTF extensions. It may not work as intended with extensions ${_gltf.extensionsUsed.toString()}.`);
      if (_gltf.extensionsRequired?.length > 0)
        throw new Error(`${GLTFLoader.name} | ${_url}: This loader does not support glTF extensions. It does not work with required extensions ${_gltf.extensionsRequired.toString()}.`);
    }

    private static preProcess(_gltf: GLTF.GlTf, _url: string): void {
      if (_gltf.nodes) {
        // mark all nodes that are animated
        _gltf.animations?.forEach(_animation => {
          _animation.channels.forEach(_channel => {
            const iNode: number = _channel.target.node;
            if (iNode != undefined)
              _gltf.nodes[iNode].isAnimated = true;
          });
        });

        // mark nodes that are joints
        _gltf.skins?.forEach(_skin => {
          _skin.joints.forEach(_iJoint => _gltf.nodes[_iJoint].isJoint = true);
        });

        // mark parent of each node
        _gltf.nodes.forEach((_node, _iNode) => _node.children?.forEach(_iChild => _gltf.nodes[_iChild].parent = _iNode));

        // mark the depth of each node
        // add names to nodes that don't have one
        _gltf.nodes.forEach((_node, _iNode) => {
          if (!_node.name)
            _node.name = `Node${_iNode}`;
          let iParent: number = _node.parent;
          let depth: number = 0;
          let path: number[] = [];
          path.push(_iNode);
          while (iParent != undefined) {
            path.push(iParent);
            depth++;
            iParent = _gltf.nodes[iParent].parent;
          }
          _node.depth = depth;
          _node.path = path;
        });

        // mark the skeleton root nodes of each skin
        _gltf.skins?.forEach((_skin, _iSkin) => {
          if (_skin.skeleton == undefined) {
            // find the common root of all joints i.e. the skeleton
            // TODO: add an error for when there is no common root found, as this is a breach of the gltf specification
            // https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#joint-hierarchy
            const ancestors: Set<number> = new Set<number>(_skin.joints.flatMap(_iJoint => _gltf.nodes[_iJoint].path));
            _skin.skeleton = Array.from(ancestors).reduce((_a, _b) => _gltf.nodes[_a].depth < _gltf.nodes[_b].depth ? _a : _b);
          }

          if (_gltf.nodes[_skin.skeleton].iSkinRoot != undefined) {
            Debug.warn(`${GLTFLoader.name} | ${_url}: Skin with index ${_iSkin} and ${_gltf.nodes[_skin.skeleton].iSkinRoot} share the same common root node. FUDGE currently only supports one skeleton at the same postion in the hierarchy`);
            return;
          }

          _gltf.nodes[_skin.skeleton].iSkinRoot = _iSkin;
        });
      }
    }

    /**
     * Returns a {@link GraphInstance} for the given scene name or the default scene if no name is given.
     */
    public async getScene(_name?: string): Promise<Graph> {
      const iScene: number = _name ? this.gltf.scenes.findIndex(_scene => _scene.name == _name) : this.gltf.scene;
      if (iScene == -1)
        throw new Error(`${this}: Couldn't find name ${_name} in gltf scenes.`);
      return await this.getSceneByIndex(iScene);
    }

    /**
     * Returns a {@link GraphInstance} for the given scene index or the default scene if no index is given.
     */
    public async getSceneByIndex(_iScene: number = this.gltf.scene): Promise<Graph> {
      if (!this.#scenes)
        this.#scenes = [];
      if (!this.#scenes[_iScene]) {
        const gltfScene: GLTF.Scene = this.gltf.scenes[_iScene];
        const scene: Graph = new Graph(gltfScene.name);
        for (const iNode of gltfScene.nodes)
          scene.addChild(await this.getNodeByIndex(iNode));
        if (this.gltf.animations?.length > 0)
          scene.addComponent(new ComponentAnimator(await this.getAnimationByIndex(0)));
        // TODO: load all animations, not just the first one

        Project.register(scene);
        this.#scenes[_iScene] = scene;
      }
      return this.#scenes[_iScene];
    }

    /**
     * Returns the first {@link Node} with the given name.
     */
    public async getNode(_name: string): Promise<Node> {
      const iNode: number = this.gltf.nodes.findIndex(_node => _node.name == _name);
      if (iNode == -1)
        throw new Error(`${this}: Couldn't find name ${_name} in gltf nodes.`);
      return await this.getNodeByIndex(iNode);
    }

    /**
     * Returns the {@link Node} for the given index.
     */
    public async getNodeByIndex(_iNode: number, _nodes: Node[] = this.#nodesGraph): Promise<Node> {
      if (!_nodes[_iNode]) {
        const gltfNode: GLTF.Node = this.gltf.nodes[_iNode];
        const node: Node = gltfNode.iSkinRoot >= 0 ?
          _nodes == this.#nodesGraph ?
            new SkeletonInstance() :
            new Skeleton(gltfNode.name) :
          new Node(gltfNode.name);

        _nodes[_iNode] = node;

        if (node instanceof SkeletonInstance) {
          await node.set(await this.getSkeletonByIndex(gltfNode.iSkinRoot));
          return node;
        }

        // check for children
        if (gltfNode.children)
          for (const iNode of gltfNode.children)
            node.addChild(await this.getNodeByIndex(iNode, _nodes));

        // check for transformation
        if (gltfNode.matrix || gltfNode.rotation || gltfNode.scale || gltfNode.translation || gltfNode.isJoint || gltfNode.isAnimated) {
          node.addComponent(new ComponentTransform());
          if (gltfNode.matrix) {
            node.mtxLocal.set(Float32Array.from(gltfNode.matrix));
          } else {
            if (gltfNode.translation) {
              const translation: Vector3 = Recycler.get(Vector3);
              translation.set(gltfNode.translation[0], gltfNode.translation[1], gltfNode.translation[2]);
              node.mtxLocal.translation = translation;
              Recycler.store(translation);
            }
            if (gltfNode.rotation) {
              const rotation: Quaternion = Recycler.get(Quaternion);
              rotation.set(gltfNode.rotation[0], gltfNode.rotation[1], gltfNode.rotation[2], gltfNode.rotation[3]);
              node.mtxLocal.rotation = rotation;
              Recycler.store(rotation);
            }
            if (gltfNode.scale) {
              const scale: Vector3 = Recycler.get(Vector3);
              scale.set(gltfNode.scale[0], gltfNode.scale[1], gltfNode.scale[2]);
              node.mtxLocal.scaling = scale;
              Recycler.store(scale);
            }
          }
        }

        // check for camera
        if (gltfNode.camera != undefined) {
          node.addComponent(await this.getCameraByIndex(gltfNode.camera));
        }

        // check for mesh and material
        if (gltfNode.mesh != undefined) {
          const gltfMesh: GLTF.Mesh = this.gltf.meshes?.[gltfNode.mesh];
          // TODO: review this
          const subComponents: [ComponentMesh, ComponentMaterial][] = [];
          for (let iPrimitive: number = 0; iPrimitive < gltfMesh.primitives.length; iPrimitive++) {
            const cmpMesh: ComponentMesh = new ComponentMesh(await this.getMeshByIndex(gltfNode.mesh, iPrimitive));

            // check for skeleton
            if (gltfNode.skin != undefined) {
              let iSkeletonInstance: number = this.gltf.skins[gltfNode.skin].skeleton;
              cmpMesh.skeleton = <SkeletonInstance>await this.getNodeByIndex(iSkeletonInstance);
            }

            let cmpMaterial: ComponentMaterial;
            const iMaterial: number = gltfMesh.primitives?.[iPrimitive]?.material;
            if (iMaterial == undefined) {
              cmpMaterial = new ComponentMaterial(cmpMesh.mesh instanceof MeshSkin ?
                GLTFLoader.defaultSkinMaterial :
                GLTFLoader.defaultMaterial);
            } else {
              cmpMaterial = new ComponentMaterial(await this.getMaterialByIndex(iMaterial, cmpMesh.mesh instanceof MeshSkin));
            }

            subComponents.push([cmpMesh, cmpMaterial]);
          }

          if (subComponents.length == 1) {
            node.addComponent(subComponents[0][0]);
            node.addComponent(subComponents[0][1]);
          } else {
            subComponents.forEach(([_cmpMesh, _cmpMaterial], _i) => {
              const nodePart: Node = new Node(node.name + "_primitive" + _i);
              nodePart.addComponent(_cmpMesh);
              nodePart.addComponent(_cmpMaterial);
              node.addChild(nodePart);
            });
          }
        }
      }

      return _nodes[_iNode];
    }

    /**
     * Returns the first {@link ComponentCamera} with the given camera name.
     */
    public async getCamera(_name: string): Promise<ComponentCamera> {
      const iCamera: number = this.gltf.cameras.findIndex(_camera => _camera.name == _name);
      if (iCamera == -1)
        throw new Error(`${this}: Couldn't find name ${_name} in gltf cameras.`);
      return await this.getCameraByIndex(iCamera);
    }

    /**
     * Returns the {@link ComponentCamera} for the given camera index.
     */
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

    /**
     * Returns the first {@link Animation} with the given animation name.
     */
    public async getAnimation(_name: string): Promise<Animation> {
      const iAnimation: number = this.gltf.animations.findIndex(_animation => _animation.name == _name);
      if (iAnimation == -1)
        throw new Error(`${this}: Couldn't find name ${_name} in gltf animations.`);
      return await this.getAnimationByIndex(iAnimation);
    }

    /**
     * Returns the {@link Animation} for the given animation index.
     */
    public async getAnimationByIndex(_iAnimation: number): Promise<Animation> {
      if (!this.#animations)
        this.#animations = [];
      if (!this.#animations[_iAnimation]) {
        const gltfAnimation: GLTF.Animation = this.gltf.animations?.[_iAnimation];

        if (!gltfAnimation)
          throw new Error(`${this}: Couldn't find animation with index ${_iAnimation}.`);

        // group channels by node
        let gltfChannelsGrouped: GLTF.AnimationChannel[][] = [];
        for (const gltfChannel of gltfAnimation.channels) {
          const iNode: number = gltfChannel.target.node;
          if (iNode == undefined)
            continue;
          if (!gltfChannelsGrouped[iNode])
            gltfChannelsGrouped[iNode] = [];
          gltfChannelsGrouped[iNode].push(gltfChannel);
        }
        // remove empty entries
        gltfChannelsGrouped = gltfChannelsGrouped.filter(_channels => _channels != undefined);

        const animationStructure: AnimationStructure = {};
        for (const gltfChannels of gltfChannelsGrouped) {
          const gltfNode: GLTF.Node = this.gltf.nodes[gltfChannels[0].target.node];

          let currentStructure: AnimationStructure = animationStructure;
          for (const iPathNode of gltfNode.path.reverse()) {
            const pathNode: GLTF.Node = this.gltf.nodes[iPathNode];

            if (currentStructure.children == undefined)
              currentStructure.children = {};

            if ((currentStructure.children as AnimationStructure)[pathNode.name] == undefined)
              (currentStructure.children as AnimationStructure)[pathNode.name] = {};
            currentStructure = (currentStructure.children as AnimationStructure)[pathNode.name] as AnimationStructure;

            const iSkin: number = pathNode.iSkinRoot;
            if (iSkin != undefined && this.gltf.skins[iSkin].joints.includes(gltfChannels[0].target.node)) {
              const mtxBoneLocal: AnimationSequenceMatrix4x4 = {};
              for (const gltfChannel of gltfChannels)
                mtxBoneLocal[toInternTransformation[gltfChannel.target.path]] =
                  await this.getAnimationSequenceVector(gltfAnimation.samplers[gltfChannel.sampler], gltfChannel.target.path);
              if (currentStructure.mtxBoneLocals == undefined)
                currentStructure.mtxBoneLocals = {};
              (currentStructure.mtxBoneLocals as { [boneName: string]: AnimationSequenceMatrix4x4 })[gltfNode.name] = mtxBoneLocal;
              break;
            }

            if (pathNode == gltfNode) {
              const mtxLocal: AnimationSequenceMatrix4x4 = {};
              for (const gltfChannel of gltfChannels)
                mtxLocal[toInternTransformation[gltfChannel.target.path]] =
                  await this.getAnimationSequenceVector(gltfAnimation.samplers[gltfChannel.sampler], gltfChannel.target.path);
              currentStructure.components = {
                ComponentTransform: [
                  { mtxLocal: mtxLocal }
                ]
              };
            }
          }
        }

        this.#animations[_iAnimation] = new Animation(gltfAnimation.name, animationStructure);
      }
      return this.#animations[_iAnimation];
    }

    /**
     * Returns the first {@link MeshImport} with the given mesh name.
     */
    public async getMesh(_name: string): Promise<MeshImport> {
      const iMesh: number = this.gltf.meshes.findIndex(_mesh => _mesh.name == _name);
      if (iMesh == -1)
        throw new Error(`${this}: Couldn't find name ${_name} in gltf meshes.`);
      return await this.getMeshByIndex(iMesh);
    }

    /**
     * Returns the {@link MeshImport} for the given mesh index.
     */
    public async getMeshByIndex(_iMesh: number, _iPrimitive: number = 0): Promise<MeshImport> {
      if (!this.#meshes)
        this.#meshes = [];
      if (!this.#meshes[_iMesh])
        this.#meshes[_iMesh] = [];

      if (!this.#meshes[_iMesh][_iPrimitive]) {
        const gltfMesh: GLTF.Mesh = this.gltf.meshes[_iMesh];

        this.#meshes[_iMesh][_iPrimitive] = await (
          gltfMesh.primitives[_iPrimitive].attributes.JOINTS_0 != undefined ?
            new MeshSkin() :
            new MeshImport()
        ).load(MeshLoaderGLTF, this.url, { iMesh: _iMesh, iPrimitive: _iPrimitive });
      }

      return this.#meshes[_iMesh][_iPrimitive];
    }

    /**
     * Returns the {@link Material} for the given material index.
     */
    public async getMaterialByIndex(_iMaterial: number, _skin: boolean = false): Promise<Material> {
      if (!this.#materials)
        this.#materials = [];
      if (!this.#materials[_iMaterial]) {
        // TODO: in the future create an appropriate shader based on the gltf material properties
        const gltfMaterial: GLTF.Material = this.gltf.materials[_iMaterial];

        if (!gltfMaterial)
          throw new Error(`${this}: Couldn't find material with index ${_iMaterial}.`);

        // TODO: add support for other gltf material properties: https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#reference-material
        // e.g. normal, occlusion and emissive textures; alphaMode; alphaCutoff; doubleSided
        const gltfBaseColorTexture: GLTF.TextureInfo = gltfMaterial.pbrMetallicRoughness?.baseColorTexture;

        const color: Color = new Color(...gltfMaterial.pbrMetallicRoughness?.baseColorFactor || [1, 1, 1, 1]);
        const coat: Coat = gltfBaseColorTexture ?
          new CoatRemissiveTextured(color, await this.getTextureByIndex(gltfBaseColorTexture.index), 1, 1) :
          new CoatRemissive(color, 1, 0.5);

        const material: Material = new Material(
          gltfMaterial.name,
          gltfBaseColorTexture ?
            (_skin ? ShaderPhongTexturedSkin : ShaderPhongTextured) :
            (_skin ? ShaderPhongSkin : ShaderPhong),
          coat);

        this.#materials[_iMaterial] = material;
      }

      return this.#materials[_iMaterial];
    }

    /**
     * Returns the {@link Texture} for the given texture index.
     */
    public async getTextureByIndex(_iTexture: number): Promise<Texture> {
      if (!this.#textures)
        this.#textures = [];
      if (!this.#textures[_iTexture]) {
        const gltfTexture: GLTF.Texture = this.gltf.textures[_iTexture];
        const gltfSampler: GLTF.Sampler = this.gltf.samplers?.[gltfTexture.sampler];
        const gltfImage: GLTF.Image = this.gltf.images?.[gltfTexture.source];

        if (gltfImage == undefined) {
          Debug.warn(`${this}: Texture with index ${_iTexture} has no image.`);
          return TextureDefault.texture;
        }

        if (gltfSampler?.wrapS != undefined && gltfSampler?.wrapS != WebGL2RenderingContext.REPEAT)
          Debug.warn(`${this}: Texture with index ${_iTexture} has a wrapS of '${getWebGLParameterName(gltfSampler.wrapS)}'. FUDGE only supports the default behavior of '${getWebGLParameterName(WebGL2RenderingContext.REPEAT)}'.`);
        if (gltfSampler?.wrapT != undefined && gltfSampler?.wrapT != WebGL2RenderingContext.REPEAT)
          Debug.warn(`${this}: Texture with index ${_iTexture} has a wrapT of '${getWebGLParameterName(gltfSampler.wrapT)}'. FUDGE only supports the default behavior of '${getWebGLParameterName(WebGL2RenderingContext.REPEAT)}'.`);

        let url: string = new URL(gltfImage.uri, this.url).toString();

        if (!gltfImage.uri && gltfImage.bufferView) {
          // TODO: this is duplicate code from getBufferData, maybe refactor getBufferData to handle bufferViewIndex input
          const gltfBufferView: GLTF.BufferView = this.gltf.bufferViews[gltfImage.bufferView];

          const buffer: ArrayBuffer = await this.getBuffer(gltfBufferView.buffer);
          const byteOffset: number = gltfBufferView.byteOffset || 0;
          const byteLength: number = gltfBufferView.byteLength || 0;

          url = URL.createObjectURL(new Blob(
            [new Uint8Array(buffer, byteOffset, byteLength / Uint8Array.BYTES_PER_ELEMENT)],
            { type: gltfImage.mimeType }
          ));
        }

        const texture: TextureImage = new TextureImage();
        await texture.load(url);
        if (gltfSampler && gltfSampler.magFilter == WebGL2RenderingContext.NEAREST && gltfSampler.minFilter == WebGL2RenderingContext.NEAREST)
          texture.mipmap = MIPMAP.CRISP;
        else if (gltfSampler && gltfSampler.magFilter == WebGL2RenderingContext.NEAREST && gltfSampler.minFilter == WebGL2RenderingContext.NEAREST_MIPMAP_LINEAR)
          texture.mipmap = MIPMAP.MEDIUM;
        else if (gltfSampler && gltfSampler.magFilter == WebGL2RenderingContext.LINEAR && gltfSampler.minFilter == WebGL2RenderingContext.LINEAR_MIPMAP_LINEAR)
          texture.mipmap = MIPMAP.BLURRY;
        else if (gltfSampler && (gltfSampler.magFilter != undefined || gltfSampler.minFilter != undefined))
          Debug.warn(`${this}: Texture with index ${_iTexture} has a magFilter and minFilter of '${getWebGLParameterName(gltfSampler.magFilter)}' and '${getWebGLParameterName(gltfSampler.minFilter)}' respectively. FUDGE only supports the following combinations: NEAREST and NEAREST | NEAREST and NEAREST_MIPMAP_LINEAR | LINEAR and LINEAR_MIPMAP_LINEAR.`);

        this.#textures[_iTexture] = texture;
      }

      return this.#textures[_iTexture];
    }

    /**
     * Returns the first {@link Skeleton} with the given skeleton name.
     */
    public async getSkeleton(_name: string): Promise<Skeleton> {
      const iSkeleton: number = this.gltf.skins.findIndex(_skeleton => _skeleton.name == _name);
      if (iSkeleton == -1)
        throw new Error(`${this}: Couldn't find name ${_name} in gltf skins.`);
      return await this.getSkeletonByIndex(iSkeleton);
    }

    /**
     * Returns the {@link Skeleton} for the given skeleton index.
     */
    public async getSkeletonByIndex(_iSkeleton: number): Promise<Skeleton> {
      if (!this.#skeletons)
        this.#skeletons = [];
      if (!this.#skeletons[_iSkeleton]) {
        const gltfSkin: GLTF.Skin = this.gltf.skins[_iSkeleton];
        const skeleton: Skeleton = await this.getNodeByIndex(gltfSkin.skeleton, this.#nodesSkeleton) as Skeleton;

        // convert float array to array of matrices and register bones
        let mtxData: Float32Array;
        if (gltfSkin.inverseBindMatrices != undefined)
          mtxData = await this.getFloat32Array(gltfSkin.inverseBindMatrices);
        const mtxDataSpan: number = 16; // size of matrix

        // iterate over joints and get corresponding matrix from float array
        for (let iBone: number = 0; iBone < gltfSkin.joints.length; iBone++) {
          let mtxBindInverse: Matrix4x4;
          if (mtxData) {
            mtxBindInverse = new Matrix4x4();
            mtxBindInverse.set(mtxData.subarray(iBone * mtxDataSpan, iBone * mtxDataSpan + mtxDataSpan));
          }
          skeleton.registerBone(await this.getNodeByIndex(gltfSkin.joints[iBone], this.#nodesSkeleton), mtxBindInverse);
        }

        Project.register(skeleton);
        this.#skeletons[_iSkeleton] = skeleton;
      }

      return this.#skeletons[_iSkeleton];
    }

    /**
     * Returns a {@link Uint8Array} for the given accessor index.
     * @internal
     */
    public async getBoneIndices(_iAccessor: number): Promise<Uint8Array> {
      const array: TypedArray = await this.getBufferData(_iAccessor);
      const componentType: GLTF.COMPONENT_TYPE = this.gltf.accessors[_iAccessor]?.componentType;

      if (componentType == GLTF.COMPONENT_TYPE.UNSIGNED_BYTE)
        return array as Uint8Array;

      if (componentType == GLTF.COMPONENT_TYPE.UNSIGNED_SHORT) {
        Debug.info(`${this}: Bone indices are stored as ${GLTF.COMPONENT_TYPE[GLTF.COMPONENT_TYPE.UNSIGNED_SHORT]}. FUDGE will convert them to UNSIGNED_BYTE. FUDGE only supports skeletons with up to 256 bones, so make sure your skeleton has no more than 256 bones.`);
        return Uint8Array.from(array);
      }

      throw new Error(`${this}: Invalid component type ${GLTF.COMPONENT_TYPE[componentType]} for bone indices. Expected ${GLTF.COMPONENT_TYPE[GLTF.COMPONENT_TYPE.UNSIGNED_BYTE]} or ${GLTF.COMPONENT_TYPE[GLTF.COMPONENT_TYPE.UNSIGNED_SHORT]}.`);
    }

    /**
     * Returns a {@link Float32Array} for the given accessor index.
     * @internal
     */
    public async getFloat32Array(_iAccessor: number): Promise<Float32Array> {
      const array: TypedArray = await this.getBufferData(_iAccessor);
      const gltfAccessor: GLTF.Accessor = this.gltf.accessors[_iAccessor];

      if (gltfAccessor.componentType == GLTF.COMPONENT_TYPE.FLOAT)
        return array as Float32Array;

      if (gltfAccessor.normalized) {
        switch (gltfAccessor.componentType) {
          case GLTF.COMPONENT_TYPE.BYTE:
            return Float32Array.from(array, _value => Math.max(_value / 127, -1));
          case GLTF.COMPONENT_TYPE.UNSIGNED_BYTE:
            return Float32Array.from(array, _value => _value / 255);
          case GLTF.COMPONENT_TYPE.SHORT:
            return Float32Array.from(array, _value => Math.max(_value / 32767, -1));
          case GLTF.COMPONENT_TYPE.UNSIGNED_SHORT:
            return Float32Array.from(array, _value => _value / 65535);
          default:
            throw new Error(`${this}: Invalid component type ${GLTF.COMPONENT_TYPE[gltfAccessor.componentType]} for normalized accessor.`);
          // https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#_accessor_normalized
        }
      }

      Debug.warn(`${this}: Expected component type FLOAT but was ${GLTF.COMPONENT_TYPE[gltfAccessor?.componentType]}.`);
      return Float32Array.from(array);
    }

    /**
     * Returns a {@link Uint16Array} for the given accessor index. Only used to get the vertex indices.
     * @internal
     */
    public async getVertexIndices(_iAccessor: number): Promise<Uint16Array> {
      const array: TypedArray = await this.getBufferData(_iAccessor);
      const gltfAccessor: GLTF.Accessor = this.gltf.accessors[_iAccessor];

      if (gltfAccessor.componentType == GLTF.COMPONENT_TYPE.UNSIGNED_SHORT)
        return array as Uint16Array;

      if (gltfAccessor.count > 65535 && gltfAccessor.type == "SCALAR")
        throw new Error(`${this}: File includes a mesh with more than 65535 vertices. FUDGE does not support meshes with more than 65535 vertices.`);

      if (gltfAccessor.componentType == GLTF.COMPONENT_TYPE.UNSIGNED_BYTE || gltfAccessor.componentType == GLTF.COMPONENT_TYPE.UNSIGNED_INT)
        return Uint16Array.from(array);

      Debug.warn(`${this}: Expected component type UNSIGNED_SHORT but was ${GLTF.COMPONENT_TYPE[this.gltf.accessors[_iAccessor]?.componentType]}.`);
      return Uint16Array.from(array);
    }

    /**
     * Return a {@link Float32Array} for the given accessor index. The array contains the vertex colors in RGBA format.
     * @internal
     */
    public async getVertexColors(_iAccessor: number): Promise<Float32Array> {
      const array: Float32Array = await this.getFloat32Array(_iAccessor);
      const gltfAccessor: GLTF.Accessor = this.gltf.accessors[_iAccessor];

      if (gltfAccessor.type == GLTF.ACCESSOR_TYPE.VEC3) {
        const rgbaArray: Float32Array = new Float32Array(array.length * 4 / 3);
        for (let iVec3: number = 0, iVec4: number = 0; iVec3 < array.length; iVec3 += 3, iVec4 += 4) {
          rgbaArray[iVec4] = array[iVec3];
          rgbaArray[iVec4 + 1] = array[iVec3 + 1];
          rgbaArray[iVec4 + 2] = array[iVec3 + 2];
          rgbaArray[iVec4 + 3] = 1;
        }
        return rgbaArray;
      }

      return array;
    }

    public toString(): string {
      return `${GLTFLoader.name} | ${this.url}`;
    }

    private async getBufferData(_iAccessor: number): Promise<TypedArray> {
      const gltfAccessor: GLTF.Accessor = this.gltf.accessors[_iAccessor];
      if (!gltfAccessor)
        throw new Error(`${this}: Couldn't find accessor`);

      let array: TypedArray;
      const componentType: GLTF.COMPONENT_TYPE = gltfAccessor.componentType;
      const accessorType: GLTF.ACCESSOR_TYPE = gltfAccessor.type;

      if (gltfAccessor.bufferView != undefined)
        array = await this.getBufferViewData(this.gltf.bufferViews[gltfAccessor.bufferView], gltfAccessor.byteOffset, componentType, accessorType);

      if (gltfAccessor.sparse) {
        const gltfBufferViewIndices: GLTF.BufferView = this.gltf.bufferViews[gltfAccessor.sparse.indices.bufferView];
        const gltfBufferViewValues: GLTF.BufferView = this.gltf.bufferViews[gltfAccessor.sparse.values.bufferView];

        if (!gltfBufferViewIndices || !gltfBufferViewValues)
          throw new Error(`${this}: Couldn't find buffer views for sparse indices or values`);

        const arrayIndices: TypedArray = await this.getBufferViewData(gltfBufferViewIndices, gltfAccessor.sparse.indices.byteOffset, gltfAccessor.sparse.indices.componentType, GLTF.ACCESSOR_TYPE.SCALAR);
        const arrayValues: TypedArray = await this.getBufferViewData(gltfBufferViewValues, gltfAccessor.sparse.values.byteOffset, componentType, accessorType);

        const accessorTypeLength: number = toAccessorTypeLength[gltfAccessor.type];
        if (gltfAccessor.bufferView == undefined)
          array = new toArrayConstructor[gltfAccessor.componentType](gltfAccessor.count * accessorTypeLength);

        for (let i: number = 0; i < gltfAccessor.sparse.count; i++) {
          array.set(arrayValues.slice(i * accessorTypeLength, (i + 1) * accessorTypeLength), arrayIndices[i] * accessorTypeLength);
        }
      }

      return array;
    }

    private async getBufferViewData(_bufferView: GLTF.BufferView, _byteOffset: number, _componentType: GLTF.COMPONENT_TYPE, _accessorType: GLTF.ACCESSOR_TYPE): Promise<TypedArray> {
      const buffer: ArrayBuffer = await this.getBuffer(_bufferView.buffer);
      const byteOffset: number = (_bufferView.byteOffset ?? 0) + (_byteOffset ?? 0);
      const byteLength: number = _bufferView.byteLength ?? 0;
      const byteStride: number = _bufferView.byteStride;

      const arrayConstructor: TypedArrayConstructor = toArrayConstructor[_componentType];
      const array: TypedArray = new arrayConstructor(buffer, byteOffset, byteLength / arrayConstructor.BYTES_PER_ELEMENT);

      if (byteStride != undefined) {
        // TODO: instead of creating new buffers maybe rather pass stride into the render mesh? and set it when data is passed to the gpu?
        const nComponentsPerElement: number = toAccessorTypeLength[_accessorType]; // amount of components per element of the accessor type, i.e. 3 for VEC3
        const nElements: number = byteLength / byteStride; // amount of elements, i.e. n*VEC3 
        const stride: number = byteStride / arrayConstructor.BYTES_PER_ELEMENT;
        const newArray: TypedArray = new arrayConstructor(nElements * nComponentsPerElement);
        for (let iNewElement: number = 0; iNewElement < nElements; iNewElement++) {
          const iElement: number = iNewElement * stride;
          // TODO: check if loop is faster than set + slice
          for (let iComponent: number = 0; iComponent < nComponentsPerElement; iComponent++)
            newArray[iNewElement * nComponentsPerElement + iComponent] = array[iElement + iComponent];
          // newArray.set(array.slice(iElement, iElement + nComponentsPerElement), iNewElement * nComponentsPerElement);
        }

        return newArray;
      }

      return array;
    }

    private async getBuffer(_iBuffer: number): Promise<ArrayBuffer> {
      const gltfBuffer: GLTF.Buffer = this.gltf.buffers[_iBuffer];
      if (!gltfBuffer)
        throw new Error(`${this}: Couldn't find buffer`);

      if (!this.#buffers)
        this.#buffers = [];
      if (!this.#buffers[_iBuffer]) {
        const response: Response = await fetch(new URL(gltfBuffer.uri, this.url));
        this.#buffers[_iBuffer] = await response.arrayBuffer();
      }

      return this.#buffers[_iBuffer];
    }

    private async getAnimationSequenceVector(_sampler: GLTF.AnimationSampler, _transformationType: GLTF.AnimationChannelTarget["path"]): Promise<AnimationSequenceVector3 | AnimationSequenceVector4> {
      const input: Float32Array = await this.getFloat32Array(_sampler.input);
      const output: Float32Array = await this.getFloat32Array(_sampler.output);

      const millisPerSecond: number = 1000;
      const isRotation: boolean = _transformationType == "rotation";
      const vectorLength: number = isRotation ? 4 : 3; // rotation is stored as quaternion
      const interpolation: ANIMATION_INTERPOLATION = this.toInternInterpolation(_sampler.interpolation);
      const isCubic: true | undefined = interpolation == ANIMATION_INTERPOLATION.CUBIC ? true : undefined;
      const vectorsPerInput: number = isCubic ? 3 : 1; // cubic interpolation uses 3 values per input: in-tangent, property value and out-tangent. https://registry.khronos.org/glTF/specs/2.0/glTF-2.0.html#interpolation-cubic

      // used only for rotation interpolation
      let lastRotation: Quaternion;
      let nextRotation: Quaternion;

      const sequenceVector: AnimationSequenceVector3 | AnimationSequenceVector4 = {};
      sequenceVector.x = new AnimationSequence();
      sequenceVector.y = new AnimationSequence();
      sequenceVector.z = new AnimationSequence();
      if (isRotation) {
        sequenceVector.w = new AnimationSequence();
        lastRotation = Recycler.get(Quaternion);
        nextRotation = Recycler.get(Quaternion);
      }

      for (let iInput: number = 0; iInput < input.length; iInput++) {
        const iOutput: number = iInput * vectorsPerInput * vectorLength + (isCubic ? vectorLength : 0);
        const iOutputSlopeIn: number = iOutput - vectorLength;
        const iOutputSlopeOut: number = iOutput + vectorLength;
        const time: number = millisPerSecond * input[iInput];

        if (isRotation) {
          // Take the shortest path between two rotations, i.e. if the dot product is negative then the next quaternion needs to be negated.
          // q and -q represent the same rotation but interpolation will take either the long way or the short way around the sphere depending on which we use.
          nextRotation.set(output[iOutput + 0], output[iOutput + 1], output[iOutput + 2], output[iOutput + 3]);
          if (Quaternion.DOT(lastRotation, nextRotation) < 0)
            nextRotation.negate();
          output[iOutput + 0] = nextRotation.x;
          output[iOutput + 1] = nextRotation.y;
          output[iOutput + 2] = nextRotation.z;
          output[iOutput + 3] = nextRotation.w;
          lastRotation.set(nextRotation.x, nextRotation.y, nextRotation.z, nextRotation.w);
        }

        sequenceVector.x.addKey(new AnimationKey(time, output[iOutput + 0], interpolation, isCubic && output[iOutputSlopeIn + 0] / millisPerSecond, isCubic && output[iOutputSlopeOut + 0] / millisPerSecond));
        sequenceVector.y.addKey(new AnimationKey(time, output[iOutput + 1], interpolation, isCubic && output[iOutputSlopeIn + 1] / millisPerSecond, isCubic && output[iOutputSlopeOut + 1] / millisPerSecond));
        sequenceVector.z.addKey(new AnimationKey(time, output[iOutput + 2], interpolation, isCubic && output[iOutputSlopeIn + 2] / millisPerSecond, isCubic && output[iOutputSlopeOut + 2] / millisPerSecond));
        (<AnimationSequenceVector4>sequenceVector).w?.addKey(new AnimationKey(time, output[iOutput + 3], interpolation, isCubic && output[iOutputSlopeIn + 3] / millisPerSecond, isCubic && output[iOutputSlopeOut + 3] / millisPerSecond));
      }

      if (isRotation) {
        Recycler.store(lastRotation);
        Recycler.store(nextRotation);
      }

      return sequenceVector;
    }

    private toInternInterpolation(_interpolation: GLTF.AnimationSampler["interpolation"]): ANIMATION_INTERPOLATION {
      switch (_interpolation) {
        case "LINEAR":
          return ANIMATION_INTERPOLATION.LINEAR;
        case "STEP":
          return ANIMATION_INTERPOLATION.CONSTANT;
        case "CUBICSPLINE":
          return ANIMATION_INTERPOLATION.CUBIC;
        default:
          if (_interpolation != undefined)
            Debug.warn(`${this}: Unknown interpolation type ${_interpolation}`);
          return ANIMATION_INTERPOLATION.LINEAR;
      }
    }
  }

  function getWebGLParameterName(_value: number): string {
    return Object.keys(WebGL2RenderingContext).find(_key => Reflect.get(WebGL2RenderingContext, _key) == _value);
  }

  type TypedArray = Uint8Array | Uint16Array | Uint32Array | Int8Array | Int16Array | Float32Array;
  type TypedArrayConstructor = Uint8ArrayConstructor | Uint16ArrayConstructor | Uint32ArrayConstructor | Int8ArrayConstructor | Int16ArrayConstructor | Float32ArrayConstructor;

  const toInternTransformation: Record<GLTF.AnimationChannelTarget["path"], string> = {
    "translation": "translation",
    "rotation": "rotation",
    "scale": "scaling",
    "weights": "weights"
  };

  // number of components defined by 'type'
  const toAccessorTypeLength: Record<GLTF.ACCESSOR_TYPE, number> = {
    "SCALAR": 1,
    "VEC2": 2,
    "VEC3": 3,
    "VEC4": 4,
    "MAT2": 4,
    "MAT3": 9,
    "MAT4": 16
  };

  const toArrayConstructor: Record<GLTF.COMPONENT_TYPE, TypedArrayConstructor> = {
    [GLTF.COMPONENT_TYPE.UNSIGNED_BYTE]: Uint8Array,
    [GLTF.COMPONENT_TYPE.BYTE]: Int8Array,
    [GLTF.COMPONENT_TYPE.UNSIGNED_SHORT]: Uint16Array,
    [GLTF.COMPONENT_TYPE.SHORT]: Int16Array,
    [GLTF.COMPONENT_TYPE.UNSIGNED_INT]: Uint32Array,
    [GLTF.COMPONENT_TYPE.FLOAT]: Float32Array
  };

}