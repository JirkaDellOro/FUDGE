namespace FudgeCore {
  /**
   * Filters synchronization between a graph instance and the graph it is connected to. If active, no synchronization occurs.
   * Maybe more finegrained in the future...
   * @authors Jirka Dell'Oro-Friedl, HFU, 2022
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
   */
  export class ComponentGraphFilter extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentGraphFilter);
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