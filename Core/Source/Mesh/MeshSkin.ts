///<reference path="./../Render/RenderInjectorMeshSkin.ts"/>
namespace FudgeCore {
  @RenderInjectorMeshSkin.decorate
  export class MeshSkin extends MeshGLTF {
    
    public static readonly vectorizedJointMatrixLength: number = 16;

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

    public useRenderBuffers(_shader: typeof Shader, _mtxWorld: Matrix4x4, _mtxProjection: Matrix4x4, _id?: number, _mtxBones?: Iterable<number>): void {/* injected by RenderInjector*/ }

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