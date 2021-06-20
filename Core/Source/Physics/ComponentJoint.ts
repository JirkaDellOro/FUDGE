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
    public static readonly iSubclass: number = Component.registerSubclass(ComponentJoint);
    protected singleton = false; //Multiple joints can be attached to one Node

    /** Get/Set the first ComponentRigidbody of this connection. It should always be the one that this component is attached too in the sceneTree. */
    get attachedRigidbody(): ComponentRigidbody {
      return this.attachedRB;
    }
    set attachedRigidbody(_cmpRB: ComponentRigidbody) {
      this.idAttachedRB = _cmpRB != null ? _cmpRB.id : 0;
      this.attachedRB = _cmpRB;
      this.disconnect();
      this.dirtyStatus();
    }

    /** Get/Set the second ComponentRigidbody of this connection. */
    get connectedRigidbody(): ComponentRigidbody {
      return this.connectedRB;
    }
    set connectedRigidbody(_cmpRB: ComponentRigidbody) {
      this.idConnectedRB = _cmpRB != null ? _cmpRB.id : 0;
      this.connectedRB = _cmpRB;
      this.disconnect();
      this.dirtyStatus();
    }

    /** Get/Set if the two bodies collide with each other or only with the world but not with themselves. Default = no internal collision.
     *  In most cases it's prefered to declare a minimum and maximum angle/length the bodies can move from one another instead of having them collide.
     */
    get selfCollision(): boolean {
      return this.collisionBetweenConnectedBodies;
    }
    set selfCollision(_value: boolean) {
      this.collisionBetweenConnectedBodies = _value;
    }

    protected idAttachedRB: number = 0;
    protected idConnectedRB: number = 0;

    protected attachedRB: ComponentRigidbody;
    protected connectedRB: ComponentRigidbody;

    protected connected: boolean = false;
    private collisionBetweenConnectedBodies: boolean;

    /** Create a joint connection between the two given RigidbodyComponents. */
    constructor(_attachedRigidbody: ComponentRigidbody = null, _connectedRigidbody: ComponentRigidbody = null) {
      super();
      this.attachedRigidbody = _attachedRigidbody;
      this.connectedRigidbody = _connectedRigidbody;
    }

    /** Check if connection is dirty, so when either rb is changed disconnect and reconnect. Internally used no user interaction needed. */
    public checkConnection(): boolean {
      return this.connected;
    }

    /** Connect when both bodies are set, and it was not connected yet, or if any of the bodies has changed. This needs to be handled this way to ensure there are no errors
     * in the simulation because a ComponentRigidbody was not yet fully created or any other piece like ComponentTransform is missing. But values are also remembered correctly.
     */
    public abstract connect(): void;

    /** Disconnect on any changes to the two bodies, so they can potentially reconnect if the component is not removed.
    */
    public abstract disconnect(): void;

    /** Get the actual joint in form of the physics engine OimoPhysics.joint. Used to expand functionality, normally no user interaction needed. */
    public abstract getOimoJoint(): OIMO.Joint;

    /** Tell the FudgePhysics system that this joint needs to be handled in the next frame. */
    protected abstract dirtyStatus(): void

    /** Adding the given Fudge ComponentJoint to the oimoPhysics World */
    protected addConstraintToWorld(cmpJoint: ComponentJoint): void {
      Physics.world.addJoint(cmpJoint);
    }

    /** Removing the given Fudge ComponentJoint to the oimoPhysics World */
    protected removeConstraintFromWorld(cmpJoint: ComponentJoint): void {
      Physics.world.removeJoint(cmpJoint);
    }


    /** Setting both bodies to the bodies that belong to the loaded IDs and reconnecting them */
    protected setBodiesFromLoadedIDs() {
      Debug.log("Set From: " + this.idAttachedRB + " / " + this.idConnectedRB);
      this.attachedRigidbody = Physics.world.getBodyByID(this.idAttachedRB);
      this.connectedRigidbody = Physics.world.getBodyByID(this.idConnectedRB);
    }

    /** Deserialize Base Class Information - Component, since Typescript does not give the ability to call super.super */
    protected baseDeserialize(_serialization: Serialization): Serializable {
      super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    /** Serialize Base Class Information - Component, since Typescript does not give the ability to call super.super in Child classes of e.g. ComponentJointPrismatic */
    protected baseSerialize(): Serialization {
      let serialization: Serialization;
      serialization = super.serialize();
      return serialization;
    }

  }

}