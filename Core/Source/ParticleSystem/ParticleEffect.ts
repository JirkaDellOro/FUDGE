namespace FudgeCore {
  export interface ParticleEffectData {
    [identifier: string]: General;
  }

  interface ClosureDataFunction {
    function: string;
    parameters: ClosureData[];
  }
  type ClosureData = ClosureDataFunction | string | number;

  // TODO: ParticleEffect should only be a resource, storedValues and randomNumbers should be part of ComponentParticleSystem
  export class ParticleEffect {
    public storageSystem: ParticleEffectData;
    public storageUpdate: ParticleEffectData;
    public storageParticle: ParticleEffectData;

    // TODO: Replace ParticleEffectData with Functions that take Mtx4/Components as arguments and know what to do with it.
    public transformLocal: ParticleEffectData;
    public transformWorld: ParticleEffectData;

    public mutationComponents: ParticleEffectData;

    public storedValues: StoredValues = {};
    private randomNumbers: number[] = [];

    constructor(_filename: string,  _numberOfParticles: number) {
      this.storedValues = {
        "time": 0,
        "index": 0,
        "size": _numberOfParticles
      };

      for (let i: number = 0; i < _numberOfParticles + 10 /* so that its possible to have 10 different random numbers per index i.e. randomNumber(index + x) */; i++) {
        this.randomNumbers.push(Math.random());
      }

      this.importFile(_filename);
    }

    public importFile(_filename: string): void {
      //TODO: import file use fetch
      let file: XMLHttpRequest = new XMLHttpRequest();
      file.open("GET", _filename, false);
      file.send();
      let data: ParticleEffectData = JSON.parse(file.responseText);
      this.parseFile(data);
    }

    /**
     * Parse the data from json file and return a particle effect definition
     * @param _data the data to parse
     * @returns a definition of the particle effect containing the closure for translation, rotation etc.
     */
    private parseFile(_data: ParticleEffectData): void {
      // pre parse storage and initialize stored values
      this.preParseStorage(_data["storage"]);

      let dataStorage: ParticleEffectData = _data["storage"];

      this.storageSystem = this.parseDataRecursively(dataStorage["system"]);
      this.storageUpdate = this.parseDataRecursively(dataStorage["update"]);
      this.storageParticle = this.parseDataRecursively(dataStorage["particle"]);

      let dataTransform: ParticleEffectData = _data["transformations"];

      this.transformLocal = this.parseDataRecursively(dataTransform["local"]);
      this.transformWorld = this.parseDataRecursively(dataTransform["world"]);

      this.mutationComponents = this.parseDataRecursively(_data["components"]);
    }

    /**
     * Create entries in stored values for each defined storage closure. Predefined values (time, index...) and previously defined ones (in json) can not be overwritten.
     * @param _data The paticle data to parse
     */
    private preParseStorage(_data: ParticleEffectData): void {
      for (const storagePartition in _data) {
        let storage: ParticleEffectData = <ParticleEffectData>_data[storagePartition];
        for (const storageValue in <ParticleEffectData>storage) {
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
     * @param _data The effect data to parse recursivley
     */
    private parseDataRecursively(_data: ParticleEffectData): ParticleEffectData {
      for (const key in _data) {
        let value: Object = _data[key];
        if (typeof value === "string" || typeof value === "number" || "function" in <ParticleEffectData>value)
          _data[key] = this.parseClosure(<ClosureData>value);
        else {
          _data[key] = this.parseDataRecursively(<ParticleEffectData>value);
        }
      }
      return _data;
    }

    /**
     * Parse the given closure data recursivley. Returns a function depending on the closure data.
     * @param _data The closure data to parse recursively
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