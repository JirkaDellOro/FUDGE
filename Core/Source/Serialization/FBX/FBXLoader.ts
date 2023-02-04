namespace FudgeCore {
  /**
   * Asset loader for Filmbox files.
   * @author Matthias Roming, HFU, 2023
   */
  export class FBXLoader {

    static #defaultMaterial: Material;
    static #defaultSkinMaterial: Material;

    private static loaders: { [uri: string]: FBXLoader };

    public readonly fbx: FBX.FBX;
    public readonly nodes: FBX.Node[];
    public readonly uri: string;

    #scenes: Graph[];
    #nodes: Node[];
    #meshes: MeshImport[];
    #materials: Material[];
    #skinMaterials: Material[] = [];
    #textures: Texture[];
    #skeletons: Skeleton[];
    #animations: Animation[];

    public constructor(_buffer: ArrayBuffer, _uri: string) {
      this.uri = _uri;
      this.nodes = FBX.parseNodesFromBinary(_buffer);
      console.log(this.nodes);
      this.fbx = FBX.loadFromNodes(this.nodes);
      console.log(this.fbx);
    }

    private static get defaultMaterial(): Material {
      return this.#defaultMaterial || (this.#defaultMaterial =
        new Material("FBXDefaultMaterial", ShaderGouraud, new CoatRemissive(Color.CSS("white")))
      );
    }

    private static get defaultSkinMaterial(): Material {
      return this.#defaultSkinMaterial || (this.#defaultSkinMaterial =
        new Material("FBXDefaultSkinMaterial", ShaderGouraudSkin, new CoatRemissive(Color.CSS("white")))
      );
    }
    
    public static async LOAD(_uri: string): Promise<FBXLoader> {
      if (!this.loaders)
        this.loaders = {};
      if (!this.loaders[_uri]) {      
        const response: Response = await fetch(_uri);
        const binary: ArrayBuffer = await response.arrayBuffer();
        this.loaders[_uri] = new FBXLoader(binary, _uri);
      }
      return this.loaders[_uri];
    }

    public async getScene(_index: number = 0): Promise<GraphInstance> {
      if (!this.#scenes)
        this.#scenes = [];
      if (!this.#scenes[_index]) {
        const documentFBX: FBX.Document = this.fbx.documents[_index].load();
        const scene: Graph = new Graph(documentFBX.name);
        for (const childFBX of documentFBX.children) {
          if (childFBX.type == "Model") {
            if (childFBX.subtype == "LimbNode")
              scene.addChild(await SkeletonInstance.CREATE(await this.getSkeleton(childFBX)));
            else
              scene.addChild(await this.getNode(this.fbx.objects.models.indexOf(childFBX), scene));
          }
        }
        const animation: Animation = await this.getAnimation(documentFBX.ActiveAnimStackName.length > 0 ?
          this.fbx.objects.animStacks.findIndex(animStack => animStack.name == documentFBX.ActiveAnimStackName) : 0);
        for (const child of scene) {
          if (child.name == "Skeleton0")
            child.getParent().addComponent(new ComponentAnimator(
              animation, ANIMATION_PLAYMODE.LOOP, ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS
            ));
        }
        Project.register(scene);
        this.#scenes[_index] = scene;
      }
      return await Project.createGraphInstance(this.#scenes[_index]);
    }

    public async getNode(_index: number, _root?: Node): Promise<Node> {
      if (!this.#nodes)
        this.#nodes = [];
      if (!this.#nodes[_index]) {
        const modelFBX: FBX.Model = this.fbx.objects.models[_index].load();
        const node: Node = new Node(modelFBX.name);
        node.addComponent(new ComponentTransform(Matrix4x4.CONSTRUCTION({
          translation: this.getTransformVector(modelFBX.LclTranslation, Vector3.ZERO),
          rotation: this.getTransformVector(modelFBX.LclRotation, Vector3.ZERO),
          scaling: this.getTransformVector(modelFBX.LclScaling, Vector3.ONE)
        })));
        if (modelFBX.PreRotation != undefined) {
          node.mtxLocal.rotate(modelFBX.PreRotation);
        }
        if (modelFBX.children) for (const childFBX of modelFBX.children) {
          if (childFBX.type == "Model") {
            if (_root && childFBX.subtype == "LimbNode") {
              const skeleton: Skeleton = await this.getSkeleton(childFBX);
              let skeletonInstance: SkeletonInstance;
              for (const child of _root) {
                if (child instanceof SkeletonInstance && child.idSource == skeleton.idResource)
                  skeletonInstance = child;
              }
              node.addChild(skeletonInstance || await SkeletonInstance.CREATE(skeleton));
            }
            else
              node.addChild(await this.getNode(this.fbx.objects.models.indexOf(childFBX)));
          }
          else if (childFBX.type == "Geometry") {
            const mesh: MeshImport = await this.getMesh(this.fbx.objects.geometries.indexOf(childFBX));
            const cmpMesh: ComponentMesh = new ComponentMesh(mesh);
            node.addComponent(new ComponentMaterial(FBXLoader.defaultMaterial));
            if (mesh instanceof MeshSkin) {
              const skeleton: Skeleton = await this.getSkeleton(childFBX.children[0].children[0].children[0]); // Model.Deformer.SubDeformer.LimbNode
              cmpMesh.bindSkeleton(_root?.getChild(0) as SkeletonInstance || await SkeletonInstance.CREATE(skeleton));
              node.getComponent(ComponentMaterial).material = FBXLoader.defaultSkinMaterial;
            }
            node.addComponent(cmpMesh);
          }
          else if (childFBX.type == "Material") {
            const iMaterial: number = this.fbx.objects.materials.indexOf(childFBX);
            const material: Material = await this.getMaterial(iMaterial);
            node.getComponent(ComponentMaterial).material = node.getComponent(ComponentMesh).mesh instanceof MeshSkin ?
              this.#skinMaterials[iMaterial] || (this.#skinMaterials[iMaterial] = new Material(
                material.name,
                material.getShader() == ShaderPhong ?
                  ShaderPhongSkin :
                  ShaderPhongTexturedSkin,
                material.coat
              )) :
              material;
          }
        }
        this.#nodes[_index] = node;
      }
      return this.#nodes[_index];
    }

    public async getMesh(_index: number): Promise<MeshImport> {
      if (!this.#meshes)
        this.#meshes = [];
      if (!this.#meshes[_index])
        this.#meshes[_index] = await (
          this.fbx.objects.geometries[_index].children?.[0].type == "Deformer" ?
            new MeshSkin() :
            new MeshImport()
        ).load(MeshLoaderFBX, this.uri, this.fbx.objects.geometries[_index]);
      return this.#meshes[_index];
    }

    public async getMaterial(_index: number): Promise<Material> {
      if (!this.#materials)
        this.#materials = [];
      if (!this.#materials[_index]) {
        const materialFBX: FBX.Material = this.fbx.objects.materials[_index].load();
        materialFBX.DiffuseColor?.children[0].load();
        // FBX supports lambert and phong shading, either way fudge has no lambert shader so we always use phong
        // In DiffuseColor the texture of the material color is stored, if it's defined we use a texture shader
        this.#materials[_index] = new Material(
          materialFBX.name,
          materialFBX.DiffuseColor ?
            ShaderPhongTextured :
            ShaderPhong,
          materialFBX.DiffuseColor ?
            new CoatRemissiveTextured(
              new Color(...materialFBX.Diffuse.get()),
              await this.getTexture(this.fbx.objects.textures.indexOf(materialFBX.DiffuseColor)),
              materialFBX.DiffuseFactor,
              materialFBX.Specular.magnitude
            ) :
            new CoatRemissive(
              new Color(...materialFBX.Diffuse.get()),
              materialFBX.DiffuseFactor,
              materialFBX.Specular.magnitude
            )
        );
      }
      return this.#materials[_index];
    }

    public async getTexture(_index: number): Promise<Texture> {
      if (!this.#textures)
        this.#textures = [];
      if (!this.#textures[_index]) {
        const videoFBX: FBX.Video = this.fbx.objects.textures[_index].children[0];
        const texture: TextureImage = new TextureImage();
        texture.image = new Image();
        texture.image.src = URL.createObjectURL(new Blob([videoFBX.Content], { type: "image/png" }));
        this.#textures[_index] = texture;
      }
      return this.#textures[_index];
    }

    // Problem: mehrere Deformer verweisen auf das selbe Skelett aber nutzen dabei nicht immer alle Knochen
    // => Problem besteht auch im GLTFLoader
    /**
     * Retriefs the skeleton containing the given limb node.
     */
    public async getSkeleton(_fbxLimbNode: FBX.Model): Promise<Skeleton> {
      if (!this.#skeletons)
        this.#skeletons = [];
      return this.#skeletons.find(skeleton => _fbxLimbNode.name in skeleton.bones) || await (async() => {
        const skeleton: Skeleton = new Skeleton(`Skeleton${this.#skeletons.length}`);
        let rootNode: FBX.Model = _fbxLimbNode;
        while (rootNode.parents && rootNode.parents.some(parent => parent.subtype == "LimbNode"))
          rootNode = rootNode.parents.find(parent => parent.subtype == "LimbNode");
        const iNode: number = this.fbx.objects.models.findIndex(model => model.name == rootNode.name);
        skeleton.addChild(await this.getNode(iNode));
        for (const node of skeleton) {
          if (node != skeleton && this.fbx.objects.models[this.#nodes.indexOf(node)].subtype == "LimbNode")
            skeleton.registerBone(node);
        }
        skeleton.setDefaultPose();
        Project.register(skeleton);
        this.#skeletons.push(skeleton);
        return skeleton;
      })();
    }

    public async getAnimation(_index: number): Promise<Animation> {
      if (!this.#animations)
        this.#animations = [];
      if (!this.#animations[_index]) {
        const animStack: FBX.Object = this.fbx.objects.animStacks[_index];
        const animNodesFBX: FBX.AnimCurveNode[] = animStack.children[0].children;
        const animStructure: {
          children: {
            [childName: string]: {
              mtxBoneLocals: {
                [boneName: string]: AnimationStructureMatrix4x4
              }
            }
          }
        } = { children: { "Skeleton0": { mtxBoneLocals: {} } } };
        for (const animNodeFBX of animNodesFBX) {
          const target: FBX.Object = animNodeFBX.parents.find(parent => parent.type != "AnimLayer");
          (animStructure.children.Skeleton0.mtxBoneLocals[target.name] ||
            (animStructure.children.Skeleton0.mtxBoneLocals[target.name] = {}))[{
            T: "translation",
            R: "rotation",
            S: "scale"
          }[animNodeFBX.name]] = this.getAnimationVector3(animNodeFBX);
        }
        this.#animations[_index] = new Animation(animStack.name, animStructure);
      }
      return this.#animations[_index];
    }

    private getTransformVector(_vector: number | Vector3 | FBX.AnimCurveNode, _default: () => Vector3): Vector3 {
      return (
        _vector == undefined ?
          _default() :
        _vector instanceof Vector3 ?
          _vector :
        typeof _vector == "number" ?
          Vector3.ONE(_vector) :
          new Vector3(
            typeof (_vector = _vector.load()).dX == "number" ?
              _vector.dX :
              (_vector.dX.load() as FBX.AnimCurve).Default,
            typeof _vector.dY == "number" ?
              _vector.dY :
              (_vector.dY.load() as FBX.AnimCurve).Default,
            typeof _vector.dZ == "number" ?
              _vector.dZ :
              (_vector.dZ.load() as FBX.AnimCurve).Default
          )
      );
    }

    private getAnimationVector3(_animNode: FBX.AnimCurveNode): AnimationStructureVector3 {
      const vectorSequence: AnimationStructureVector3 = {};
      for (const valueName in _animNode) if (valueName == "dX" || valueName == "dY" || valueName == "dZ") {
        const value: FBX.AnimCurve | number = _animNode[valueName];
        if (typeof value != "number") {
          const sequence: AnimationSequence = new AnimationSequence();
          for (let i: number = 0; i < value.KeyTime.length; ++i) {
            // According to the reference time is defined as a signed int64, unit being 1/46186158000 seconds
            // ref: https://archive.blender.org/wiki/index.php/User:Mont29/Foundation/FBX_File_Structure/#Some_Specific_Property_Types
            sequence.addKey(new AnimationKey(Number((value.KeyTime[i] - value.KeyTime.reduce((min, v) => v < min ? v : min)) / BigInt("46186158")), value.KeyValueFloat[i]));
          }
          vectorSequence[valueName[1].toLowerCase()] = sequence;
        }
      }
      return vectorSequence;
    }

  }
}