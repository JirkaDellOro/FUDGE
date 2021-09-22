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




    constructor(_attachedRigidbody: ComponentRigidbody = null, _connectedRigidbody: ComponentRigidbody = null, _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_attachedRigidbody, _connectedRigidbody);
      this.jointAnchor = new OIMO.Vec3(_localAnchor.x, _localAnchor.y, _localAnchor.z);

      /*Tell the physics that there is a new joint and on the physics start the actual joint is first created. Values can be set but the
       actual constraint ain't existent until the game starts
     */
      this.addEventListener(EVENT.COMPONENT_ADD, this.dirtyStatus);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.removeJoint);
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




    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
     */

    //#endregion

    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = {
        springDamping: this.jointSpringDampingRatio,
        springFrequency: this.jointSpringFrequency,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.anchor = _serialization.anchor != null ? _serialization.anchor : this.jointAnchor;
      this.internalCollision = _serialization.internalCollision != null ? _serialization.internalCollision : false;
      this.springDamping = _serialization.springDamping != null ? _serialization.springDamping : this.jointSpringDampingRatio;
      this.springFrequency = _serialization.springFrequency != null ? _serialization.springFrequency : this.jointSpringFrequency;
      this.breakForce = _serialization.breakForce != null ? _serialization.breakForce : this.jointBreakForce;
      this.breakTorque = _serialization.breakTorque != null ? _serialization.breakTorque : this.jointBreakTorque;
      super.deserialize(_serialization);
      return this;
    }
    //#endregion

    protected constructJoint(): void {
      this.springDamper = new OIMO.SpringDamper().setSpring(this.jointSpringFrequency, this.jointSpringDampingRatio);
      this.config = new OIMO.SphericalJointConfig();
      let attachedRBPos: Vector3 = this.attachedRigidbody.node.mtxWorld.translation;
      let worldAnchor: OIMO.Vec3 = new OIMO.Vec3(attachedRBPos.x + this.jointAnchor.x, attachedRBPos.y + this.jointAnchor.y, attachedRBPos.z + this.jointAnchor.z);
      this.config.init(this.attachedRB.getOimoRigidbody(), this.connectedRB.getOimoRigidbody(), worldAnchor);
      this.config.springDamper = this.springDamper;

      var j: OIMO.SphericalJoint = new OIMO.SphericalJoint(this.config);
      j.setBreakForce(this.breakForce);
      j.setBreakTorque(this.breakTorque);
      j.setAllowCollision(this.jointInternalCollision);

      this.oimoJoint = j;
    }
  }
}