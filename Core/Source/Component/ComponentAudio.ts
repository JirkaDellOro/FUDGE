namespace FudgeCore {
  export enum AUDIO_PANNER {
    CONE_INNERANGLE = "coneInnerAngle",
    CONE_OUTERANGLE = "coneOuterAngle",
    CONE_OUTERGAIN = "coneOuterGain",
    DISTANCE_MODEL = "distanceModel",
    MAX_DISTANCE = "maxDistance",
    PANNING_MODEL = "panningModel",
    REF_DISTANCE = "refDistance",
    ROLL_OFFFACTOR = "rolloffFactor"
  }

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
    private connected: boolean = false;
    // solely for testing component standalone. Determine at runtime
    // private attached: boolean = false;
    private listened: boolean = false;

    constructor(_audio: Audio = null, _loop: boolean = false, _start: boolean = false) {
      super();
      this.install();
      this.createSource(_audio, _loop);

      this.addEventListener(EVENT.COMPONENT_ADD, this.handleAttach);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.handleAttach);

      if (_start)
        this.play(_start);
    }

    public set audio(_audio: Audio) {
      this.source.buffer = _audio;
    }

    public get audio(): Audio {
      return <Audio>this.source.buffer;
    }

    public setPanner(_prop: AUDIO_PANNER, _value: number): void {
      Object.assign(this.panner, { [_prop]: _value });
      // this.panner.coneOuterAngle = _value;
    }

    public play(_on: boolean): void {
      if (_on) {
        this.createSource(this.audio, this.source.loop);
        this.source.start(0, 0);
      }
      else
        this.source.stop();
      this.playing = _on;
    }

    // public reset(): void {
    //   this.source.re
    // }

    public get isPlaying(): boolean {
      return this.playing;
    }
    public get isConnected(): boolean {
      return this.connected;
    }
    public get isAttached(): boolean {
      return this.getContainer() != null;
    }
    public get isListened(): boolean {
      return this.listened;
    }

    // public get isConnected(): boolean {
    //   return this.connected;
    // }

    /**
     * Activate override. Connects or disconnects AudioNodes
     */
    public activate(_on: boolean): void {
      super.activate(_on);
      this.updateConnection();
    }

    public install(_audioManager: AudioManager = AudioManager.default): void {
      let active: boolean = this.isActive;
      this.activate(false);
      this.audioManager = _audioManager;
      this.panner = _audioManager.createPanner();
      this.gain = _audioManager.createGain();
      this.panner.connect(this.gain);
      this.gain.connect(_audioManager.gain);
      this.activate(active);
    }

    public createSource(_audio: Audio, _loop: boolean): void {
      this.source = this.audioManager.createBufferSource();
      this.source.connect(this.panner);

      if (_audio)
        this.audio = _audio;
      this.source.loop = _loop;
    }

    public connect(_on: boolean): void {
      if (_on)
        this.gain.connect(this.audioManager.gain);
      else
        this.gain.disconnect(this.audioManager.gain);
    }

    private updateConnection(): void {
      try {
        this.connect(this.isActive && this.isAttached && this.listened);
      } catch (_error) {
        // nop
      }
    }

    /** 
     * Automatically connects/disconnects AudioNodes when adding/removing this component to/from a node. 
     * Therefore unused AudioNodes may be garbage collected when an unused component is collected
     */
    private handleAttach = (_event: Event): void => {
      // Debug.log(_event);
      if (_event.type == EVENT.COMPONENT_ADD) {
        this.getContainer().addEventListener(EVENT_AUDIO.CHILD_APPEND, this.handleBranch, true);
        this.getContainer().addEventListener(EVENT_AUDIO.CHILD_REMOVE, this.handleBranch, true);
        this.getContainer().addEventListener(EVENT_AUDIO.UPDATE, this.update, true);
        this.listened = this.getContainer().isDescendantOf(AudioManager.default.getBranchListeningTo());
      }
      else {
        this.getContainer().removeEventListener(EVENT_AUDIO.CHILD_APPEND, this.handleBranch, true);
        this.getContainer().removeEventListener(EVENT_AUDIO.CHILD_REMOVE, this.handleBranch, true);
        this.getContainer().removeEventListener(EVENT_AUDIO.UPDATE, this.update, true);
        this.listened = false;
      }
      this.updateConnection();
    }

    /** 
     * Automatically connects/disconnects AudioNodes when appending/removing the branch the component is in. 
     */
    private handleBranch = (_event: Event): void => {
      // Debug.log(_event);
      this.listened = (_event.type == EVENT_AUDIO.CHILD_APPEND);
      this.updateConnection();
    }

    /** 
     * Updates the panner node, its position and direction, using the worldmatrix of the container and the pivot of this component. 
     */
    private update = (_event: Event): void => {
      let mtxResult: Matrix4x4 = this.pivot;
      if (this.getContainer())
        mtxResult = Matrix4x4.MULTIPLICATION(this.getContainer().mtxWorld, this.pivot);

      // Debug.log(mtxResult.toString());
      let position: Vector3 = mtxResult.translation;
      let forward: Vector3 = Vector3.TRANSFORMATION(Vector3.Z(1), mtxResult, false);

      this.panner.positionX.value = position.x;
      this.panner.positionY.value = position.y;
      this.panner.positionZ.value = position.z;

      this.panner.orientationX.value = forward.x;
      this.panner.orientationY.value = forward.y;
      this.panner.orientationZ.value = forward.z;
    }
  }
}