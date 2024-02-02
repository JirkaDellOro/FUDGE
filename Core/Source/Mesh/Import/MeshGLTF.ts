///<reference path="./MeshImport.ts"/>
namespace FudgeCore {

  /**
   * gl Transfer Format mesh import
   * @authors Matthias Roming, HFU, 2022-2023 | Jonas Plotzky, HFU, 2023
   */
  export class MeshGLTF extends MeshImport {
    public iMesh: number;
    public iPrimitive: number;

    public async load(_url: RequestInfo = this.url, _iMesh: number = this.iMesh, _iPrimitive: number = this.iPrimitive): Promise<MeshGLTF> {
      super.load(_url);
      this.iMesh = _iMesh;
      this.iPrimitive = _iPrimitive;
      const loader: GLTFLoader = await GLTFLoader.LOAD(_url.toString());
      return await loader.loadMesh(_iMesh, _iPrimitive, this);
    }

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      serialization.iMesh = this.iMesh;
      serialization.iPrimitive = this.iPrimitive;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.iMesh = _serialization.iMesh;
      this.iPrimitive = _serialization.iPrimitive;
      return super.deserialize(_serialization);
    }
  }
}