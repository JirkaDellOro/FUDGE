namespace FudgeCore {

  export enum PARTICLE_VARIBALE_NAMES {
    TIME = "time",
    INDEX = "index",
    SIZE = "size",
    RANDOM_NUMBERS = "randomNumbers"
  }

  /**
   * The data format used to store the parsed paticle effect
   */
  export interface ParticleEffectStructure {
    [attribute: string]: ParticleEffectStructure | Function;
  }

  export interface FunctionData {
    function: string;
    parameters: (FunctionData | string | number)[];
    readonly type: "function";
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

    constructor(_name: string = "ParticleEffect", _particleEffectData: Serialization = {}) {
      super();
      this.name = _name;
      this.data = _particleEffectData;

      Project.register(this);
    }

    public static isClosureData(_data: General): _data is FunctionData | string | number {
      return ParticleEffect.isFunctionData(_data) || typeof _data == "string" || typeof _data == "number";
    }

    public static isFunctionData(_data: General): _data is FunctionData {
      return (_data as FunctionData).type == "function";
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
    private static parseClosure(_data: FunctionData | string | number, _variableNames: string[]): Function {
      if (ParticleEffect.isFunctionData(_data)) {
        let parameters: Function[] = [];
        for (let param of _data.parameters) {
          parameters.push(ParticleEffect.parseClosure(param, _variableNames));
        }
        return ParticleClosureFactory.createClosure(_data.function, parameters);
      }

      if (typeof _data == "string") {
        if (_variableNames.includes(_data)) {
          return function (_variables: ParticleVariables): number {
            // Debug.log("Variable", `"${_data}"`, _variables[<string>_data]);
            return <number>_variables[_data];
          };
        } else {
          throw `"${_data}" is not a defined variable in the ${this.name}`;
        }
      } 

      if (typeof _data == "number") {
        return function (_variables: ParticleVariables): number {
          // Debug.log("Constant", _data);
          return <number>_data;
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