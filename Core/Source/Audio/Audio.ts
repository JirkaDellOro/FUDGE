namespace FudgeCore {
  /**
   * Describes the [[Audio]] class in which all Audio Data is stored.
   * Audio will be given to the [[ComponentAudio]] for further usage.
   * @authors Thomas Dorner, HFU, 2019
   */
  export class Audio {

    public url: string;

    public audioBuffer: AudioBuffer;
    public bufferSource: AudioBufferSourceNode;
    private localGain: GainNode;

    private isLooping: boolean;

    /**
     * Constructor for the [[Audio]] Class
     * @param _audioContext from [[AudioSettings]]
     * @param _gainValue 0 for muted | 1 for max volume
     */
    constructor(_audioSettings: AudioSettings, _url: string, _gainValue: number, _loop: boolean) {
      this.init(_audioSettings, _url, _gainValue, _loop);
    }

    public async init(_audioSettings: AudioSettings, _url: string, _volume: number, _loop: boolean): Promise<void> {
      this.url = _url;
      // Get AudioBuffer
      const promiseBuffer: Promise<AudioBuffer> = _audioSettings.getAudioSession().urlToBuffer(_audioSettings.getAudioContext(), _url);
      while (!promiseBuffer) {
        console.log("Waiting for Promise..");
      }
      await promiseBuffer.then(val => {
        this.audioBuffer = val;
      });

      this.localGain = _audioSettings.getAudioContext().createGain();
      this.volume = _volume;
      this.createAudio(_audioSettings, this.audioBuffer);
      this.isLooping = _loop;
    }

    public initBufferSource(_audioSettings: AudioSettings): void {
      this.bufferSource = _audioSettings.getAudioContext().createBufferSource();
      this.bufferSource.buffer = this.audioBuffer;
      this.beginLoop();
      this.bufferSource.connect(this.localGain);
    }

    public connect(_audioNode: AudioNode): void {
      this.localGain.connect(_audioNode);
    }

    public set volume(_volume: number) {
      this.localGain.gain.value = _volume;
    }

    public get volume(): number {
      return this.localGain.gain.value;
    }

    public setLooping(_isLooping: boolean): void {
      this.isLooping = _isLooping;
    }

    public getLooping(): boolean {
      return this.isLooping;
    }

    public setBufferSource(_buffer: AudioBuffer): void {
      this.audioBuffer = _buffer;
      this.bufferSource.buffer = _buffer;
    }

    public getBufferSource(): AudioBuffer {
      return this.audioBuffer;
    }

    /**
     * createAudio builds an [[Audio]] to use with the [[ComponentAudio]]
     * @param _audioContext from [[AudioSettings]]
     * @param _audioBuffer from [[AudioSessionData]]
     */
    private createAudio(_audioSettings: AudioSettings, _audioBuffer: AudioBuffer): AudioBuffer {
      this.audioBuffer = _audioBuffer;
      this.initBufferSource(_audioSettings);
      return this.audioBuffer;
    }

    private beginLoop(): void {
      this.bufferSource.loop = this.isLooping;
    }
  }
}