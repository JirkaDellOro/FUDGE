namespace FudgeCore {
  /**
     * A physical connection between two bodies with no movement. 
     * Best way to simulate convex objects like a chair seat connected to chair legs.
     * The actual anchor point does not matter that much, only in very specific edge cases.
     * Because welding means they simply do not disconnect. (unless you add Breakability)
     * @author Marko Fehrenbach, HFU 2020
     */
  export class ComponentJointWelding extends ComponentJoint {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentJointWelding);

    protected oimoJoint: OIMO.GenericJoint;
    private config: OIMO.GenericJointConfig = new OIMO.GenericJointConfig();


    constructor(_attachedRigidbody: ComponentRigidbody = null, _connectedRigidbody: ComponentRigidbody = null, _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_attachedRigidbody, _connectedRigidbody);

      this.jointAnchor = new OIMO.Vec3(_localAnchor.x, _localAnchor.y, _localAnchor.z);

      /*Tell the physics that there is a new joint and on the physics start the actual joint is first created. Values can be set but the
        actual constraint ain't existent until the game starts
      */
      this.addEventListener(EVENT.COMPONENT_ADD, this.dirtyStatus);
      this.addEventListener(EVENT.COMPONENT_REMOVE, this.removeJoint);
    }
    //#endregion


    //#region Saving/Loading
    public serialize(): Serialization {
      let serialization: Serialization = {
        [super.constructor.name]: super.serialize()
      };
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      return this;
    }
    //#endregion


    protected constructJoint(): void {
      this.config = new OIMO.GenericJointConfig();
      let attachedRBPos: Vector3 = this.attachedRigidbody.node.mtxWorld.translation;
      let worldAnchor: OIMO.Vec3 = new OIMO.Vec3(attachedRBPos.x + this.jointAnchor.x, attachedRBPos.y + this.jointAnchor.y, attachedRBPos.z + this.jointAnchor.z);
      this.config.init(this.attachedRB.getOimoRigidbody(), this.connectedRB.getOimoRigidbody(), worldAnchor, new OIMO.Mat3(), new OIMO.Mat3());


      this.oimoJoint = new OIMO.GenericJoint(this.config);
      this.oimoJoint.setAllowCollision(this.jointInternalCollision);
    }
  }
}