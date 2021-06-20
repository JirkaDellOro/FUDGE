namespace FudgeCore {
  export enum AUDIO_PANNER {
    CONE_INNER_ANGLE = "coneInnerAngle",
    CONE_OUTER_ANGLE = "coneOuterAngle",
    CONE_OUTER_GAIN = "coneOuterGain",
    DISTANCE_MODEL = "distanceModel",
    MAX_DISTANCE = "maxDistance",
    PANNING_MODEL = "panningModel",
    REF_DISTANCE = "refDistance",
    ROLLOFF_FACTOR = "rolloffFactor"
  }

  export enum AUDIO_NODE_TYPE {
    SOURCE, PANNER, GAIN
  }

  /**
   * Builds a minimal audio graph (by default in {@link AudioManager}.default) and synchronizes it with the containing {@link Node}
   * ```plaintext
   * ┌ AudioManager(.default) ────────────────────────┐
   * │ ┌ ComponentAudio ───────────────────┐          │
   * │ │    ┌──────┐   ┌──────┐   ┌──────┐ │ ┌──────┐ │  
   * │ │    │source│ → │panner│ → │ gain │ → │ gain │ │
   * │ │    └──────┘   └──────┘   └──────┘ │ └──────┘ │  
   * │ └───────────────────────────────────┘          │
   * └────────────────────────────────────────────────┘
   * ```
   * @authors Thomas Dorner, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class ComponentAudio extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentAudio);
    /** places and directs the panner relative to the world transform of the {@link Node}  */
    public mtxPivot: Matrix4x4 = Matrix4x4.IDENTITY();

    protected singleton: boolean = false;

    private audio: Audio;
    private gain: GainNode;
    private panner: PannerNode;
    private source: AudioBufferSourceNode;
    private audioManager: AudioManager;
    private playing: boolean = false;
    private listened: boolean = false;

    constructor(_audio: Audio = null, _loop: boolean = false, _start: boolean = false, _audioManager: AudioManager = AudioManager.default) {
      super();
      this.install(_audioManager);
      this.createSource(_audio, _loop);

      this.addEventListener(EVENT.COMPONENT_ADD, this.handleAttach);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.handleAttach);

      if (_start)
        this.play(_start);
    }


    public set volume(_value: number) {
      this.gain.gain.value = _value;
    }

    public get volume(): number {
      return this.gain.gain.value;
    }

    public get isPlaying(): boolean {
      return this.playing;
    }
    public get isAttached(): boolean {
      return this.getContainer() != null;
    }
    public get isListened(): boolean {
      return this.listened;
    }

    public setAudio(_audio: Audio): void {
      this.createSource(_audio, this.source.loop);
    }

    /**
     * Set the property of the panner to the given value. Use to manipulate range and rolloff etc.
     */
    public setPanner(_property: AUDIO_PANNER, _value: number): void {
      Object.assign(this.panner, { [_property]: _value });
    }

    // TODO: may be used for serialization of AudioNodes
    public getMutatorOfNode(_type: AUDIO_NODE_TYPE): Mutator {
      let node: AudioNode = this.getAudioNode(_type);
      let mutator: Mutator = getMutatorOfArbitrary(node);
      return mutator;
    }

    /**
     * Returns the specified AudioNode of the standard graph for further manipulation
     */
    public getAudioNode(_type: AUDIO_NODE_TYPE): AudioNode {
      switch (_type) {
        case AUDIO_NODE_TYPE.SOURCE: return this.source;
        case AUDIO_NODE_TYPE.PANNER: return this.panner;
        case AUDIO_NODE_TYPE.GAIN: return this.gain;
      }
    }

    /**
     * Start or stop playing the audio
     */
    public play(_on: boolean): void {
      if (_on) {
        if (this.audio.isReady) {
          this.createSource(this.audio, this.source.loop);
          this.source.start(0, 0);
        }
        else {
          this.audio.addEventListener(EVENT_AUDIO.READY, this.hndAudioReady);
        }
        this.source.addEventListener(EVENT_AUDIO.ENDED, this.hndAudioEnded);
      }
      else
        try {
          this.source.stop();
        } catch (_error: unknown) { /* catch exception when source hasn't been started... */ }
      this.playing = _on;
    }

    /**
     * Inserts AudioNodes between the panner and the local gain of this {@link ComponentAudio}
     * _input and _output may be the same AudioNode, if there is only one to insert,
     * or may have multiple AudioNode between them to create an effect-graph.\
     * Note that {@link ComponentAudio} does not keep track of inserted AudioNodes!
     * ```plaintext
     * ┌ AudioManager(.default) ──────────────────────────────────────────────────────┐
     * │ ┌ ComponentAudio ─────────────────────────────────────────────────┐          │
     * │ │    ┌──────┐   ┌──────┐   ┌──────┐          ┌───────┐   ┌──────┐ │ ┌──────┐ │  
     * │ │    │source│ → │panner│ → │_input│ → ...  → │_output│ → │ gain │ → │ gain │ │
     * │ │    └──────┘   └──────┘   └──────┘          └───────┘   └──────┘ │ └──────┘ │  
     * │ └─────────────────────────────────────────────────────────────────┘          │
     * └──────────────────────────────────────────────────────────────────────────────┘
     * ```
     */
    public insertAudioNodes(_input: AudioNode, _output: AudioNode): void {
      this.panner.disconnect(0);
      if (!_input && !_output) {
        this.panner.connect(this.gain);
        return;
      }
      this.panner.connect(_input);
      _output.connect(this.gain);
    }

    /**
     * Activate override. Connects or disconnects AudioNodes
     */
    public activate(_on: boolean): void {
      super.activate(_on);
      this.updateConnection();
    }

    /**
     * Connects this components gain-node to the gain node of the AudioManager this component runs on.
     * Only call this method if the component is not attached to a {@link Node} but needs to be heard.
     */
    public connect(_on: boolean): void {
      if (_on)
        this.gain.connect(this.audioManager.gain);
      else
        this.gain.disconnect(this.audioManager.gain);
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.idResource = this.audio.idResource;
      serialization.playing = this.playing;
      serialization.loop = this.source.loop;
      serialization.volume = this.gain.gain.value;
      // console.log(this.getMutatorOfNode(AUDIO_NODE_TYPE.PANNER));
      // TODO: serialize panner parameters
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      let audio: Audio = <Audio>await Project.getResource(_serialization.idResource);
      this.createSource(audio, _serialization.loop);
      this.volume = _serialization.volume;
      this.play(_serialization.playing);
      return this;
    }
    //#endregion


    private hndAudioReady: EventListener = (_event: Event) => {
      Debug.fudge("Audio start", Reflect.get(_event.target, "url"));
      if (this.playing)
        this.play(true);
    }

    private hndAudioEnded: EventListener = (_event: Event) => {
      // Debug.fudge("Audio ended", Reflect.get(_event.target, "url"));
      this.playing = false;
    }

    private install(_audioManager: AudioManager = AudioManager.default): void {
      let active: boolean = this.isActive;
      this.activate(false);
      this.audioManager = _audioManager;
      this.panner = _audioManager.createPanner();
      this.gain = _audioManager.createGain();
      this.panner.connect(this.gain);
      this.gain.connect(_audioManager.gain);
      this.activate(active);
    }

    private createSource(_audio: Audio, _loop: boolean): void {
      if (this.source) {
        this.source.disconnect();
        this.source.buffer = null;
      }
      this.source = this.audioManager.createBufferSource();
      this.source.connect(this.panner);

      if (_audio) {
        this.audio = _audio;
        this.source.buffer = _audio.buffer;
      }

      this.source.loop = _loop;
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
        this.getContainer().addEventListener(EVENT_AUDIO.CHILD_APPEND, this.handleGraph, true);
        this.getContainer().addEventListener(EVENT_AUDIO.CHILD_REMOVE, this.handleGraph, true);
        this.getContainer().addEventListener(EVENT_AUDIO.UPDATE, this.update, true);
        this.listened = this.getContainer().isDescendantOf(AudioManager.default.getGraphListeningTo());
      }
      else {
        this.getContainer().removeEventListener(EVENT_AUDIO.CHILD_APPEND, this.handleGraph, true);
        this.getContainer().removeEventListener(EVENT_AUDIO.CHILD_REMOVE, this.handleGraph, true);
        this.getContainer().removeEventListener(EVENT_AUDIO.UPDATE, this.update, true);
        this.listened = false;
      }
      this.updateConnection();
    }

    /** 
     * Automatically connects/disconnects AudioNodes when appending/removing the FUDGE-graph the component is in. 
     */
    private handleGraph = (_event: Event): void => {
      // Debug.log(_event);
      this.listened = (_event.type == EVENT_AUDIO.CHILD_APPEND);
      this.updateConnection();
    }

    /** 
     * Updates the panner node, its position and direction, using the worldmatrix of the container and the pivot of this component. 
     */
    private update = (_event: Event): void => {
      let mtxResult: Matrix4x4 = this.mtxPivot;
      if (this.getContainer())
        mtxResult = Matrix4x4.MULTIPLICATION(this.getContainer().mtxWorld, this.mtxPivot);

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