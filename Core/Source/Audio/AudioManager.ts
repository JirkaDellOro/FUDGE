namespace FudgeCore {
  /**
   * Extends the standard AudioContext for integration with FUDGE-graphs.
   * Creates a default object at startup to be addressed as AudioManager default.
   * Other objects of this class may be create for special purposes.
   */
  export class AudioManager extends AudioContext {
    /** The default context that may be used throughout the project without the need to create others */
    public static readonly default: AudioManager = new AudioManager({ latencyHint: "interactive", sampleRate: 44100 });
    /** The master volume all AudioNodes in the context should attach to */
    public readonly gain: GainNode;
    private graph: Node = null;
    private cmpListener: ComponentAudioListener = null;

    constructor(contextOptions?: AudioContextOptions) {
      super(contextOptions);
      this.gain = this.createGain();
      this.gain.connect(this.destination);
    }

    /**
     * Set the master volume
     */
    public set volume(_value: number) {
      this.gain.gain.value = _value;
    }

    /**
     * Get the master volume
     */
    public get volume(): number {
      return this.gain.gain.value;
    }

    /**
     * Determines FUDGE-graph to listen to. Each {@link ComponentAudio} in the graph will connect to this contexts master gain, all others disconnect.
     */
    public listenTo = (_graph: Node | null): void => {
      if (this.graph)
        this.graph.broadcastEvent(new Event(EVENT_AUDIO.CHILD_REMOVE));
      if (!_graph)
        return;
      this.graph = _graph;
      this.graph.broadcastEvent(new Event(EVENT_AUDIO.CHILD_APPEND));
    }

    /**
     * Retrieve the FUDGE-graph currently listening to
     */
    public getGraphListeningTo = (): Node => {
      return this.graph;
    }

    /**
     * Set the {@link ComponentAudioListener} that serves the spatial location and orientation for this contexts listener
     */
    public listenWith = (_cmpListener: ComponentAudioListener | null): void => {
      this.cmpListener = _cmpListener;
    }

    /**
     * Updates the spatial settings of the AudioNodes effected in the current FUDGE-graph
     */
    public update = (): void => {
      this.graph.broadcastEvent(new Event(EVENT_AUDIO.UPDATE));
      if (this.cmpListener)
        this.cmpListener.update(this.listener);
    }
  }
}