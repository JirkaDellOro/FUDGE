namespace FudgeCore {
  /**
   * A [[Coat]] providing a texture and additional data for texturing
   */
  @RenderInjector.decorateCoat
  export class CoatTextured extends Coat {
    public texture: TextureImage = null;
    public pivot: Matrix3x3 = Matrix3x3.IDENTITY;
    // just ideas so far
    public tilingX: number;
    public tilingY: number;
    public repetition: boolean;

    // public getMutatorForComponent(): MutatorForComponent {
    //   let mutatorPivot: MutatorForComponent = <MutatorForComponent><unknown>this.pivot.getMutator();
    //   return mutatorPivot;
    // }

    // public mutate(_mutator: MutatorForComponent): void {
    //   this.pivot.mutate(_mutator);
    // }
  }
}