namespace FudgeCore {
  /**
     * A physical connection between two bodies with a defined axe of rotation. Also known as HINGE joint.
     * Two RigidBodies need to be defined to use it. A motor can be defined to rotate the connected along the defined axis.
     * 
     * ```plaintext        
     *                  rotation axis, 1st Degree of freedom
     *                    ↑
     *               ┌───┐│┌────┐     
     *               │   │││    │  
     *               │   │││    │ 
     *               │   │││    │ 
     *               └───┘│└────┘
     *                    │   
     *      bodyAnchor         bodyTied
     *   (e.g. Doorhinge)       (e.g. Door)
     * ```
     * @author Marko Fehrenbach, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
     */
  export class JointRevolute extends JointAxial {
    public static readonly iSubclass: number = Joint.registerSubclass(JointRevolute);

    #motorTorque: number = 0;
    #rotor: OIMO.RotationalLimitMotor;

    protected joint: OIMO.RevoluteJoint;
    protected config: OIMO.RevoluteJointConfig = new OIMO.RevoluteJointConfig();


    constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null, _axis: Vector3 = new Vector3(0, 1, 0), _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_bodyAnchor, _bodyTied, _axis, _localAnchor);

      this.maxMotor = 360;
      this.minMotor = 0;
    }

    /**
      * The Upper Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis-Angle measured in Degree.
     */
    public set maxMotor(_value: number) {
      super.maxMotor = _value;
      _value *= Calc.deg2rad;
      if (this.joint)
        this.joint.getLimitMotor().upperLimit = _value;
    }
    /**
      * The Lower Limit of movement along the axis of this joint. The limiter is disable if lowerLimit > upperLimit. Axis Angle measured in Degree.
     */
    public set minMotor(_value: number) {
      super.minMotor = _value;
      if (this.joint)
        this.joint.getLimitMotor().lowerLimit = _value * Calc.deg2rad;
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
      this.motorTorque = _serialization.motorTorque;
      super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator();
      mutator.motorTorque = this.motorTorque;
      return mutator;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      if (typeof (_mutator.motorTorque) !== "undefined")
        this.motorTorque = _mutator.motorTorque;
      delete _mutator.motorTorque;
      super.mutate(_mutator);
    }
    //#endregion

    protected constructJoint(): void {
      this.#rotor = new OIMO.RotationalLimitMotor().setLimits(super.minMotor * Calc.deg2rad, super.maxMotor * Calc.deg2rad);
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