namespace FudgeCore {
  /**
     * A physical connection between two bodies with a defined axe of rotation. Also known as HINGE joint.
     * Two RigidBodies need to be defined to use it. A motor can be defined to rotate the connected along the defined axis.
     * 
     * ```plaintext        
     *                  rotation axis, 1st Degree of freedom
     *                    ↑
     *              ---   |   ------------
     *             |   |  |  |            | 
     *             |   |  |  |            | 
     *             |   |  |  |            | 
     *              ---   |   ------------
     *      attachedRB    ↓    connectedRB
     *   (e.g. Doorhinge)       (e.g. Door)
     * ```
     * @author Marko Fehrenbach, HFU, 2020
     */
  export class ComponentJointRevolute extends ComponentJointAxial {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentJointRevolute);

    protected oimoJoint: OIMO.RevoluteJoint;
    protected config: OIMO.RevoluteJointConfig = new OIMO.RevoluteJointConfig();
    
    private jointmotorTorque: number = 0;
    private rotationalMotor: OIMO.RotationalLimitMotor;

    constructor(_attachedRigidbody: ComponentRigidbody = null, _connectedRigidbody: ComponentRigidbody = null, _axis: Vector3 = new Vector3(0, 1, 0), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_attachedRigidbody, _connectedRigidbody);
      this.jointAxis = new OIMO.Vec3(_axis.x, _axis.y, _axis.z);
      this.jointAnchor = new OIMO.Vec3(_localAnchor.x, _localAnchor.y, _localAnchor.z);

      this.jointMotorLimitUpper = 360;
      this.jointMotorLimitLower = 0;
      /*Tell the physics that there is a new joint and on the physics start the actual joint is first created. Values can be set but the
       actual constraint ain't existent until the game starts
     */
      this.addEventListener(EVENT.COMPONENT_ADD, this.dirtyStatus);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.removeJoint);
    }
    
    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
     */
   public get motorLimitUpper(): number {
      return this.jointMotorLimitUpper * 180 / Math.PI;
    }
    public  set motorLimitUpper(_value: number) {
      this.jointMotorLimitUpper = _value * Math.PI / 180;
      if (this.oimoJoint != null) this.oimoJoint.getLimitMotor().upperLimit = this.jointMotorLimitUpper;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
     */
     public  get motorLimitLower(): number {
      return this.jointMotorLimitLower * 180 / Math.PI;
    }
    public  set motorLimitLower(_value: number) {
      this.jointMotorLimitLower = _value * Math.PI / 180;
      if (this.oimoJoint != null) this.oimoJoint.getLimitMotor().lowerLimit = this.jointMotorLimitLower;
    }

    /**
      * The maximum motor force in Newton. force <= 0 equals disabled. 
     */
    get motorTorque(): number {
      return this.jointmotorTorque;
    }
    set motorTorque(_value: number) {
      this.jointmotorTorque = _value;
      if (this.oimoJoint != null) this.oimoJoint.getLimitMotor().motorTorque = this.jointmotorTorque;
    }

    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
     */

    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = {
        motorTorque: this.jointmotorTorque,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.motorTorque = _serialization.motorForce || this.jointmotorTorque;
      super.deserialize(_serialization);
      return this;
    }
    //#endregion

    protected constructJoint(): void {
      this.rotationalMotor = new OIMO.RotationalLimitMotor().setLimits(this.jointMotorLimitLower, this.jointMotorLimitUpper);
      this.rotationalMotor.setMotor(this.jointMotorSpeed, this.jointmotorTorque);

      this.config = new OIMO.RevoluteJointConfig();
      super.constructJoint();
      
      this.config.springDamper = this.springDamper;
      this.config.limitMotor = this.rotationalMotor;

      this.oimoJoint = new OIMO.RevoluteJoint(this.config);
      this.configureJoint();
    }
  }
}