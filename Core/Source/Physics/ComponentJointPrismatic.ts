///<reference path="ComponentJointAxial.ts"/>
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
    //Internally used variables - Joint Properties that are used even when no actual oimoJoint is currently existend
    private jointSpringDampingRatio: number = 0;
    private jointSpringFrequency: number = 0;

    private jointMotorLimitUpper: number = 10;
    private jointMotorLimitLower: number = -10;
    private jointMotorForce: number = 0;
    private jointMotorSpeed: number = 0;

    private config: OIMO.PrismaticJointConfig = new OIMO.PrismaticJointConfig();
    private translationalMotor: OIMO.TranslationalLimitMotor;
    private springDamper: OIMO.SpringDamper;
    private jointAxis: OIMO.Vec3;


    /** Creating a prismatic joint between two ComponentRigidbodies only moving on one axis bound on a local anchorpoint. */
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
    //#region Get/Set transfor of fudge properties to the physics engine

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
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
     */
    get motorLimitUpper(): number {
      return this.jointMotorLimitUpper;
    }
    set motorLimitUpper(_value: number) {
      this.jointMotorLimitUpper = _value;
      if (this.oimoJoint != null) this.oimoJoint.getLimitMotor().upperLimit = this.jointMotorLimitUpper;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit.
     */
    get motorLimitLower(): number {
      return this.jointMotorLimitLower;
    }
    set motorLimitLower(_value: number) {
      this.jointMotorLimitLower = _value;
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
      * The maximum motor force in Newton. force <= 0 equals disabled. This is the force that the motor is using to hold the position, or reach it if a motorSpeed is defined.
     */
    get motorForce(): number {
      return this.jointMotorForce;
    }
    set motorForce(_value: number) {
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
        axis: this.axis,
        springDamping: this.jointSpringDampingRatio,
        springFrequency: this.jointSpringFrequency,
        motorLimitUpper: this.jointMotorLimitUpper,
        motorLimitLower: this.jointMotorLimitLower,
        motorSpeed: this.jointMotorSpeed,
        motorForce: this.jointMotorForce,
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
      this.motorLimitUpper = _serialization.motorLimitUpper != null ? _serialization.motorLimitUpper : this.jointMotorLimitUpper;
      this.motorLimitLower = _serialization.motorLimitLower != null ? _serialization.motorLimitLower : this.jointMotorLimitLower;
      this.motorSpeed = _serialization.motorSpeed != null ? _serialization.motorSpeed : this.jointMotorSpeed;
      this.motorForce = _serialization.motorForce != null ? _serialization.motorForce : this.jointMotorForce;
      super.deserialize(_serialization); //Super, Super, Component != ComponentJoint
      return this;
    }
    //#endregion

    /** Actual creation of a joint in the OimoPhysics system */
    protected constructJoint(): void {
      this.springDamper = new OIMO.SpringDamper().setSpring(this.jointSpringFrequency, this.jointSpringDampingRatio); //Create spring settings, either as a spring or totally rigid
      this.translationalMotor = new OIMO.TranslationalLimitMotor().setLimits(this.jointMotorLimitLower, this.jointMotorLimitUpper); //Create motor settings, to hold positions, set constraint min/max
      this.translationalMotor.setMotor(this.jointMotorSpeed, this.jointMotorForce);
      this.config = new OIMO.PrismaticJointConfig(); //Create a specific config for this joint type that is calculating the local axis for both bodies
      let attachedRBPos: Vector3 = this.attachedRigidbody.node.mtxWorld.translation; //Setting the anchor position locally from the first rigidbody
      let worldAnchor: OIMO.Vec3 = new OIMO.Vec3(attachedRBPos.x + this.jointAnchor.x, attachedRBPos.y + this.jointAnchor.y, attachedRBPos.z + this.jointAnchor.z);
      this.config.init(this.attachedRB.getOimoRigidbody(), this.connectedRB.getOimoRigidbody(), worldAnchor, this.jointAxis); //Initialize the config to calculate the local axis/anchors for the OimoPhysics Engine
      this.config.springDamper = this.springDamper; //Telling the config to use the motor/spring of the Fudge Component
      this.config.limitMotor = this.translationalMotor;
      var j: OIMO.PrismaticJoint = new OIMO.PrismaticJoint(this.config); //Creating the specific type of joint
      j.setBreakForce(this.breakForce); //Set additional infos, if the joint is unbreakable and colliding internally
      j.setBreakTorque(this.breakTorque);
      j.setAllowCollision(this.jointInternalCollision);
      this.oimoJoint = j; //Tell the Fudge Component which joint in the OimoPhysics system it represents
    }
  }
}