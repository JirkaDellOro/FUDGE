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
    protected abstract oimoJoint: OIMO.Joint;


    /** Create a joint connection between the two given RigidbodyComponents. */
    public constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null) {
      super();
      this.bodyAnchor = _bodyAnchor;
      this.bodyTied = _bodyTied;

      /*
        Tell the physics that there is a new joint and on the physics start the actual joint is first created. Values can be set but the
        actual constraint ain't existent until the game starts
      */
      this.addEventListener(EVENT.COMPONENT_ADD, this.dirtyStatus);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.removeJoint);
    }

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
      if (this.oimoJoint != null) this.oimoJoint.setBreakTorque(this.#breakTorque);
    }

    /**
     * The amount of force needed to break the JOINT, in Newton. 0 equals unbreakable (default) 
     */
    public get breakForce(): number {
      return this.#breakForce;
    }
    public set breakForce(_value: number) {
      this.#breakForce = _value;
      if (this.oimoJoint != null) this.oimoJoint.setBreakForce(this.#breakForce);
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
      if (this.oimoJoint != null) this.oimoJoint.setAllowCollision(this.#internalCollision);
    }

    public connectChild(_name: string): void {
      this.#nameChildToConnect = _name;
      let children: Node[] = this.node.getChildrenByName(_name);
      if (children.length != 1)
        Debug.warn(`${this.constructor.name} at ${this.node.name} fails to connect child with non existent or ambigous name ${_name}`);
      this.connectNode(children.pop());
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
        if (this.#idBodyAnchor == -1 || this.#idBodyTied == -1)
          if (this.#nameChildToConnect) {
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
     * Only to be used when functionality that is not added within Fudge is needed.
    */
    public getOimoJoint(): OIMO.Joint {
      return this.oimoJoint;
    }

    public serialize(): Serialization {
      let serialization: Serialization = {
        nameChildToConnect: this.#nameChildToConnect,
        anchor: this.anchor.serialize(),
        internalCollision: this.#internalCollision,
        breakForce: this.#breakForce,
        breakTorque: this.#breakTorque,
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.anchor = await new Vector3().deserialize(_serialization.anchor) || this.anchor;
      this.internalCollision = _serialization.internalCollision || false;
      this.breakForce = _serialization.breakForce || this.breakForce;
      this.breakTorque = _serialization.breakTorque || this.breakTorque;
      await super.deserialize(_serialization[super.constructor.name]);
      this.connectChild(this.#nameChildToConnect);
      return this;
    }

    public getMutator(): Mutator {
      let mutator: Mutator = {};

      mutator.active = this.active;
      mutator.nameChildToConnect = this.#nameChildToConnect;
      mutator.anchor = this.anchor.getMutator();
      mutator.internalCollision = this.#internalCollision;
      mutator.breakForce = this.#breakForce;
      mutator.breakTorque = this.#breakTorque;

      return mutator;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      this.anchor = new Vector3(...<number[]>(Object.values(_mutator.anchor)));
      this.connectChild(_mutator.nameChildToConnect);
      delete _mutator.anchor;
      delete _mutator.nameChildToConnect;
      super.mutate(_mutator);
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

    protected constructJoint(): void {
      let posBodyAnchor: Vector3 = this.bodyAnchor.node.mtxWorld.translation; //Setting the anchor position locally from the first rigidbody
      let worldAnchor: OIMO.Vec3 = new OIMO.Vec3(posBodyAnchor.x + this.#anchor.x, posBodyAnchor.y + this.#anchor.y, posBodyAnchor.z + this.#anchor.z);

      // @ts-ignore
      this.config.init(this.#bodyAnchor.getOimoRigidbody(), this.#bodyTied.getOimoRigidbody(), worldAnchor, this.jointAxis);
    }

    protected configureJoint(): void {
      this.oimoJoint.setBreakForce(this.breakForce);
      this.oimoJoint.setBreakTorque(this.breakTorque);
      this.oimoJoint.setAllowCollision(this.#internalCollision);
    }
  }

  // class PhysicsAccessor<Joint, Value> {
  //   #component: ComponentJoint;
  //   #getter: Function;
  //   #property: string;
  //   #value: Value;
  //   public constructor(_component: ComponentJoint, _getter: Function, _property: string ) {
  //     this.#component = _component;
  //     this.#getter = _getter;
  //     this.#property = _property;
  //   }

  //   public get(): Value {
  //     return this.#value;
  //   }
  //   public set(_value: Value): void {
  //     this.#value = _value;
  //     Object.call(this.#getter, this.#component.getOimoJoint())[this.#property] = _value;
  //   }
  // }

}