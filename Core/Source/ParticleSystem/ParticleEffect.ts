namespace FudgeCore {

  /**
   * The data format used to parse and store the paticle effect
   */
  export interface ParticleEffectData {
    //TODO: Refactor this to type ParticleEffectData | ParticleClosure
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
  export class ParticleEffect {
    public storageSystem: ParticleEffectData;
    public storageUpdate: ParticleEffectData;
    public storageParticle: ParticleEffectData;
    // ParticleEffectData could be replaced with Functions that take Mtx4/Components as arguments and know what to do with it.
    public transformLocal: ParticleEffectData;
    public transformWorld: ParticleEffectData;
    public componentMutations: ParticleEffectData;
    //TODO: put randomNumbers in inputFactors???
    public randomNumbers: number[];

    public cachedMutators: { [key: string]: Mutator };

    private definedInputFactors: string[] = ["time", "index", "size"]; // these are used to throw errors only

    /**
     * Asynchronously loads the json from the given url and parses it initializing this particle effect.
     */
    public async load(_request: RequestInfo): Promise<void> {
      let data: ParticleEffectData = await window.fetch(_request)
        .then(_response => _response.json());
      this.parse(data);
    }

    /**
     * Parses the data initializing this particle effect with the corresponding closures
     * @param _data The paticle effect data to parse.
     */
    private parse(_data: ParticleEffectData): void {
      let dataStorage: ParticleEffectData = _data["storage"];

      if (dataStorage) {
        this.preParseStorage(dataStorage);
        this.storageSystem = this.parseRecursively(dataStorage["system"]);
        this.storageUpdate = this.parseRecursively(dataStorage["update"]);
        this.storageParticle = this.parseRecursively(dataStorage["particle"]);
      }

      let dataTransform: ParticleEffectData = _data["transformations"];

      this.transformLocal = this.parseRecursively(dataTransform["local"]);
      this.transformWorld = this.parseRecursively(dataTransform["world"]);

      this.componentMutations = this.parseRecursively(_data["components"]);

      this.cachedMutators = {};
      this.cacheMutators(this.transformLocal);
      this.cacheMutators(this.transformWorld);
      this.cacheMutators(this.componentMutations);
    }

    /**
     * Creates entries in [[definedInputFactors]] for each defined closure in _data. Predefined values (time, index...) and previously defined ones (in json) can not be overwritten.
     * @param _data The paticle effect data to parse.
     */
    private preParseStorage(_data: ParticleEffectData): void {
      for (const storagePartition in _data) {
        let storage: ParticleEffectData = _data[storagePartition];
        for (const storageValue in storage) {
          if (this.definedInputFactors.includes(storageValue)) {
            throw `"${storageValue}" is already defined`;
          }
          else
            this.definedInputFactors.push(storageValue);
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

          // random closure needs to have the random numbers array as a parameter
          if (_data.function == "random") {
            parameters.push(() => {
              return this.randomNumbers;
            });
          }

          let closure: Function = ClosureFactory.getClosure(_data.function, parameters);

          return closure;

        case "string":
          if (this.definedInputFactors.includes(_data))
            return (_inputFactors: ParticleInputFactors) => {
              Debug.log("Variable", `"${_data}"`, _inputFactors[<string>_data]);
              return _inputFactors[<string>_data];
            };
          else
            throw `"${_data}" is not defined`;



        case "number":
          return function (): number {
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