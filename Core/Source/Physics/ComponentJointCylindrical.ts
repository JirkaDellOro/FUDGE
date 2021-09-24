///<reference path="ComponentJointAxial.ts"/>
namespace FudgeCore {
  /**
     * A physical connection between two bodies with a defined axe of rotation and rotation. Two Degrees of Freedom in the defined axis.
     * Two RigidBodies need to be defined to use it. A motor can be defined for rotation and translation, along with spring settings.
     * 
     * ```plaintext
     *          JointHolder - attachedRigidbody
     *                    ----------  ↑
     *                    |        |  |
     *          <---------|        |--------------> connectedRigidbody, sliding on one Axis, 1st Degree of Freedom
     *                    |        |  |   
     *                    ----------  ↓ rotating on one Axis, 2nd Degree of Freedom   
     * ```
     * 
     * @author Marko Fehrenbach, HFU 2020
   */
  export class ComponentJointCylindrical extends ComponentJointAxial {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentJointCylindrical);
    protected oimoJoint: OIMO.CylindricalJoint;
    protected config: OIMO.CylindricalJointConfig = new OIMO.CylindricalJointConfig();

    //Internal Variables
    private jointMotorForce: number = 0;

    private jointRotationMotorLimitUpper: number = 360;
    private jointRotationMotorLimitLower: number = 0;
    private jointRotationMotorTorque: number = 0;
    private jointRotationMotorSpeed: number = 0;

    private rotationalMotor: OIMO.RotationalLimitMotor;
    private rotationSpringDamper: OIMO.SpringDamper;

