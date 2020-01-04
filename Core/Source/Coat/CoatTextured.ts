namespace FudgeCore {
  /**
   * A [[Coat]] providing a texture and additional data for texturing
   */
  @RenderInjector.decorateCoat
  export class CoatTextured extends Coat {
    public texture: TextureImage = null;
    public pivot: Matrix3x3 = new Matrix3x3();
    // just ideas so far
    public tilingX: number;
    public tilingY: number;
    public repetition: boolean;

    public getMutatorForComponent(): MutatorForComponent {
      let mutatorPivot: Mutator = this.pivot.getMutator();
    }
  }

}