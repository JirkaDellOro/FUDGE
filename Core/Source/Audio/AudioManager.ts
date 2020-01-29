namespace FudgeCore {
  export class AudioManager extends AudioContext {
    public static readonly default: AudioManager = new AudioManager({ latencyHint: "interactive", sampleRate: 44100 });
    public readonly gain: AudioNode;

    constructor(contextOptions?: AudioContextOptions) {
      super(contextOptions);
      this.gain = this.createGain();
      this.gain.connect(this.destination);
    }
  }
}