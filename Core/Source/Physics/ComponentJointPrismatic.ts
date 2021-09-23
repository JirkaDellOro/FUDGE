namespace FudgeCore {
  /**
     * A physical connection between two bodies with a defined axe movement.
     * Used to create a sliding joint along one axis. Two RigidBodies need to be defined to use it.
     * A motor can be defined to move the connected along the defined axis. Great to construct standard springs or physical sliders.
     * 
     * ```plaintext
     *          JointHolder - attachedRigidbody
     *                    --------
     *                    |      |
     *          <---------|      |--------------> connectedRigidbody, sliding on one Axis, 1 Degree of Freedom
     *                    |      |
     *                    --------
     * ```
     * @author Marko Fehrenbach, HFU 2020
     */
  export class ComponentJointPrismatic extends ComponentJointAxial {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentJointPrismatic);

    protected oimoJoint: OIMO.PrismaticJoint;
    protected config: OIMO.PrismaticJointConfig = new OIMO.PrismaticJointConfig();
    //Internally used variables - Joint Properties that are used even when no actual oimoJoint is currently existend

    private jointMotorForce: number = 0;

    /** Creating a prismatic joint between two ComponentRigidbodies only moving on one axis bound on a local anchorpoint. */
    constructor(_attachedRigidbody: ComponentRigidbody = null, _connectedRigidbody: ComponentRigidbody = null, _axis: Vector3 = new Vector3(0, 1, 0), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_attachedRigidbody, _connectedRigidbody);
      this.jointAxis = new OIMO.Vec3(_axis.x, _axis.y, _axis.z);
      this.jointAnchor = new OIMO.Vec3(_localAnchor.x, _localAnchor.y, _localAnchor.z);

      this.jointMotorLimitUpper = 10;
      this.jointMotorLimitLower = -10;
      /*Tell the physics that there is a new joint and on the physics start the actual joint is first created. Values can be set but the
        actual constraint ain't existent until the game starts
      */
      this.addEventListener(EVENT.COMPONENT_ADD, this.dirtyStatus);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.removeJoint);
    }
    //#region Get/Set transfor of fudge properties to the physics engine
    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
     */
    public get motorLimitUpper(): number {
      return this.jointMotorLimitUpper;
    }
    public set motorLimitUpper(_value: number) {
      this.jointMotorLimitUpper = _value;
      if (this.oimoJoint != null)
        this.oimoJoint.getLimitMotor().upperLimit = this.jointMotorLimitUpper;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
     */
    public get motorLimitLower(): number {
      return this.jointMotorLimitLower;
    }
    public set motorLimitLower(_value: number) {
      this.jointMotorLimitLower = _value;
      if (this.oimoJoint != null) this.oimoJoint.getLimitMotor().lowerLimit = this.jointMotorLimitLower;
    }
    /**
      * The maximum motor force in Newton. force <= 0 equals disabled. This is the force that the motor is using to hold the position, or reach it if a motorSpeed is defined.
     */
    public get motorForce(): number {
      return this.jointMotorForce;
    }
    public set motorForce(_value: number) {
      this.jointMotorForce = _value;
      if (this.oimoJoint != null) this.oimoJoint.getLimitMotor().motorForce = this.jointMotorForce;
    }

    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
     */

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
      this.motorForce = _serialization.motorForce || this.jointMotorForce;
      super.deserialize(_serialization); //Super, Super, Component != ComponentJoint
      return this;
    }

    public getMutator(): Mutator {
      return super.getMutator();
    }
    //#endregion

    /** Actual creation of a joint in the OimoPhysics system */
    protected constructJoint(): void {
      this.translationMotor = new OIMO.TranslationalLimitMotor().setLimits(this.jointMotorLimitLower, this.jointMotorLimitUpper); //Create motor settings, to hold positions, set constraint min/max
      this.translationMotor.setMotor(this.motorSpeed, this.motorForce);

      this.config = new OIMO.PrismaticJointConfig(); //Create a specific config for this joint type that is calculating the local axis for both bodies
      super.constructJoint();

      this.config.springDamper = this.springDamper; //Telling the config to use the motor/spring of the Fudge Component
      this.config.limitMotor = this.translationMotor;

      this.oimoJoint = new OIMO.PrismaticJoint(this.config);
      this.configureJoint();
    }
  }
}