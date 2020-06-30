namespace FudgeCore {

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
  export class ParticleEffect {
    public storageSystem: ParticleEffectData;
    public storageUpdate: ParticleEffectData;
    public storageParticle: ParticleEffectData;

    // ParticleEffectData could be replaced with Functions that take Mtx4/Components as arguments and know what to do with it.
    public transformLocal: ParticleEffectData;
    public transformWorld: ParticleEffectData;

    public componentMutations: ParticleEffectData;

    // TODO: StoredValues and random number arrays should be stored inside each instance of ComponentParticleSystem and not per instance of ParticleEffect
    public storedValues: StoredValues = {};
    private randomNumbers: number[] = [];

    constructor(_numberOfParticles: number) {
      this.storedValues = {
        "time": 0,
        "index": 0,
        "size": _numberOfParticles
      };

      for (let i: number = 0; i < _numberOfParticles + 10 /* so that its possible to have 10 different random numbers per index i.e. randomNumber(index + x) */; i++) {
        this.randomNumbers.push(Math.random());
      }
    }

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
      this.preParseStorage(_data["storage"]);

      let dataStorage: ParticleEffectData = _data["storage"];

      this.storageSystem = this.parseRecursively(dataStorage["system"]);
      this.storageUpdate = this.parseRecursively(dataStorage["update"]);
      this.storageParticle = this.parseRecursively(dataStorage["particle"]);

      let dataTransform: ParticleEffectData = _data["transformations"];

      this.transformLocal = this.parseRecursively(dataTransform["local"]);
      this.transformWorld = this.parseRecursively(dataTransform["world"]);

      this.componentMutations = this.parseRecursively(_data["components"]);
    }

    /**
     * Creates entries in [[storedValues]] for each defined closure in _data. Predefined values (time, index...) and previously defined ones (in json) can not be overwritten.
     * @param _data The paticle effect data to parse.
     */
    private preParseStorage(_data: ParticleEffectData): void {
      for (const storagePartition in _data) {
        let storage: ParticleEffectData = _data[storagePartition];
        for (const storageValue in storage) {
          if (storageValue in this.storedValues) {
            throw `"${storageValue}" is already defined`;
          }
          else
            this.storedValues[storageValue] = 0;
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
          if (_data in this.storedValues) {
            return () => {
              Debug.log("Variable", `"${_data}"`, this.storedValues[<string>_data]);
              return this.storedValues[<string>_data];
            };
          }
          else {
            throw `"${_data}" is not defined`;
          }

        case "number":
          return function (): number {
            Debug.log("Constant", _data);
            return <number>_data;
          };
      }
    }
  }
}