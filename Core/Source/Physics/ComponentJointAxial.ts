namespace FudgeCore {
  /**
     * Base class for joints operating with exactly on axis
     * @author Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export abstract class ComponentJointAxial extends ComponentJoint {

    //Internal Variables
    protected jointSpringDampingRatio: number = 0;
    protected jointSpringFrequency: number = 0;

    protected jointRotationSpringDampingRatio: number = 0;
    protected jointRotationSpringFrequency: number = 0;

    protected jointMotorLimitUpper: number = 10;
    protected jointMotorLimitLower: number = -10;
    protected jointMotorSpeed: number = 0;
    

    private config: OIMO.CylindricalJointConfig = new OIMO.CylindricalJointConfig();
    private rotationalMotor: OIMO.RotationalLimitMotor;
    private translationMotor: OIMO.TranslationalLimitMotor;
    private springDamper: OIMO.SpringDamper;
    private rotationSpringDamper: OIMO.SpringDamper;
    private jointAxis: OIMO.Vec3;

    /** Creating a cylindrical joint between two ComponentRigidbodies moving on one axis and rotating around another bound on a local anchorpoint. */
    constructor(_attachedRigidbody: ComponentRigidbody = null, _connectedRigidbody: ComponentRigidbody = null, _axis: Vector3 = new Vector3(0, 1, 0), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_attachedRigidbody, _connectedRigidbody);
      this.jointAxis = new OIMO.Vec3(_axis.x, _axis.y, _axis.z);
      this.jointAnchor = new OIMO.Vec3(_localAnchor.x, _localAnchor.y, _localAnchor.z);

      /*Tell the physics that there is a new joint and on the physics start the actual joint is first created. Values can be set but the
        actual constraint ain't existent until the game starts
      */
      this.addEventListener(EVENT.COMPONENT_ADD, this.dirtyStatus);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.removeJoint);
    }

    //#region Get/Set transfor of fudge properties to the physics engine
    /**
     * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
     *  When changed after initialization the joint needs to be reconnected.
     */
    public get axis(): Vector3 {
      return new Vector3(this.jointAxis.x, this.jointAxis.y, this.jointAxis.z);
    }
    public set axis(_value: Vector3) {
      this.jointAxis = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    public get springDamping(): number {
      return this.jointSpringDampingRatio;
    }
    public set springDamping(_value: number) {
      this.jointSpringDampingRatio = _value;
      if (this.oimoJoint != null)
        // overwrite for e.g. CylindricalJoint
        (<OIMO.PrismaticJoint><unknown>this.oimoJoint).getSpringDamper().dampingRatio = this.jointSpringDampingRatio;
    }

    /**
    * The damping of the spring. 1 equals completly damped. Influencing TORQUE / ROTATION
    */
    get rotationSpringDamping(): number {
      return this.jointRotationSpringDampingRatio;
    }
    set rotationSpringDamping(_value: number) {
      this.jointRotationSpringDampingRatio = _value;
      if (this.oimoJoint != null) this.oimoJoint.getRotationalSpringDamper().dampingRatio = this.jointRotationSpringDampingRatio;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. Influencing TORQUE / ROTATION
    */
    get rotationSpringFrequency(): number {
      return this.jointRotationSpringFrequency;
    }
    set rotationSpringFrequency(_value: number) {
      this.jointRotationSpringFrequency = _value;
      if (this.oimoJoint != null) this.oimoJoint.getRotationalSpringDamper().frequency = this.jointRotationSpringFrequency;
    }

    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. 
     */
    get translationMotorLimitLower(): number {
      return this.jointMotorLimitUpper;
    }
    set translationMotorLimitLower(_value: number) {
      this.jointMotorLimitLower = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTranslationalLimitMotor().lowerLimit = this.jointMotorLimitLower;
    }
    /**
      * The target speed of the motor in m/s.
     */
    get translationMotorSpeed(): number {
      return this.jointMotorSpeed;
    }
    set translationMotorSpeed(_value: number) {
      this.jointMotorSpeed = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTranslationalLimitMotor().motorSpeed = this.jointMotorSpeed;
    }

    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
     */

    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = {
        springDamping: this.jointSpringDampingRatio,
        springFrequency: this.jointSpringFrequency,
        motorLimitUpper: this.jointMotorLimitUpper,
        motorLimitLower: this.jointMotorLimitLower,
        motorSpeed: this.jointMotorSpeed,
        springDampingRotation: this.jointRotationSpringDampingRatio,
        springFrequencyRotation: this.jointRotationSpringFrequency,
        // upperLimitRotation: this.jointRotationMotorLimitUpper,
        // lowerLimitRotation: this.jointRotationMotorLimitLower,
        // motorSpeedRotation: this.jointRotationMotorSpeed,
        // motorTorque: this.jointRotationMotorTorque,
        axis: this.axis,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.axis = _serialization.axis != null ? _serialization.axis : this.jointAxis;
      this.anchor = _serialization.anchor != null ? _serialization.anchor : this.jointAnchor;
      this.internalCollision = _serialization.internalCollision != null ? _serialization.internalCollision : false;
      this.springDamping = _serialization.springDamping != null ? _serialization.springDamping : this.jointSpringDampingRatio;
      // this.springFrequency = _serialization.springFrequency != null ? _serialization.springFrequency : this.jointSpringFrequency;
      this.breakForce = _serialization.breakForce != null ? _serialization.breakForce : this.jointBreakForce;
      this.breakTorque = _serialization.breakTorque != null ? _serialization.breakTorque : this.jointBreakTorque;
      // this.translationMotorLimitUpper = _serialization.upperLimitTranslation != null ? _serialization.upperLimitTranslation : this.jointMotorLimitUpper;
      this.translationMotorLimitLower = _serialization.lowerLimitTranslation != null ? _serialization.lowerLimitTranslation : this.jointMotorLimitLower;
      this.translationMotorSpeed = _serialization.motorSpeedTranslation != null ? _serialization.motorSpeedTranslation : this.jointMotorSpeed;
      this.rotationSpringDamping = _serialization.springDampingRotation != null ? _serialization.springDampingRotation : this.jointRotationSpringDampingRatio;
      this.rotationSpringFrequency = _serialization.springFrequencyRotation != null ? _serialization.springFrequencyRotation : this.jointRotationSpringFrequency;
      // this.rotationalMotorLimitUpper = _serialization.upperLimitRotation != null ? _serialization.upperLimitRotation : this.jointRotationMotorLimitUpper;
      // this.rotationalMotorLimitLower = _serialization.lowerLimitRotation != null ? _serialization.lowerLimitRotation : this.jointRotationMotorLimitLower;
      // this.rotationalMotorSpeed = _serialization.motorSpeedRotation != null ? _serialization.motorSpeedRotation : this.jointRotationMotorSpeed;
      // this.rotationalMotorTorque = _serialization.motorTorque != null ? _serialization.motorTorque : this.jointRotationMotorTorque;
      super.deserialize(_serialization);
      return this;
    }
    //#endregion

    protected constructJoint(): void {
      this.springDamper = new OIMO.SpringDamper().setSpring(this.jointSpringFrequency, this.jointSpringDampingRatio);
      this.rotationSpringDamper = new OIMO.SpringDamper().setSpring(this.jointRotationSpringFrequency, this.rotationSpringDamping);

      this.translationMotor = new OIMO.TranslationalLimitMotor().setLimits(this.jointMotorLimitLower, this.jointMotorLimitUpper);
      // this.translationMotor.setMotor(this.jointMotorSpeed, this.jointMotorForce);
      this.rotationalMotor = new OIMO.RotationalLimitMotor().setLimits(this.jointRotationMotorLimitLower, this.jointRotationMotorLimitUpper);
      this.rotationalMotor.setMotor(this.jointRotationMotorSpeed, this.jointRotationMotorTorque);

      this.config = new OIMO.CylindricalJointConfig();
      let attachedRBPos: Vector3 = this.attachedRigidbody.node.mtxWorld.translation;
      let worldAnchor: OIMO.Vec3 = new OIMO.Vec3(attachedRBPos.x + this.jointAnchor.x, attachedRBPos.y + this.jointAnchor.y, attachedRBPos.z + this.jointAnchor.z);
      this.config.init(this.attachedRB.getOimoRigidbody(), this.connectedRB.getOimoRigidbody(), worldAnchor, this.jointAxis);
      this.config.translationalSpringDamper = this.springDamper;
      this.config.translationalLimitMotor = this.translationMotor;
      this.config.rotationalLimitMotor = this.rotationalMotor;
      this.config.rotationalSpringDamper = this.rotationSpringDamper;

      var j: OIMO.CylindricalJoint = new OIMO.CylindricalJoint(this.config);
      j.setBreakForce(this.breakForce);
      j.setBreakTorque(this.breakTorque);
      j.setAllowCollision(this.jointInternalCollision);

      this.oimoJoint = j;
    }
  }
}