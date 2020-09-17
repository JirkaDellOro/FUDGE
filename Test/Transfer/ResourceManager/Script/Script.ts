///<reference types="../../../../Core/Build/FudgeCore"/>
namespace ResourceManager {
  import ƒ = FudgeCore;

  export class Script extends ƒ.ComponentScript {
    public prefix: string = "Script: ";
    public count: number = 0;
    private timer: ƒ.Timer;

    constructor() {
      super();
      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndAddComponent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndRemoveComponent);
    }

    public hndTimer = (_event: ƒ.EventTimer) => {
      console.log(this.prefix + this.count++);
    }

    public hndAddComponent = (_event: Event) => {
      this.timer = new ƒ.Timer(ƒ.Time.game, 1000, 0, this.hndTimer);
    }
    public hndRemoveComponent = (_event: Event) => {
      this.timer.clear();
    }

    // protected reduceMutator(_mutator: ƒ.Mutator): void {
    //   // delete properties that should not be mutated
    //   // undefined properties with not be included by default
    // }
  }
}