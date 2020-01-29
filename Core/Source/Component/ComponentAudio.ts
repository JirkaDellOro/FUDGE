namespace FudgeCore {
  /**
   * Attaches a [[ComponentAudio]] to a [[Node]].
   * Only a single [[Audio]] can be used within a single [[ComponentAudio]]
   * @authors Thomas Dorner, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class ComponentAudio extends Component {
    public pivot: Matrix4x4 = Matrix4x4.IDENTITY;
    public gain: GainNode;

    protected singleton: boolean = false;
    private panner: PannerNode;
    private source: AudioBufferSourceNode;
    private audioManager: AudioManager;
    private playing: boolean = false;

    constructor(_audio?: Audio) {
      super();
      this.install();
      if (_audio)
        this.audio = _audio;

      this.addEventListener(EVENT.COMPONENT_ADD, this.handleAttach);
    }

    public set audio(_audio: Audio) {
      this.source.buffer = _audio;
    }

    public get audio(): Audio {
      return <Audio>this.source.buffer;
    }

    public play(_on: boolean): void {
      if (_on)
        this.source.start();
      else
        this.source.stop();
      this.playing = _on;
    }

    public get isPlaying(): boolean {
      return this.playing;
    }

    /**
     * Activate override. Connects or disconnects AudioNodes
     */
    public activate(_on: boolean): void {
      super.activate(_on);
      if (_on)
        this.gain.connect(this.audioManager.gain);
      else
        if (this.gain)
          this.gain.disconnect(this.audioManager.gain);
    }

    public install(_audioManager: AudioManager = AudioManager.default): void {
      let active: boolean = this.isActive;
      this.activate(false);
      this.audioManager = _audioManager;
      this.source = _audioManager.createBufferSource();
      this.panner = _audioManager.createPanner();
      this.gain = _audioManager.createGain();
      this.source.connect(this.panner);
      this.panner.connect(this.gain);
      this.gain.connect(_audioManager.gain);
      this.activate(active);
    }

    /** 
     * Automatically connects/disconnects AudioNodes when adding/removing this component to/from a node. 
     * Therefore unused AudioNodes may be garbage collected when an unused component is collected
     */
    private handleAttach = (_event: Event): void => {
      if (_event.type == EVENT.COMPONENT_REMOVE)
        this.activate(false);
      else
        this.activate(true);
    }
  }
}