namespace FudgeCore {
  interface CodeData {
    variables?: CodeMap;
    transformations?: {
      local?: CodeTransformations;
      world?: CodeTransformations;
    };
    color?: CodeMap;
  }

  interface CodeMap { [key: string]: string; }
  interface CodeTransformations { [key: string]: CodeMap; }

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
      let shaderCodeStructure: CodeData = RenderInjectorParticleEffect.generateCodeData(this.data);
      let variables: CodeMap = shaderCodeStructure?.variables;
      let transformationsLocal: CodeTransformations = shaderCodeStructure?.transformations?.local;
      let transformationsWorld: CodeTransformations = shaderCodeStructure?.transformations?.world;
      let color: CodeMap = shaderCodeStructure?.color;

      let source: string = ShaderParticle.getVertexShaderSource()
        .replace("/*$variables*/", RenderInjectorParticleEffect.generateVariables(variables))
        .replace("/*$mtxLocal*/", RenderInjectorParticleEffect.generateTransformations(transformationsLocal, true))
        .replace("/*$mtxLocal*/", transformationsLocal ? "* mtxLocal" : "")
        .replace("/*$mtxWorld*/", RenderInjectorParticleEffect.generateTransformations(transformationsWorld, false))
        .replace("/*$mtxWorld*/", transformationsWorld ? "mtxWorld *" : "")
        .replace("/*$color*/", RenderInjectorParticleEffect.generateColor(color));
      return source; 
    }

    public static getFragmentShaderSource(this: ParticleEffect): string {
      return ShaderParticle.getFragmentShaderSource();
    }

    //#region code generation
    private static generateCodeData(_data: Serialization): CodeData {
      if (!_data) return {};

      let codeData: General = {};
  
      for (const key in _data) {
        let subData: General = _data[key];
        if (ParticleEffect.isClosureData(subData)) 
          codeData[key] = RenderInjectorParticleEffect.generateCode(subData);
        else
          codeData[key] = RenderInjectorParticleEffect.generateCodeData(subData);
      }
  
      return codeData as CodeData;
    }   
  
    private static generateCode(_data: ClosureData): string {
      if (ParticleEffect.isFunctionData(_data)) {
        let parameters: string[] = [];
        for (let param of _data.parameters) {
          parameters.push(this.generateCode(param));
        }
        return RenderInjectorParticleEffect.generateFunction(_data.function, parameters);
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
  
    private static generateFunction(_function: string, _parameters: string[]): string {
      if (_function in RenderInjectorParticleEffect.FUNCTIONS)
        return RenderInjectorParticleEffect.FUNCTIONS[_function](_parameters);
      else
        throw `"${_function}" is not an operation`;
    }

    private static generateVariables(_variables: CodeMap): string {
      let code: string = "";
      for (const variableName in _variables) {
        code += `float ${variableName} = ${_variables[variableName]};\n`;
      }

      return code;
    }

    private static generateTransformations(_transformations: CodeTransformations, _isLocal: boolean): string {
      if (!_transformations) return "";

      let code: string = "";
      let rotation: CodeMap = _transformations["rotate"];
      if (rotation) {
        code += `float fSinX = sin(${rotation.x ? rotation.x : "0.0"});
        float fCosX = cos(${rotation.x ? rotation.x : "0.0"});
        float fSinY = sin(${rotation.y ? rotation.y : "0.0"});
        float fCosY = cos(${rotation.y ? rotation.y : "0.0"});
        float fSinZ = sin(${rotation.z ? rotation.z : "0.0"});
        float fCosZ = cos(${rotation.z ? rotation.z : "0.0"});\n`;
      }

      
      code += `mat4 mtx${_isLocal ? "Local" : "World"} = `;
      code += Object.keys(_transformations)
        .map( (_key: string) => {
          let transformation: CodeMap = _transformations[_key] as CodeMap;
          switch (_key) {
            case "translate":
              return `mat4(
              1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              ${transformation.x ? transformation.x : "0.0"}, ${transformation.y ? transformation.y : "0.0"}, ${transformation.z ? transformation.z : "0.0"}, 1.0)`;
            case "rotate":
              return `mat4(
              fCosZ * fCosY, fSinZ * fCosY, -fSinY, 0.0,
              fCosZ * fSinY * fSinX - fSinZ * fCosX, fSinZ * fSinY * fSinX + fCosZ * fCosX, fCosY * fSinX, 0.0,
              fCosZ * fSinY * fCosX + fSinZ * fSinX, fSinZ * fSinY * fCosX - fCosZ * fSinX, fCosY * fCosX, 0.0,
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
        .reduce((_accumulator: string, _code: string) => `${_accumulator} * \n${_code}`);
      code += ";\n";
      return code;
    }

    private static generateColor(_color: CodeMap): string {
      let code: string = "";
      if (_color) {
        code += `v_vctColor = vec4(${_color.r ? _color.r : "1.0"}, ${_color.g ? _color.g : "1.0"}, ${_color.b ? _color.b : "1.0"}, ${_color.a ? _color.a : "1.0"});`;
      }

      return code;
    }
    //#endregion
  }
}