namespace FudgeCore {
  /**
   * Attaches a [[Material]] to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class ComponentMaterial extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentMaterial);
    public material: Material;
    public clrPrimary: Color = Color.CSS("white");
    public clrSecondary: Color = Color.CSS("white");
    public pivot: Matrix3x3 = Matrix3x3.IDENTITY();
    // public mutatorCoat: MutatorForComponent;

    public constructor(_material: Material = null) {
      super();
      this.material = _material;
      // this.mutatorCoat = _material.getCoat().getMutatorForComponent();
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        clrPrimary: this.clrPrimary,
        clrSecondary: this.clrSecondary,
        pivot: this.pivot.serialize(),
        [super.constructor.name]: super.serialize()
      };
      /* at this point of time, serialization as resource and as inline object is possible. TODO: check if inline becomes obsolete */
      let idMaterial: string = this.material.idResource;
      // if (idMaterial)
      serialization.idMaterial = idMaterial;
      // else
      //   serialization.material = Serializer.serialize(this.material);

      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      let material: Material;
      // if (_serialization.idMaterial)
      material = <Material>await ResourceManager.get(_serialization.idMaterial);
      // else
      //   material = <Material>await Serializer.deserialize(_serialization.material);
      this.material = material;
      this.clrPrimary = _serialization.clrPrimary;
      this.clrSecondary = _serialization.clrSecondary;
      this.pivot.deserialize(_serialization.pivot);
      super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    // public getMutatorForUserInterface(): MutatorForUserInterface {
    //   let mutatorCoat: MutatorForComponent = this.material.getCoat().getMutatorForComponent();
    //   return <MutatorForUserInterface><unknown>mutatorCoat;
    // }
    //#endregion
  }
}