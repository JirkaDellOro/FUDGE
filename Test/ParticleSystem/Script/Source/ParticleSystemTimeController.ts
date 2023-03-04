namespace Script {
  import ƒ = FudgeCore;
  ƒ.Project.registerScriptNamespace(Script);

  export class ParticleSystemTimeController extends ƒ.ComponentScript {
    // Register the script as component for use in the editor via drag&drop
    public static readonly iSubclass: number = ƒ.Component.registerSubclass(ParticleSystemTimeController);

    #cmpParticleSystem: ƒ.ComponentParticleSystem;

    constructor() {
      super();

      this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndEvent);
      this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndEvent);
      this.addEventListener(ƒ.EVENT.NODE_DESERIALIZED, this.hndEvent);
    }

    public get scale(): number {
      return this.#cmpParticleSystem.time.getScale();
    }

    public set scale(_value: number) {
      this.#cmpParticleSystem.time.setScale(_value);
    }

    public get time(): number {
      return this.#cmpParticleSystem.time.get() / 1000;
    }

    public set time(_value: number) {
      this.#cmpParticleSystem.time.set(_value * 1000);
    }

    // Activate the functions of this component as response to events
    public hndEvent = (_event: Event): void => {
      switch (_event.type) {
        case ƒ.EVENT.COMPONENT_ADD:
        case ƒ.EVENT.NODE_DESERIALIZED:
          // if deserialized the node is now fully reconstructed and access to all its components and children is possible
          this.#cmpParticleSystem = this.node.getComponent(ƒ.ComponentParticleSystem);
          break;
      }
    }

    public getMutatorForUserInterface(): ƒ.MutatorForUserInterface {
      let mutator: ƒ.MutatorForUserInterface = <ƒ.MutatorForUserInterface>super.getMutator(true);
      mutator.scale = this.scale;
      mutator.time = this.time;
      return mutator;
    }
  }
}