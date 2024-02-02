namespace FudgeCore {
  /**
   * Mesh loaded from a file
   * @authors Matthias Roming, HFU, 2022-2023 | Jonas Plotzky, HFU, 2024
   */
  export abstract class MeshImport extends Mesh {
    public url: RequestInfo;

    public serialize(): Serialization {
      const serialization: Serialization = super.serialize();
      serialization.url = this.url.toString();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      this.url = _serialization.url;
      return this.load();
    }

    public async load(_url: RequestInfo = this.url): Promise<MeshImport> {
      this.clear();
      this.url = _url;
      if (!this.ƒrenderMesh)
        this.ƒrenderMesh = new RenderMesh(this); // TODO: maybe create this with an lazy getter?
      return this;
    }

    public async mutate(_mutator: Mutator, _selection: string[] = null, _dispatchMutate: boolean = true): Promise<void> {
      super.mutate(_mutator, _selection, _dispatchMutate);
      if (typeof (_mutator.url) !== "undefined")
        this.load(_mutator.url);
    }
  }
}