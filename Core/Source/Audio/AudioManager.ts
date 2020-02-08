namespace FudgeCore {
  /**
   * Extends the standard AudioContext for integration with [[Node]]-branches
   */
  export class AudioManager extends AudioContext {
    /** The default context that may be used throughout the project without the need to create others */
    public static readonly default: AudioManager = new AudioManager({ latencyHint: "interactive", sampleRate: 44100 });
    /** The master volume all AudioNodes in the context should attach to */
    public readonly gain: GainNode;
    private branch: Node = null;
    private cmpListener: ComponentAudioListener = null;

    constructor(contextOptions?: AudioContextOptions) {
      super(contextOptions);
      this.gain = this.createGain();
      this.gain.connect(this.destination);
    }

    public set volume(_value: number) {
      this.gain.gain.value = _value;
    }

    public get volume(): number {
      return this.gain.gain.value;
    }

    /**
     * Determines branch to listen to. Each [[ComponentAudio]] in the branch will connect to this contexts master gain, all others disconnect.
     */
    public listenTo = (_branch: Node | null): void => {
      if (this.branch)
        this.branch.broadcastEvent(new Event(EVENT_AUDIO.CHILD_REMOVE));
      if (!_branch)
        return;
      this.branch = _branch;
      this.branch.broadcastEvent(new Event(EVENT_AUDIO.CHILD_APPEND));
    }

    /**
     * Retrieve the branch currently listening to
     */
    public getBranchListeningTo = (): Node => {
      return this.branch;
    }

    /**
     * Set the [[ComponentAudioListener]] that serves the spatial location and orientation for this contexts listener
     */
    public listen = (_cmpListener: ComponentAudioListener | null): void => {
      this.cmpListener = _cmpListener;
    }

    /**
     * Updates the spatial settings of the AudioNodes effected in the current branch
     */
    public update = (): void => {
      this.branch.broadcastEvent(new Event(EVENT_AUDIO.UPDATE));
      if (this.cmpListener)
        this.cmpListener.update(this.listener);
    }
  }
}