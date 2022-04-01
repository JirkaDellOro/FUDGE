namespace FudgeCore {

  export enum PARTICLE_VARIBALE_NAMES {
    TIME = "time",
    INDEX = "index",
    SIZE = "size",
    RANDOM_NUMBERS = "randomNumbers"
  }

  /**
   * The data format used to parse and store the paticle effect
   */
  export interface ParticleEffectData {
    [identifier: string]: General;
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
    public name: string = "ParticleEffect";
    public idResource: string = undefined;
    public url: RequestInfo;

    public storageSystem: ParticleEffectData;
    public storageUpdate: ParticleEffectData;
    public storageParticle: ParticleEffectData;
    // ParticleEffectData could be replaced with Functions that take Mtx4/Components as arguments and know what to do with it.
    public transformLocal: ParticleEffectData;
    public transformWorld: ParticleEffectData;
    public componentMutations: ParticleEffectData;
    public cachedMutators: { [key: string]: Mutator };
    private definedVariables: string[]; // these are used to throw errors only

    constructor(_url?: RequestInfo) {
      super();
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
      this.url = _url;
      let data: ParticleEffectData = await window.fetch(_url)
        .then(_response => _response.json());
      this.parse(data);
    }

    public serialize(): Serialization {
      let serialization: Serialization =  {
        idResource: this.idResource,
        name: this.name,
        type: this.type,
        url: this.url
      };
      return serialization;
    }
    
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await this.load(_serialization.url);
      return this;
    }

    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.idResource;
    }

    /**
     * Parses the data initializing this particle effect with the corresponding closures
     * @param _data The paticle effect data to parse.
     */
    private parse(_data: ParticleEffectData): void {
      this.definedVariables = Object.values(PARTICLE_VARIBALE_NAMES);
      let dataStorage: ParticleEffectData = _data["storage"];
      if (dataStorage) {
        this.preParseStorage(dataStorage);
        this.storageSystem = this.parseRecursively(dataStorage["system"]);
        this.storageUpdate = this.parseRecursively(dataStorage["update"]);
        this.storageParticle = this.parseRecursively(dataStorage["particle"]);
      }

      let dataTransform: ParticleEffectData = _data["transformations"];
      if (dataTransform) {
        this.transformLocal = this.parseRecursively(dataTransform["local"]);
        this.transformWorld = this.parseRecursively(dataTransform["world"]);
      }
      
      this.componentMutations = this.parseRecursively(_data["components"]);

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
        let storage: ParticleEffectData = _data[storagePartition];
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
    private parseRecursively(_data: ParticleEffectData): ParticleEffectData {
      for (const key in _data) {
        let value: Object = _data[key];
        if (typeof value === "string" || typeof value === "number" || "function" in <ParticleEffectData>value)
          _data[key] = this.parseClosure(<ClosureData>value);
        else {
          _data[key] = this.parseRecursively(<ParticleEffectData>value);
        }
      }
      return _data;
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
              Debug.log("Variable", `"${_data}"`, _variables[<string>_data]);
              return <number>_variables[<string>_data];
            };
          else
            throw `"${_data}" is not defined`;

        case "number":
          return function (_variables: ParticleVariables): number {
            Debug.log("Constant", _data);
            return <number>_data;
          };
      }
    }

    /**
     * Create mutators from the given _data and cache them.
     */
    private cacheMutators(_data: ParticleEffectData): void {
      for (const key in _data) {
        let effectData: ParticleEffectData = _data[key];
        this.cachedMutators[key] = this.createEmptyMutatorFrom(effectData);
      }
    }

    /**
     * Create an empty mutator from _data.
     */
    private createEmptyMutatorFrom(_data: ParticleEffectData): Mutator {
      let mutator: Mutator = {};
      for (const attribute in _data) {
        let value: Object = _data[attribute];
        if (typeof value === "function") {
          mutator[attribute] = null;
        } else {
          mutator[attribute] = this.createEmptyMutatorFrom(value);
        }
      }
      return mutator;
    }
  }
}