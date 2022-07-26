namespace FudgeCore {
  export class RenderInjectorShaderParticleSystem extends RenderInjectorShader {
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
        const maxWidth: string = RenderInjectorShaderParticleSystem.RANDOM_NUMBERS_TEXTURE_MAX_WIDTH.toString() + ".0";
        return `texelFetch(u_fRandomNumbers, ivec2(mod(${_parameters[0]}, ${maxWidth}), ${_parameters[0]} / ${maxWidth}), 0).r`;
      },
      "randomRange": (_parameters: string[]) => {
        return `${RenderInjectorShaderParticleSystem.FUNCTIONS["random"](_parameters)} * (${_parameters[2]} - ${_parameters[1]}) + ${_parameters[1]}`;
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
        value: RenderInjectorShaderParticleSystem.getVertexShaderSource
      });
      Object.defineProperty(_constructor.prototype, "getFragmentShaderSource", {
        value: RenderInjectorShaderParticleSystem.getFragmentShaderSource
      });
    }

    public static getVertexShaderSource(this: ShaderParticleSystem): string {
      let data: ParticleEffectData = RenderInjectorShaderParticleSystem.renameVariables(this.particleEffect.data);
      let mtxLocal: TransformationData[] = data?.mtxLocal;
      let mtxWorld: TransformationData[] = data?.mtxWorld;

      let source: string = this.vertexShaderSource
        .replace("#version 300 es", `#version 300 es\n#define ${this.define[0]}${data.color ? "\n#define PARTICLE_COLOR" : ""}`)
        .replace("/*$variables*/", RenderInjectorShaderParticleSystem.generateVariables(data?.variables))
        .replace("/*$mtxLocal*/", RenderInjectorShaderParticleSystem.generateTransformations(mtxLocal, "Local"))
        .replace("/*$mtxLocal*/", mtxLocal && mtxLocal.length > 0 ? "* mtxLocal" : "")
        .replace("/*$mtxWorld*/", RenderInjectorShaderParticleSystem.generateTransformations(mtxWorld, "World"))
        .replace("/*$mtxWorld*/", mtxWorld && mtxWorld.length > 0 ? "mtxWorld *" : "")
        .replaceAll("/*$color*/", RenderInjectorShaderParticleSystem.generateColor(data?.color));
      return source; 
    }

    public static getFragmentShaderSource(this: ShaderParticleSystem): string {
      return this.fragmentShaderSource.replace("#version 300 es", `#version 300 es${this.particleEffect.data.color ? "\n#define PARTICLE_COLOR" : ""}`);
    }
    
    //#region code generation
    protected static appendDefines(_shader: string, _defines: string[]): string {
      if (!_defines)
        return _shader;

      let code: string = `#version 300 es\n`;
      for (let define of _defines)
        code += `#define ${define}\n`;

      return _shader.replace("#version 300 es", code);
    }

    private static renameVariables(_data: ParticleEffectData): ParticleEffectData {
      if (!_data.variables) return _data;

      let variableMap: {[key: string]: string} = {};
      Object.keys(_data.variables).forEach( (_variableName, _index) => {
        if (RenderInjectorShaderParticleSystem.PREDEFINED_VARIABLES[_variableName])
          throw `Error in ${ParticleEffect.name}: "${_variableName}" is a predefined variable and can not be redeclared`;
        else
          return variableMap[_variableName] = `fVariable${_index}`; 
      });

      let dataRenamed: ParticleEffectData = JSON.parse(JSON.stringify(_data));
      dataRenamed.variables = Object.fromEntries(Object.entries(dataRenamed.variables).map( ([_name, _exrpession]) => [variableMap[_name], _exrpession] ));
      renameRecursive(dataRenamed);
      return dataRenamed;

      function renameRecursive(_data: ParticleEffectData): void {
        if (ParticleEffect.isVariableData(_data)) {
          let newName: string = RenderInjectorShaderParticleSystem.PREDEFINED_VARIABLES[_data.name] || variableMap[_data.name];
          if (newName)
            _data.name = newName;
          else
            throw `Error in ${ParticleEffect.name}: "${newName}" is not a defined variable`;
        } else {
          for (const key in _data) {
            if (typeof _data[key] == "string")
              continue;
            else
              renameRecursive(_data[key]);
          }
        }
      }
    } 

    private static generateVariables(_variables: {[name: string]: ExpressionData}): string {
      if (!_variables) return "";
      
      return Object.entries(_variables)
        .map( ([_variableName, _expressionTree]): [string, string] => [_variableName, RenderInjectorShaderParticleSystem.generateExpression(_expressionTree)] )
        .map( ([_variableName, _code]): string => `float ${_variableName} = ${_code};` )
        .reduce( (_accumulator: string, _code: string) => `${_accumulator}\n${_code}`, "" );
    }

    private static generateTransformations(_transformations: TransformationData[], _localOrWorld: "Local" | "World"): string {
      if (!_transformations || _transformations.length == 0) return "";

      type Transformation = "translate" | "rotate" | "scale"; // TODO: maybe extract this from TransformationData eg. Pick<TransformationData, "transformation">;
      type CodeTransformation = [Transformation, string, string, string];

      let transformations: CodeTransformation[] = _transformations
        .map( (_data: TransformationData): CodeTransformation => {
          let isScale: boolean = _data.transformation === "scale";
          let [x, y, z] = [_data.x, _data.y, _data.z]
            .map( (_value) => _value ? RenderInjectorShaderParticleSystem.generateExpression(_value) : (isScale ? "1.0" : "0.0") ) as [string, string, string];

          return [_data.transformation, x, y, z];
        });

      let code: string = "";
      code += transformations
        .map( ([_transformation, _x, _y, _z]: CodeTransformation, _index: number) => {
          if (_transformation == "rotate") {
            let sin: (_value: string) => string = (_value: string) => _value == "0.0" ? "0.0" : `sin(${_value})`;
            let cos: (_value: string) => string = (_value: string) => _value == "0.0" ? "1.0" : `cos(${_value})`;

            return `float fSinX${_index} = ${sin(_x)};
              float fCosX${_index} = ${cos(_x)};
              float fSinY${_index} = ${sin(_y)};
              float fCosY${_index} = ${cos(_y)};
              float fSinZ${_index} = ${sin(_z)};
              float fCosZ${_index} = ${cos(_z)};\n`;
          } else
            return "";
        })
        .filter( (_transformation: string) => _transformation != "")
        .reduce( (_accumulator: string, _code: string) => `${_accumulator}\n${_code}`, "" );
      code += "\n";
      
      code += `mat4 mtx${_localOrWorld} = `;
      code += transformations
        .map( ([_transformation, _x, _y, _z]: CodeTransformation, _index: number) => {
          switch (_transformation) {
            case "translate":
              return `mat4(
              1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              ${_x}, ${_y}, ${_z}, 1.0)`;
            case "rotate":
              return `mat4(
              fCosZ${_index} * fCosY${_index}, fSinZ${_index} * fCosY${_index}, -fSinY${_index}, 0.0,
              fCosZ${_index} * fSinY${_index} * fSinX${_index} - fSinZ${_index} * fCosX${_index}, fSinZ${_index} * fSinY${_index} * fSinX${_index} + fCosZ${_index} * fCosX${_index}, fCosY${_index} * fSinX${_index}, 0.0,
              fCosZ${_index} * fSinY${_index} * fCosX${_index} + fSinZ${_index} * fSinX${_index}, fSinZ${_index} * fSinY${_index} * fCosX${_index} - fCosZ${_index} * fSinX${_index}, fCosY${_index} * fCosX${_index}, 0.0,
              0.0, 0.0, 0.0, 1.0
              )`;
            case "scale":
              return `mat4(
              ${_x}, 0.0, 0.0, 0.0,
              0.0, ${_y}, 0.0, 0.0,
              0.0, 0.0, ${_z}, 0.0,
              0.0, 0.0, 0.0, 1.0
              )`;
            default:
              throw `Error in ${ParticleEffect.name}: "${_transformation}" is not a transformation`;    
          }
        })
        .reduce( (_accumulator: string, _code: string) => `${_accumulator} * \n${_code}`);
      code += ";\n";

      return code;
    }

    private static generateColor(_color: {r?: ExpressionData, g?: ExpressionData, b?: ExpressionData, a?: ExpressionData}): string {
      if (!_color) return "";
      
      let [r, g, b, a]: [string, string, string, string] = [_color.r, _color.g, _color.b, _color.a]
        .map( (_value): string => _value ? RenderInjectorShaderParticleSystem.generateExpression(_value) : "1.0" ) as [string, string, string, string];

      return `vec4(${r}, ${g}, ${b}, ${a});`;
    }

    private static generateExpression(_expression: ExpressionData): string {
      if (ParticleEffect.isFunctionData(_expression)) {
        let parameters: string[] = [];
        for (let param of _expression.parameters) {
          parameters.push(RenderInjectorShaderParticleSystem.generateExpression(param));
        }
        return RenderInjectorShaderParticleSystem.generateFunction(_expression.function, parameters);
      }
  
      if (ParticleEffect.isVariableData(_expression)) {
        return _expression.name;
      } 
  
      if (ParticleEffect.isConstantData(_expression)) {
        let value: string = _expression.value.toString();
        return `${value}${value.includes(".") ? "" : ".0"}`;
      }
  
      throw `Error in ${ParticleEffect.name}: invalid node structure in particle effect serialization`;
    }
  
    private static generateFunction(_function: string, _parameters: string[]): string {
      if (_function in RenderInjectorShaderParticleSystem.FUNCTIONS)
        return RenderInjectorShaderParticleSystem.FUNCTIONS[_function](_parameters);
      else
        throw `Error in ${ParticleEffect.name}: "${_function}" is not an operation`;
    }
    //#endregion
  }
}