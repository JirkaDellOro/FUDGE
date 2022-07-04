namespace FudgeCore {
  interface ShaderCodeMap { [key: string]: string; }

  interface ShaderCodeData {
    storage?: {
      system?: ShaderCodeMap;
      update?: ShaderCodeMap;
      particle?: ShaderCodeMap;
    };
    transformations?: {
      local?: ShaderCodeMap;
      world?: ShaderCodeMap;
    };
    components?: { [componentType: string]: ShaderCodeData};
    [attribute: string]: ShaderCodeData | string;
  }

  export class RenderInjectorParticleEffect extends RenderInjectorShader {
    public static readonly RANDOM_NUMBERS_TEXTURE_MAX_WIDTH: number = 1000;
    private static readonly FUNCTIONS: { [key: string]: Function } = {
      "addition": (_parameters: string[]) => {
        return `(${_parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} + ${_value}`)})`;
      },
      "subtraction": (_parameters: string[]) => {
        return `(${_parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} - ${_value}`)})`;
      },
      "multiplication": (_parameters: string[]) => {
        return `(${_parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} * ${_value}`)})`;
      },
      "division": (_parameters: string[]) => {
        return `(${_parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} / ${_value}`)})`;
      },
      "modulo": (_parameters: string[]) => {
        return `(${_parameters.reduce((_accumulator: string, _value: string) => `mod(${_accumulator}, ${_value})`)})`;
      },
      "linear": (_parameters: string[]) => {
        let x: string = _parameters[0];
        let xStart: string = _parameters[1];
        let yStart: string = _parameters[2];
        let xEnd: string = _parameters[3];
        let yEnd: string = _parameters[4];
        return `(${yStart} + (${x} - ${xStart}) * (${yEnd} - ${yStart}) / (${xEnd} - ${xStart}))`;
      },
      "polynomial": (_parameters: string[]) => {
        let x: string = _parameters[0];
        let a: string = _parameters[1];
        let b: string = _parameters[2];
        let c: string = _parameters[3];
        let d: string = _parameters[4];
        return `(${a} * pow(${x}, 3.0) + ${b} * pow(${x}, 2.0) + ${c} * ${x} + ${d})`;
      },
      "squareRoot": (_parameters: string[]) => {
        let x: string = _parameters[0];
        return `sqrt(${x})`;
      },
      "random": (_parameters: string[]) => {
        const maxWidth: string = RenderInjectorParticleEffect.RANDOM_NUMBERS_TEXTURE_MAX_WIDTH.toString() + ".0";
        return `texelFetch(u_fRandomNumbers, ivec2(mod(${_parameters[0]}, ${maxWidth}), ${_parameters[0]} / ${maxWidth}), 0).r`;
      },
      "randomRange": (_parameters: string[]) => {
        return `${RenderInjectorParticleEffect.FUNCTIONS["random"](_parameters)} * (${_parameters[2]} - ${_parameters[1]}) + ${_parameters[1]}`;
      }
    };
    private static readonly PREDEFINED_VARIABLES: { [key: string]: string } = {
      index: "fParticleIndex",
      numberOfParticles: "u_fNumberOfParticles",
      time: "u_fTime"
    };

    public static override decorate(_constructor: Function): void {
      Object.defineProperty(_constructor.prototype, "useProgram", {
        value: RenderInjectorShader.useProgram
      });
      Object.defineProperty(_constructor.prototype, "deleteProgram", {
        value: RenderInjectorShader.deleteProgram
      });
      Object.defineProperty(_constructor.prototype, "createProgram", {
        value: RenderInjectorShader.createProgram
      });
      Object.defineProperty(_constructor.prototype, "getVertexShaderSource", {
        value: RenderInjectorParticleEffect.getVertexShaderSource
      });
      Object.defineProperty(_constructor.prototype, "getFragmentShaderSource", {
        value: RenderInjectorParticleEffect.getFragmentShaderSource
      });
    }

    public static getVertexShaderSource(this: ParticleEffect): string { 
      let shaderCodeStructure: ShaderCodeData = RenderInjectorParticleEffect.generateShaderCodeData(this.data);
      let source: string = ShaderParticle.getVertexShaderSource()
        .replace("/*$variables*/", RenderInjectorParticleEffect.createStorageShaderCode(shaderCodeStructure))
        .replace("/*$mtxLocal*/", RenderInjectorParticleEffect.createTransformationsShaderCode(shaderCodeStructure?.transformations?.local, true))
        .replace("/*$mtxLocal*/", "mtxLocal *")
        .replace("/*$mtxWorld*/", RenderInjectorParticleEffect.createTransformationsShaderCode(shaderCodeStructure?.transformations?.world, false))
        .replace("/*$mtxWorld*/", "mtxWorld *")
        .replace("/*$color*/", RenderInjectorParticleEffect.createColorShaderCode(shaderCodeStructure));
      
      return source; 
    }

    public static getFragmentShaderSource(this: ParticleEffect): string {
      return ShaderParticle.getFragmentShaderSource();
    }

    //#region Code generation
    private static generateShaderCodeData(_data: Serialization): ShaderCodeData {
      if (!_data) return {};

      let codeStructure: ShaderCodeData = {};
  
      for (const key in _data) {
        let subData: General = _data[key];
        if (ParticleEffect.isClosureData(subData)) 
          codeStructure[key] = RenderInjectorParticleEffect.generateCode(subData);
        else
          codeStructure[key] = RenderInjectorParticleEffect.generateShaderCodeData(subData);
      }
  
      return codeStructure;
    }   
  
    private static generateCode(_data: ClosureData): string {
      if (ParticleEffect.isFunctionData(_data)) {
        let parameters: string[] = [];
        for (let param of _data.parameters) {
          parameters.push(this.generateCode(param));
        }
        return RenderInjectorParticleEffect.generateShaderCodeFunction(_data.function, parameters);
      }
  
      if (ParticleEffect.isVariableData(_data)) {
        let predefined: string = RenderInjectorParticleEffect.PREDEFINED_VARIABLES[_data.value];
        return predefined ? predefined : _data.value;
      } 
  
      if (ParticleEffect.isConstantData(_data)) {
        let value: string = _data.value.toString();
        return `${value}${value.includes(".") ? "" : ".0"}`;
      }
  
      throw `invalid node structure in particle effect serialization`;
    }
  
    private static generateShaderCodeFunction(_function: string, _parameters: string[]): string {
      if (_function in RenderInjectorParticleEffect.FUNCTIONS)
        return RenderInjectorParticleEffect.FUNCTIONS[_function](_parameters);
      else
        throw `"${_function}" is not an operation`;
    }

    private static createStorageShaderCode(_structure: ShaderCodeData): string {
      let storage: ShaderCodeData = _structure?.storage;
      let code: string = "";
      if (storage) {
        for (const partitionName in storage) {
          let partition: ShaderCodeMap = storage[partitionName] as ShaderCodeMap;
          for (const variableName in partition) {
            code += `float ${variableName} = ${partition[variableName]};\n`;
          }
        }
      }

      return code;
    }

    private static createTransformationsShaderCode(_transformations: ShaderCodeData, _isLocal: boolean): string {
      if (!_transformations) return "";

      let code: string = "";
      code += `mat4 mtx${_isLocal ? "Local" : "World"} = \n`;
      code += Object.keys(_transformations)
      .map( (_key: string) => {
        let transformation: ShaderCodeMap = _transformations[_key] as ShaderCodeMap;
        switch (_key) {
          case "translate":
            return `mat4(
            1.0, 0.0, 0.0, 0.0,
            0.0, 1.0, 0.0, 0.0,
            0.0, 0.0, 1.0, 0.0,
            ${transformation.x ? transformation.x : "0.0"}, ${transformation.y ? transformation.y : "0.0"}, ${transformation.z ? transformation.z : "0.0"}, 1.0)`;
          case "rotate":
            // TODO: move these into shader?
            let sinX: string = `sin(${transformation.x ? transformation.x : "0.0"})`;
            let cosX: string = `cos(${transformation.x ? transformation.x : "0.0"})`;
            let sinY: string = `sin(${transformation.y ? transformation.y : "0.0"})`;
            let cosY: string = `cos(${transformation.y ? transformation.y : "0.0"})`;
            let sinZ: string = `sin(${transformation.z ? transformation.z : "0.0"})`;
            let cosZ: string = `cos(${transformation.z ? transformation.z : "0.0"})`;
            return `mat4(
            ${cosZ} * ${cosY}, ${sinZ} * ${cosY}, -${sinY}, 0.0,
            ${cosZ} * ${sinY} * ${sinX} - ${sinZ} * ${cosX}, ${sinZ} * ${sinY} * ${sinX} + ${cosZ} * ${cosX}, ${cosY} * ${sinX}, 0.0,
            ${cosZ} * ${sinY} * ${cosX} + ${sinZ} * ${sinX}, ${sinZ} * ${sinY} * ${cosX} - ${cosZ} * ${sinX}, ${cosY} * ${cosX}, 0.0,
            0.0, 0.0, 0.0, 1.0
            )`;
          case "scale":
            return `mat4(
            ${transformation.x ? transformation.x : "1.0"}, 0.0, 0.0, 0.0,
            0.0, ${transformation.y ? transformation.y : "1.0"}, 0.0, 0.0,
            0.0, 0.0, ${transformation.z ? transformation.z : "1.0"}, 0.0,
            0.0, 0.0, 0.0, 1.0
            )`;
          default:
            return "";    
          }
        }
      )
      .reduce((_accumulator: string, _code: string) => `${_accumulator}\n * \n ${_code}`);
      code += ";";
      return code;
    }

    private static createColorShaderCode(_structure: ShaderCodeData): string {      
      let clrPrimary: ShaderCodeMap = _structure?.components?.ComponentMaterial?.clrPrimary as ShaderCodeMap;
      let code: string = "";
      if (clrPrimary) {
        code += `v_vctColor = vec4(${clrPrimary.r ? clrPrimary.r : "1.0"}, ${clrPrimary.g ? clrPrimary.g : "1.0"}, ${clrPrimary.b ? clrPrimary.b : "1.0"}, ${clrPrimary.a ? clrPrimary.a : "1.0"});`;
      }

      return code;
    }
    //#endregion
  }
}