namespace FudgeCore {
  /**
      * A physical connection between two bodies, designed to simulate behaviour within a real body. It has two axis, a swing and twist axis, and also the perpendicular axis, 
      * similar to a Spherical joint, but more restrictive in it's angles and only two degrees of freedom. Two RigidBodies need to be defined to use it. Mostly used to create humanlike joints that behave like a 
      * lifeless body.
      * ```plaintext        
      *                  
      *                      anchor - it can twist on one axis and swing on another
      *         z                   |
      *         ↑            -----  |  ------------
      *         |           |     | ↓ |            |        e.g. z = TwistAxis, it can rotate in-itself around this axis 
      *  -x <---|---> x     |     | x |            |        e.g. x = SwingAxis, it can rotate anchored around the base on this axis   
      *         |           |     |   |            |           
      *         ↓            -----     ------------         e.g. you can twist the leg in-itself to a certain degree,
      *        -z                                           but also rotate it forward/backward/left/right to a certain degree
      *                attachedRB          connectedRB
      *              (e.g. upper-leg)         (e.g. pelvis)
      * 
      * ```
      * Twist equals a rotation around a point without moving on an axis.
      * Swing equals a rotation on a point with a moving local axis.
      * @author Marko Fehrenbach, HFU, 2020
      */
  export class ComponentJointRagdoll extends ComponentJoint {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentJointRagdoll);


    #springDampingTwist: number = 0;
    #springFrequencyTwist: number = 0;

    #springDampingSwing: number = 0;
    #springFrequencySwing: number = 0;

    #motorLimitUpperTwist: number = 360;
    #motorLimitLowerTwist: number = 0;
    #motorTorqueTwist: number = 0;
    #motorSpeedTwist: number = 0;

    #motorTwist: OIMO.RotationalLimitMotor;
    #springDamperTwist: OIMO.SpringDamper;
    #springDamperSwing: OIMO.SpringDamper;
    #axisFirst: OIMO.Vec3;
    #axisSecond: OIMO.Vec3;


    #maxAngle1: number;
    #maxAngle2: number;

    protected joint: OIMO.RagdollJoint;
    protected config: OIMO.RagdollJointConfig = new OIMO.RagdollJointConfig();

    constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null, _firstAxis: Vector3 = new Vector3(1, 0, 0), _secondAxis: Vector3 = new Vector3(0, 0, 1), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_bodyAnchor, _bodyTied);
      this.#axisFirst = new OIMO.Vec3(_firstAxis.x, _firstAxis.y, _firstAxis.z);
      this.#axisSecond = new OIMO.Vec3(_secondAxis.x, _secondAxis.y, _secondAxis.z);
      this.anchor = new Vector3(_localAnchor.x, _localAnchor.y, _localAnchor.z);
    }

    //#region Get/Set transfor of fudge properties to the physics engine
    /**
     * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
     *  When changed after initialization the joint needs to be reconnected.
     */
    get firstAxis(): Vector3 {
      return new Vector3(this.#axisFirst.x, this.#axisFirst.y, this.#axisFirst.z);
    }
    set firstAxis(_value: Vector3) {
      this.#axisFirst = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

    /**
    * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
    *  When changed after initialization the joint needs to be reconnected.
    */
    get secondAxis(): Vector3 {
      return new Vector3(this.#axisSecond.x, this.#axisSecond.y, this.#axisSecond.z);
    }
    set secondAxis(_value: Vector3) {
      this.#axisSecond = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The maximum angle of rotation along the first axis. Value needs to be positive. Changes do rebuild the joint
     */
    get maxAngleFirstAxis(): number {
      return this.#maxAngle1 * 180 / Math.PI;
    }
    set maxAngleFirstAxis(_value: number) {
      this.#maxAngle1 = _value * Math.PI / 180;
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The maximum angle of rotation along the second axis. Value needs to be positive. Changes do rebuild the joint
     */
    get maxAngleSecondAxis(): number {
      return this.#maxAngle2 * 180 / Math.PI;
    }
    set maxAngleSecondAxis(_value: number) {
      this.#maxAngle2 = _value * Math.PI / 180;
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    get springDampingTwist(): number {
      return this.#springDampingTwist;
    }
    set springDampingTwist(_value: number) {
      this.#springDampingTwist = _value;
      if (this.joint != null) this.joint.getTwistSpringDamper().dampingRatio = this.#springDampingTwist;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    get springFrequencyTwist(): number {
      return this.#springFrequencyTwist;
    }
    set springFrequencyTwist(_value: number) {
      this.#springFrequencyTwist = _value;
      if (this.joint != null) this.joint.getTwistSpringDamper().frequency = this.#springFrequencyTwist;
    }

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    get springDampingSwing(): number {
      return this.#springDampingSwing;
    }
    set springDampingSwing(_value: number) {
      this.#springDampingSwing = _value;
      if (this.joint != null) this.joint.getSwingSpringDamper().dampingRatio = this.#springDampingSwing;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    get springFrequencySwing(): number {
      return this.#springFrequencySwing;
    }
    set springFrequencySwing(_value: number) {
      this.#springFrequencySwing = _value;
      if (this.joint != null) this.joint.getSwingSpringDamper().frequency = this.#springFrequencySwing;
    }




    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
     */
    get twistMotorLimitUpper(): number {
      return this.#motorLimitUpperTwist * 180 / Math.PI;
    }
    set twistMotorLimitUpper(_value: number) {
      this.#motorLimitUpperTwist = _value * Math.PI / 180;
      if (this.joint != null) this.joint.getTwistLimitMotor().upperLimit = this.#motorLimitUpperTwist;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
     */
    get twistMotorLimitLower(): number {
      return this.#motorLimitLowerTwist * 180 / Math.PI;
    }
    set twistMotorLimitLower(_value: number) {
      this.#motorLimitLowerTwist = _value * Math.PI / 180;
      if (this.joint != null) this.joint.getTwistLimitMotor().lowerLimit = this.#motorLimitLowerTwist;
    }
    /**
      * The target rotational speed of the motor in m/s. 
     */
    get twistMotorSpeed(): number {
      return this.#motorSpeedTwist;
    }
    set twistMotorSpeed(_value: number) {
      this.#motorSpeedTwist = _value;
      if (this.joint != null) this.joint.getTwistLimitMotor().motorSpeed = this.#motorSpeedTwist;
    }
    /**
      * The maximum motor torque in Newton. force <= 0 equals disabled. 
     */
    get twistMotorTorque(): number {
      return this.twistMotorTorque;
    }
    set twistMotorTorque(_value: number) {
      this.twistMotorTorque = _value;
      if (this.joint != null) this.joint.getTwistLimitMotor().motorTorque = this.twistMotorTorque;
    }

    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
     */

    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = {
        firstAxis: this.#axisFirst,
        secondAxis: this.#axisSecond,
        maxAngleFirstAxis: this.#maxAngle1,
        maxAngleSecondAxis: this.#maxAngle2,
        springDampingTwist: this.#springDampingTwist,
        springFrequencyTwist: this.#springFrequencyTwist,
        springDampingSwing: this.#springDampingSwing,
        springFrequencySwing: this.#springFrequencySwing,
        twistMotorLimitUpper: this.#motorLimitUpperTwist,
        twistMotorLimitLower: this.#motorLimitLowerTwist,
        twistMotorSpeed: this.twistMotorSpeed,
        twistMotorTorque: this.twistMotorTorque,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.firstAxis = _serialization.firstAxis || this.#axisFirst;
      this.secondAxis = _serialization.secondAxis || this.#axisSecond;
      this.maxAngleFirstAxis = _serialization.maxAngleFirstAxis || this.#maxAngle1;
      this.maxAngleSecondAxis = _serialization.maxAngleSecondAxis || this.#maxAngle2;
      this.springDampingTwist = _serialization.springDampingTwist || this.#springDampingTwist;
      this.springFrequencyTwist = _serialization.springFrequencyTwist || this.#springFrequencyTwist;
      this.springDampingSwing = _serialization.springDampingSwing || this.#springDampingSwing;
      this.springFrequencySwing = _serialization.springFrequencySwing || this.#springFrequencySwing;
      this.twistMotorLimitUpper = _serialization.twistMotorLimitUpper || this.#motorLimitUpperTwist;
      this.twistMotorLimitLower = _serialization.twistMotorLimitLower || this.#motorLimitLowerTwist;
      this.twistMotorSpeed = _serialization.twistMotorSpeed || this.#motorSpeedTwist;
      this.twistMotorTorque = _serialization.twistMotorTorque || this.#motorTorqueTwist;
      super.deserialize(_serialization);
      return this;
    }
    //#endregion

    protected constructJoint(): void {
      this.#springDamperTwist = new OIMO.SpringDamper().setSpring(this.#springFrequencyTwist, this.#springDampingTwist);
      this.#springDamperSwing = new OIMO.SpringDamper().setSpring(this.#springFrequencySwing, this.#springDampingSwing);

      this.#motorTwist = new OIMO.RotationalLimitMotor().setLimits(this.#motorLimitLowerTwist, this.#motorLimitUpperTwist);
      this.#motorTwist.setMotor(this.#motorSpeedTwist, this.#motorTorqueTwist);

      this.config = new OIMO.RagdollJointConfig();
      super.constructJoint(this.#axisFirst, this.#axisSecond); // last parameter differs from ComponentJoint
      this.config.swingSpringDamper = this.#springDamperSwing;
      this.config.twistSpringDamper = this.#springDamperTwist;
      this.config.twistLimitMotor = this.#motorTwist;
      this.config.maxSwingAngle1 = this.#maxAngle1;
      this.config.maxSwingAngle2 = this.#maxAngle2;

      this.joint = new OIMO.RagdollJoint(this.config);
      super.configureJoint();
    }
  }
}