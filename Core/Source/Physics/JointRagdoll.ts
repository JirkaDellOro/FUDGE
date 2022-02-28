namespace FudgeCore {
  /**
    * A physical connection between two bodies, designed to simulate behaviour within a real body. It has two axis, a swing and twist axis, and also the perpendicular axis, 
    * similar to a Spherical joint, but more restrictive in it's angles and only two degrees of freedom. Two RigidBodies need to be defined to use it. Mostly used to create humanlike joints that behave like a 
    * lifeless body.
    * ```plaintext        
    *                  
    *                      anchor - it can twist on one axis and swing on another
    *                            │
    *         z            ┌───┐ │ ┌───┐
    *         ↑            │   │ ↓ │   │        e.g. z = TwistAxis, it can rotate in-itself around this axis 
    *    -x ←─┼─→ x        │   │ x │   │        e.g. x = SwingAxis, it can rotate anchored around the base on this axis   
    *         ↓            │   │   │   │           
    *        -z            └───┘   └───┘         e.g. you can twist the leg in-itself to a certain degree,
    *                                                     but also rotate it forward/backward/left/right to a certain degree
    *                bodyAnchor          bodyTied
    *              (e.g. pelvis)         (e.g. upper-leg)
    * 
    * ```
    * Twist equals a rotation around a point without moving on an axis.
    * Swing equals a rotation on a point with a moving local axis.
     * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
    */

  export class JointRagdoll extends Joint {
    public static readonly iSubclass: number = Joint.registerSubclass(JointRagdoll);


    #springDampingTwist: number = 0;
    #springFrequencyTwist: number = 0;

    #springDampingSwing: number = 0;
    #springFrequencySwing: number = 0;

    #maxMotorTwist: number = 360;
    #minMotorTwist: number = 0;
    #motorTorqueTwist: number = 0;
    #motorSpeedTwist: number = 0;

    #motorTwist: OIMO.RotationalLimitMotor;
    #springDamperTwist: OIMO.SpringDamper;
    #springDamperSwing: OIMO.SpringDamper;
    #axisFirst: OIMO.Vec3;
    #axisSecond: OIMO.Vec3;


    #maxAngleFirst: number = 0;
    #maxAngleSecond: number = 0;

    protected joint: OIMO.RagdollJoint;
    protected config: OIMO.RagdollJointConfig = new OIMO.RagdollJointConfig();

    constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null, _axisFirst: Vector3 = new Vector3(1, 0, 0), _axisSecond: Vector3 = new Vector3(0, 0, 1), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_bodyAnchor, _bodyTied);
      this.axisFirst = _axisFirst;
      this.axisSecond = _axisSecond;
      this.anchor = _localAnchor;
    }

    //#region Get/Set transfor of fudge properties to the physics engine
    /**
     * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
     *  When changed after initialization the joint needs to be reconnected.
     */
    get axisFirst(): Vector3 {
      return new Vector3(this.#axisFirst.x, this.#axisFirst.y, this.#axisFirst.z);
    }
    set axisFirst(_value: Vector3) {
      this.#axisFirst = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

    /**
    * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
    *  When changed after initialization the joint needs to be reconnected.
    */
    get axisSecond(): Vector3 {
      return new Vector3(this.#axisSecond.x, this.#axisSecond.y, this.#axisSecond.z);
    }
    set axisSecond(_value: Vector3) {
      this.#axisSecond = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The maximum angle of rotation along the first axis. Value needs to be positive. Changes do rebuild the joint
     */
    get maxAngleFirstAxis(): number {
      return this.#maxAngleFirst * 180 / Math.PI;
    }
    set maxAngleFirstAxis(_value: number) {
      this.#maxAngleFirst = _value * Math.PI / 180;
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The maximum angle of rotation along the second axis. Value needs to be positive. Changes do rebuild the joint
     */
    get maxAngleSecondAxis(): number {
      return this.#maxAngleSecond * 180 / Math.PI;
    }
    set maxAngleSecondAxis(_value: number) {
      this.#maxAngleSecond = _value * Math.PI / 180;
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
      if (this.joint != null) this.joint.getTwistSpringDamper().dampingRatio = _value;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    get springFrequencyTwist(): number {
      return this.#springFrequencyTwist;
    }
    set springFrequencyTwist(_value: number) {
      this.#springFrequencyTwist = _value;
      if (this.joint != null) this.joint.getTwistSpringDamper().frequency = _value;
    }

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    get springDampingSwing(): number {
      return this.#springDampingSwing;
    }
    set springDampingSwing(_value: number) {
      this.#springDampingSwing = _value;
      if (this.joint != null) this.joint.getSwingSpringDamper().dampingRatio = _value;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    get springFrequencySwing(): number {
      return this.#springFrequencySwing;
    }
    set springFrequencySwing(_value: number) {
      this.#springFrequencySwing = _value;
      if (this.joint != null) this.joint.getSwingSpringDamper().frequency = _value;
    }




    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
     */
    get maxMotorTwist(): number {
      return this.#maxMotorTwist * 180 / Math.PI;
    }
    set maxMotorTwist(_value: number) {
      _value *= Math.PI / 180;
      this.#maxMotorTwist = _value;
      if (this.joint != null) this.joint.getTwistLimitMotor().upperLimit = _value;
    }
    /**
     * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
     */
    get minMotorTwist(): number {
      return this.#minMotorTwist * 180 / Math.PI;
    }
    set minMotorTwist(_value: number) {
      _value *= Math.PI / 180;
      this.#minMotorTwist = _value;
      if (this.joint != null) this.joint.getTwistLimitMotor().lowerLimit = _value;
    }
    /**
      * The target rotational speed of the motor in m/s. 
     */
    get motorSpeedTwist(): number {
      return this.#motorSpeedTwist;
    }
    set motorSpeedTwist(_value: number) {
      this.#motorSpeedTwist = _value;
      if (this.joint != null) this.joint.getTwistLimitMotor().motorSpeed = _value;
    }
    /**
      * The maximum motor torque in Newton. force <= 0 equals disabled. 
     */
    get motorTorqueTwist(): number {
      return this.#motorTorqueTwist;
    }
    set motorTorqueTwist(_value: number) {
      this.#motorTorqueTwist = _value;
      if (this.joint != null) this.joint.getTwistLimitMotor().motorTorque = _value;
    }

    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
     */

    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = this.#getMutator();
      serialization.axisFirst = this.axisFirst.serialize();
      serialization.axisSecond = this.axisSecond.serialize();
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await this.axisFirst.deserialize(_serialization.axisFirst);
      await this.axisSecond.deserialize(_serialization.axisSecond);
      this.#mutate(_serialization);
      super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      this.axisFirst = new Vector3(...<number[]>(Object.values(_mutator.axisFirst)));
      this.axisSecond = new Vector3(...<number[]>(Object.values(_mutator.axisSecond)));
      delete _mutator.axisFirst;
      delete _mutator.axisSecond;
      this.#mutate(_mutator);
      this.deleteFromMutator(_mutator, this.#getMutator());
      super.mutate(_mutator);
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator();
      Object.assign(mutator, this.#getMutator());
      mutator.axisFirst = this.axisFirst.getMutator();
      mutator.axisSecond = this.axisSecond.getMutator();
      return mutator;
    }

    #getMutator = (): Mutator => {
      let mutator: Mutator = {
        maxAngleFirst: this.#maxAngleFirst,
        maxAngleSecond: this.#maxAngleSecond,
        springDampingTwist: this.springDampingTwist,
        springFrequencyTwist: this.springFrequencyTwist,
        springDampingSwing: this.springDampingSwing,
        springFrequencySwing: this.springFrequencySwing,
        maxMotorTwist: this.#maxMotorTwist,
        minMotorTwist: this.#minMotorTwist,
        motorSpeedTwist: this.motorSpeedTwist,
        motorTorqueTwist: this.motorTorqueTwist
      };
      return mutator;
    }

    #mutate = (_mutator: Mutator): void => {
      this.#maxAngleFirst = _mutator.maxAngleFirst;
      this.#maxAngleSecond = _mutator.maxAngleSecond;
      this.springDampingTwist = _mutator.springDampingTwist;
      this.springFrequencyTwist = _mutator.springFrequencyTwist;
      this.springDampingSwing = _mutator.springDampingSwing;
      this.springFrequencySwing = _mutator.springFrequencySwing;
      this.maxMotorTwist = _mutator.maxMotorTwist;
      this.minMotorTwist = _mutator.minMotorTwist;
      this.motorSpeedTwist = _mutator.motorSpeedTwist;
      this.motorTorqueTwist = _mutator.motorTorqueTwist;
    }
    //#endregion

    protected constructJoint(): void {
      this.#springDamperTwist = new OIMO.SpringDamper().setSpring(this.springFrequencyTwist, this.springDampingTwist);
      this.#springDamperSwing = new OIMO.SpringDamper().setSpring(this.springFrequencySwing, this.springDampingSwing);

      this.#motorTwist = new OIMO.RotationalLimitMotor().setLimits(this.minMotorTwist, this.maxMotorTwist);
      this.#motorTwist.setMotor(this.motorSpeedTwist, this.motorTorqueTwist);

      this.config = new OIMO.RagdollJointConfig();
      super.constructJoint(this.axisFirst, this.axisSecond);
      this.config.swingSpringDamper = this.#springDamperSwing;
      this.config.twistSpringDamper = this.#springDamperTwist;
      this.config.twistLimitMotor = this.#motorTwist;
      this.config.maxSwingAngle1 = this.#maxAngleFirst;
      this.config.maxSwingAngle2 = this.#maxAngleSecond;

      this.joint = new OIMO.RagdollJoint(this.config);
      super.configureJoint();
    }
  }
}