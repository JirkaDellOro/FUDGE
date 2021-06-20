namespace FudgeCore {
  /**
   * A {@link Coat} providing a texture and additional data for texturing
   */
  @RenderInjectorCoat.decorate
  export class CoatTextured extends CoatColored {
    // TODO: see if color should be generalized
    // public color: Color = new Color(1, 1, 1, 1);
    public texture: Texture = null;

    constructor(_color?: Color, _texture?: Texture) {
      super(_color);
      this.texture = _texture || TextureDefault.texture;
    }

    //#region Transfer
    //TODO: examine if using super in serialization works with decorators... should.
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      delete serialization.texture;
      serialization.idTexture = this.texture.idResource;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      if (_serialization.idTexture)
        this.texture = <Texture>await Project.getResource(_serialization.idTexture);
      return this;
    }
    //#endregion

    // just ideas so far
    // public tilingX: number;
    // public tilingY: number;
    // public repetition: boolean;

    // constructor(_texture: TextureImage, _color?: Color) {
    //   super();
    //   this.texture = _texture;
    //   this.color = _color || new Color(1, 1, 1, 1);
    // }

    // public getMutatorForComponent(): MutatorForComponent {
    //   let mutatorPivot: MutatorForComponent = <MutatorForComponent><unknown>this.pivot.getMutator();
    //   return mutatorPivot;
    // }

    // public mutate(_mutator: MutatorForComponent): void {
    //   this.pivot.mutate(_mutator);
    // }
  }
}