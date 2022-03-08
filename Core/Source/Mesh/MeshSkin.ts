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

    public async load(_loader: GLTFLoader, _iMesh: number): Promise<MeshSkin> {
      await super.load(_loader, _iMesh);
      const gltfMesh: GLTF.Mesh = _loader.gltf.meshes[_iMesh];
      this.ƒiBones = await _loader.getUint8Array(gltfMesh.primitives[0].attributes.JOINTS_0);
      this.ƒweights = await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.WEIGHTS_0);
      return this;
    }

    public useRenderBuffers(_shader: typeof Shader, _mtxWorld: Matrix4x4, _mtxProjection: Matrix4x4, _id?: number, _mtxBones?: Matrix4x4[]): RenderBuffers { return null; /* injected by RenderInjector*/ }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);

      delete _mutator.ƒbones;
      delete _mutator.ƒweights;
      delete _mutator.ƒboneMatrices;
    }
    
  }
}