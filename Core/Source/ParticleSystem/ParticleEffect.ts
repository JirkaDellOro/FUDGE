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

  /**
   * The data format used to parse the paticle effect
   */
  interface ParticleEffectData {
    [attribute: string]: ParticleEffectData | ClosureData;
  }

  /**
   * The parsing expression grammar.
   */
  type ClosureData = ClosureDataFunction | string | number;

  interface ClosureDataFunction {
    function: string;
    parameters: ClosureData[];
  }

  /**
   * Holds all the information which defines the particle effect. Can load the said information out of a json file.
   * @authors Jonas Plotzky, HFU, 2020
   */
  export class ParticleEffect extends Mutable implements SerializableResource {
    public name: string;
    public idResource: string = undefined;
    public url: RequestInfo = "";

    public storageSystem: ParticleEffectStructure;
    public storageUpdate: ParticleEffectStructure;
    public storageParticle: ParticleEffectStructure;
    // ParticleEffectData could be replaced with Functions that take Mtx4/Components as arguments and know what to do with it.
    public transformLocal: ParticleEffectStructure;
    public transformWorld: ParticleEffectStructure;
    public componentMutations: ParticleEffectStructure;
    public cachedMutators: { [key: string]: Mutator };
    private definedVariables: string[]; // these are used to throw errors only

    constructor(_name: string = "ParticleEffect", _url?: RequestInfo) {
      super();
      this.name = _name;
      if (_url) {
        this.load(_url);
        this.name = _url.toString().split("/").pop();
      }

      Project.register(this);
    }

    /**
     * Asynchronously loads the json from the given url and parses it initializing this particle effect.
     */
    public async load(_url: RequestInfo): Promise<void> {
      if (!_url) return;

      this.url = _url;
      let data: ParticleEffectData = await window.fetch(_url)
        .then(_response => _response.json());
      this.parse(data);
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization =  {
        idResource: this.idResource,
        name: this.name,
        // type: this.type,
        url: this.url
      };
      return serialization;
    }
    
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      Project.register(this, _serialization.idResource);
      this.name = _serialization.name;
      await this.load(_serialization.url);
      return this;
    }
    
    public async mutate(_mutator: Mutator): Promise<void> {
      if (_mutator.url != this.url.toString())
        await this.load(_mutator.url);
      // except url from mutator for further processing
      delete (_mutator.url);
      super.mutate(_mutator);
      // TODO: examine necessity to reconstruct, if mutator is kept by caller
    }
    
    protected reduceMutator(_mutator: Mutator): void {
      // delete _mutator.idResource;
      // TODO: maybe move this logic into getMutatorForuserinterface override
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
    private parse(_data: ParticleEffectData): void {
      this.definedVariables = Object.values(PARTICLE_VARIBALE_NAMES);
      let dataStorage: ParticleEffectData = <ParticleEffectData>_data["storage"];
      if (dataStorage) {
        this.preParseStorage(dataStorage);
        this.storageSystem = this.parseRecursively(<ParticleEffectData>dataStorage["system"]);
        this.storageUpdate = this.parseRecursively(<ParticleEffectData>dataStorage["update"]);
        this.storageParticle = this.parseRecursively(<ParticleEffectData>dataStorage["particle"]);
      }

      let dataTransform: ParticleEffectData = <ParticleEffectData>_data["transformations"];
      if (dataTransform) {
        this.transformLocal = this.parseRecursively(<ParticleEffectData>dataTransform["local"]);
        this.transformWorld = this.parseRecursively(<ParticleEffectData>dataTransform["world"]);
      }
      
      this.componentMutations = this.parseRecursively(<ParticleEffectData>_data["components"]);

      this.cachedMutators = {};
      this.cacheMutators(this.transformLocal);
      this.cacheMutators(this.transformWorld);
      this.cacheMutators(this.componentMutations);
    }

    /**
     * Creates entries in {@link definedVariables} for each defined closure in _data. Predefined variables (time, index...) and previously defined ones (in json) can not be overwritten.
     * @param _data The paticle effect data to parse.
     */
    private preParseStorage(_data: ParticleEffectData): void {
      for (const storagePartition in _data) {
        let storage: ParticleEffectData = <ParticleEffectData>_data[storagePartition];
        for (const storageValue in storage) {
          if (this.definedVariables.includes(storageValue)) {
            throw `"${storageValue}" is already defined`;
          }
          else
            this.definedVariables.push(storageValue);
        }
      }
    }

    /**
     * Parse the given effect data recursivley. The hierachy of the json file will be kept. Constants, variables("time") and functions definitions will be replaced with functions.
     * @param _data The particle effect data to parse recursivley.
     */
    private parseRecursively(_data: ParticleEffectData): ParticleEffectStructure {
      let effectStructure: ParticleEffectStructure = {};
      for (const key in _data) {
        let value: ParticleEffectData | ClosureData = _data[key];
        if (typeof value === "string" || typeof value === "number" || "function" in value)
          effectStructure[key] = this.parseClosure(<ClosureData>value);
        else {
          effectStructure[key] = this.parseRecursively(<ParticleEffectData>value);
        }
      }
      return effectStructure;
    }

    /**
     * Parse the given closure data recursivley. Returns a function depending on the closure data.
     * @param _data The closure data to parse recursively.
     */
    private parseClosure(_data: ClosureData): Function {
      switch (typeof _data) {
        case "object":
          let parameters: Function[] = [];
          for (let param of _data.parameters) {
            parameters.push(this.parseClosure(param));
          }
          return ParticleClosureFactory.createClosure(_data.function, parameters);

        case "string":
          if (this.definedVariables.includes(_data))
            return function (_variables: ParticleVariables): number {
              // Debug.log("Variable", `"${_data}"`, _variables[<string>_data]);
              return <number>_variables[<string>_data];
            };
          else
            throw `"${_data}" is not defined`;

        case "number":
          return function (_variables: ParticleVariables): number {
            // Debug.log("Constant", _data);
            return <number>_data;
          };
      }
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