namespace FudgeCore {
  /**
     * A physical connection between two bodies with three Degrees of Freedom, also known as ball and socket joint. Two bodies connected at their anchor but free to rotate.
     * Used for things like the connection of bones in the human shoulder (if simplified, else better use JointRagdoll). Two RigidBodies need to be defined to use it. Only spring settings can be defined.
     * 3 Degrees are swing horizontal, swing vertical and twist.
     * 
     * ```plaintext
     *              JointHolder - attachedRigidbody (e.g. Human-Shoulder)
     *         z                             -------
     *      y  ↑                            |      |
     *        \|            ----------------|      |
     *  -x <---|---> x     |                |      |
     *         |\           ----------------|      |
     *         ↓ -y       conntectedRb      |      |
     *        -z         (e.g. Upper-Arm)    -------
     * ```
     * @authors Marko Fehrenbach, HFU, 2020
     */
  export class ComponentJointSpherical extends ComponentJoint {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentJointSpherical);

    private jointSpringDampingRatio: number = 0;
    private jointSpringFrequency: number = 0;

    private jointBreakForce: number = 0;
    private jointBreakTorque: number = 0;

    private config: OIMO.SphericalJointConfig = new OIMO.SphericalJointConfig();
    private springDamper: OIMO.SpringDamper;
    private jointAnchor: OIMO.Vec3;

    private jointInternalCollision: boolean;

    private oimoJoint: OIMO.SphericalJoint;


    constructor(_attachedRigidbody: ComponentRigidbody = null, _connectedRigidbody: ComponentRigidbody = null, _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_attachedRigidbody, _connectedRigidbody);
      this.jointAnchor = new OIMO.Vec3(_localAnchor.x, _localAnchor.y, _localAnchor.z);

      /*Tell the physics that there is a new joint and on the physics start the actual joint is first created. Values can be set but the
       actual constraint ain't existent until the game starts
     */
      this.addEventListener(EVENT.COMPONENT_ADD, this.dirtyStatus);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.superRemove);
    }

    //#region Get/Set transfor of fudge properties to the physics engine
    /**

    /**
     * The exact position where the two {@link Node}s are connected. When changed after initialization the joint needs to be reconnected.
     */
    get anchor(): Vector3 {
      return new Vector3(this.jointAnchor.x, this.jointAnchor.y, this.jointAnchor.z);
    }
    set anchor(_value: Vector3) {
      this.jointAnchor = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    get springDamping(): number {
      return this.jointSpringDampingRatio;
    }
    set springDamping(_value: number) {
      this.jointSpringDampingRatio = _value;
      if (this.oimoJoint != null) this.oimoJoint.getSpringDamper().dampingRatio = this.jointSpringDampingRatio;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    get springFrequency(): number {
      return this.jointSpringFrequency;
    }
    set springFrequency(_value: number) {
      this.jointSpringFrequency = _value;
      if (this.oimoJoint != null) this.oimoJoint.getSpringDamper().frequency = this.jointSpringFrequency;
    }

    /**
     * The amount of force needed to break the JOINT, in Newton. 0 equals unbreakable (default) 
    */
    get breakForce(): number {
      return this.jointBreakForce;
    }
    set breakForce(_value: number) {
      this.jointBreakForce = _value;
      if (this.oimoJoint != null) this.oimoJoint.setBreakForce(this.jointBreakForce);
    }

    /**
       * The amount of force needed to break the JOINT, while rotating, in Newton. 0 equals unbreakable (default) 
      */
    get breakTorque(): number {
      return this.jointBreakTorque;
    }
    set breakTorque(_value: number) {
      this.jointBreakTorque = _value;
      if (this.oimoJoint != null) this.oimoJoint.setBreakTorque(this.jointBreakTorque);
    }

    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
     */
    get internalCollision(): boolean {
      return this.jointInternalCollision;
    }
    set internalCollision(_value: boolean) {
      this.jointInternalCollision = _value;
      if (this.oimoJoint != null) this.oimoJoint.setAllowCollision(this.jointInternalCollision);
    }
    //#endregion

    /**
     * Initializing and connecting the two rigidbodies with the configured joint properties
     * is automatically called by the physics system. No user interaction needed.
     */
    public connect(): void {
      if (this.connected == false) {
        this.constructJoint();
        this.connected = true;
        this.superAdd();
      }
    }

    /**
     * Disconnecting the two rigidbodies and removing them from the physics system,
     * is automatically called by the physics system. No user interaction needed.
     */
    public disconnect(): void {
      if (this.connected == true) {
        this.superRemove();
        this.connected = false;
      }
    }

    /**
     * Returns the original Joint used by the physics engine. Used internally no user interaction needed.
     * Only to be used when functionality that is not added within Fudge is needed.
    */
    public getOimoJoint(): OIMO.Joint {
      return this.oimoJoint;
    }

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = {
        attID: super.idAttachedRB,
        conID: super.idConnectedRB,
        anchor: this.anchor,
        internalCollision: this.jointInternalCollision,
        springDamping: this.jointSpringDampingRatio,
        springFrequency: this.jointSpringFrequency,
        breakForce: this.jointBreakForce,
        breakTorque: this.jointBreakTorque,
        [super.constructor.name]: super.baseSerialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.idAttachedRB = _serialization.attID;
      super.idConnectedRB = _serialization.conID;
      if (_serialization.attID != null && _serialization.conID != null)
        super.setBodiesFromLoadedIDs();
      this.anchor = _serialization.anchor != null ? _serialization.anchor : this.jointAnchor;
      this.internalCollision = _serialization.internalCollision != null ? _serialization.internalCollision : false;
      this.springDamping = _serialization.springDamping != null ? _serialization.springDamping : this.jointSpringDampingRatio;
      this.springFrequency = _serialization.springFrequency != null ? _serialization.springFrequency : this.jointSpringFrequency;
      this.breakForce = _serialization.breakForce != null ? _serialization.breakForce : this.jointBreakForce;
      this.breakTorque = _serialization.breakTorque != null ? _serialization.breakTorque : this.jointBreakTorque;
      super.baseDeserialize(_serialization);
      return this;
    }
    //#endregion

    protected dirtyStatus(): void {
      Physics.world.changeJointStatus(this);
    }

    private constructJoint(): void {
      this.springDamper = new OIMO.SpringDamper().setSpring(this.jointSpringFrequency, this.jointSpringDampingRatio);
      this.config = new OIMO.SphericalJointConfig();
      let attachedRBPos: Vector3 = this.attachedRigidbody.getContainer().mtxWorld.translation;
      let worldAnchor: OIMO.Vec3 = new OIMO.Vec3(attachedRBPos.x + this.jointAnchor.x, attachedRBPos.y + this.jointAnchor.y, attachedRBPos.z + this.jointAnchor.z);
      this.config.init(this.attachedRB.getOimoRigidbody(), this.connectedRB.getOimoRigidbody(), worldAnchor);
      this.config.springDamper = this.springDamper;

      var j: OIMO.SphericalJoint = new OIMO.SphericalJoint(this.config);
      j.setBreakForce(this.breakForce);
      j.setBreakTorque(this.breakTorque);
      j.setAllowCollision(this.jointInternalCollision);

      this.oimoJoint = j;
    }

    private superAdd(): void {
      this.addConstraintToWorld(this);
    }

    private superRemove(): void {
      this.removeConstraintFromWorld(this);
    }
  }
}