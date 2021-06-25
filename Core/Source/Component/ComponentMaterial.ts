namespace FudgeCore {
  /**
   * Attaches a {@link Material} to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019 - 2021
   */
  export class ComponentMaterial extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentMaterial);
    public material: Material;
    public clrPrimary: Color = Color.CSS("white");
    public clrSecondary: Color = Color.CSS("white");
    public mtxPivot: Matrix3x3 = Matrix3x3.IDENTITY();
    //** support sorting of objects with transparency when rendering, render objects in the back first */
    public sortForAlpha: boolean = false;
    // public mutatorCoat: MutatorForComponent;

    public constructor(_material: Material = null) {
      super();
      this.material = _material;
      // this.mutatorCoat = _material.getCoat().getMutatorForComponent();
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        sortForAlpha: this.sortForAlpha,
        clrPrimary: this.clrPrimary.serialize(),
        clrSecondary: this.clrSecondary.serialize(),
        pivot: this.mtxPivot.serialize(),
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
      material = <Material>await Project.getResource(_serialization.idMaterial);
      // else
      //   material = <Material>await Serializer.deserialize(_serialization.material);
      this.material = material;
      this.clrPrimary.deserialize(_serialization.clrPrimary);
      this.clrSecondary.deserialize(_serialization.clrSecondary);
      this.sortForAlpha = _serialization.sortForAlpha;
      this.mtxPivot.deserialize(_serialization.pivot);
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