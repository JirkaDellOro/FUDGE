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

    #springDamping: number = 0;
    #springFrequency: number = 0;
    #springDamper: OIMO.SpringDamper;
    
    protected joint: OIMO.SphericalJoint;
    protected config: OIMO.SphericalJointConfig = new OIMO.SphericalJointConfig();



    constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null, _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_bodyAnchor, _bodyTied);
      this.anchor = new Vector3(_localAnchor.x, _localAnchor.y, _localAnchor.z);
    }

    //#region Get/Set transfor of fudge properties to the physics engine

    /**
     * The damping of the spring. 1 equals completly damped.
     */
    get springDamping(): number {
      return this.#springDamping;
    }
    set springDamping(_value: number) {
      this.#springDamping = _value;
      if (this.joint != null) this.joint.getSpringDamper().dampingRatio = _value;
    }

    /**
     * The frequency of the spring in Hz. At 0 the spring is rigid, equals no spring. The smaller the value the less restrictive is the spring.
    */
    get springFrequency(): number {
      return this.#springFrequency;
    }
    set springFrequency(_value: number) {
      this.#springFrequency = _value;
      if (this.joint != null) this.joint.getSpringDamper().frequency = _value;
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
      this.springDamping = _serialization.springDamping || this.springDamping;
      this.springFrequency = _serialization.springFrequency || this.springFrequency;
      super.deserialize(_serialization);
      return this;
    }
    //#endregion

    protected constructJoint(): void {
      this.#springDamper = new OIMO.SpringDamper().setSpring(this.springFrequency, this.springDamping);
      this.config = new OIMO.SphericalJointConfig();
      super.constructJoint();
      this.config.springDamper = this.#springDamper;

      this.joint = new OIMO.SphericalJoint(this.config);
      super.configureJoint();
    }
  }
}