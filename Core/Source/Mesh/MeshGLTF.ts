namespace FudgeCore {

  /**
   * A {@link Mesh} loaded from a glTF-File.
   * @authors Jonas Plotzky, HFU, 2024
   */
  export class MeshGLTF extends mixinSerializableResourceExternal(Mesh) {
    public iPrimitive: number; // most likely will not stay consistent with the glTF file...

    public async load(_url: RequestInfo = this.url, _name: string = this.name, _iPrimitive: number = this.iPrimitive): Promise<MeshGLTF> {
      this.url = _url;
      this.name = _name;
      this.iPrimitive = _iPrimitive;
      return GLTFLoader.loadResource(this);
    }

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      serialization.iPrimitive = this.iPrimitive;
      return serialization;
    }

    public deserialize(_serialization: Serialization): Promise<Serializable> {
      this.iPrimitive = _serialization.iPrimitive;
      return super.deserialize(_serialization);
    }
  }
}