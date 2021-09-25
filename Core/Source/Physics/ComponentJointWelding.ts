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


    constructor(_bodyAnchor: ComponentRigidbody = null, _bodyTied: ComponentRigidbody = null, _localAnchor: Vector3 = new Vector3(0, 0, 0)) {
      super(_bodyAnchor, _bodyTied);

      this.anchor = new Vector3(_localAnchor.x, _localAnchor.y, _localAnchor.z);
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
      let attachedRBPos: Vector3 = this.bodyAnchor.node.mtxWorld.translation;
      let worldAnchor: OIMO.Vec3 = new OIMO.Vec3(attachedRBPos.x + this.anchor.x, attachedRBPos.y + this.anchor.y, attachedRBPos.z + this.anchor.z);
      this.config.init(this.bodyAnchor.getOimoRigidbody(), this.bodyTied.getOimoRigidbody(), worldAnchor, new OIMO.Mat3(), new OIMO.Mat3());


      this.oimoJoint = new OIMO.GenericJoint(this.config);
      this.oimoJoint.setAllowCollision(this.internalCollision);
    }
  }
}