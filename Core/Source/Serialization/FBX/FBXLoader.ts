namespace FudgeCore {
  /**
   * Asset loader for Filmbox files.
   * @author Matthias Roming, HFU, 2023
   */
  export class FBXLoader {
    private static loaders: { [uri: string]: FBXLoader };

    static #defaultMaterial: Material;
    static #defaultSkinMaterial: Material;

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
        if (this.fbx.objects.animStacks && this.fbx.objects.animStacks.length > 0) {
          const animation: Animation = await this.getAnimation(documentFBX.ActiveAnimStackName.length > 0 ?
            this.fbx.objects.animStacks.findIndex(_animStack => _animStack.name == documentFBX.ActiveAnimStackName) : 0);
          for (const child of scene) {
            if (child.name == "Skeleton0")
              child.getParent().addComponent(new ComponentAnimator(
                animation, ANIMATION_PLAYMODE.LOOP, ANIMATION_QUANTIZATION.CONTINOUS
              ));
          }
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
        // create node with transform
        const modelFBX: FBX.Model = this.fbx.objects.models[_index].load();
        const node: Node = new Node(modelFBX.name);
        await this.generateTransform(modelFBX, node);
        // node.addComponent(new ComponentTransform(Matrix4x4.CONSTRUCTION({
        //   translation: this.getTransformVector(modelFBX.LclTranslation, Vector3.ZERO),
        //   rotation: this.getTransformVector(modelFBX.LclRotation, Vector3.ZERO),
        //   scaling: this.getTransformVector(modelFBX.LclScaling, Vector3.ONE)
        // })));
        // if (modelFBX.PreRotation)
        //   node.mtxLocal.multiply(Matrix4x4.ROTATION(modelFBX.PreRotation), true);
        // if (modelFBX.PostRotation)
        //   node.mtxLocal.multiply(Matrix4x4.ROTATION(modelFBX.PostRotation));
        this.#nodes[_index] = node;

        // attach children and components
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
            } else
              node.addChild(await this.getNode(this.fbx.objects.models.indexOf(childFBX)));
          } else if (childFBX.type == "Geometry") {
            const mesh: MeshImport = await this.getMesh(this.fbx.objects.geometries.indexOf(childFBX));
            const cmpMesh: ComponentMesh = new ComponentMesh(mesh);
            node.addComponent(new ComponentMaterial(FBXLoader.defaultMaterial));
            if (mesh instanceof MeshSkin) {
              const skeleton: Skeleton = await this.getSkeleton(childFBX.children[0].children[0].children[0]); // Model.Deformer.SubDeformer.LimbNode
              cmpMesh.skeleton = (_root?.getChild(0) as SkeletonInstance || await SkeletonInstance.CREATE(skeleton));
              for (const subDeformerFBX of childFBX.children[0].children as FBX.SubDeformer[]) {
                const bone: Node = cmpMesh.skeleton.bones[subDeformerFBX.children[0].name];
                bone.mtxLocal.set(subDeformerFBX.TransformLink);
                if (bone.getParent())
                  bone.mtxLocal.multiply(bone.getParent().mtxWorldInverse);
              }
              node.getComponent(ComponentMaterial).material = FBXLoader.defaultSkinMaterial;
            }
            node.addComponent(cmpMesh);
          } else if (childFBX.type == "Material") {
            // TODO: additional skin materials get created here, check if the original material is still needed
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
        if (!(materialFBX.DiffuseColor instanceof Vector3))
          materialFBX.DiffuseColor?.children[0].load();
        // FBX supports lambert and phong shading, either way fudge has no lambert shader so we always use phong.
        // In DiffuseColor the texture of the material color is stored, if it's defined we use a texture shader.
        // TODO: materialFBX also contains additional values like shininess and reflectivity (and others) which are not suppported.
        this.#materials[_index] = new Material(
          materialFBX.name,
          materialFBX.DiffuseColor && !(materialFBX.DiffuseColor instanceof Vector3) ?
            ShaderPhongTextured :
            ShaderPhong,
          materialFBX.DiffuseColor && !(materialFBX.DiffuseColor instanceof Vector3) ?
            new CoatRemissiveTextured(
              new Color(...materialFBX.Diffuse.get()),
              await this.getTexture(this.fbx.objects.textures.indexOf(materialFBX.DiffuseColor)),
              materialFBX.DiffuseFactor ?? 1,
              materialFBX.SpecularFactor ?? average(materialFBX.Specular?.get()) ?? 0
            ) :
            new CoatRemissive(
              new Color(...(materialFBX.DiffuseColor as Vector3 ?? materialFBX.Diffuse).get()),
              materialFBX.DiffuseFactor ?? 1,
              materialFBX.SpecularFactor ?? average(materialFBX.Specular?.get()) ?? 0
            )
        );
      }
      return this.#materials[_index];

      function average(_array: Float32Array): number { // TODO: specular factor vector (together with specular color texture) is not supported so we use the average of the vector to approximate a singular specular factor.
        if (_array)
          return _array.reduce((a, b) => a + b) / _array.length;
        else
          return undefined;
      } 
    }

    public async getTexture(_index: number): Promise<Texture> {
      return new Promise((resolve, reject) => {
        if (!this.#textures)
          this.#textures = [];
        if (this.#textures[_index])
          return resolve(this.#textures[_index]);

        const videoFBX: FBX.Video = this.fbx.objects.textures[_index].children[0];
        const texture: TextureImage = new TextureImage();
        texture.image = new Image();
        texture.image.onload = () => resolve(texture);
        texture.image.onerror = reject;
        texture.image.src = URL.createObjectURL(new Blob([videoFBX.Content], { type: "image/png" }));
        this.#textures[_index] = texture;
        // TODO: get and set mipmap information ???
      });
    }

    // Problem: mehrere Deformer verweisen auf das selbe Skelett aber nutzen dabei nicht immer alle Knochen
    // => Problem besteht auch im GLTFLoader
    /**
     * Retriefs the skeleton containing the given limb node.
     */
    public async getSkeleton(_fbxLimbNode: FBX.Model): Promise<Skeleton> {
      if (!this.#skeletons)
        this.#skeletons = [];
      return this.#skeletons.find(_skeleton => _fbxLimbNode.name in _skeleton.bones) || await (async() => {
        const skeleton: Skeleton = new Skeleton(`Skeleton${this.#skeletons.length}`);
        let rootNode: FBX.Model = _fbxLimbNode;
        while (rootNode.parents && rootNode.parents.some(parent => parent.subtype == "LimbNode"))
          rootNode = rootNode.parents.find(_parent => _parent.subtype == "LimbNode");
        const iRootNode: number = this.fbx.objects.models.findIndex(_model => _model.name == rootNode.name);
        skeleton.addChild(await this.getNode(iRootNode));
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
                [boneName: string]: AnimationStructureMatrix4x4;
              };
            };
          };
        } = { children: { "Skeleton0": { mtxBoneLocals: {} } } };
        for (const animNodeFBX of animNodesFBX) {
          if (typeof animNodeFBX.dX == "number" && typeof animNodeFBX.dY == "number" && typeof animNodeFBX.dZ == "number") 
            continue;
          const target: FBX.Model = animNodeFBX.parents.find(_parent => _parent.type != "AnimLayer");
          (animStructure.children.Skeleton0.mtxBoneLocals[target.name] ||
            (animStructure.children.Skeleton0.mtxBoneLocals[target.name] = {}))[{
            T: "translation",
            R: "rotation",
            S: "scale"
          }[animNodeFBX.name]] = this.getAnimationVector3(animNodeFBX, target);
        }
        this.#animations[_index] = new Animation(animStack.name, animStructure);
      }
      return this.#animations[_index];
    }

    /**
     * fetched from three.js, adapted to FUDGE and optimized
     * https://github.com/mrdoob/three.js/blob/dev/examples/jsm/loaders/FBXLoader.js
     * line 3950
     */
    private async generateTransform(_modelFBX: FBX.Model, _node: Node): Promise<void> {
      const parentIndex: number = this.fbx.objects.models.indexOf(_modelFBX.parents.find(_parent => _parent.type == "Model"));
      const parent: Node = parentIndex >= 0 ? await this.getNode(parentIndex) : undefined;
      
      const mtxLocalRotation: Matrix4x4 = _modelFBX.PreRotation || _modelFBX.LclRotation || _modelFBX.PostRotation ?
        Matrix4x4.IDENTITY() :
        undefined;
      if (_modelFBX.PreRotation) {
        mtxLocalRotation.rotate(this.getOrdered(_modelFBX.PreRotation, _modelFBX));
      }
      if (_modelFBX.LclRotation) {
        mtxLocalRotation.rotate(this.getOrdered(this.getTransformVector(_modelFBX.LclRotation, Vector3.ZERO), _modelFBX));
      }
      if (_modelFBX.PostRotation) {
        let mtxPostRotationInverse: Matrix4x4 = Matrix4x4.ROTATION(this.getOrdered(_modelFBX.PostRotation , _modelFBX));
        mtxPostRotationInverse = Matrix4x4.INVERSION(mtxPostRotationInverse);
        mtxLocalRotation.multiply(mtxPostRotationInverse);
      }

      const mtxLocalScaling: Matrix4x4 = _modelFBX.LclScaling ?
        Matrix4x4.SCALING(this.getTransformVector(_modelFBX.LclScaling, Vector3.ONE)) :
        undefined;

      const mtxParentWorldRotation: Matrix4x4 = parent ? Matrix4x4.ROTATION(parent.mtxWorld.rotation) : undefined;

      const mtxParentWorldScale: Matrix4x4 = parent ? (() => {
        const mtxParentWorldScale: Matrix4x4 = Matrix4x4.INVERSION(mtxParentWorldRotation);
        mtxParentWorldScale.translate(Vector3.SCALE(parent.mtxWorld.translation, -1));
        mtxParentWorldScale.multiply(parent.mtxWorld);
        return mtxParentWorldScale;
      })() : undefined;

      const mtxWorldRotationScale: Matrix4x4 = parent || mtxLocalRotation || mtxLocalScaling ? Matrix4x4.IDENTITY() : undefined;
      if (parent || mtxLocalRotation || mtxLocalScaling) {
        const inheritType: number = _modelFBX.InheritType || 0;
        if (inheritType == 0) {
          if (parent)
            mtxWorldRotationScale.multiply(mtxParentWorldRotation);
          if (mtxLocalRotation)
            mtxWorldRotationScale.multiply(mtxLocalRotation);
          if (parent)
            mtxWorldRotationScale.multiply(mtxParentWorldScale);
          if (mtxLocalScaling)
            mtxWorldRotationScale.multiply(mtxLocalScaling);
        } else if (inheritType == 1) {
          if (parent) {
            mtxWorldRotationScale.multiply(mtxParentWorldRotation);
            mtxWorldRotationScale.multiply(mtxParentWorldScale);
          }
          if (mtxLocalRotation)
            mtxWorldRotationScale.multiply(mtxLocalRotation);
          if (mtxLocalScaling)
            mtxWorldRotationScale.multiply(mtxLocalScaling);
        } else {
          if (parent)
            mtxWorldRotationScale.multiply(mtxParentWorldRotation);
          if (mtxLocalRotation)
            mtxWorldRotationScale.multiply(mtxLocalRotation);
          if (parent) {
            mtxWorldRotationScale.multiply(mtxParentWorldScale);
            let mtxParentLocalScalingInverse: Matrix4x4 = Matrix4x4.SCALING(parent.mtxLocal.scaling);
            mtxParentLocalScalingInverse = Matrix4x4.INVERSION(mtxParentLocalScalingInverse);
            mtxWorldRotationScale.multiply(mtxParentLocalScalingInverse);
          }
          if (mtxLocalScaling)
            mtxWorldRotationScale.multiply(mtxLocalScaling);
        }
      }

      // Calculate the local transform matrix
      let translation: Vector3;
      translation = Vector3.ZERO();
      if (_modelFBX.LclTranslation)
        translation.add(this.getTransformVector(_modelFBX.LclTranslation, Vector3.ZERO));
      if (_modelFBX.RotationOffset)
        translation.add(_modelFBX.RotationOffset);
      if (_modelFBX.RotationPivot)
        translation.add(_modelFBX.RotationPivot);
      
      const mtxTransform: Matrix4x4 = Matrix4x4.TRANSLATION(translation);
      if (mtxLocalRotation)
        mtxTransform.multiply(mtxLocalRotation);
      
      translation = Vector3.ZERO();
      if (_modelFBX.RotationPivot)
        translation.subtract(_modelFBX.RotationPivot);
      if (_modelFBX.ScalingOffset)
        translation.add(_modelFBX.ScalingOffset);
      if (_modelFBX.ScalingPivot)
        translation.add(_modelFBX.ScalingPivot);
      mtxTransform.translate(translation);

      if (mtxLocalScaling)
        mtxTransform.multiply(mtxLocalScaling);
      if (_modelFBX.ScalingPivot)
        mtxTransform.translate(Vector3.SCALE(_modelFBX.ScalingPivot, -1));

      const mtxWorldTranslation: Matrix4x4 = parent ?
        Matrix4x4.TRANSLATION(Matrix4x4.MULTIPLICATION(
          parent.mtxWorld,
          Matrix4x4.TRANSLATION(mtxTransform.translation)
        ).translation) :
        Matrix4x4.TRANSLATION(mtxTransform.translation);

      mtxTransform.set(mtxWorldTranslation);
      mtxTransform.multiply(mtxWorldRotationScale);
      _node.mtxWorld.set(mtxTransform);

      if (parent)
        mtxTransform.multiply(Matrix4x4.INVERSION(parent.mtxWorld), true);
      _node.addComponent(new ComponentTransform(mtxTransform));
    }

    private getTransformVector(_vector: Vector3 | FBX.AnimCurveNode, _default: () => Vector3): Vector3 {
      return (
        _vector == undefined ?
          _default() :
          _vector instanceof Vector3 ?
            _vector :
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

    private getAnimationVector3(_animNode: FBX.AnimCurveNode, _target: FBX.Model): AnimationStructureVector3 {
      const vectorSequence: AnimationStructureVector3 = {};
      for (const valueName in _animNode) if (valueName == "dX" || valueName == "dY" || valueName == "dZ") {
        const value: FBX.AnimCurve | number = _animNode[valueName];
        if (typeof value != "number") {
          const sequence: AnimationSequence = new AnimationSequence();
          for (let i: number = 0; i < value.KeyTime.length; ++i) {
            // According to the reference time is defined as a signed int64, unit being 1/46186158000 seconds
            // ref: https://archive.blender.org/wiki/index.php/User:Mont29/Foundation/FBX_File_Structure/#Some_Specific_Property_Types
            sequence.addKey(new AnimationKey(
              Number((value.KeyTime[i] - value.KeyTime.reduce((_min, _v) => _v < _min ? _v : _min)) / BigInt("46186158")),
              value.KeyValueFloat[i]
            ));
          }
          vectorSequence[valueName[1].toLowerCase()] = sequence;
        }
      }

      if (_animNode.name == "R" && (_target.PreRotation || _target.PostRotation)) {
        let preRototation: Matrix4x4;
        if (_target.PreRotation) 
          preRototation = Matrix4x4.ROTATION(_target.PreRotation);
        let postRotation: Matrix4x4;
        if (_target.PostRotation)
          postRotation = Matrix4x4.ROTATION(_target.PostRotation);

        [vectorSequence.x, vectorSequence.y, vectorSequence.z]
          .flatMap(_seq => _seq?.getKeys())
          .map(_key => _key?.time)
          .sort((_timeA, _timeB) => _timeA - _timeB) // sort times
          .filter((_time, _index, _times) => _time != _times[_index + 1]) // remove duplicates
          .map(_time => { // find keys for all axes at time
            return { x: findKey(vectorSequence.x), y: findKey(vectorSequence.y), z: findKey(vectorSequence.z) };
            function findKey(_sequence: AnimationSequence): AnimationKey {
              return _sequence?.getKeys().find(_key => _key.time == _time);
            }
          })
          .forEach(_frame => {
            let vctEulerAngles: Vector3 = Recycler.get(Vector3);
            vctEulerAngles.set(
              _frame.x?.value ?? 0,
              _frame.y?.value ?? 0,
              _frame.z?.value ?? 0
            );
            const mtxRotation: Matrix4x4 = Matrix4x4.ROTATION(vctEulerAngles);
            if (preRototation)
              mtxRotation.multiply(preRototation, true);
            if (postRotation)
              mtxRotation.multiply(postRotation);
            vctEulerAngles = mtxRotation.getEulerAngles();
            if (_frame.x)
              _frame.x.value = vctEulerAngles.x;
            if (_frame.y)
              _frame.y.value = vctEulerAngles.y;
            if (_frame.z)
              _frame.z.value = vctEulerAngles.z;
          });
      }

      return vectorSequence;
    }

    private getOrdered(_rotation: Vector3, _modelFBX: FBX.Model): Vector3 {
      if (!_modelFBX.EulerOrder)
        return _rotation;
      
      const data: Float32Array = _rotation.get();
      const result: Vector3 = Recycler.get(Vector3);
      result.set(
        data[_modelFBX.EulerOrder.indexOf("Z")],
        data[_modelFBX.EulerOrder.indexOf("Y")],
        data[_modelFBX.EulerOrder.indexOf("X")]
      );
      return result;
    }

  }
}