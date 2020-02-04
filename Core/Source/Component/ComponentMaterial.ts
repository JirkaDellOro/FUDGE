namespace FudgeCore {
  /**
   * Attaches a [[Material]] to the node
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  export class ComponentMaterial extends Component {
    public material: Material;
    // public mutatorCoat: MutatorForComponent;

    public constructor(_material: Material = null) {
      super();
      this.material = _material;
      // this.mutatorCoat = _material.getCoat().getMutatorForComponent();
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization;
      /* at this point of time, serialization as resource and as inline object is possible. TODO: check if inline becomes obsolete */
      let idMaterial: string = this.material.idResource;
      if (idMaterial)
        serialization = { idMaterial: idMaterial };
      else
        serialization = { material: Serializer.serialize(this.material) };

      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }
    public deserialize(_serialization: Serialization): Serializable {
      let material: Material;
      if (_serialization.idMaterial)
        material = <Material>ResourceManager.get(_serialization.idMaterial);
      else
        material = <Material>Serializer.deserialize(_serialization.material);
      this.material = material;
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