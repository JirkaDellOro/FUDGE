namespace FudgeCore {
  export class AudioManager extends AudioContext {
    public static readonly default: AudioManager = new AudioManager({ latencyHint: "interactive", sampleRate: 44100 });
    public readonly gain: AudioNode;
    private branch: Node;

    constructor(contextOptions?: AudioContextOptions) {
      super(contextOptions);
      this.gain = this.createGain();
      this.gain.connect(this.destination);
    }

    public listenTo = (_branch: Node | null): void => {
      if (this.branch)
        this.branch.broadcastEvent(new Event(EVENT_AUDIO.CHILD_REMOVE));
      if (!_branch)
        return;
      this.branch = _branch;
      this.branch.broadcastEvent(new Event(EVENT_AUDIO.CHILD_APPEND));
    }

    public getBranchListeningTo = (): Node => {
      return this.branch;
    }

    public update = (): void => {
      this.branch.broadcastEvent(new Event(EVENT_AUDIO.UPDATE_PANNER));
    }
  }
}