namespace FudgeCore {
  /**
     * Base class for joints operating with exactly one axis
     * @author Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export abstract class JointAxial extends Joint {

    //Internal Variables

    #maxMotor: number = 10;
    #minMotor: number = -10;
    #motorSpeed: number = 0;
    #axis: OIMO.Vec3;
    #springFrequency: number = 0;
    #springDamping: number = 0;

    protected springDamper: OIMO.SpringDamper;


    /** Creating a cylindrical joint between two ComponentRigidbodies moving on one axis and rotating around another bound on a local anchorpoint. */
    constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null, _axis: Vector3 = new Vector3(0, 1, 0), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_bodyAnchor, _bodyTied);
      this.axis = _axis;
      this.anchor = _localAnchor;
      this.minMotor = -10;
      this.maxMotor = 10;
    }

    //#region Get/Set transfor of fudge properties to the physics engine
    /**
     * The axis connecting the the two {@link Node}s e.g. Vector3(0,1,0) to have a upward connection.
     *  When changed after initialization the joint needs to be reconnected.
     */
    public get axis(): Vector3 {
      return new Vector3(this.#axis.x, this.#axis.y, this.#axis.z);
    }
    public set axis(_value: Vector3) {
      this.#axis = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. 
     */
    public get maxMotor(): number {
      return this.#maxMotor;
    }

    public set maxMotor(_value: number) {
      this.#maxMotor = _value;
      try {
        (<OIMO.PrismaticJoint><unknown>this.joint).getLimitMotor().upperLimit = _value;
      } catch (_e: unknown) { /* */ }
    }

    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
     */
    public get minMotor(): number {
      return this.#minMotor;
    }
    public set minMotor(_value: number) {
      this.#minMotor = _value;
      try {
        (<OIMO.PrismaticJoint><unknown>this.joint).getLimitMotor().lowerLimit = _value;
      } catch (_e: unknown) { /* */ }
    }

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    public get springDamping(): number {
      return this.#springDamping;
    }
    public set springDamping(_value: number) {
      this.#springDamping = _value;
      try {
        (<OIMO.PrismaticJoint><unknown>this.joint).getSpringDamper().dampingRatio = _value;
      } catch (_e: unknown) { /* */ }
    }

    /**
      * The target speed of the motor in m/s.
     */
    public get motorSpeed(): number {
      return this.#motorSpeed;
    }

    public set motorSpeed(_value: number) {
      this.#motorSpeed = _value;
      try {
        (<OIMO.PrismaticJoint>this.joint).getLimitMotor().motorSpeed = _value;
      } catch (_e: unknown) { /* */ }
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    public get springFrequency(): number {
      return this.#springFrequency;
    }
    public set springFrequency(_value: number) {
      this.#springFrequency = _value;
      try {
        (<OIMO.PrismaticJoint>this.joint).getSpringDamper().frequency = _value;
      } catch (_e: unknown) { /* */ }
    }
    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = this.#getMutator();
      serialization.axis = this.axis.serialize();
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.axis = await new Vector3().deserialize(_serialization.axis);
      this.#mutate(_serialization);
      super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      if (typeof (_mutator.axis) !== "undefined")
        this.axis = new Vector3(...<number[]>(Object.values(_mutator.axis)));
      delete _mutator.axis;
      this.#mutate(_mutator);
      this.deleteFromMutator(_mutator, this.#getMutator());
      super.mutate(_mutator);
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator();
      mutator.axis = this.axis.getMutator();
      Object.assign(mutator, this.#getMutator());
      return mutator;
    }

    #getMutator = (): Mutator => {
      let mutator: Mutator = {
        springDamping: this.#springDamping,
        springFrequency: this.#springFrequency,
        maxMotor: this.#maxMotor,
        minMotor: this.#minMotor,
        motorSpeed: this.#motorSpeed
      };
      return mutator;
    }
    #mutate = (_mutator: Mutator): void => {
      this.mutateBase(_mutator, ["springDamping", "springFrequency", "maxMotor", "minMotor", "motorSpeed"]);
    }

    //#endregion

    protected constructJoint(): void {
      this.springDamper = new OIMO.SpringDamper().setSpring(this.#springFrequency, this.#springDamping);
      super.constructJoint(this.#axis);
    }
  }
}