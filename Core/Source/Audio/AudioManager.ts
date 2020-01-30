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
        this.branch.broadcastEvent(new Event(EVENT.CHILD_REMOVE_FROM_AUDIO_BRANCH));
      if (!_branch)
        return;
      this.branch = _branch;
      this.branch.broadcastEvent(new Event(EVENT.CHILD_APPEND_TO_AUDIO_BRANCH));
    }

    public getBranchListeningTo = (): Node => {
      return this.branch;
    }
  }
}