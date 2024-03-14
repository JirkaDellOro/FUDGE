namespace FudgeCore {
  /**
   * Attaches a {@link Material} to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019 - 2021
   */
  export class ComponentMaterial extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentMaterial);
    public clrPrimary: Color = Color.CSS("white");
    public clrSecondary: Color = Color.CSS("white");
    public mtxPivot: Matrix3x3 = Matrix3x3.IDENTITY();
    public material: Material;
    /** Support sorting of objects with transparency when rendering, render objects in the back first. When this component is used as a part of a {@link ParticleSystem}, try enabling this when disabling {@link ComponentParticleSystem.depthMask} */
    public sortForAlpha: boolean = false;
    // public mutatorCoat: MutatorForComponent;

    public constructor(_material: Material = null) {
      super();
      this.material = _material;
      // this.mutatorCoat = _material.getCoat().getMutatorForComponent();
    }

    /**
     * Returns true if the material has any areas (color or texture) with alpha < 1.
     * ⚠️ CAUTION: Computionally expensive for textured materials, see {@link Texture.hasTransparency}
     */
    public get hasTransparency(): boolean {
      return this.material?.hasTransparency || this.clrPrimary.a < 1;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        sortForAlpha: this.sortForAlpha,
        clrPrimary: this.clrPrimary.serialize(),
        clrSecondary: this.clrSecondary.serialize(),
        pivot: this.mtxPivot.serialize(),
        [super.constructor.name]: super.serialize(),
        idMaterial: this.material.idResource
      };

      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.material = <Material>await Project.getResource(_serialization.idMaterial);
      await this.clrPrimary.deserialize(_serialization.clrPrimary);
      await this.clrSecondary.deserialize(_serialization.clrSecondary);
      this.sortForAlpha = _serialization.sortForAlpha;
      await this.mtxPivot.deserialize(_serialization.pivot);
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }

    // public getMutatorForUserInterface(): MutatorForUserInterface {
    //   let mutatorCoat: MutatorForComponent = this.material.getCoat().getMutatorForComponent();
    //   return <MutatorForUserInterface><unknown>mutatorCoat;
    // }
    //#endregion
  }
}