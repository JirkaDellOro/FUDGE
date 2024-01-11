///<reference path="CoatTextured.ts"/>

namespace FudgeCore {
  /**
   * A {@link Coat} providing a texture and additional data for texturing
   */
  @RenderInjectorCoat.decorate
  export class CoatRemissiveTextured extends CoatTextured {
    public diffuse: number;
    public specular: number;
    public intensity: number;

    #metallic: number;

    public constructor(_color: Color = new Color(), _texture: Texture = TextureDefault.color, _diffuse: number = 1, _specular: number = 0.5, _intensity: number = 0.7, _metallic: number = 0.0) {
      super(_color, _texture);
      this.diffuse = _diffuse;
      this.specular = _specular;
      this.intensity = _intensity;
      this.metallic = _metallic;
    }

    public get metallic(): number {
      return this.#metallic;
    }
    public set metallic(_value: number) {
      this.#metallic = Calc.clamp(_value, 0, 1);
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.diffuse = this.diffuse;
      serialization.specular = this.specular;
      serialization.intensity = this.intensity;
      serialization.metallic = this.metallic;
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      this.diffuse = _serialization.diffuse;
      this.specular = _serialization.specular;
      this.intensity = _serialization.intensity ?? this.intensity;
      this.metallic = _serialization.metallic ?? this.metallic;
      return this;
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator(true);
      mutator.metallic = this.metallic;
      return mutator;
    }
    //#endregion
  }
}