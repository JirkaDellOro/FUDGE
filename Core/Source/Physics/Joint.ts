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
  export abstract class Joint extends Component {
    /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
    public static readonly baseClass: typeof Joint = Joint;
    /** list of all the subclasses derived from this class, if they registered properly*/
    public static readonly subclasses: typeof Joint[] = [];

    #idBodyAnchor: number = 0;
    #idBodyTied: number = 0;
    #bodyAnchor: ComponentRigidbody;
    #bodyTied: ComponentRigidbody;

    #connected: boolean = false;
    #anchor: OIMO.Vec3;
    #internalCollision: boolean = false;

    #breakForce: number = 0;
    #breakTorque: number = 0;

    #nameChildToConnect: string;


    // public static readonly iSubclass: number = Component.registerSubclass(ComponentJoint);
    protected singleton: boolean = false; //Multiple joints can be attached to one Node
    protected abstract joint: OIMO.Joint;
    protected abstract config: OIMO.JointConfig;


    /** Create a joint connection between the two given RigidbodyComponents. */
    public constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null) {
      super();
      this.bodyAnchor = _bodyAnchor;
      this.bodyTied = _bodyTied;

      /*
        Tell the physics that there is a new joint and on the physics start the actual joint is first created. Values can be set but the
        actual constraint ain't existent until the game starts
      */
      this.addEventListener(EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.hndEvent);
    }

    protected static registerSubclass(_subclass: typeof Joint): number { return Joint.subclasses.push(_subclass) - 1; }

    /** Get/Set the first ComponentRigidbody of this connection. It should always be the one that this component is attached too in the sceneTree. */
    public get bodyAnchor(): ComponentRigidbody {
      return this.#bodyAnchor;
    }

    public set bodyAnchor(_cmpRB: ComponentRigidbody) {
      this.#idBodyAnchor = _cmpRB != null ? _cmpRB.id : -1;
      this.#bodyAnchor = _cmpRB;
      this.disconnect();
      this.dirtyStatus();
    }

    /** Get/Set the second ComponentRigidbody of this connection. */
    public get bodyTied(): ComponentRigidbody {
      return this.#bodyTied;
    }
    public set bodyTied(_cmpRB: ComponentRigidbody) {
      this.#idBodyTied = _cmpRB != null ? _cmpRB.id : -1;
      this.#bodyTied = _cmpRB;
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The exact position where the two {@link Node}s are connected. When changed after initialization the joint needs to be reconnected.
     */
    public get anchor(): Vector3 {
      return new Vector3(this.#anchor.x, this.#anchor.y, this.#anchor.z);
    }
    public set anchor(_value: Vector3) {
      this.#anchor = new OIMO.Vec3(_value.x, _value.y, _value.z);
      this.disconnect();
      this.dirtyStatus();
    }

    /**
     * The amount of force needed to break the JOINT, while rotating, in Newton. 0 equals unbreakable (default) 
    */
    public get breakTorque(): number {
      return this.#breakTorque;
    }
    public set breakTorque(_value: number) {
      this.#breakTorque = _value;
      if (this.joint != null) this.joint.setBreakTorque(this.#breakTorque);
    }

    /**
     * The amount of force needed to break the JOINT, in Newton. 0 equals unbreakable (default) 
     */
    public get breakForce(): number {
      return this.#breakForce;
    }
    public set breakForce(_value: number) {
      this.#breakForce = _value;
      if (this.joint != null) this.joint.setBreakForce(this.#breakForce);
    }

    /**
      * If the two connected RigidBodies collide with eath other. (Default = false)
      * On a welding joint the connected bodies should not be colliding with each other,
      * for best results
     */
    public get internalCollision(): boolean {
      return this.#internalCollision;
    }
    public set internalCollision(_value: boolean) {
      this.#internalCollision = _value;
      if (this.joint != null) this.joint.setAllowCollision(this.#internalCollision);
    }

    public connectChild(_name: string): void {
      this.#nameChildToConnect = _name;
      if (!this.node)
        return;

      let children: Node[] = this.node.getChildrenByName(_name);
      if (children.length == 1)
        this.connectNode(children.pop());
      else
        Debug.warn(`${this.constructor.name} at ${this.node.name} fails to connect child with non existent or ambigous name ${_name}`);
    }

    public connectNode(_node: Node): void {
      if (!_node || !this.node)
        return;

      Debug.fudge(`${this.constructor.name} connected ${this.node.name} and ${_node.name}`);

      let connectBody: ComponentRigidbody = _node.getComponent(ComponentRigidbody);
      let thisBody: ComponentRigidbody = this.node.getComponent(ComponentRigidbody);

      if (!connectBody || !thisBody) {
        Debug.warn(`${this.constructor.name} at ${this.node.name} fails due to missing rigidbodies on ${this.node.name} or ${_node.name}`);
        return;
      }

      this.bodyAnchor = thisBody;
      this.bodyTied = connectBody;
    }

    /** Check if connection is dirty, so when either rb is changed disconnect and reconnect. Internally used no user interaction needed. */
    public isConnected(): boolean {
      return this.#connected;
    }

    /**
     * Initializing and connecting the two rigidbodies with the configured joint properties
     * is automatically called by the physics system. No user interaction needed.
     */
    public connect(): void {
      if (this.#connected == false) {
        if (this.#idBodyAnchor == -1 || this.#idBodyTied == -1) {
          if (this.#nameChildToConnect)
            this.connectChild(this.#nameChildToConnect);
          return;
        }

        this.constructJoint();
        this.#connected = true;
        this.addJoint();
      }
    }

    /**
     * Disconnecting the two rigidbodies and removing them from the physics system,
     * is automatically called by the physics system. No user interaction needed.
     */
    public disconnect(): void {
      if (this.#connected == true) {
        this.removeJoint();
        this.#connected = false;
      }
    }

    /**
     * Returns the original Joint used by the physics engine. Used internally no user interaction needed.
     * Only to be used when functionality that is not added within FUDGE is needed.
    */
    public getOimoJoint(): OIMO.Joint {
      return this.joint;
    }

    public serialize(): Serialization {
      let serialization: Serialization = this.#getMutator();
      serialization.anchor = this.anchor.serialize();
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.anchor = await new Vector3().deserialize(_serialization.anchor);
      this.#mutate(_serialization);
      await super.deserialize(_serialization[super.constructor.name]);
      this.connectChild(_serialization.nameChildToConnect);
      return this;
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator(true);
      Object.assign(mutator, this.#getMutator());
      mutator.anchor = this.anchor.getMutator();
      return mutator;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      if (typeof (_mutator.anchor) !== "undefined")
        this.anchor = new Vector3(...<number[]>(Object.values(_mutator.anchor)));
      delete _mutator.anchor;
      if (typeof (_mutator.nameChildToConnect) !== "undefined")
        this.connectChild(_mutator.nameChildToConnect);
      this.#mutate(_mutator);
      this.deleteFromMutator(_mutator, this.#getMutator());
      super.mutate(_mutator);
    }

    #getMutator = (): Mutator => {
      let mutator: Mutator = {
        nameChildToConnect: this.#nameChildToConnect,
        internalCollision: this.#internalCollision,
        breakForce: this.#breakForce,
        breakTorque: this.#breakTorque
      };
      return mutator;
    }

    #mutate = (_mutator: Mutator): void => {
      this.mutateBase(_mutator, ["internalCollision", "breakForce", "breakTorque"]);
    }

    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.springDamper;
      delete _mutator.joint;
      delete _mutator.motor;
      super.reduceMutator(_mutator);
    }

    /** Tell the FudgePhysics system that this joint needs to be handled in the next frame. */
    protected dirtyStatus(): void {
      Physics.changeJointStatus(this);
    }

    protected addJoint(): void {
      Physics.addJoint(this);
    }

    protected removeJoint(): void {
      Physics.removeJoint(this);
    }

    protected constructJoint(..._configParams: Object[]): void {
      let posBodyAnchor: Vector3 = this.bodyAnchor.node.mtxWorld.translation; //Setting the anchor position locally from the first rigidbody
      let worldAnchor: OIMO.Vec3 = new OIMO.Vec3(posBodyAnchor.x + this.#anchor.x, posBodyAnchor.y + this.#anchor.y, posBodyAnchor.z + this.#anchor.z);

      // @ts-ignore    // unfortunately, method init is not a member of the base class OIMO.JointConfig
      this.config.init(this.#bodyAnchor.getOimoRigidbody(), this.#bodyTied.getOimoRigidbody(), worldAnchor, ..._configParams);
    }

    protected configureJoint(): void {
      this.joint.setBreakForce(this.breakForce);
      this.joint.setBreakTorque(this.breakTorque);
      this.joint.setAllowCollision(this.#internalCollision);
    }

    protected deleteFromMutator(_mutator: Mutator, _delete: Mutator): void {
      for (let key in _delete)
        delete _mutator[key];
    }

    private hndEvent = (_event: Event) => {
      switch (_event.type) {
        case EVENT.COMPONENT_ADD:
          this.node.addEventListener(EVENT.DISCONNECT_JOINT, () => { this.disconnect(); this.dirtyStatus(); }, true);
          this.dirtyStatus();
          break;
        case EVENT.COMPONENT_REMOVE:
          this.node.removeEventListener(EVENT.DISCONNECT_JOINT, () => { this.disconnect(); this.dirtyStatus(); }, true);
          this.removeJoint();
          break;
      }
    }
  }
}