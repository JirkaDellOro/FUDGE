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
      Reflect.set(this.renderMesh, "ƒiBones", await _loader.getUint8Array(gltfMesh.primitives[0].attributes.JOINTS_0));
      Reflect.set(this.renderMesh, "ƒweights", await _loader.getFloat32Array(gltfMesh.primitives[0].attributes.WEIGHTS_0));
      this.createBones();
      return this;
    }

    public useRenderBuffers(_shader: ShaderInterface, _mtxWorld: Matrix4x4, _mtxProjection: Matrix4x4, _id?: number, _mtxBones?: Matrix4x4[]): RenderBuffers { return null; /* injected by RenderInjector*/ }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
    }

    private createBones(): void {
      for (let iVertex: number = 0, iBoneEntry: number = 0; iVertex < this.vertices.length; iVertex++) {
        this.vertices[iVertex].bones = [];
        for (let i: number = 0; i < 4; i++, iBoneEntry++) {
          this.vertices[iVertex].bones.push({
            index: this.renderMesh.iBones[iBoneEntry],
            weight: this.renderMesh.weights[iBoneEntry]
          });
        }
      }
    }
  }
}