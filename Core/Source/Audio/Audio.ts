namespace FudgeCore {
  /**
   * Extension of AudioBuffer with a load method that creates a buffer in the [[AudioManager]].default to be used with [[ComponentAudio]]
   * @authors Thomas Dorner, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class Audio extends EventTarget implements SerializableResource {
    public idResource: string = undefined;
    public buffer: AudioBuffer = undefined;
    private url: RequestInfo = undefined;
    private ready: boolean = false;

    constructor(_url?: RequestInfo) {
      super();
      if (_url)
        this.load(_url);
      ResourceManager.register(this);
    }

    get isReady(): boolean {
      return this.ready;
    }

    /**
     * Asynchronously loads the audio (mp3) from the given url
     */
    public async load(_url: RequestInfo): Promise<void> {
      this.url = _url;
      this.ready = false;
      const response: Response = await window.fetch(this.url);
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
        idResource: this.idResource
      };
    }
    public deserialize(_serialization: Serialization): Serializable {
      ResourceManager.register(this, _serialization.idResource);
      this.load(_serialization.url);
      return this;
    }
    //#endregion
  }
}