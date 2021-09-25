namespace FudgeCore {
  /**
     * A physical connection between two bodies with three Degrees of Freedom, also known as ball and socket joint. Two bodies connected at their anchor but free to rotate.
     * Used for things like the connection of bones in the human shoulder (if simplified, else better use JointRagdoll). Two RigidBodies need to be defined to use it. Only spring settings can be defined.
     * 3 Degrees are swing horizontal, swing vertical and twist.
     * 
     * ```plaintext
     *              JointHolder - attachedRigidbody (e.g. Human-Shoulder)
     *         z                             -------
     *      y  ↑                            |      |
     *        \|            ----------------|      |
     *  -x <---|---> x     |                |      |
     *         |\           ----------------|      |
     *         ↓ -y       conntectedRb      |      |
     *        -z         (e.g. Upper-Arm)    -------
     * ```
     * @authors Marko Fehrenbach, HFU, 2020
     */
  export class ComponentJointSpherical extends ComponentJoint {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentJointSpherical);

    protected oimoJoint: OIMO.SphericalJoint;

    private jointSpringDampingRatio: number = 0;
    private jointSpringFrequency: number = 0;

    private config: OIMO.SphericalJointConfig = new OIMO.SphericalJointConfig();
    private springDamper: OIMO.SpringDamper;

    constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null, _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_bodyAnchor, _bodyTied);
      this.anchor = new Vector3(_localAnchor.x, _localAnchor.y, _localAnchor.z);
    }

    //#region Get/Set transfor of fudge properties to the physics engine

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    get springDamping(): number {
      return this.jointSpringDampingRatio;
    }
    set springDamping(_value: number) {
      this.jointSpringDampingRatio = _value;
      if (this.oimoJoint != null) this.oimoJoint.getSpringDamper().dampingRatio = this.jointSpringDampingRatio;
    }

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
    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = {
        springDamping: this.springDamping,
        springFrequency: this.springFrequency,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.springDamping = _serialization.springDamping || this.jointSpringDampingRatio;
      this.springFrequency = _serialization.springFrequency || this.jointSpringFrequency;
      super.deserialize(_serialization);
      return this;
    }
    //#endregion

    protected constructJoint(): void {
      this.springDamper = new OIMO.SpringDamper().setSpring(this.jointSpringFrequency, this.jointSpringDampingRatio);
      this.config = new OIMO.SphericalJointConfig();
      super.constructJoint();
      this.config.springDamper = this.springDamper;

      this.oimoJoint = new OIMO.SphericalJoint(this.config);
      super.configureJoint();
    }
  }
}