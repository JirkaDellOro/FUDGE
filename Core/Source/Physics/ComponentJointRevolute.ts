namespace FudgeCore {
  /**
     * A physical connection between two bodies with a defined axe of rotation. Also known as HINGE joint.
     * Two RigidBodies need to be defined to use it. A motor can be defined to rotate the connected along the defined axis.
     * 
     * ```plaintext        
     *                  rotation axis, 1st Degree of freedom
     *                    ↑
     *              ---   |   ------------
     *             |   |  |  |            | 
     *             |   |  |  |            | 
     *             |   |  |  |            | 
     *              ---   |   ------------
     *      attachedRB    ↓    connectedRB
     *   (e.g. Doorhinge)       (e.g. Door)
     * ```
     * @author Marko Fehrenbach, HFU, 2020
     */
  export class ComponentJointRevolute extends ComponentJointAxial {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentJointRevolute);

    protected oimoJoint: OIMO.RevoluteJoint;
    
    private jointSpringDampingRatio: number = 0;
    private jointSpringFrequency: number = 0;

    private jointMotorLimitUpper: number = 360;
    private jointMotorLimitLower: number = 0;
    private jointmotorTorque: number = 0;
    private jointMotorSpeed: number = 0;

    private config: OIMO.RevoluteJointConfig = new OIMO.RevoluteJointConfig();
    private rotationalMotor: OIMO.RotationalLimitMotor;
    private springDamper: OIMO.SpringDamper;
    private jointAxis: OIMO.Vec3;



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
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
     */
    get motorLimitUpper(): number {
      return this.jointMotorLimitUpper * 180 / Math.PI;
    }
    set motorLimitUpper(_value: number) {
      this.jointMotorLimitUpper = _value * Math.PI / 180;
      if (this.oimoJoint != null) this.oimoJoint.getLimitMotor().upperLimit = this.jointMotorLimitUpper;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
     */
    get motorLimitLower(): number {
      return this.jointMotorLimitLower * 180 / Math.PI;
    }
    set motorLimitLower(_value: number) {
      this.jointMotorLimitLower = _value * Math.PI / 180;
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
      * The maximum motor force in Newton. force <= 0 equals disabled. 
     */
    get motorTorque(): number {
      return this.jointmotorTorque;
    }
    set motorTorque(_value: number) {
      this.jointmotorTorque = _value;
      if (this.oimoJoint != null) this.oimoJoint.getLimitMotor().motorTorque = this.jointmotorTorque;
    }

    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
     */

    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = {
        axis: this.axis,
        springDamping: this.jointSpringDampingRatio,
        springFrequency: this.jointSpringFrequency,
        motorLimitUpper: this.jointMotorLimitUpper,
        motorLimitLower: this.jointMotorLimitLower,
        motorSpeed: this.jointMotorSpeed,
        motorTorque: this.jointmotorTorque,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.axis = _serialization.axis != null ? _serialization.axis : this.jointAxis;
      this.anchor = _serialization.anchor != null ? _serialization.anchor : this.jointAnchor;
      this.internalCollision = _serialization.internalCollision != null ? _serialization.internalCollision : false;
      this.springDamping = _serialization.springDamping != null ? _serialization.springDamping : this.jointSpringDampingRatio;
      this.springFrequency = _serialization.springFrequency != null ? _serialization.springFrequency : this.jointSpringFrequency;
      this.breakForce = _serialization.breakForce != null ? _serialization.breakForce : this.jointBreakForce;
      this.breakTorque = _serialization.breakTorque != null ? _serialization.breakTorque : this.jointBreakTorque;
      this.motorLimitUpper = _serialization.upperLimit != null ? _serialization.upperLimit : this.jointMotorLimitUpper;
      this.motorLimitLower = _serialization.lowerLimit != null ? _serialization.lowerLimit : this.jointMotorLimitLower;
      this.motorSpeed = _serialization.motorSpeed != null ? _serialization.motorSpeed : this.jointMotorSpeed;
      this.motorTorque = _serialization.motorForce != null ? _serialization.motorForce : this.jointmotorTorque;
      super.deserialize(_serialization);
      return this;
    }
    //#endregion

    protected constructJoint(): void {
      this.springDamper = new OIMO.SpringDamper().setSpring(this.jointSpringFrequency, this.jointSpringDampingRatio);
      this.rotationalMotor = new OIMO.RotationalLimitMotor().setLimits(this.jointMotorLimitLower, this.jointMotorLimitUpper);
      this.rotationalMotor.setMotor(this.jointMotorSpeed, this.jointmotorTorque);
      this.config = new OIMO.RevoluteJointConfig();
      let attachedRBPos: Vector3 = this.attachedRigidbody.node.mtxWorld.translation;
      let worldAnchor: OIMO.Vec3 = new OIMO.Vec3(attachedRBPos.x + this.jointAnchor.x, attachedRBPos.y + this.jointAnchor.y, attachedRBPos.z + this.jointAnchor.z);
      this.config.init(this.attachedRB.getOimoRigidbody(), this.connectedRB.getOimoRigidbody(), worldAnchor, this.jointAxis);
      this.config.springDamper = this.springDamper;
      this.config.limitMotor = this.rotationalMotor;
      var j: OIMO.RevoluteJoint = new OIMO.RevoluteJoint(this.config);
      j.setBreakForce(this.breakForce);
      j.setBreakTorque(this.breakTorque);
      j.setAllowCollision(this.jointInternalCollision);
      this.oimoJoint = j;
    }
  }
}