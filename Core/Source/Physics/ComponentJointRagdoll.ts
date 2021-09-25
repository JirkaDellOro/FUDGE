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

    protected oimoJoint: OIMO.RagdollJoint;
    protected config: OIMO.RagdollJointConfig = new OIMO.RagdollJointConfig();

    private jointTwistSpringDampingRatio: number = 0;
    private jointTwistSpringFrequency: number = 0;

    private jointSwingSpringDampingRatio: number = 0;
    private jointSwingSpringFrequency: number = 0;

    private jointTwistMotorLimitUpper: number = 360;
    private jointTwistMotorLimitLower: number = 0;
    private jointTwistMotorTorque: number = 0;
    private jointTwistMotorSpeed: number = 0;

    private jointTwistMotor: OIMO.RotationalLimitMotor;
    private jointTwistSpringDamper: OIMO.SpringDamper;
    private jointSwingSpringDamper: OIMO.SpringDamper;
    private jointFirstAxis: OIMO.Vec3;
    private jointSecondAxis: OIMO.Vec3;


    private jointMaxAngle1: number;
    private jointMaxAngle2: number;



    constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null, _firstAxis: Vector3 = new Vector3(1, 0, 0), _secondAxis: Vector3 = new Vector3(0, 0, 1), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_bodyAnchor, _bodyTied);
      this.jointFirstAxis = new OIMO.Vec3(_firstAxis.x, _firstAxis.y, _firstAxis.z);
      this.jointSecondAxis = new OIMO.Vec3(_secondAxis.x, _secondAxis.y, _secondAxis.z);
      this.anchor = new Vector3(_localAnchor.x, _localAnchor.y, _localAnchor.z);
    }

    //#region Get/Set transfor of fudge properties to the physics engine
    /**
     * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
     *  When changed after initialization the joint needs to be reconnected.
     */
    get firstAxis(): Vector3 {
      return new Vector3(this.jointFirstAxis.x, this.jointFirstAxis.y, this.jointFirstAxis.z);
    }
    set firstAxis(_value: Vector3) {
      this.jointFirstAxis = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

    /**
    * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
    *  When changed after initialization the joint needs to be reconnected.
    */
    get secondAxis(): Vector3 {
      return new Vector3(this.jointSecondAxis.x, this.jointSecondAxis.y, this.jointSecondAxis.z);
    }
    set secondAxis(_value: Vector3) {
      this.jointSecondAxis = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The maximum angle of rotation along the first axis. Value needs to be positive. Changes do rebuild the joint
     */
    get maxAngleFirstAxis(): number {
      return this.jointMaxAngle1 * 180 / Math.PI;
    }
    set maxAngleFirstAxis(_value: number) {
      this.jointMaxAngle1 = _value * Math.PI / 180;
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The maximum angle of rotation along the second axis. Value needs to be positive. Changes do rebuild the joint
     */
    get maxAngleSecondAxis(): number {
      return this.jointMaxAngle2 * 180 / Math.PI;
    }
    set maxAngleSecondAxis(_value: number) {
      this.jointMaxAngle2 = _value * Math.PI / 180;
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    get springDampingTwist(): number {
      return this.jointTwistSpringDampingRatio;
    }
    set springDampingTwist(_value: number) {
      this.jointTwistSpringDampingRatio = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTwistSpringDamper().dampingRatio = this.jointTwistSpringDampingRatio;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    get springFrequencyTwist(): number {
      return this.jointTwistSpringFrequency;
    }
    set springFrequencyTwist(_value: number) {
      this.jointTwistSpringFrequency = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTwistSpringDamper().frequency = this.jointTwistSpringFrequency;
    }

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    get springDampingSwing(): number {
      return this.jointSwingSpringDampingRatio;
    }
    set springDampingSwing(_value: number) {
      this.jointSwingSpringDampingRatio = _value;
      if (this.oimoJoint != null) this.oimoJoint.getSwingSpringDamper().dampingRatio = this.jointSwingSpringDampingRatio;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    get springFrequencySwing(): number {
      return this.jointSwingSpringFrequency;
    }
    set springFrequencySwing(_value: number) {
      this.jointSwingSpringFrequency = _value;
      if (this.oimoJoint != null) this.oimoJoint.getSwingSpringDamper().frequency = this.jointSwingSpringFrequency;
    }




    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
     */
    get twistMotorLimitUpper(): number {
      return this.jointTwistMotorLimitUpper * 180 / Math.PI;
    }
    set twistMotorLimitUpper(_value: number) {
      this.jointTwistMotorLimitUpper = _value * Math.PI / 180;
      if (this.oimoJoint != null) this.oimoJoint.getTwistLimitMotor().upperLimit = this.jointTwistMotorLimitUpper;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
     */
    get twistMotorLimitLower(): number {
      return this.jointTwistMotorLimitLower * 180 / Math.PI;
    }
    set twistMotorLimitLower(_value: number) {
      this.jointTwistMotorLimitLower = _value * Math.PI / 180;
      if (this.oimoJoint != null) this.oimoJoint.getTwistLimitMotor().lowerLimit = this.jointTwistMotorLimitLower;
    }
    /**
      * The target rotational speed of the motor in m/s. 
     */
    get twistMotorSpeed(): number {
      return this.jointTwistMotorSpeed;
    }
    set twistMotorSpeed(_value: number) {
      this.jointTwistMotorSpeed = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTwistLimitMotor().motorSpeed = this.jointTwistMotorSpeed;
    }
    /**
      * The maximum motor torque in Newton. force <= 0 equals disabled. 
     */
    get twistMotorTorque(): number {
      return this.twistMotorTorque;
    }
    set twistMotorTorque(_value: number) {
      this.twistMotorTorque = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTwistLimitMotor().motorTorque = this.twistMotorTorque;
    }

    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
     */

    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = {
        firstAxis: this.jointFirstAxis,
        secondAxis: this.jointSecondAxis,
        maxAngleFirstAxis: this.jointMaxAngle1,
        maxAngleSecondAxis: this.jointMaxAngle2,
        springDampingTwist: this.jointTwistSpringDampingRatio,
        springFrequencyTwist: this.jointTwistSpringFrequency,
        springDampingSwing: this.jointSwingSpringDampingRatio,
        springFrequencySwing: this.jointSwingSpringFrequency,
        twistMotorLimitUpper: this.jointTwistMotorLimitUpper,
        twistMotorLimitLower: this.jointTwistMotorLimitLower,
        twistMotorSpeed: this.twistMotorSpeed,
        twistMotorTorque: this.twistMotorTorque,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.firstAxis = _serialization.firstAxis || this.jointFirstAxis;
      this.secondAxis = _serialization.secondAxis || this.jointSecondAxis;
      this.maxAngleFirstAxis = _serialization.maxAngleFirstAxis || this.jointMaxAngle1;
      this.maxAngleSecondAxis = _serialization.maxAngleSecondAxis || this.jointMaxAngle2;
      this.springDampingTwist = _serialization.springDampingTwist || this.jointTwistSpringDampingRatio;
      this.springFrequencyTwist = _serialization.springFrequencyTwist || this.jointTwistSpringFrequency;
      this.springDampingSwing = _serialization.springDampingSwing || this.jointSwingSpringDampingRatio;
      this.springFrequencySwing = _serialization.springFrequencySwing || this.jointSwingSpringFrequency;
      this.twistMotorLimitUpper = _serialization.twistMotorLimitUpper || this.jointTwistMotorLimitUpper;
      this.twistMotorLimitLower = _serialization.twistMotorLimitLower || this.jointTwistMotorLimitLower;
      this.twistMotorSpeed = _serialization.twistMotorSpeed || this.jointTwistMotorSpeed;
      this.twistMotorTorque = _serialization.twistMotorTorque || this.jointTwistMotorTorque;
      super.deserialize(_serialization);
      return this;
    }
    //#endregion

    protected constructJoint(): void {
      this.jointTwistSpringDamper = new OIMO.SpringDamper().setSpring(this.jointTwistSpringFrequency, this.jointTwistSpringDampingRatio);
      this.jointSwingSpringDamper = new OIMO.SpringDamper().setSpring(this.jointSwingSpringFrequency, this.jointSwingSpringDampingRatio);

      this.jointTwistMotor = new OIMO.RotationalLimitMotor().setLimits(this.jointTwistMotorLimitLower, this.jointTwistMotorLimitUpper);
      this.jointTwistMotor.setMotor(this.jointTwistMotorSpeed, this.jointTwistMotorTorque);

      this.config = new OIMO.RagdollJointConfig();
      super.constructJoint(this.jointFirstAxis, this.jointSecondAxis); // last parameter differs from ComponentJoint
      this.config.swingSpringDamper = this.jointSwingSpringDamper;
      this.config.twistSpringDamper = this.jointTwistSpringDamper;
      this.config.twistLimitMotor = this.jointTwistMotor;
      this.config.maxSwingAngle1 = this.jointMaxAngle1;
      this.config.maxSwingAngle2 = this.jointMaxAngle2;

      this.oimoJoint = new OIMO.RagdollJoint(this.config);
      super.configureJoint();
    }
  }
}