    /** Creating a cylindrical joint between two ComponentRigidbodies moving on one axis and rotating around another bound on a local anchorpoint. */
    constructor(_attachedRigidbody: ComponentRigidbody = null, _connectedRigidbody: ComponentRigidbody = null, _axis: Vector3 = new Vector3(0, 1, 0), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_attachedRigidbody, _connectedRigidbody);
      this.jointAxis = new OIMO.Vec3(_axis.x, _axis.y, _axis.z);
      this.jointAnchor = new OIMO.Vec3(_localAnchor.x, _localAnchor.y, _localAnchor.z);
    }

    //#region Get/Set transfor of fudge properties to the physics engine

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    public set springDamping(_value: number) {
      this.jointSpringDampingRatio = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTranslationalSpringDamper().dampingRatio = this.jointSpringDampingRatio;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    public set springFrequency(_value: number) {
      this.jointSpringFrequency = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTranslationalSpringDamper().frequency = this.jointSpringFrequency;
    }

    /**
    * The damping of the spring. 1 equals completly damped. Influencing TORQUE / ROTATION
    */
    get rotationSpringDamping(): number {
      return this.jointRotationSpringDampingRatio;
    }
    set rotationSpringDamping(_value: number) {
      this.jointRotationSpringDampingRatio = _value;
      if (this.oimoJoint != null) this.oimoJoint.getRotationalSpringDamper().dampingRatio = this.jointRotationSpringDampingRatio;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. Influencing TORQUE / ROTATION
    */
    get rotationSpringFrequency(): number {
      return this.jointRotationSpringFrequency;
    }
    set rotationSpringFrequency(_value: number) {
      this.jointRotationSpringFrequency = _value;
      if (this.oimoJoint != null) this.oimoJoint.getRotationalSpringDamper().frequency = this.jointRotationSpringFrequency;
    }


    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
     */
    get rotationalMotorLimitUpper(): number {
      return this.jointRotationMotorLimitUpper * 180 / Math.PI;
    }
    set rotationalMotorLimitUpper(_value: number) {
      this.jointRotationMotorLimitUpper = _value * Math.PI / 180;
      if (this.oimoJoint != null) this.oimoJoint.getRotationalLimitMotor().upperLimit = this.jointRotationMotorLimitUpper;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
     */
    get rotationalMotorLimitLower(): number {
      return this.jointRotationMotorLimitLower * 180 / Math.PI;
    }
    set rotationalMotorLimitLower(_value: number) {
      this.jointRotationMotorLimitLower = _value * Math.PI / 180;
      if (this.oimoJoint != null) this.oimoJoint.getRotationalLimitMotor().lowerLimit = this.jointRotationMotorLimitLower;
    }
    /**
      * The target rotational speed of the motor in m/s. 
     */
    get rotationalMotorSpeed(): number {
      return this.jointRotationMotorSpeed;
    }
    set rotationalMotorSpeed(_value: number) {
      this.jointRotationMotorSpeed = _value;
      if (this.oimoJoint != null) this.oimoJoint.getRotationalLimitMotor().motorSpeed = this.jointRotationMotorSpeed;
    }
    /**
      * The maximum motor torque in Newton. force <= 0 equals disabled. 
     */
    get motorTorque(): number {
      return this.jointRotationMotorTorque;
    }
    set motorTorque(_value: number) {
      this.jointRotationMotorTorque = _value;
      if (this.oimoJoint != null) this.oimoJoint.getRotationalLimitMotor().motorTorque = this.jointRotationMotorTorque;
    }

    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. 
     */
    public get motorLimitUpper(): number {
      return this.jointMotorLimitUpper;
    }
    public set motorLimitUpper(_value: number) {
      this.jointMotorLimitUpper = _value;
      if (this.oimoJoint != null)
        this.oimoJoint.getTranslationalLimitMotor().upperLimit = this.jointMotorLimitUpper;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. 
     */
    public get motorLimitLower(): number {
      return this.jointMotorLimitLower;
    }
    public set motorLimitLower(_value: number) {
      this.jointMotorLimitLower = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTranslationalLimitMotor().lowerLimit = this.jointMotorLimitLower;
    }

    public set motorSpeed(_value: number) {
      this.jointMotorSpeed = _value;
      if (this.oimoJoint != null)
        this.oimoJoint.getTranslationalLimitMotor().motorSpeed = this.jointMotorSpeed;
    }
    /**
      * The maximum motor force in Newton. force <= 0 equals disabled. 
     */
    get motorForce(): number {
      return this.jointMotorForce;
    }
    set motorForce(_value: number) {
      this.jointMotorForce = _value;
      if (this.oimoJoint != null) this.oimoJoint.getTranslationalLimitMotor().motorForce = this.jointMotorForce;
    }

    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
     */

    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = {
        motorForce: this.motorForce,
        motorTorque: this.motorTorque,
        rotationalMotorSpeed: this.rotationalMotorSpeed,
        rotationalMotorLimitUpper: this.rotationalMotorLimitUpper,
        rotationalMotorLimitLower: this.rotationalMotorLimitLower,
        rotationSpringDamping: this.rotationSpringDamping,
        rotationSpringFrequency: this.rotationSpringFrequency,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.motorForce = _serialization.motorForce || this.motorForce;
      this.motorTorque = _serialization.motorTorque || this.motorTorque;
      this.rotationalMotorSpeed = _serialization.rotationalMotorSpeed || this.rotationalMotorSpeed;
      this.rotationalMotorLimitUpper = _serialization.rotationalMotorLimitUpper || this.rotationalMotorLimitUpper;
      this.rotationalMotorLimitLower = _serialization.rotationalMotorLimitLower || this.rotationalMotorLimitLower;
      this.rotationSpringDamping = _serialization.rotationSpringDamping || this.rotationSpringDamping;
      this.rotationSpringFrequency = _serialization.rotationSpringFrequency || this.rotationSpringFrequency;
      this.springFrequency = _serialization.springFrequency || this.springFrequency;
      super.deserialize(_serialization);
      return this;
    }
    //#endregion

    protected constructJoint(): void {
      this.rotationSpringDamper = new OIMO.SpringDamper().setSpring(this.rotationSpringFrequency, this.rotationSpringDamping);

      this.translationMotor = new OIMO.TranslationalLimitMotor().setLimits(this.motorLimitLower, this.motorLimitUpper);
      this.translationMotor.setMotor(this.motorSpeed, this.motorForce);
      this.rotationalMotor = new OIMO.RotationalLimitMotor().setLimits(this.rotationalMotorLimitLower, this.rotationalMotorLimitUpper);
      this.rotationalMotor.setMotor(this.rotationalMotorSpeed, this.motorTorque);

      this.config = new OIMO.CylindricalJointConfig();
      super.constructJoint();

      this.config.translationalSpringDamper = this.springDamper;
      this.config.translationalLimitMotor = this.translationMotor;
      this.config.rotationalLimitMotor = this.rotationalMotor;
      this.config.rotationalSpringDamper = this.rotationSpringDamper;

      this.oimoJoint = new OIMO.CylindricalJoint(this.config);
      this.configureJoint();
    }
  }
}