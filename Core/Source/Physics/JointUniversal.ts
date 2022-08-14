namespace FudgeCore {
  /**
     * A physical connection between two bodies with two defined axis (normally e.g. (0,0,1) and rotation(1,0,0)), they share the same anchor and have free rotation, but transfer the twist.
     * In reality used in cars to transfer the more stable stationary force on the velocity axis to the bumping, damped moving wheel. Two RigidBodies need to be defined to use it.
     * The two motors can be defined for the two rotation axis, along with springs. 
     * ```plaintext        
     *                  
     *                      anchor - twist is transfered between bodies
     *         z                   |
     *         ↑            -----  |  ------------
     *         |           |     | ↓ |            | 
     *  -x <---|---> x     |     | x |            |           e.g. wheel can still turn up/down, 
     *         |           |     |   |            |           left right but transfering it's rotation on to the wheel-axis.
     *         ↓            -----     ------------
     *        -z    
     *                 attachedRB          connectedRB
     *                (e.g. wheel)       (e.g. wheel-axis)
     * ```
   * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
     */
  export class JointUniversal extends Joint {
    public static readonly iSubclass: number = Joint.registerSubclass(JointUniversal);

    #springDampingFirst: number = 0;
    #springFrequencyFirst: number = 0;

    #springDampingSecond: number = 0;
    #springFrequencySecond: number = 0;

    #maxRotorFirst: number = 360;
    #minRotorFirst: number = 0;
    #rotorTorqueFirst: number = 0;
    #rotorSpeedFirst: number = 0;

    #maxRotorSecond: number = 360;
    #minRotorSecond: number = 0;
    #rotorTorqueSecond: number = 0;
    #rotorSpeedSecond: number = 0;

    #motorFirst: OIMO.RotationalLimitMotor;
    #motorSecond: OIMO.RotationalLimitMotor;
    #axisSpringDamperFirst: OIMO.SpringDamper;
    #axisSpringDamperSecond: OIMO.SpringDamper;
    #axisFirst: OIMO.Vec3;
    #axisSecond: OIMO.Vec3;

    protected joint: OIMO.UniversalJoint;
    protected config: OIMO.UniversalJointConfig = new OIMO.UniversalJointConfig();

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
     * The damping of the spring. 1 equals completly damped.
     */
    get springDampingFirst(): number {
      return this.#springDampingFirst;
    }
    set springDampingFirst(_value: number) {
      this.#springDampingFirst = _value;
      if (this.joint != null) this.joint.getSpringDamper1().dampingRatio = _value;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    get springFrequencyFirst(): number {
      return this.#springFrequencyFirst;
    }
    set springFrequencyFirst(_value: number) {
      this.#springFrequencyFirst = _value;
      if (this.joint != null) this.joint.getSpringDamper1().frequency = _value;
    }

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    get springDampingSecond(): number {
      return this.#springDampingSecond;
    }
    set springDampingSecond(_value: number) {
      this.#springDampingSecond = _value;
      if (this.joint != null) this.joint.getSpringDamper2().dampingRatio = _value;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    get springFrequencySecond(): number {
      return this.#springFrequencySecond;
    }
    set springFrequencySecond(_value: number) {
      this.#springFrequencySecond = _value;
      if (this.joint != null) this.joint.getSpringDamper2().frequency = _value;
    }




    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
     */
    get maxRotorFirst(): number {
      return this.#maxRotorFirst;
    }
    set maxRotorFirst(_value: number) {
      this.#maxRotorFirst = _value;
      if (this.joint != null) this.joint.getLimitMotor1().upperLimit = _value * Calc.deg2rad;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
     */
    get minRotorFirst(): number {
      return this.#minRotorFirst;
    }
    set minRotorFirst(_value: number) {
      this.#minRotorFirst = _value;
      if (this.joint != null) this.joint.getLimitMotor1().lowerLimit = _value * Calc.deg2rad;
    }
    /**
      * The target rotational speed of the motor in m/s. 
     */
    get rotorSpeedFirst(): number {
      return this.#rotorSpeedFirst;
    }
    set rotorSpeedFirst(_value: number) {
      this.#rotorSpeedFirst = _value;
      if (this.joint != null) this.joint.getLimitMotor1().motorSpeed = _value;
    }
    /**
      * The maximum motor torque in Newton. force <= 0 equals disabled. 
     */
    get rotorTorqueFirst(): number {
      return this.#rotorTorqueFirst;
    }
    set rotorTorqueFirst(_value: number) {
      this.#rotorTorqueFirst = _value;
      if (this.joint != null) this.joint.getLimitMotor1().motorTorque = _value;
    }

    /**
    * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
   */
    get maxRotorSecond(): number {
      return this.#maxRotorSecond;
    }
    set maxRotorSecond(_value: number) {
      this.#maxRotorSecond = _value;
      if (this.joint != null) this.joint.getLimitMotor2().upperLimit = _value * Calc.deg2rad;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
     */
    get minRotorSecond(): number {
      return this.#minRotorSecond;
    }
    set minRotorSecond(_value: number) {
      this.#minRotorSecond = _value;
      if (this.joint != null) this.joint.getLimitMotor2().lowerLimit = _value * Calc.deg2rad;
    }
    /**
      * The target rotational speed of the motor in m/s. 
     */
    get rotorSpeedSecond(): number {
      return this.#rotorSpeedSecond;
    }
    set rotorSpeedSecond(_value: number) {
      this.#rotorSpeedSecond = _value;
      if (this.joint != null) this.joint.getLimitMotor2().motorSpeed = _value;
    }
    /**
      * The maximum motor torque in Newton. force <= 0 equals disabled. 
     */
    get rotorTorqueSecond(): number {
      return this.#rotorTorqueSecond;
    }
    set rotorTorqueSecond(_value: number) {
      this.#rotorTorqueSecond = _value;
      if (this.joint != null) this.joint.getLimitMotor2().motorTorque = _value;
    }

    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
     */

    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = this.#getMutator();
      serialization.firstAxis = this.axisFirst.serialize();
      serialization.secondAxis = this.axisSecond.serialize();
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.axisFirst = await new Vector3().deserialize(_serialization.axisFirst);
      this.axisSecond = await new Vector3().deserialize(_serialization.axisSecond);
      this.#mutate(_serialization);
      super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      if (typeof (_mutator.axisFirst) !== "undefined")
        this.axisFirst = new Vector3(...<number[]>(Object.values(_mutator.axisFirst)));
      if (typeof (_mutator.axisSecond) !== "undefined")
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
        springDampingFirst: this.#springDampingFirst,
        springFrequencyFirst: this.#springFrequencyFirst,
        springDampingSecond: this.#springDampingSecond,
        springFrequencySecond: this.#springFrequencySecond,
        maxRotorFirst: this.#maxRotorFirst,
        minRotorFirst: this.#minRotorFirst,
        rotorSpeedFirst: this.#rotorSpeedFirst,
        rotorTorqueFirst: this.#rotorTorqueFirst,
        maxRotorSecond: this.#maxRotorSecond,
        minRotorSecond: this.#minRotorSecond,
        rotorSpeedSecond: this.#rotorSpeedSecond,
        rotorTorqueSecond: this.#rotorTorqueSecond
      };
      return mutator;
    }

    #mutate = (_mutator: Mutator): void => {
      this.mutateBase(_mutator, [
        "springDampingFirst", "springFrequencyFirst", "springDampingSecond", "springFrequencySecond",
        "maxRotorFirst", "minRotorFirst", "rotorSpeedFirst", "rotorTorqueFirst",
        "maxRotorSecond", "minRotorSecond", "rotorSpeedSecond", ".rotorTorqueSecond"]
      );
    }
    //#endregion

    protected constructJoint(): void {
      this.#axisSpringDamperFirst = new OIMO.SpringDamper().setSpring(this.#springFrequencyFirst, this.#springDampingFirst);
      this.#axisSpringDamperSecond = new OIMO.SpringDamper().setSpring(this.#springFrequencySecond, this.#springDampingSecond);

      this.#motorFirst = new OIMO.RotationalLimitMotor().setLimits(this.#minRotorFirst * Calc.deg2rad, this.#maxRotorFirst * Calc.deg2rad);
      this.#motorFirst.setMotor(this.#rotorSpeedFirst, this.#rotorTorqueFirst);
      this.#motorSecond = new OIMO.RotationalLimitMotor().setLimits(this.#minRotorFirst * Calc.deg2rad, this.#maxRotorFirst * Calc.deg2rad);
      this.#motorSecond.setMotor(this.#rotorSpeedFirst, this.#rotorTorqueFirst);

      this.config = new OIMO.UniversalJointConfig();
      super.constructJoint(this.#axisFirst, this.#axisSecond);
      this.config.limitMotor1 = this.#motorFirst;
      this.config.limitMotor2 = this.#motorSecond;
      this.config.springDamper1 = this.#axisSpringDamperFirst;
      this.config.springDamper2 = this.#axisSpringDamperSecond;

      this.joint = new OIMO.UniversalJoint(this.config);
      super.configureJoint();
    }
  }
}