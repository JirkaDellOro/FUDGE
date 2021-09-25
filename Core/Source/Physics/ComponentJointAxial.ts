namespace FudgeCore {
  /**
     * Base class for joints operating with exactly on axis
     * @author Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export abstract class ComponentJointAxial extends ComponentJoint {

    //Internal Variables

    #motorLimitUpper: number = 10;
    #motorLimitLower: number = -10;
    #motorSpeed: number = 0;
    springDamper: OIMO.SpringDamper;
    jointAxis: OIMO.Vec3;
    translationMotor: OIMO.TranslationalLimitMotor;

    protected jointSpringFrequency: number = 0;
    protected jointSpringDampingRatio: number = 0;
    protected abstract config: OIMO.JointConfig;

    /** Creating a cylindrical joint between two ComponentRigidbodies moving on one axis and rotating around another bound on a local anchorpoint. */
    constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null, _axis: Vector3 = new Vector3(0, 1, 0), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_bodyAnchor, _bodyTied);
      this.jointAxis = new OIMO.Vec3(_axis.x, _axis.y, _axis.z);
      this.anchor = new Vector3(_localAnchor.x, _localAnchor.y, _localAnchor.z);
      this.motorLimitLower = -10;
      this.motorLimitUpper = 10;
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
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. 
     */
    public get motorLimitUpper(): number {
      return this.#motorLimitUpper;
    }

    public set motorLimitUpper(_value: number) {
      this.#motorLimitUpper = _value;
      try {
        (<OIMO.PrismaticJoint><unknown>this.oimoJoint).getLimitMotor().upperLimit = _value;
      } catch (_e: unknown) { /* */ }
    }

    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
     */
    public get motorLimitLower(): number {
      return this.#motorLimitLower;
    }
    public set motorLimitLower(_value: number) {
      this.#motorLimitLower = _value;
      try {
        (<OIMO.PrismaticJoint><unknown>this.oimoJoint).getLimitMotor().lowerLimit = _value;
      } catch (_e: unknown) { /* */ }
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
      * The target speed of the motor in m/s.
     */
    public get motorSpeed(): number {
      return this.#motorSpeed;
    }

    public set motorSpeed(_value: number) {
      this.#motorSpeed = _value;
      if (this.oimoJoint != null)
        (<OIMO.PrismaticJoint>this.oimoJoint).getLimitMotor().motorSpeed = this.#motorSpeed;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    public get springFrequency(): number {
      return this.jointSpringFrequency;
    }
    public set springFrequency(_value: number) {
      this.jointSpringFrequency = _value;
      if (this.oimoJoint != null)
        (<OIMO.PrismaticJoint>this.oimoJoint).getSpringDamper().frequency = this.jointSpringFrequency;
    }
    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = {
        axis: this.axis.serialize(),
        springDamping: this.springDamping,
        springFrequency: this.springFrequency,
        motorLimitUpper: this.motorLimitUpper,
        motorLimitLower: this.motorLimitLower,
        motorSpeed: this.motorSpeed,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.axis = await new Vector3().deserialize(_serialization.axis) || this.axis;
      this.springDamping = _serialization.springDamping || this.springDamping;
      this.springFrequency = _serialization.springFrequency || this.springFrequency;
      this.motorLimitUpper = _serialization.motorLimitUpper || this.motorLimitUpper;
      this.motorLimitLower = _serialization.motorLimitLower || this.motorLimitLower;
      this.motorSpeed = _serialization.motorSpeed || this.motorSpeed;
      super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      this.axis = new Vector3(...<number[]>(Object.values(_mutator.axis)));
      delete _mutator.axis;
      super.mutate(_mutator);
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator();
      mutator.axis = this.axis.getMutator();
      mutator.springDamping = this.springDamping;
      mutator.springFrequency = this.springFrequency;
      mutator.motorLimitUpper = this.motorLimitUpper;
      mutator.motorLimitLower = this.motorLimitLower;
      mutator.motorSpeed = this.motorSpeed;
      return mutator;
    }
    //#endregion

    protected constructJoint(): void {
      this.springDamper = new OIMO.SpringDamper().setSpring(this.jointSpringFrequency, this.jointSpringDampingRatio);
      super.constructJoint();
    }
  }
}