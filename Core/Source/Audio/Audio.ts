namespace FudgeCore {
  /**
   * @authors Thomas Dorner, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class Audio extends AudioBuffer {
    public static async load(_url: string): Promise<Audio> {
      const response: Response = await window.fetch(_url);
      const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
      return <Audio>(await AudioManager.default.decodeAudioData(arrayBuffer));
    }
  }
}