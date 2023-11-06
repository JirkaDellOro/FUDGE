namespace FudgeCore {
  /**
   * Mesh loaded from a file
   * @author Matthias Roming, HFU, 2022-2023
   */
  export class MeshImport extends Mesh {
    public url: RequestInfo;
    private loader: typeof MeshLoader;

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      serialization.url = this.url.toString();
      serialization.filetype = this.loader.name.replace(MeshLoader.name, "");
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      this.url = _serialization.url;
      this.loader = Reflect.get(FudgeCore, MeshLoader.name.concat(_serialization.filetype));
      return this.load();
    }

    /**
     * Load mesh from file
     */
    public async load(_loader: typeof MeshLoader = this.loader, _url: RequestInfo = this.url, _data?: Object): Promise<MeshImport> {
      this.url = _url;
      this.loader = _loader;
      this.clear();
      if (!this.renderMesh)
        this.renderMesh = new RenderMesh(this);
      return _loader.load(this, _data);
    }

    public async mutate(_mutator: Mutator, _selection: string[] = null, _dispatchMutate: boolean = true): Promise<void> {
      super.mutate(_mutator, _selection, _dispatchMutate);
      if (typeof (_mutator.url) !== "undefined")
        this.load(this.loader, _mutator.url);
    }

  }
}