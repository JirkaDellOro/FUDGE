///<reference path="./../Render/RenderInjectorMeshSkin.ts"/>
///<reference path="./MeshImport.ts"/>
namespace FudgeCore {
  /**
   * Mesh influenced by a skeleton and loaded from a file
   * @authors Matthias Roming, HFU, 2022-2023 | Jonas Plotzky, HFU, 2023
   */
  @RenderInjectorMeshSkin.decorate
  export class MeshSkin extends MeshImport {
    // Subclass used for skinning
  }
}