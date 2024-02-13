namespace FudgeCore {

  /**
   * A {@link Material} loaded from a glTF-File.
   * @authors Jonas Plotzky, HFU, 2024
   */
  export class MaterialGLTF extends mixinSerializableResourceExternal(Material) {
    public async load(_url: RequestInfo = this.url, _name: string = this.name): Promise<MaterialGLTF> {
      this.url = _url;
      this.name = _name;
      return GLTFLoader.loadResource(this);
    }
  }
}