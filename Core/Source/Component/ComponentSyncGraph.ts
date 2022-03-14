namespace FudgeCore {
  /**
   * Synchronizes the graph instance this component is attached to with the graph and vice versa
   * @authors Jirka Dell'Oro-Friedl, HFU, 2022
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
   */
  export class ComponentSyncGraph extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentSyncGraph);
    constructor() {
      super();
      this.singleton = true;
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