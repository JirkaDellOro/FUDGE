namespace PhysicsVR {
  import f = FudgeCore;
  f.Project.registerScriptNamespace(PhysicsVR);  // Register the namespace to FUDGE for serialization

  export class Sword extends f.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = f.Component.registerSubclass(Sword);
    // Properties may be mutated by users in the editor via the automatically created user interface
    public static speed: number = 15;

    constructor() {
      super();

      // Don't start when running in editor
      if (f.Project.mode == f.MODE.EDITOR)
        return;

      // Listen to this component being added to or removed from a node
      this.addEventListener(f.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(f.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(f.EVENT.NODE_DESERIALIZED, this.hndEvent);

    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case f.EVENT.COMPONENT_ADD:
          this.node.getComponent(f.ComponentRigidbody).addEventListener(f.EVENT_PHYSICS.COLLISION_ENTER, this.onColiisionEnter);


          break;
        case f.EVENT.COMPONENT_REMOVE:
          this.removeEventListener(f.EVENT.COMPONENT_ADD, this.hndEvent);
          this.removeEventListener(f.EVENT.COMPONENT_REMOVE, this.hndEvent);
          break;
        case f.EVENT.NODE_DESERIALIZED:
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          break;
      }
    }
    private onColiisionEnter = (_event: f.EventPhysics): void => {
      if (_event.cmpRigidbody.node.name == "CubeInstance") {
        if (_event.cmpRigidbody.node) {
          _event.cmpRigidbody.node.getComponent(Translator).hasHitted = true;
          _event.cmpRigidbody.setVelocity(f.Vector3.DIFFERENCE(_event.cmpRigidbody.mtxPivot.translation, this.node.mtxLocal.translation));
          _event.cmpRigidbody.effectGravity = 1;
          this.removeHittedObject(_event.cmpRigidbody.node);
        }
      }
    }
    private removeHittedObject = async (_objectHit: f.Node): Promise<void> => {

      await f.Time.game.delay(1250);
      cubeContainer.removeChild(_objectHit);
    }
  }
}