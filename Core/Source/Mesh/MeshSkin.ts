///<reference path="./../Render/RenderInjectorMeshSkin.ts"/>
namespace FudgeCore {
  /**
   * Mesh influenced by a skeleton
   * @author Matthias Roming, HFU, 2022
   */
  @RenderInjectorMeshSkin.decorate
  export class MeshSkin extends MeshGLTF {

    public async load(_loader: GLTFLoader, _iMesh: number): Promise<MeshSkin> {
      await super.load(_loader, _iMesh);
      const gltfMesh: GLTF.Mesh = _loader.gltf.meshes[_iMesh];
      this.renderMesh = new RenderMesh(this);
      Reflect.set(this.renderMesh, "ƒiBones", await _loader.getUint8Array(gltfMesh.primitives[0].attributes.JOINTS_0));
      Reflect.set(this.renderMesh, "ƒweights", await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.WEIGHTS_0));
      return this;
    }

    public useRenderBuffers(_shader: typeof Shader, _mtxWorld: Matrix4x4, _mtxProjection: Matrix4x4, _id?: number, _mtxBones?: Matrix4x4[]): RenderBuffers { return null; /* injected by RenderInjector*/ }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
    }
  }
}