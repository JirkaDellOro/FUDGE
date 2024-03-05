namespace FudgeCore {

  /**
   * A {@link Graph} loaded from a glTF-File.
   * @authors Jonas Plotzky, HFU, 2024
   */
  export class GraphGLTF extends mixinSerializableResourceExternal(Graph) {
    public async load(_url: RequestInfo = this.url, _name: string = this.name): Promise<GraphGLTF> {
      this.url = _url;
      this.name = _name;
      return GLTFLoader.loadResource(this);
    }

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize(true);
      delete serialization.components[ComponentSkeleton.name];
      delete serialization.children;
      return serialization;
    }
  }
}