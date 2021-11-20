///<reference path="./../Render/RenderInjectorMeshSkin.ts"/>
namespace FudgeCore {
  @RenderInjectorMeshSkin.decorate
  export class MeshSkin extends MeshGLTF {
    
    public static readonly vectorizedJointMatrixLength: number = 16;

    public readonly skeleton: SkeletonInstance = new SkeletonInstance();

    protected ƒiBones: Uint8Array;
    protected ƒweights: Float32Array;
    protected ƒmtxBones: Float32Array;

    protected createJoints: () => Uint8Array;
    protected createWeights: () => Float32Array;

    /**
     * Creates a new mesh-skin with an optional name
     */
    constructor(_gltfMesh?: GLTF.Mesh, _loader?: GLTFLoader) {
      super(_gltfMesh, _loader);

      this.ƒiBones = _loader?.getUint8Array(_gltfMesh.primitives[0].attributes.JOINTS_0);
      this.ƒweights = _loader?.getFloat32Array(_gltfMesh.primitives[0].attributes.WEIGHTS_0);
    }

    public get iBones(): Uint8Array {
      if (this.ƒiBones == null)
        this.ƒiBones = this.createJoints?.call(this);
      
      return this.ƒiBones;
    }

    public get weights(): Float32Array {
      if (this.ƒweights == null)
        this.ƒweights = this.createWeights?.call(this);

      return this.ƒweights;
    }

    public get mtxBones(): Float32Array {
      // get bone matrices and concatenate them to one Float32Array
      this.ƒmtxBones = Float32Array.from(
        this.skeleton.mtxBones.flatMap(mtxBone => Array.from(mtxBone.get()))
      );

      return this.ƒmtxBones;
    }

    /**
     * Calculates the position of a vertex transformed by the skeleton
     * @param _index index of the vertex
     */
    public getVertexPosition(_index: number): Vector3 {
      // extract the vertex data (vertices: 3D vectors, bone indices & weights: 4D vectors)
      const vertex: Vector3 = new Vector3(...this.vertices.slice(_index * 3, _index * 3 + 3));
      const iBones: Uint8Array = this.iBones.slice(_index * 4, _index * 4 + 4);
      const weights: Float32Array = this.weights.slice(_index * 4, _index * 4 + 4);

      // get bone matrices
      const mtxBones: Array<Matrix4x4> = this.skeleton.mtxBones;

      // skin matrix S = sum_i=1^m{w_i * B_i}
      const skinMatrix: Matrix4x4 = new Matrix4x4();
      skinMatrix.set(Array
        .from(iBones)
        .map((iJoint, iWeight) => mtxBones[iJoint].get().map(value => value * weights[iWeight])) // apply weight on each matrix
        .reduce((mtxBoneA, mtxBoneB) => mtxBoneA.map((value, index) => value + mtxBoneB[index])) // sum up the matrices
      );

      // transform vertex
      vertex.transform(skinMatrix);

      return vertex;
    }

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      return this;
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);

      delete _mutator.ƒbones;
      delete _mutator.ƒweights;
      delete _mutator.ƒboneMatrices;
    }
    
  }
}