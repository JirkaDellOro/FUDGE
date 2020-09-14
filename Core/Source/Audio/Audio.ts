namespace FudgeCore {
  /**
   * Extension of AudioBuffer with a load method that creates a buffer in the [[AudioManager]].default to be used with [[ComponentAudio]]
   * @authors Thomas Dorner, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class Audio implements SerializableResource {
    public idResource: string = undefined;
    public buffer: AudioBuffer = undefined;
    private url: string = undefined;

    constructor(_url?: string) {
      if (_url)
        this.asyncLoad(_url);
      ResourceManager.register(this);
    }

    /**
     * Asynchronously loads the audio (mp3) from the given url
     */
    public async load(_url: string): Promise<void> {
      this.url = _url;
      const response: Response = await window.fetch(this.url);
      const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
      let buffer: AudioBuffer = await AudioManager.default.decodeAudioData(arrayBuffer);
      this.buffer = buffer;
    }

    public async asyncLoad(_url: string): Promise<void> {
      await this.load(_url);
    }

    //#region Transfer
    public serialize(): Serialization {
      return { url: this.url };
    }
    public deserialize(_serialization: Serialization): Serializable {
      this.asyncLoad(_serialization.url);
      return this;
    }
    //#endregion
  }
}