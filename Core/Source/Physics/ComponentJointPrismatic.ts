namespace FudgeCore {
  /**
     * A physical connection between two bodies with a defined axe movement.
     * Used to create a sliding joint along one axis. Two RigidBodies need to be defined to use it.
     * A motor can be defined to move the connected along the defined axis. Great to construct standard springs or physical sliders.
     * 
     * ```plaintext
     *          JointHolder - attachedRigidbody
     *                    --------
     *                    |      |
     *          <---------|      |--------------> connectedRigidbody, sliding on one Axis, 1 Degree of Freedom
     *                    |      |
     *                    --------
     * ```
     * @author Marko Fehrenbach, HFU 2020
     */
  export class ComponentJointPrismatic extends ComponentJoint {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentJointPrismatic);

    //Internally used variables - Joint Properties that are used even when no actual oimoJoint is currently existend
    private jointSpringDampingRatio: number = 0;
    private jointSpringFrequency: number = 0;

    private jointMotorLimitUpper: number = 10;
    private jointMotorLimitLower: number = -10;
    private jointMotorForce: number = 0;
    private jointMotorSpeed: number = 0;

    private jointBreakForce: number = 0;
    private jointBreakTorque: number = 0;

    private config: OIMO.PrismaticJointConfig = new OIMO.PrismaticJointConfig();
    private translationalMotor: OIMO.TranslationalLimitMotor;
    private springDamper: OIMO.SpringDamper;
    private jointAnchor: OIMO.Vec3;
    private jointAxis: OIMO.Vec3;

    private jointInternalCollision: boolean;
    private oimoJoint: OIMO.PrismaticJoint;

    /** Creating a prismatic joint between two ComponentRigidbodies only moving on one axis bound on a local anchorpoint. */
    constructor(_attachedRigidbody: ComponentRigidbody = null, _connectedRigidbody: ComponentRigidbody = null, _axis: Vector3 = new Vector3(0, 1, 0), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_attachedRigidbody, _connectedRigidbody);
      this.jointAxis = new OIMO.Vec3(_axis.x, _axis.y, _axis.z);
      this.jointAnchor = new OIMO.Vec3(_localAnchor.x, _localAnchor.y, _localAnchor.z);

      /*Tell the physics that there is a new joint and on the physics start the actual joint is first created. Values can be set but the
        actual constraint ain't existent until the game starts
      */
      this.addEventListener(EVENT.COMPONENT_ADD, this.dirtyStatus);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.superRemove);
    }
    //#region Get/Set transfor of fudge properties to the physics engine
    /**
     * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
     *  When changed after initialization the joint needs to be reconnected.
     */
    get axis(): Vector3 {
      return new Vector3(this.jointAxis.x, this.jointAxis.y, this.jointAxis.z);
    }
    set axis(_value: Vector3) {
      this.jointAxis = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

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
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
     */
    get motorLimitUpper(): number {
      return this.jointMotorLimitUpper;
    }
    set motorLimitUpper(_value: number) {
      this.jointMotorLimitUpper = _value;
      if (this.oimoJoint != null) this.oimoJoint.getLimitMotor().upperLimit = this.jointMotorLimitUpper;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
     */
    get motorLimitLower(): number {
      return this.jointMotorLimitLower;
    }
    set motorLimitLower(_value: number) {
      this.jointMotorLimitLower = _value;
      if (this.oimoJoint != null) this.oimoJoint.getLimitMotor().lowerLimit = this.jointMotorLimitLower;
    }
    /**
      * The target speed of the motor in m/s.
     */
    get motorSpeed(): number {
      return this.jointMotorSpeed;
    }
    set motorSpeed(_value: number) {
      this.jointMotorSpeed = _value;
      if (this.oimoJoint != null) this.oimoJoint.getLimitMotor().motorSpeed = this.jointMotorSpeed;
    }
    /**
      * The maximum motor force in Newton. force <= 0 equals disabled. This is the force that the motor is using to hold the position, or reach it if a motorSpeed is defined.
     */
    get motorForce(): number {
      return this.jointMotorForce;
    }
    set motorForce(_value: number) {
      this.jointMotorForce = _value;
      if (this.oimoJoint != null) this.oimoJoint.getLimitMotor().motorForce = this.jointMotorForce;
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
        Debug.log("called Connection For: " + this.attachedRB.getContainer().name + " / " + this.connectedRB.getContainer().name);
        Debug.log("Strength: " + this.springDamping + " / " + this.springFrequency);
        Debug.log(this.oimoJoint);
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
        axis: this.axis,
        anchor: this.anchor,
        internalCollision: this.jointInternalCollision,
        springDamping: this.jointSpringDampingRatio,
        springFrequency: this.jointSpringFrequency,
        breakForce: this.jointBreakForce,
        breakTorque: this.jointBreakTorque,
        motorLimitUpper: this.jointMotorLimitUpper,
        motorLimitLower: this.jointMotorLimitLower,
        motorSpeed: this.jointMotorSpeed,
        motorForce: this.jointMotorForce,
        [super.constructor.name]: super.baseSerialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.idAttachedRB = _serialization.attID;
      super.idConnectedRB = _serialization.conID;
      if (_serialization.attID != null && _serialization.conID != null)
        super.setBodiesFromLoadedIDs();
      this.axis = _serialization.axis != null ? _serialization.axis : this.jointAxis;
      this.anchor = _serialization.anchor != null ? _serialization.anchor : this.jointAnchor;
      this.internalCollision = _serialization.internalCollision != null ? _serialization.internalCollision : false;
      this.springDamping = _serialization.springDamping != null ? _serialization.springDamping : this.jointSpringDampingRatio;
      this.springFrequency = _serialization.springFrequency != null ? _serialization.springFrequency : this.jointSpringFrequency;
      this.breakForce = _serialization.breakForce != null ? _serialization.breakForce : this.jointBreakForce;
      this.breakTorque = _serialization.breakTorque != null ? _serialization.breakTorque : this.jointBreakTorque;
      this.motorLimitUpper = _serialization.motorLimitUpper != null ? _serialization.motorLimitUpper : this.jointMotorLimitUpper;
      this.motorLimitLower = _serialization.motorLimitLower != null ? _serialization.motorLimitLower : this.jointMotorLimitLower;
      this.motorSpeed = _serialization.motorSpeed != null ? _serialization.motorSpeed : this.jointMotorSpeed;
      this.motorForce = _serialization.motorForce != null ? _serialization.motorForce : this.jointMotorForce;
      super.baseDeserialize(_serialization); //Super, Super, Component != ComponentJoint
      return this;
    }
    //#endregion

    /** Tell the FudgePhysics system that this joint needs to be handled in the next frame. */
    protected dirtyStatus(): void {
      Debug.log("Dirty Status");
      Physics.world.changeJointStatus(this);
    }

    /** Actual creation of a joint in the OimoPhysics system */
    private constructJoint(): void {
      this.springDamper = new OIMO.SpringDamper().setSpring(this.jointSpringFrequency, this.jointSpringDampingRatio); //Create spring settings, either as a spring or totally rigid
      this.translationalMotor = new OIMO.TranslationalLimitMotor().setLimits(this.jointMotorLimitLower, this.jointMotorLimitUpper); //Create motor settings, to hold positions, set constraint min/max
      this.translationalMotor.setMotor(this.jointMotorSpeed, this.jointMotorForce);
      this.config = new OIMO.PrismaticJointConfig(); //Create a specific config for this joint type that is calculating the local axis for both bodies
      let attachedRBPos: Vector3 = this.attachedRigidbody.getContainer().mtxWorld.translation; //Setting the anchor position locally from the first rigidbody
      let worldAnchor: OIMO.Vec3 = new OIMO.Vec3(attachedRBPos.x + this.jointAnchor.x, attachedRBPos.y + this.jointAnchor.y, attachedRBPos.z + this.jointAnchor.z);
      this.config.init(this.attachedRB.getOimoRigidbody(), this.connectedRB.getOimoRigidbody(), worldAnchor, this.jointAxis); //Initialize the config to calculate the local axis/anchors for the OimoPhysics Engine
      this.config.springDamper = this.springDamper; //Telling the config to use the motor/spring of the Fudge Component
      this.config.limitMotor = this.translationalMotor;
      var j: OIMO.PrismaticJoint = new OIMO.PrismaticJoint(this.config); //Creating the specific type of joint
      j.setBreakForce(this.breakForce); //Set additional infos, if the joint is unbreakable and colliding internally
      j.setBreakTorque(this.breakTorque);
      j.setAllowCollision(this.jointInternalCollision);
      this.oimoJoint = j; //Tell the Fudge Component which joint in the OimoPhysics system it represents
    }

    /** Adding this joint to the world through the general function of the base class ComponentJoint. Happening when the joint is connecting.  */
    private superAdd(): void {
      this.addConstraintToWorld(this);
    }

    /** Removing this joint to the world through the general function of the base class ComponentJoint. Happening when this component is removed from the Node. */
    private superRemove(): void {
      this.removeConstraintFromWorld(this);
    }
  }
}