namespace FudgeCore {
  /**
   * A [[Coat]] providing a texture and additional data for texturing
   */
  @RenderInjectorCoat.decorate
  export class CoatTextured extends Coat {
    // TODO: see if color should be generalized
    public color: Color = new Color(1, 1, 1, 1);
    public texture: TextureImage = null;
    // just ideas so far
    public tilingX: number;
    public tilingY: number;
    public repetition: boolean;

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