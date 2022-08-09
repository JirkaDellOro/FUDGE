
namespace FudgeCore {
  /**
   * A physical connection between two bodies with a defined axe of translation and rotation. Two Degrees of Freedom in the defined axis.
   * Two RigidBodies need to be defined to use it. A motor can be defined for rotation and translation, along with spring settings.
   * 
   * ```plaintext
   *          JointHolder - bodyAnchor
   *                    ┌───┐
   *                    │   │
   *           <────────│   │──────> tied body, sliding on axis = 1st degree of freedom
   *                    │   │        rotating around axis = 2nd degree of freedom 
   *                    └───┘
   * ```  
   * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class JointCylindrical extends JointAxial {
    public static readonly iSubclass: number = Joint.registerSubclass(JointCylindrical);
    #springDampingRotation: number = 0;
    #springFrequencyRotation: number = 0;

    #motorForce: number = 0;

    #maxRotor: number = 360;
    #minRotor: number = 0;
    #rotorTorque: number = 0;
    #rotorSpeed: number = 0;

    #rotor: OIMO.RotationalLimitMotor;
    #rotorSpringDamper: OIMO.SpringDamper;

    protected joint: OIMO.CylindricalJoint;
    protected config: OIMO.CylindricalJointConfig = new OIMO.CylindricalJointConfig();
    protected motor: OIMO.TranslationalLimitMotor;


    /** Creating a cylindrical joint between two ComponentRigidbodies moving on one axis and rotating around another bound on a local anchorpoint. */
    constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null, _axis: Vector3 = new Vector3(0, 1, 0), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_bodyAnchor, _bodyTied, _axis, _localAnchor);
    }

    //#region Get/Set transfor of fudge properties to the physics engine

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    public set springDamping(_value: number) {
      super.springDamping = _value;
      if (this.joint != null) this.joint.getTranslationalSpringDamper().dampingRatio = _value;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    public set springFrequency(_value: number) {
      super.springFrequency = _value;
      if (this.joint != null) this.joint.getTranslationalSpringDamper().frequency = _value;
    }

    /**
    * The damping of the spring. 1 equals completly damped. Influencing TORQUE / ROTATION
    */
    get springDampingRotation(): number {
      return this.#springDampingRotation;
    }
    set springDampingRotation(_value: number) {
      this.#springDampingRotation = _value;
      if (this.joint != null) this.joint.getRotationalSpringDamper().dampingRatio = _value;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. Influencing TORQUE / ROTATION
    */
    get springFrequencyRotation(): number {
      return this.#springFrequencyRotation;
    }
    set springFrequencyRotation(_value: number) {
      this.#springFrequencyRotation = _value;
      if (this.joint != null) this.joint.getRotationalSpringDamper().frequency = _value;
    }


    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
     */
    get maxRotor(): number {
      return this.#maxRotor;
    }
    set maxRotor(_value: number) {
      this.#maxRotor = _value;
      if (this.joint != null) this.joint.getRotationalLimitMotor().upperLimit = _value * Calc.deg2rad;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
     */
    get minRotor(): number {
      return this.#minRotor;
    }
    set minRotor(_value: number) {
      this.#minRotor = _value;
      if (this.joint != null) this.joint.getRotationalLimitMotor().lowerLimit = _value * Calc.deg2rad;
    }
    /**
      * The target rotational speed of the motor in m/s. 
     */
    get rotorSpeed(): number {
      return this.#rotorSpeed;
    }
    set rotorSpeed(_value: number) {
      this.#rotorSpeed = _value;
      if (this.joint != null) this.joint.getRotationalLimitMotor().motorSpeed = _value;
    }
    /**
      * The maximum motor torque in Newton. force <= 0 equals disabled. 
     */
    get rotorTorque(): number {
      return this.#rotorTorque;
    }
    set rotorTorque(_value: number) {
      this.#rotorTorque = _value;
      if (this.joint != null) this.joint.getRotationalLimitMotor().motorTorque = _value;
    }

    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. 
     */
    public set maxMotor(_value: number) {
      super.maxMotor = _value;
      if (this.joint != null)
        this.joint.getTranslationalLimitMotor().upperLimit = _value;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. 
     */
    public set minMotor(_value: number) {
      super.minMotor = _value;
      if (this.joint != null)
        this.joint.getTranslationalLimitMotor().lowerLimit = _value;
    }

    public set motorSpeed(_value: number) {
      super.motorSpeed = _value;
      if (this.joint != null)
        this.joint.getTranslationalLimitMotor().motorSpeed = _value;
    }
    /**
      * The maximum motor force in Newton. force <= 0 equals disabled. 
     */
    get motorForce(): number {
      return this.#motorForce;
    }
    set motorForce(_value: number) {
      this.#motorForce = _value;
      if (this.joint != null) this.joint.getTranslationalLimitMotor().motorForce = _value;
    }

    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = this.#getMutator();
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.#mutate(_serialization);
      super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      this.#mutate(_mutator);
      this.deleteFromMutator(_mutator, this.#getMutator());
      super.mutate(_mutator);
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator();
      Object.assign(mutator, this.#getMutator());
      return mutator;
    }

    #getMutator = (): Mutator => {
      let mutator: Mutator = {
        motorForce: this.motorForce,
        springDampingRotation: this.springDampingRotation,
        springFrequencyRotation: this.springFrequencyRotation,
        maxRotor: this.maxRotor,
        minRotor: this.minRotor,
        rotorTorque: this.rotorTorque,
        rotorSpeed: this.rotorSpeed
      };
      return mutator;
    }

    #mutate = (_mutator: Mutator): void => {
      this.mutateBase(_mutator, ["motorForce", "rotorTorque", "rotorSpeed", "maxRotor", "minRotor", "springDampingRotation", "springFrequencyRotation", "springFrequency"]);
    }
    //#endregion

    protected constructJoint(): void {
      this.#rotorSpringDamper = new OIMO.SpringDamper().setSpring(this.springFrequencyRotation, this.springDampingRotation);

      this.motor = new OIMO.TranslationalLimitMotor().setLimits(super.minMotor, super.maxMotor);
      this.motor.setMotor(super.motorSpeed, this.motorForce);
      this.#rotor = new OIMO.RotationalLimitMotor().setLimits(this.minRotor * Calc.deg2rad, this.maxRotor * Calc.deg2rad);
      this.#rotor.setMotor(this.rotorSpeed, this.rotorTorque);

      this.config = new OIMO.CylindricalJointConfig();
      super.constructJoint();

      this.config.translationalSpringDamper = this.springDamper;
      this.config.translationalLimitMotor = this.motor;
      this.config.rotationalLimitMotor = this.#rotor;
      this.config.rotationalSpringDamper = this.#rotorSpringDamper;

      this.joint = new OIMO.CylindricalJoint(this.config);
      this.configureJoint();
    }
  }
}