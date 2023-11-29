namespace FudgeCore {
  /**
   * Attached to a {@link Node} with an attached {@link ComponentCamera} this causes the rendered image to receive an ambient occlusion effect.
   * @authors Roland Heer, HFU, 2023 | Jonas Plotzky, HFU, 2023
   */
  export class ComponentAmbientOcclusion extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentAmbientOcclusion);

    public sampleRadius: number;
    public bias: number;
    public attenuationConstant: number;
    public attenuationLinear: number;
    public attenuationQuadratic: number;

    public constructor(_sampleRadius: number = 16, _bias: number = 0.07, _attenuationConstant: number = 2.5, _attenuationLinear: number = 1, _attenuationQuadratic: number = 1) {
      super();
      this.sampleRadius = _sampleRadius;
      this.bias = _bias;
      this.attenuationConstant = _attenuationConstant;
      this.attenuationLinear = _attenuationLinear;
      this.attenuationQuadratic = _attenuationQuadratic;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        sampleRadius: this.sampleRadius,
        bias: this.bias,
        attenuationConstant: this.attenuationConstant,
        attenuationLinear: this.attenuationLinear,
        attenuationQuadratic: this.attenuationQuadratic
      };
      serialization[super.constructor.name] = super.serialize();
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      this.sampleRadius = _serialization.sampleRadius;
      this.bias = _serialization.bias;
      this.attenuationConstant = _serialization.attenuationConstant;
      this.attenuationLinear = _serialization.attenuationLinear;
      this.attenuationQuadratic = _serialization.attenuationQuadratic;
      await super.deserialize(_serialization[super.constructor.name]);
      return this;
    }
  }
}