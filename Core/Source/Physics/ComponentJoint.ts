namespace FudgeCore {
  /**
     * Acts as the physical representation of a connection between two [[Node]]'s.
     * The type of conncetion is defined by the subclasses like prismatic joint, cylinder joint etc.
     * A Rigidbody on the [[Node]] that this component is added to is needed. Setting the connectedRigidbody and
     * initializing the connection creates a physical connection between them. This differs from a connection through hierarchy
     * in the node structure of fudge. Joints can have different DOF's (Degrees Of Freedom), 1 Axis = 1 Degree. 
     * @authors Marko Fehrenbach, HFU, 2020
     */
  export abstract class ComponentJoint extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentJoint);

    get attachedRigidbody(): ComponentRigidbody {
      return this.attachedRB;
    }
    set attachedRigidbody(_cmpRB: ComponentRigidbody) {
      this.connected = false;
      this.attachedRB = _cmpRB;
    }
    get connectedRigidbody(): ComponentRigidbody {
      return this.connectedRB;
    }
    set connectedRigidbody(_cmpRB: ComponentRigidbody) {
      this.connected = false;
      this.connectedRB = _cmpRB;
    }

    get selfCollision(): boolean {
      return this.collisionBetweenConnectedBodies;
    }
    set selfCollision(_value: boolean) {
      this.collisionBetweenConnectedBodies = _value;
    }

    protected attachedRB: ComponentRigidbody;
    protected connectedRB: ComponentRigidbody;

    protected connected: boolean = false;

    private collisionBetweenConnectedBodies: boolean;

    constructor(_attachedRigidbody: ComponentRigidbody = null, _connectedRigidbody: ComponentRigidbody = null) {
      super();
      this.attachedRigidbody = _attachedRigidbody;
      this.connectedRigidbody = _connectedRigidbody;
    }

    public checkConnection(): boolean {
      return this.connected; //check if connection is dirty, so when either rb is changed disconnect and reconnect
    }

    public abstract connect(): void; //Connect when both bodies are set, and it was not connected yet, or if any of the bodies is changed

    public abstract disconnect(): void; //When the ComponentJoint is removed, or before every connection, if connected

    public abstract getOimoJoint(): OIMO.Joint;

    protected addConstraintToWorld(cmpJoint: ComponentJoint): void {
      Physics.world.addJoint(cmpJoint);
    }

    protected removeConstraintFromWorld(cmpJoint: ComponentJoint): void {
      Physics.world.removeJoint(cmpJoint);
    }

  }

}