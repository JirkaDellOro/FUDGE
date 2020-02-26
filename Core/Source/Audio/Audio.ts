namespace FudgeCore {
  /**
   * Extension of AudioBuffer with a load method that creates a buffer in the [[AudioManager]].default to be used with [[ComponentAudio]]
   * @authors Thomas Dorner, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2020
   */
  export class Audio extends AudioBuffer {
    /**
     * Asynchronously loads the audio (mp3) from the given url
     */
    public static async load(_url: string): Promise<Audio> {
      const response: Response = await window.fetch(_url);
      const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
      return <Audio>(await AudioManager.default.decodeAudioData(arrayBuffer));
    }
  }
}