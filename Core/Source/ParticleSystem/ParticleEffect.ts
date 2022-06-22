namespace FudgeCore {
  export enum PARTICLE_VARIBALE_NAMES {
    TIME = "time",
    INDEX = "index",
    NUMBER_OF_PARTICLES = "numberOfParticles",
    RANDOM_NUMBERS = "randomNumbers"
  }

  interface ShaderCodeStructure {
    [attribute: string]: ShaderCodeStructure | string;
  }

  /**
   * The data format used to store the parsed paticle effect
   */
  export interface ParticleEffectStructure {
    [attribute: string]: ParticleEffectStructure | Function;
  }

  export type ClosureData = FunctionData | VariableData | ConstantData;

  export interface FunctionData {
    function: string;
    parameters: ClosureData[];
    readonly type: "function";
  }

  export interface VariableData {
    value: string;
    type: "variable";
  }

  export interface ConstantData {
    value: number;
    type: "constant";
  }

  /**
   * Holds all the information which defines the particle effect. Can load the said information out of a json file.
   * @authors Jonas Plotzky, HFU, 2020
   */
  export class ParticleEffect extends Mutable implements SerializableResource {
    public name: string;
    public idResource: string = undefined;

    public storageSystem: ParticleEffectStructure;
    public storageUpdate: ParticleEffectStructure;
    public storageParticle: ParticleEffectStructure;
    public mtxLocal: ParticleEffectStructure;
    public mtxWorld: ParticleEffectStructure;
    public componentMutators: ParticleEffectStructure;
    public cachedMutators: { [key: string]: Mutator };
    #data: Serialization;

    public program: WebGLProgram;
    public attributes: { [name: string]: number };
    public uniforms: { [name: string]: WebGLUniformLocation };

    constructor(_name: string = "ParticleEffect", _particleEffectData: Serialization = {}) {
      super();
      this.name = _name;
      this.data = _particleEffectData;

      Project.register(this);
    }

    public static isClosureData(_data: General): _data is ClosureData {
      return ParticleEffect.isFunctionData(_data) || ParticleEffect.isVariableData(_data) || ParticleEffect.isConstantData(_data);
    }

    public static isFunctionData(_data: General): _data is FunctionData {
      return (_data as FunctionData)?.type == "function";
    }

    public static isVariableData(_data: General): _data is VariableData {
      return (_data as VariableData)?.type == "variable";
    }

    public static isConstantData(_data: General): _data is ConstantData {
      return (_data as ConstantData)?.type == "constant";
    }

    private static generateCodeStructure(_data: Serialization): ShaderCodeStructure {
      if (!_data) return {};
  
      let effectStructure: ShaderCodeStructure = {};
  
      for (const key in _data) {
        let subData: General = _data[key];
        if (ParticleEffect.isClosureData(subData)) 
          effectStructure[key] = ParticleEffect.generateCode(subData);
        else
          effectStructure[key] = ParticleEffect.generateCodeStructure(subData);
      }
  
      return effectStructure;
    }   
  
    private static generateCode(_data: ClosureData): string {
      let predefinedVariableMap: {[key: string]: string} = {
        index: "particleIndex",
        numberOfParticles: "u_fNumberOfParticles",
        time: "u_fTime"
      };
      if (ParticleEffect.isFunctionData(_data)) {
        let parameters: string[] = [];
        for (let param of _data.parameters) {
          parameters.push(this.generateCode(param));
        }
        return ParticleEffect.createShaderCode(_data.function, parameters);
      }
  
      if (ParticleEffect.isVariableData(_data)) {
        let predefined: string = predefinedVariableMap[_data.value];
        return predefined ? predefined : _data.value;
      } 
  
      if (ParticleEffect.isConstantData(_data)) {
        let value: string = _data.value.toString();
        return `${value}${value.includes(".") ? "" : ".0"}` + "f";
      }
  
      throw `invalid node structure`;
    }
  
    private static createShaderCode(_function: string, _parameters: string[]): string {
      let closures: { [key: string]: Function } = {
        "addition": (_parameters: string[]) => _parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} + ${_value}`),
        "subtraction": (_parameters: string[]) => _parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} - ${_value}`),
        "multiplication": (_parameters: string[]) => _parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} * ${_value}`),
        "division": (_parameters: string[]) => _parameters.reduce((_accumulator: string, _value: string) => `${_accumulator} / ${_value}`),
        "modulo": (_parameters: string[]) => _parameters.reduce((_accumulator: string, _value: string) => `mod(${_accumulator}, ${_value})`),
        "linear": (_parameters: string[]) => "TODO",
        "polynomial": (_parameters: string[]) => "TODO",
        "squareRoot": (_parameters: string[]) => "TODO",
        "random": (_parameters: string[]) => "TODO"
      };

      if (_function in closures)
        return closures[_function](_parameters);
      else
        throw `"${_function}" is not an operation`;
    }

    private static createLocalTransformationsShaderCode(_transformations: ShaderCodeStructure): string {
      let code: string = "";
      if (_transformations) {
        for (const key in _transformations) {
          let transformation: ParticleEffectStructure = _transformations[key] as ParticleEffectStructure;
          switch (key) {
            case "translate":
              code += `mat4 translationMatrix = mat4(
              1.0, 0.0, 0.0, 0.0,
              0.0, 1.0, 0.0, 0.0,
              0.0, 0.0, 1.0, 0.0,
              ${transformation.x ? transformation.x : "0.0"}, ${transformation.y ? transformation.y : "0.0"}, ${transformation.z ? transformation.z : "0.0"}, 1.0);\n`;
              break;
            case "scale":
              code += `mat4 scalingMatrix = mat4(
              ${transformation.x ? transformation.x : "1.0"}, 0.0, 0.0, 0.0,
              0.0, ${transformation.y ? transformation.y : "1.0"}, 0.0, 0.0,
              0.0, 0.0, ${transformation.z ? transformation.z : "1.0"}, 0.0,
              0.0, 0.0, 0.0, 1.0
              );\n`;
              break;
            case "rotate":
              let sinX: string = `sin(${transformation.x ? transformation.x : "0.0"})`;
              let cosX: string = `cos(${transformation.x ? transformation.x : "0.0"})`;
              let sinY: string = `sin(${transformation.y ? transformation.y : "0.0"})`;
              let cosY: string = `cos(${transformation.y ? transformation.y : "0.0"})`;
              let sinZ: string = `sin(${transformation.z ? transformation.z : "0.0"})`;
              let cosZ: string = `cos(${transformation.z ? transformation.z : "0.0"})`;
              code += `mat4 rotationMatrix = mat4(
              ${cosZ} * ${cosY}, ${sinZ} * ${cosY}, -${sinY}, 0.0,
              ${cosZ} * ${sinY} * ${sinX} - ${sinZ} * ${cosX}, ${sinZ} * ${sinY} * ${sinX} + ${cosZ} * ${cosX}, ${cosY} * ${sinX}, 0.0,
              ${cosZ} * ${sinY} * ${cosX} + ${sinZ} * ${sinX}, ${sinZ} * ${sinY} * ${cosX} - ${cosZ} * ${sinX}, ${cosY} * ${cosX}, 0.0,
              0.0, 0.0, 0.0, 1.0
              );\n`;
              break;
          }
        }
      }
      return code;
    }

    private static createPositionShaderCode(_structure: ShaderCodeStructure): string {
      let positionCodeMap: {[key: string]: string} = {
        translate: "translationMatrix",
        scale: "scalingMatrix",
        rotate: "rotationMatrix"
      };
      
      let code: string = "";
      if (_structure) {
        for (const key in _structure) {
          code += `${positionCodeMap[key]} * `;
        }
      }
      return code;
    }

    /**
     * Parse the given effect data recursivley. The hierachy of the json file will be kept. Constants, variables("time") and functions definitions will be replaced with functions.
     * @param _data The particle effect data to parse recursivley.
     */
    private static parseData(_data: Serialization, _variableNames: string[]): ParticleEffectStructure {
      if (!_data || !_variableNames) return {};

      let effectStructure: ParticleEffectStructure = {};

      for (const key in _data) {
        let subData: General = _data[key];
        if (ParticleEffect.isClosureData(subData)) 
          effectStructure[key] = ParticleEffect.parseClosure(subData, _variableNames);
        else
          effectStructure[key] = ParticleEffect.parseData(subData, _variableNames);
      }

      return effectStructure;
    }   

    /**
     * Parse the given closure data recursivley. Returns a function depending on the closure data.
     * @param _data The closure data to parse recursively.
     */
    private static parseClosure(_data: ClosureData, _variableNames: string[]): Function {
      if (ParticleEffect.isFunctionData(_data)) {
        let parameters: Function[] = [];
        for (let param of _data.parameters) {
          parameters.push(ParticleEffect.parseClosure(param, _variableNames));
        }
        return ParticleClosureFactory.createClosure(_data.function, parameters);
      }

      if (ParticleEffect.isVariableData(_data)) {
        if (_variableNames.includes(_data.value)) {
          return function (_variables: ParticleVariables): number {
            // Debug.log("Variable", `"${_data}"`, _variables[<string>_data]);
            return <number>_variables[_data.value];
          };
        } else {
          throw `"${_data.value}" is not a defined variable in the ${this.name}`;
        }
      } 

      if (ParticleEffect.isConstantData(_data)) {
        return function (_variables: ParticleVariables): number {
          // Debug.log("Constant", _data);
          return <number>_data.value;
        };
      }

      throw `invalid node structure`;
    }

    /**
     * Creates entries in {@link variableNames} for each defined closure in _data. Predefined variables (time, index...) and previously defined ones (in json) can not be overwritten.
     * @param _data The paticle effect data to parse.
     */
    private static preParseStorage(_data: Serialization, _variableNames: string[]): string[] {
      for (const storageName in _data) {
        let storage: Serialization  = _data[storageName];
        for (const variableName in storage) {
          if (_variableNames.includes(variableName)) {
            throw `"${variableName}" is already defined in the ${this.name} or predefined`;
          }
          else
            _variableNames.push(variableName);
        }
      }

      return _variableNames;
    }

    private static createStorageShaderCode(_storage: ShaderCodeStructure): string {
      let code: string = "";
      if (_storage) {
        for (const partitionName in _storage) {
          let partition: ParticleEffectStructure = _storage[partitionName] as ParticleEffectStructure;
          for (const variableName in partition) {
            code += `float ${variableName} = ${partition[variableName]};\n`;
          }
        }
      }
      return code;
    }
    
    public get data(): Serialization {
      return this.#data;
    }

    public set data(_data: Serialization) {
      this.#data = _data;
      this.parse(_data);
    }
 
    /**
     * Asynchronously loads the json from the given url and parses it initializing this particle effect.
     */
    public async load(_url: RequestInfo): Promise<void> {
      if (!_url) return;

      let data: Serialization = await window.fetch(_url)
        .then(_response => _response.json());
        // .then(data => this.desirializeData(data));
      this.data = data;
    }

    public getVertexShaderSource(): string { 
      let shaderCodeStructure: ShaderCodeStructure = ParticleEffect.generateCodeStructure(this.data);
      let source: string = ShaderParticle.getVertexShaderSource()
        .replace("/*$selfDefinedVariables*/", ParticleEffect.createStorageShaderCode(shaderCodeStructure["storage"] as ShaderCodeStructure))
        .replace("/*$localTransformationMatrices*/", ParticleEffect.createLocalTransformationsShaderCode((shaderCodeStructure["transformations"] as ShaderCodeStructure).local as ShaderCodeStructure))
        .replace("/*$localTransformations*/", ParticleEffect.createPositionShaderCode((shaderCodeStructure["transformations"] as ShaderCodeStructure).local as ShaderCodeStructure));
      
      return source; 
    }

    public getFragmentShaderSource(): string { return ShaderParticle.getFragmentShaderSource(); }
  
    public useProgram(): void {      
      if (!this.program)
        this.createProgram();
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      crc3.useProgram(this.program);
    }
  
    public deleteProgram(): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      if (this.program) {
        crc3.deleteProgram(this.program);
        delete this.attributes;
        delete this.uniforms;
      }
    }
  
    public createProgram(): void {
      Debug.fudge("Create shader program", ShaderParticle.name);
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      let program: WebGLProgram = crc3.createProgram();
      try {
        let shdVertex: WebGLShader = compileShader(this.getVertexShaderSource(), WebGL2RenderingContext.VERTEX_SHADER);
        let shdFragment: WebGLShader = compileShader(this.getFragmentShaderSource(), WebGL2RenderingContext.FRAGMENT_SHADER);
        crc3.attachShader(program, RenderWebGL.assert<WebGLShader>(shdVertex));
        crc3.attachShader(program, RenderWebGL.assert<WebGLShader>(shdFragment));
        crc3.linkProgram(program);
        let error: string = RenderWebGL.assert<string>(crc3.getProgramInfoLog(program));
        if (error !== "") {
          throw new Error("Error linking Shader: " + error);
        }
  
        this.program = program;
        this.attributes = detectAttributes();
        this.uniforms = detectUniforms();
  
      } catch (_error) {
        Debug.error(_error);
        debugger;
      }
  
  
      function compileShader(_shaderCode: string, _shaderType: GLenum): WebGLShader | null {
        let webGLShader: WebGLShader = crc3.createShader(_shaderType);
        crc3.shaderSource(webGLShader, _shaderCode);
        crc3.compileShader(webGLShader);
        let error: string = RenderWebGL.assert<string>(crc3.getShaderInfoLog(webGLShader));
        if (error !== "") {
          throw new Error("Error compiling shader: " + error);
        }
        // Check for any compilation errors.
        if (!crc3.getShaderParameter(webGLShader, WebGL2RenderingContext.COMPILE_STATUS)) {
          alert(crc3.getShaderInfoLog(webGLShader));
          return null;
        }
        return webGLShader;
      }
      function detectAttributes(): { [name: string]: number } {
        let detectedAttributes: { [name: string]: number } = {};
        let attributeCount: number = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_ATTRIBUTES);
        for (let i: number = 0; i < attributeCount; i++) {
          let attributeInfo: WebGLActiveInfo = RenderWebGL.assert<WebGLActiveInfo>(crc3.getActiveAttrib(program, i));
          if (!attributeInfo) {
            break;
          }
          detectedAttributes[attributeInfo.name] = crc3.getAttribLocation(program, attributeInfo.name);
        }
        return detectedAttributes;
      }
      function detectUniforms(): { [name: string]: WebGLUniformLocation } {
        let detectedUniforms: { [name: string]: WebGLUniformLocation } = {};
        let uniformCount: number = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_UNIFORMS);
        for (let i: number = 0; i < uniformCount; i++) {
          let info: WebGLActiveInfo = RenderWebGL.assert<WebGLActiveInfo>(crc3.getActiveUniform(program, i));
          if (!info) {
            break;
          }
          detectedUniforms[info.name] = RenderWebGL.assert<WebGLUniformLocation>(crc3.getUniformLocation(program, info.name));
        }
        return detectedUniforms;
      }
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization =  {
        idResource: this.idResource,
        name: this.name,
        data: this.data
      };
      return serialization;
    }
    
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      Project.register(this, _serialization.idResource);
      this.name = _serialization.name;
      this.data = _serialization.data;
      return this;
    }

    public getMutatorForUserInterface(): MutatorForUserInterface {
      return <MutatorForUserInterface>super.getMutator();
    }

    public getMutator(): Mutator {
      let mutator: Mutator = super.getMutator(true);
      mutator.data = this.data;
      return mutator;
    }
    
    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.storageSystem;
      delete _mutator.storageUpdate;
      delete _mutator.storageParticle;
      delete _mutator.transformLocal;
      delete _mutator.transformWorld;
      delete _mutator.componentMutations;
      delete _mutator.cachedMutators;
      delete _mutator.definedVariables;
    }
    //#endregion

    /**
     * Parses the data initializing this particle effect with the corresponding closures
     * @param _data The paticle effect data to parse.
     */
    private parse(_data: Serialization): void {
      let variableNames: string[] = Object.values(PARTICLE_VARIBALE_NAMES);
      let dataStorage: Serialization = _data.storage;
      if (dataStorage) {
        variableNames = ParticleEffect.preParseStorage(dataStorage, variableNames);
        this.storageSystem = ParticleEffect.parseData(dataStorage.system, variableNames);
        this.storageUpdate = ParticleEffect.parseData(dataStorage.update, variableNames);
        this.storageParticle = ParticleEffect.parseData(dataStorage.particle, variableNames);
      }

      let dataTransform: Serialization = _data.transformations;
      if (dataTransform) {
        this.mtxLocal = ParticleEffect.parseData(dataTransform.local, variableNames);
        this.mtxWorld = ParticleEffect.parseData(dataTransform.world, variableNames);
      }
      
      let dataComponents: Serialization = _data.components;
      if (dataComponents) {
        this.componentMutators = ParticleEffect.parseData(dataComponents, variableNames);
      }

      this.cachedMutators = {};
      this.cacheMutators(this.mtxLocal);
      this.cacheMutators(this.mtxWorld);
      this.cacheMutators(this.componentMutators);
    }

    /**
     * Create mutators from the given _effectStructure and cache them.
     */
    private cacheMutators(_effectStructure: ParticleEffectStructure): void {
      for (const attribute in _effectStructure) {
        let effectStructureOrFunction: ParticleEffectStructure | Function = _effectStructure[attribute];
        if (effectStructureOrFunction instanceof Function) continue;

        this.cachedMutators[attribute] = this.createEmptyMutatorFrom(effectStructureOrFunction);
      }
    }

    /**
     * Create an empty mutator from _effectStructure.
     */
    private createEmptyMutatorFrom(_effectStructure: ParticleEffectStructure): Mutator {
      let mutator: Mutator = {};
      for (const attribute in _effectStructure) {
        let effectStructureOrFunction: ParticleEffectStructure | Function = _effectStructure[attribute];
        if (effectStructureOrFunction instanceof Function) {
          mutator[attribute] = null;
        } else {
          mutator[attribute] = this.createEmptyMutatorFrom(effectStructureOrFunction);
        }
      }
      return mutator;
    }

    
    
  }
}