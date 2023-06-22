namespace FudgeCore {
  export namespace ParticleData {
    export enum FUNCTION {
      // VALUE = "value",
      ADDITION = "addition",
      SUBTRACTION = "subtraction",
      MULTIPLICATION = "multiplication",
      DIVISION = "division",
      MODULO = "modulo",
      POWER = "power",
      POLYNOMIAL3 = "polynomial3",
      SQUARE_ROOT = "squareRoot",
      RANDOM = "random",
      RANDOM_RANGE = "randomRange"
    }

    export const FUNCTION_MINIMUM_PARAMETERS: { [key in ParticleData.FUNCTION]: number } = {
      // [ParticleData.FUNCTION.VALUE]: 1,
      [ParticleData.FUNCTION.ADDITION]: 2,
      [ParticleData.FUNCTION.SUBTRACTION]: 2,
      [ParticleData.FUNCTION.MULTIPLICATION]: 2,
      [ParticleData.FUNCTION.DIVISION]: 2,
      [ParticleData.FUNCTION.MODULO]: 2,
      [ParticleData.FUNCTION.POWER]: 2,
      [ParticleData.FUNCTION.POLYNOMIAL3]: 5,
      [ParticleData.FUNCTION.SQUARE_ROOT]: 1,
      [ParticleData.FUNCTION.RANDOM]: 1,
      [ParticleData.FUNCTION.RANDOM_RANGE]: 3
    };

    export const PREDEFINED_VARIABLES: { [key: string]: string } = {
      systemDuration: "u_fParticleSystemDuration",
      systemSize: "u_fParticleSystemSize",
      systemTime: "u_fParticleSystemTime",
      particleId: "fParticleId"
    };
  }

  /**
   * Compiles particle system shaders from shader universal derivates for WebGL
   * @authors Jonas Plotzky, HFU, 2022
   */
  export class RenderInjectorShaderParticleSystem extends RenderInjectorShader {
    public static readonly FUNCTIONS: { [key in ParticleData.FUNCTION]: Function } = {
      // [ParticleData.FUNCTION.VALUE]: (_parameters: string[]) => {
      //   return `(${_parameters[0]})`;
      // },
      [ParticleData.FUNCTION.ADDITION]: (_parameters: string[]) => {
        return `(${_parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} + ${_value}`)})`;
      },
      [ParticleData.FUNCTION.SUBTRACTION]: (_parameters: string[]) => {
        return `(${_parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} - ${_value}`)})`;
      },
      [ParticleData.FUNCTION.MULTIPLICATION]: (_parameters: string[]) => {
        return `(${_parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} * ${_value}`)})`;
      },
      [ParticleData.FUNCTION.DIVISION]: (_parameters: string[]) => {
        return `(${_parameters[0]} / ${_parameters[1]})`;
      },
      [ParticleData.FUNCTION.MODULO]: (_parameters: string[]) => {
        return `(${_parameters.reduce((_accumulator: string, _value: string) => `mod(${_accumulator}, ${_value})`)})`;
      },
      [ParticleData.FUNCTION.POWER]: (_parameters: string[]) => {
        return `pow(${_parameters[0]}, ${_parameters[1]})`;
      },
      [ParticleData.FUNCTION.POLYNOMIAL3]: (_parameters: string[]) => {
        let x: string = _parameters[0];
        let a: string = _parameters[1];
        let b: string = _parameters[2];
        let c: string = _parameters[3];
        let d: string = _parameters[4];
        return `(${a} * pow(${x}, 3.0) + ${b} * pow(${x}, 2.0) + ${c} * ${x} + ${d})`;
      },
      [ParticleData.FUNCTION.SQUARE_ROOT]: (_parameters: string[]) => {
        let x: string = _parameters[0];
        return `sqrt(${x})`;
      },
      [ParticleData.FUNCTION.RANDOM]: (_parameters: string[]) => {
        return `fetchRandomNumber(int(${_parameters[0]}), iParticleSystemRandomNumbersSize, iParticleSystemRandomNumbersLength)`;
      },
      [ParticleData.FUNCTION.RANDOM_RANGE]: (_parameters: string[]) => {
        return `(${RenderInjectorShaderParticleSystem.FUNCTIONS["random"](_parameters)} * (${_parameters[2]} - ${_parameters[1]}) + ${_parameters[1]})`;
      }
    };

    public static override decorate(_constructor: Function): void {
      super.decorate(_constructor.prototype);
      Object.defineProperty(_constructor.prototype, "getVertexShaderSource", {
        value: RenderInjectorShaderParticleSystem.getVertexShaderSource
      });
      Object.defineProperty(_constructor.prototype, "getFragmentShaderSource", {
        value: RenderInjectorShaderParticleSystem.getFragmentShaderSource
      });
    }

    public static getVertexShaderSource(this: ShaderParticleSystem): string {
      let data: ParticleData.System = this.data;
      let mtxLocal: ParticleData.Transformation[] = data?.mtxLocal;
      let mtxWorld: ParticleData.Transformation[] = data?.mtxWorld;

      let source: string = this.vertexShaderSource
        .replace("#version 300 es", `#version 300 es\n#define ${this.define[0]}${data.color ? "\n#define PARTICLE_COLOR" : ""}`)
        .replace("/*$variables*/", RenderInjectorShaderParticleSystem.generateVariables(data?.variables, data?.variableNames))
        .replace("/*$mtxLocal*/", RenderInjectorShaderParticleSystem.generateTransformations(mtxLocal, "Local"))
        .replace("/*$mtxLocal*/", mtxLocal && mtxLocal.length > 0 ? "* mtxLocal" : "")
        .replace("/*$mtxWorld*/", RenderInjectorShaderParticleSystem.generateTransformations(mtxWorld, "World"))
        .replace("/*$mtxWorld*/", mtxWorld && mtxWorld.length > 0 ? "mtxWorld *" : "")
        .replaceAll("/*$color*/", RenderInjectorShaderParticleSystem.generateColor(data?.color));
      return source;
    }

    public static getFragmentShaderSource(this: ShaderParticleSystem): string {
      return this.fragmentShaderSource.replace("#version 300 es", `#version 300 es${this.data.color ? "\n#define PARTICLE_COLOR" : ""}`);
    }

    //#region code generation

    private static generateVariables(_variables: ParticleData.System["variables"], _variableNames: ParticleData.System["variableNames"]): string {
      if (!_variables) return "";

      return _variables
        .map((_variable, _index) => ({ name: "fParticleSystemVariable_" + _variableNames[_index], value: RenderInjectorShaderParticleSystem.generateExpression(_variable) }))
        .map(_variable => `float ${_variable.name} = ${_variable.value};`)
        .reduce((_accumulator: string, _code: string) => `${_accumulator}\n${_code}`, "");
    }

    private static generateTransformations(_transformations: ParticleData.System["mtxLocal"], _localOrWorld: "Local" | "World"): string {
      if (!_transformations || _transformations.length == 0) return "";

      let transformations: [ParticleData.Transformation["transformation"], string, string, string][] = _transformations
        .map(_data => {
          let isScale: boolean = _data.transformation === "scale";
          let [x, y, z] = [_data.parameters[0], _data.parameters[1], _data.parameters[2]]
            .map((_value) => _value ? RenderInjectorShaderParticleSystem.generateExpression(_value) : (isScale ? "1.0" : "0.0")) as [string, string, string];

          return [_data.transformation, x, y, z];
        });

      let code: string = "";
      code += transformations
        .map(([_transformation, _x, _y, _z], _index: number) => {
          let rotateId: string = _index + _localOrWorld;
          if (_transformation == "rotate") {
            let toRadians: (_value: string) => string = (_value: string) => `${_value} * ${Calc.deg2rad}`;
            return `float fXRadians${rotateId} = ${toRadians(_x)};
              float fYRadians${rotateId} = ${toRadians(_y)};
              float fZRadians${rotateId} = ${toRadians(_z)};
              float fSinX${rotateId} = sin(fXRadians${rotateId});
              float fCosX${rotateId} = cos(fXRadians${rotateId}); 
              float fSinY${rotateId} = sin(fYRadians${rotateId});
              float fCosY${rotateId} = cos(fYRadians${rotateId});
              float fSinZ${rotateId} = sin(fZRadians${rotateId});
              float fCosZ${rotateId} = cos(fZRadians${rotateId});\n`;
          } else
            return "";
        })
        .filter((_transformation: string) => _transformation != "")
        .reduce((_accumulator: string, _code: string) => `${_accumulator}\n${_code}`, "");
      code += "\n";

      code += `mat4 mtx${_localOrWorld} = `;
      code += transformations
        .map(([_transformation, _x, _y, _z], _index: number) => {
          let rotateId: string = _index + _localOrWorld;
          switch (_transformation) {
            case "translate":
              return `mat4(
              1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              ${_x}, ${_y}, ${_z}, 1.0)`;
            case "rotate":
              return `mat4(
              fCosZ${rotateId} * fCosY${rotateId}, fSinZ${rotateId} * fCosY${rotateId}, -fSinY${rotateId}, 0.0,
              fCosZ${rotateId} * fSinY${rotateId} * fSinX${rotateId} - fSinZ${rotateId} * fCosX${rotateId}, fSinZ${rotateId} * fSinY${rotateId} * fSinX${rotateId} + fCosZ${rotateId} * fCosX${rotateId}, fCosY${rotateId} * fSinX${rotateId}, 0.0,
              fCosZ${rotateId} * fSinY${rotateId} * fCosX${rotateId} + fSinZ${rotateId} * fSinX${rotateId}, fSinZ${rotateId} * fSinY${rotateId} * fCosX${rotateId} - fCosZ${rotateId} * fSinX${rotateId}, fCosY${rotateId} * fCosX${rotateId}, 0.0,
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
              throw `Error in ${ParticleSystem.name}: "${_transformation}" is not a transformation`;
          }
        })
        .reduce((_accumulator: string, _code: string) => `${_accumulator} * \n${_code}`);
      code += ";\n";

      return code;
    }

    private static generateColor(_color: ParticleData.Expression[]): string {
      if (!_color) return "";

      let rgba: string = [_color[0], _color[1], _color[2], _color[3]]
        .map((_value): string => _value ? RenderInjectorShaderParticleSystem.generateExpression(_value) : "1.0")
        .join(", ");

      return `vec4(${rgba});`;
    }

    private static generateExpression(_expression: ParticleData.Expression): string {
      if (ParticleData.isFunction(_expression)) {
        let parameters: string[] = [];
        for (let param of _expression.parameters) {
          parameters.push(RenderInjectorShaderParticleSystem.generateExpression(param));
        }
        return RenderInjectorShaderParticleSystem.generateFunction(_expression.function, parameters);
      }

      if (ParticleData.isVariable(_expression)) {
        return ParticleData.PREDEFINED_VARIABLES[_expression.value] || "fParticleSystemVariable_" + _expression.value;
      }

      if (ParticleData.isConstant(_expression)) {
        let value: string = _expression.value.toString();
        return `${value}${value.includes(".") ? "" : ".0"}`;
      }

      if (ParticleData.isCode(_expression)) {
        let code: string = _expression.code
          .replaceAll(/\b[a-zA-z]+\w*(?!\()\b/g, (_match) => ParticleData.PREDEFINED_VARIABLES[_match] || "fParticleSystemVariable_" + _match)
          .replaceAll(/(?<!\.)\b\d+\b(?!\.)/g, (_match) => _match + ".0");
        code = RenderInjectorShaderParticleSystem.replaceFunctions(code);

        return code;
      }

      throw `Error in ${ParticleSystem.name}: invalid node structure in particle system serialization`;
    }

    private static generateFunction(_function: ParticleData.FUNCTION, _parameters: string[]): string {
      if (_parameters.length < ParticleData.FUNCTION_MINIMUM_PARAMETERS[_function])
        throw `Error in ${ParticleSystem.name}: "${_function}" needs at least ${ParticleData.FUNCTION_MINIMUM_PARAMETERS[_function]} parameters`;
      if (Object.values(ParticleData.FUNCTION).includes(_function))
        return RenderInjectorShaderParticleSystem.FUNCTIONS[_function](_parameters);
      else
        throw `Error in ${ParticleSystem.name}: "${_function}" is not an operation`;
    }

    private static replaceFunctions(_code: string): string {
      let functionRegex: RegExp = /\b[a-zA-z_]+\w*\(/g;
      let match: RegExpExecArray;
      while ((match = functionRegex.exec(_code)) != null) {
        let functionGenerator: Function = RenderInjectorShaderParticleSystem.FUNCTIONS[<ParticleData.FUNCTION>match[0].slice(0, -1)];
        if (!functionGenerator)
          continue;

        let commaIndices: number[] = [];
        let openBrackets: number = 1;
        let argumentsLastIndex: number = functionRegex.lastIndex;
        while (openBrackets > 0) {
          switch (_code[argumentsLastIndex]) {
            case "(":
              openBrackets++;
              break;
            case ")":
              openBrackets--;
              break;
            case ",":
              if (openBrackets == 1)
                commaIndices.push(argumentsLastIndex);
              break;
          }
          argumentsLastIndex++;
        }

        let args: string[] =
          [functionRegex.lastIndex - 1, ...commaIndices, argumentsLastIndex - 1].reduce<string[]>((_accumulator, _position, _index, _positions) => {
            return _index == _positions.length - 1 ?
              _accumulator :
              _accumulator.concat(_code.slice(_position + 1, _positions[_index + 1]).trim());
          }, []);

        functionRegex.lastIndex = match.index;
        _code = `${_code.slice(0, match.index)}(${functionGenerator(args)})${_code.slice(argumentsLastIndex)}`;
      }
      return _code;
    }
    //#endregion
  }
}