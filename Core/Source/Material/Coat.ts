namespace FudgeCore {
  /**
   * Holds data to feed into a {@link Shader} to describe the surface of {@link Mesh}.  
   * {@link Material}s reference {@link Coat} and {@link Shader}.   
   * The method useRenderData will be injected by {@link RenderInjector} at runtime, extending the functionality of this class to deal with the renderer.
   */
  export class Coat extends Mutable implements Serializable {
    // public name: string = "Coat";
    protected renderData: { [key: string]: unknown };

    public useRenderData(_shader: ShaderInterface, _cmpMaterial: ComponentMaterial): void {/* injected by RenderInjector*/ }

    //#region Transfer
    public serialize(): Serialization {
      return {};
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      return this;
    }

    protected reduceMutator(_mutator: Mutator): void { 
      delete _mutator.renderData;
     }
    //#endregion
  }
}