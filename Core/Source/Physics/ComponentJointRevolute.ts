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

    #motorTorque: number = 0;
    #rotor: OIMO.RotationalLimitMotor;

    protected joint: OIMO.RevoluteJoint;
    protected config: OIMO.RevoluteJointConfig = new OIMO.RevoluteJointConfig();


    constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null, _axis: Vector3 = new Vector3(0, 1, 0), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_bodyAnchor, _bodyTied, _axis, _localAnchor);

      this.motorLimitUpper = 360;
      this.motorLimitLower = 0;
    }

    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
     */
    public set motorLimitUpper(_value: number) {
      super.motorLimitUpper = _value;
      _value *= Math.PI / 180;
      if (this.joint)
        this.joint.getLimitMotor().upperLimit = _value;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
     */
    public set motorLimitLower(_value: number) {
      super.motorLimitLower = _value;
      if (this.joint)
        this.joint.getLimitMotor().lowerLimit = _value * Math.PI / 180;
    }

    /**
      * The maximum motor force in Newton. force <= 0 equals disabled. 
     */
    get motorTorque(): number {
      return this.#motorTorque;
    }
    set motorTorque(_value: number) {
      this.#motorTorque = _value;
      if (this.joint != null) this.joint.getLimitMotor().motorTorque = _value;
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
      super.deserialize(_serialization[super.constructor.name]);
      return this;
    }
    //#endregion

    protected constructJoint(): void {
      this.#rotor = new OIMO.RotationalLimitMotor().setLimits(super.motorLimitLower * Math.PI / 180, super.motorLimitUpper * Math.PI / 180);
      this.#rotor.setMotor(this.motorSpeed, this.motorTorque);

      this.config = new OIMO.RevoluteJointConfig();
      super.constructJoint();

      this.config.springDamper = this.springDamper;
      this.config.limitMotor = this.#rotor;

      this.joint = new OIMO.RevoluteJoint(this.config);
      this.configureJoint();
    }
  }
}