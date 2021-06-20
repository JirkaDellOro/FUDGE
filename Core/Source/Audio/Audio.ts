namespace FudgeCore {
  /**
   * Extension of AudioBuffer with a load method that creates a buffer in the {@link AudioManager}.default to be used with {@link ComponentAudio}
   * @authors Thomas Dorner, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class Audio extends Mutable implements SerializableResource {
    public name: string = "Audio";
    public idResource: string = undefined;
    public buffer: AudioBuffer = undefined;
    public path: URL = undefined;
    private url: RequestInfo = undefined;
    private ready: boolean = false;

    constructor(_url?: RequestInfo) {
      super();
      if (_url) {
        this.load(_url);
        this.name = _url.toString().split("/").pop();
      }
      Project.register(this);
    }

    get isReady(): boolean {
      return this.ready;
    }

    /**
     * Asynchronously loads the audio (mp3) from the given url
     */
    public async load(_url: RequestInfo): Promise<void> {
      Debug.fudge("AudioLoad", _url);
      this.url = _url;
      this.ready = false;
      this.path = new URL(this.url.toString(), Project.baseURL);
      const response: Response = await window.fetch(this.path.toString());
      const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
      let buffer: AudioBuffer = await AudioManager.default.decodeAudioData(arrayBuffer);
      this.buffer = buffer;
      this.ready = true;
      this.dispatchEvent(new Event(EVENT_AUDIO.READY));
    }

    //#region Transfer
    public serialize(): Serialization {
      return {
        url: this.url,
        idResource: this.idResource,
        name: this.name,
        type: this.type
      };
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      Project.register(this, _serialization.idResource);
      await this.load(_serialization.url);
      this.name = _serialization.name;
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      let url: string = _mutator.url; // save url for reconstruction after exclusion
      if (_mutator.url != this.url.toString())
        this.load(_mutator.url);
      // except url from mutator for further processing
      delete(_mutator.url);
      super.mutate(_mutator);
      // reconstruct, for mutator may be kept by caller
      _mutator.url = url;
    }

    protected reduceMutator(_mutator: Mutator): void {
      // delete _mutator.idResource; 
      delete _mutator.ready;
    }
    //#endregion
  }
}