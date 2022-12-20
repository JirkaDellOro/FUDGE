namespace PhysicsVR {
  import f = FudgeCore;
  f.Project.registerScriptNamespace(PhysicsVR);  // Register the namespace to FUDGE for serialization

  export class Translator extends f.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = f.Component.registerSubclass(Translator);
    // Properties may be mutated by users in the editor via the automatically created user interface
    public static speed: number = 25;
    public hasHitted: boolean = false;
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
          f.Loop.addEventListener(f.EVENT.LOOP_FRAME, this.update);
          f.Loop.start(f.LOOP_MODE.FRAME_REQUEST, 60);
          this.addVel();

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
    private addVel = (): void => {
      this.node.getComponent(f.ComponentRigidbody).addVelocity(f.Vector3.Z(-Translator.speed));

    }
    private randomRot = f.Random.default.getRange(-0.5, 0.5);
    private update = (_event: Event): void => {
      if (!this.hasHitted) {
        this.node.getComponent(f.ComponentRigidbody).rotateBody(f.Vector3.X(-0.5))
        this.node.getComponent(f.ComponentRigidbody).rotateBody(f.Vector3.Z(this.randomRot));
        if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.z > 70 && this.node)
          cubeContainer.removeChild(this.node);
      }

    }
  }
}