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

    constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null, _axis: Vector3 = new Vector3(0, 1, 0), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_bodyAnchor, _bodyTied);
      this.jointAxis = new OIMO.Vec3(_axis.x, _axis.y, _axis.z);
      this.anchor = new Vector3(_localAnchor.x, _localAnchor.y, _localAnchor.z);

      this.motorLimitUpper = 360;
      this.motorLimitLower = 0;
    }
    
    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
     */
   public get motorLimitUpper(): number {
      return super.motorLimitUpper * 180 / Math.PI;
    }
    public  set motorLimitUpper(_value: number) {
      _value *= Math.PI / 180;
      super.motorLimitUpper = _value;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
     */
     public  get motorLimitLower(): number {
      return super.motorLimitLower * 180 / Math.PI;
    }
    public  set motorLimitLower(_value: number) {
      _value *= Math.PI / 180;
      super.motorLimitLower = _value;
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
        motorTorque: this.motorTorque,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.motorTorque = _serialization.motorTorque || this.motorTorque;
      super.deserialize(_serialization);
      return this;
    }
    //#endregion

    protected constructJoint(): void {
      this.rotationalMotor = new OIMO.RotationalLimitMotor().setLimits(this.motorLimitLower, this.motorLimitUpper);
      this.rotationalMotor.setMotor(this.motorSpeed, this.jointmotorTorque);

      this.config = new OIMO.RevoluteJointConfig();
      super.constructJoint();
      
      this.config.springDamper = this.springDamper;
      this.config.limitMotor = this.rotationalMotor;

      this.oimoJoint = new OIMO.RevoluteJoint(this.config);
      this.configureJoint();
    }
  }
}