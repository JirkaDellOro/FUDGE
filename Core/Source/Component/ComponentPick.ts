namespace FudgeCore {
  /**
   * Base class for scripts the user writes
   * @authors Jirka Dell'Oro-Friedl, HFU, 2022
   * @link https://github.com/JirkaDellOro/FUDGE/wiki/Component
   */
  export class ComponentPick extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentPick);

    public serialize(): Serialization {
      return this.getMutator();
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.mutate(_serialization);
      return this;
    }
  }
}