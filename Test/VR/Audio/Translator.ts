namespace AudioSceneVR {
  import f = FudgeCore;
  f.Project.registerScriptNamespace(AudioSceneVR);  // Register the namespace to FUDGE for serialization

  export class Translator extends f.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = f.Component.registerSubclass(Translator);
    // Properties may be mutated by users in the editor via the automatically created user interface
    public message: string = "CustomComponentScript added to ";


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
          f.Loop.start();


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
    private hasToTurn: boolean = false;
    public isTranslating: boolean = false;
    private update = (_event: Event): void => {
      if (this.isTranslating) {
        if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.x < 8.1 && !this.hasToTurn) {
          this.node.mtxLocal.translateX(0.01);
          if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.x > 8)
            this.hasToTurn = true;
        }
        else if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.x > -8.1 && this.hasToTurn) {
          this.node.mtxLocal.translateX(-0.01);
          if (this.node.getComponent(f.ComponentTransform).mtxLocal.translation.x < -8)
            this.hasToTurn = false;
        }
      }
    }
  }
}