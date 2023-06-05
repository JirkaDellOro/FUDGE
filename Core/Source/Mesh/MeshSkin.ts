///<reference path="./../Render/RenderInjectorMeshSkin.ts"/>
///<reference path="./MeshImport.ts"/>
namespace FudgeCore {
  /**
   * Mesh influenced by a skeleton and loaded from a file
   * @author Matthias Roming, HFU, 2022-2023
   */
  @RenderInjectorMeshSkin.decorate
  export class MeshSkin extends MeshImport {
    public useRenderBuffers(_shader: ShaderInterface, _mtxWorld: Matrix4x4, _mtxProjection: Matrix4x4, _id?: number, _mtxBones?: Matrix4x4[]): RenderBuffers { return null; /* injected by RenderInjector*/ }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
    }
  }
}