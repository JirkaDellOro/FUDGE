namespace FudgeCore {
  /**
   * Base class for scripts the user writes
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
   */
  export class ComponentScript extends Component {
    // registering this doesn't make sense, only its subclasses. Or this component must refer to scripts to be attached to this component
    // TODO: rethink & refactor
    public static readonly iSubclass: number = Component.registerSubclass(ComponentScript);
    constructor() {
      super();
      this.singleton = false;
    }

    public serialize(): Serialization {
      return this.getMutator();
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.mutate(_serialization);
      return this;
    }
  }
}