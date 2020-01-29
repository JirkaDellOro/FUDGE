namespace FudgeCore {
  /**
   * @authors Thomas Dorner, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class Audio extends AudioBuffer {
    // constructor(_url: string, _options: AudioBufferOptions) {
    //   super(_options);
    //   return await Audio.load(_url);
    // return this;

    public static async load(_url: string): Promise<Audio> {
      const response: Response = await window.fetch(_url);
      const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
      return <Audio>(await AudioManager.default.decodeAudioData(arrayBuffer));
    }
  }
}