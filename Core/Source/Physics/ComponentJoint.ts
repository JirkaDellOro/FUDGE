namespace FudgeCore {
  /**
     * Acts as the physical representation of a connection between two {@link Node}'s.
     * The type of conncetion is defined by the subclasses like prismatic joint, cylinder joint etc.
     * A Rigidbody on the {@link Node} that this component is added to is needed. Setting the connectedRigidbody and
     * initializing the connection creates a physical connection between them. This differs from a connection through hierarchy
     * in the node structure of fudge. Joints can have different DOF's (Degrees Of Freedom), 1 Axis that can either twist or swing is a degree of freedom.
     * A joint typically consists of a motor that limits movement/rotation or is activly trying to move to a limit. And a spring which defines the rigidity.
     * @author Marko Fehrenbach, HFU 2020
     */
  export abstract class ComponentJoint extends Component {
    // public static readonly iSubclass: number = Component.registerSubclass(ComponentJoint);
    protected singleton: boolean = false; //Multiple joints can be attached to one Node

    protected idAttachedRB: number = 0;
    protected idConnectedRB: number = 0;

    protected attachedRB: ComponentRigidbody;
    protected connectedRB: ComponentRigidbody;

    protected abstract oimoJoint: OIMO.Joint;
    protected connected: boolean = false;
    protected jointAnchor: OIMO.Vec3;
    protected jointInternalCollision: boolean;

    protected jointBreakForce: number = 0;
    protected jointBreakTorque: number = 0;

    private collisionBetweenConnectedBodies: boolean;


    /** Create a joint connection between the two given RigidbodyComponents. */
    public constructor(_attachedRigidbody: ComponentRigidbody = null, _connectedRigidbody: ComponentRigidbody = null) {
      super();
      this.attachedRigidbody = _attachedRigidbody;
      this.connectedRigidbody = _connectedRigidbody;
    }

    /** Get/Set the first ComponentRigidbody of this connection. It should always be the one that this component is attached too in the sceneTree. */
    public get attachedRigidbody(): ComponentRigidbody {
      return this.attachedRB;
    }
    public set attachedRigidbody(_cmpRB: ComponentRigidbody) {
      this.idAttachedRB = _cmpRB != null ? _cmpRB.id : 0;
      this.attachedRB = _cmpRB;
      this.disconnect();
      this.dirtyStatus();
    }

    /** Get/Set the second ComponentRigidbody of this connection. */
    public get connectedRigidbody(): ComponentRigidbody {
      return this.connectedRB;
    }
    public set connectedRigidbody(_cmpRB: ComponentRigidbody) {
      this.idConnectedRB = _cmpRB != null ? _cmpRB.id : 0;
      this.connectedRB = _cmpRB;
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The exact position where the two {@link Node}s are connected. When changed after initialization the joint needs to be reconnected.
     */
    public get anchor(): Vector3 {
      return new Vector3(this.jointAnchor.x, this.jointAnchor.y, this.jointAnchor.z);
    }
    public set anchor(_value: Vector3) {
      this.jointAnchor = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

    /** Get/Set if the two bodies collide with each other or only with the world but not with themselves. Default = no internal collision.
     *  In most cases it's prefered to declare a minimum and maximum angle/length the bodies can move from one another instead of having them collide.
     */
    public get selfCollision(): boolean {
      return this.collisionBetweenConnectedBodies;
    }
    public set selfCollision(_value: boolean) {
      this.collisionBetweenConnectedBodies = _value;
    }

    /**
     * The amount of force needed to break the JOINT, while rotating, in Newton. 0 equals unbreakable (default) 
    */
    public get breakTorque(): number {
      return this.jointBreakTorque;
    }
    public set breakTorque(_value: number) {
      this.jointBreakTorque = _value;
      if (this.oimoJoint != null) this.oimoJoint.setBreakTorque(this.jointBreakTorque);
    }

    /**
     * The amount of force needed to break the JOINT, in Newton. 0 equals unbreakable (default) 
     */
    public get breakForce(): number {
      return this.jointBreakForce;
    }
    public set breakForce(_value: number) {
      this.jointBreakForce = _value;
      if (this.oimoJoint != null) this.oimoJoint.setBreakForce(this.jointBreakForce);
    }

    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
      * On a welding joint the connected bodies should not be colliding with each other,
      * for best results
     */
    public get internalCollision(): boolean {
      return this.jointInternalCollision;
    }
    public set internalCollision(_value: boolean) {
      this.jointInternalCollision = _value;
      if (this.oimoJoint != null) this.oimoJoint.setAllowCollision(this.jointInternalCollision);
    }

    /** Check if connection is dirty, so when either rb is changed disconnect and reconnect. Internally used no user interaction needed. */
    public checkConnection(): boolean {
      return this.connected;
    }

    /**
     * Initializing and connecting the two rigidbodies with the configured joint properties
     * is automatically called by the physics system. No user interaction needed.
     */
    public connect(): void {
      if (this.connected == false) {
        this.constructJoint();
        this.connected = true;
        this.addJoint();
      }
    }

    /**
     * Disconnecting the two rigidbodies and removing them from the physics system,
     * is automatically called by the physics system. No user interaction needed.
     */
    public disconnect(): void {
      if (this.connected == true) {
        this.removeJoint();
        this.connected = false;
      }
    }

    /**
     * Returns the original Joint used by the physics engine. Used internally no user interaction needed.
     * Only to be used when functionality that is not added within Fudge is needed.
    */
    public getOimoJoint(): OIMO.Joint {
      return this.oimoJoint;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    public serialize(): Serialization {
      let serialization: Serialization = {
        anchor: this.anchor,
        internalCollision: this.jointInternalCollision,
        breakForce: this.jointBreakForce,
        breakTorque: this.jointBreakTorque,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }


    /** Tell the FudgePhysics system that this joint needs to be handled in the next frame. */
    protected dirtyStatus(): void {
      Physics.world.changeJointStatus(this);
    }

    protected addJoint(): void {
      Physics.world.addJoint(this);
    }

    protected removeJoint(): void {
      Physics.world.removeJoint(this);
    }

    protected abstract constructJoint(): void;


    /** Setting both bodies to the bodies that belong to the loaded IDs and reconnecting them */
    // protected setBodiesFromLoadedIDs(): void {
    //   Debug.log("Set From: " + this.idAttachedRB + " / " + this.idConnectedRB);
    //   this.attachedRigidbody = Physics.world.getBodyByID(this.idAttachedRB);
    //   this.connectedRigidbody = Physics.world.getBodyByID(this.idConnectedRB);
    // }
  }
}