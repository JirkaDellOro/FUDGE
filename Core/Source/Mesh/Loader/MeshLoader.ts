namespace FudgeCore {
  /**
   * Base class for MeshImport-loaders
   * @author Matthias Roming, HFU, 2023
   */
  export abstract class MeshLoader {
    public static async load(_mesh: MeshImport | MeshSkin, _data?: Object): Promise<MeshImport> {
      return _mesh;
    }
  }
}