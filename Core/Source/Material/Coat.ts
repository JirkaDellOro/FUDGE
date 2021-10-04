namespace FudgeCore {
  /**
   * Holds data to feed into a {@link Shader} to describe the surface of {@link Mesh}.  
   * {@link Material}s reference {@link Coat} and {@link Shader}.   
   * The method useRenderData will be injected by {@link RenderInjector} at runtime, extending the functionality of this class to deal with the renderer.
   */
  export class Coat extends Mutable implements Serializable {
    // public name: string = "Coat";
    protected renderData: { [key: string]: unknown };

    public useRenderData(_shader: typeof Shader, _cmpMaterial: ComponentMaterial): void {/* injected by RenderInjector*/ }

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

  /**
   * The simplest {@link Coat} providing just a color
   */
  @RenderInjectorCoat.decorate
  export class CoatColored extends Coat {
    public color: Color;

    constructor(_color?: Color) {
      super();
      this.color = _color || new Color();
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.color = this.color.serialize();
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      await this.color.deserialize(_serialization.color);
      return this;
    }
    //#endregion
  }

  /**
   * A {@link Coat} to be used by the MatCap Shader providing a texture, a tint color (0.5 grey is neutral). Set shadeSmooth to 1 for smooth shading.
   */
  @RenderInjectorCoat.decorate
  export class CoatMatCap extends Coat {
    public texture: TextureImage = null;
    public color: Color = new Color();
    public shadeSmooth: number;

    constructor(_texture?: TextureImage, _color?: Color, _shadeSmooth?: number) {
      super();
      this.texture = _texture || new TextureImage();
      this.color = _color || new Color();
      this.shadeSmooth = _shadeSmooth || 0;
    }
    
    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.color = this.color.serialize();
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      await this.color.deserialize(_serialization.color);
      return this;
    }
    //#endregion
  }
}