namespace FudgeCore {
  /**
     * A physical connection between two bodies with a defined axe movement.
     * Used to create a sliding joint along one axis. Two RigidBodies need to be defined to use it.
     * A motor can be defined to move the connected along the defined axis. Great to construct standard springs or physical sliders.
     * 
     * ```plaintext
     *          JointHolder - bodyAnchor
     *                    ┌───┐
     *                    │   │
     *           <────────│   │──────> tied body, sliding on one Axis, 1 Degree of Freedom
     *                    │   │
     *                    └───┘
     * ```
     * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
     */
  export class JointPrismatic extends JointAxial {
    public static readonly iSubclass: number = Joint.registerSubclass(JointPrismatic);

    #motorForce: number = 0;

    protected joint: OIMO.PrismaticJoint;
    protected config: OIMO.PrismaticJointConfig = new OIMO.PrismaticJointConfig();
    protected motor: OIMO.TranslationalLimitMotor;
    //Internally used variables - Joint Properties that are used even when no actual joint is currently existend

    /** Creating a prismatic joint between two ComponentRigidbodies only moving on one axis bound on a local anchorpoint. */
    constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null, _axis: Vector3 = new Vector3(0, 1, 0), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_bodyAnchor, _bodyTied, _axis, _localAnchor);

      this.maxMotor = 10;
      this.minMotor = -10;
    }
    //#region Get/Set transfor of fudge properties to the physics engine
    /**
      * The maximum motor force in Newton. force <= 0 equals disabled. This is the force that the motor is using to hold the position, or reach it if a motorSpeed is defined.
     */
    public get motorForce(): number {
      return this.#motorForce;
    }
    public set motorForce(_value: number) {
      this.#motorForce = _value;
      if (this.joint != null) this.joint.getLimitMotor().motorForce = _value;
    }
    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = {
        motorForce: this.motorForce,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.motorForce = _serialization.motorForce;
      super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator();
      mutator.motorForce = this.motorForce;
      return mutator;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      if (typeof (_mutator.motorForce) !== "undefined")
        this.motorForce = _mutator.motorForce;
      delete _mutator.motorForce;
      super.mutate(_mutator);
    }
    //#endregion

    /** Actual creation of a joint in the OimoPhysics system */
    protected constructJoint(): void {
      this.motor = new OIMO.TranslationalLimitMotor().setLimits(this.minMotor, this.maxMotor); //Create motor settings, to hold positions, set constraint min/max
      this.motor.setMotor(this.motorSpeed, this.motorForce);

      this.config = new OIMO.PrismaticJointConfig(); //Create a specific config for this joint type that is calculating the local axis for both bodies
      super.constructJoint();

      this.config.springDamper = this.springDamper; //Telling the config to use the motor/spring of the FUDGE Component
      this.config.limitMotor = this.motor;

      this.joint = new OIMO.PrismaticJoint(this.config);
      this.configureJoint();
    }
  }
}