namespace FudgeCore {
  export interface ParticleEffectData {
    [identifier: string]: Object;
  }

  interface ClosureDataFunction {
    function: string;
    parameters: ClosureData[];
  }
  type ClosureData = ClosureDataFunction | string | number;

  export class ParticleEffectImporter {
    private storedValues: FudgeCore.StoredValues;
    private randomNumbers: number[];

    constructor(_storedValues: FudgeCore.StoredValues, _randomNumbers: number[]) {
      this.storedValues = _storedValues;
      this.randomNumbers = _randomNumbers;
    }

    public importFile(_filename: string): ParticleEffectData {
      //TODO: import file
      let file: XMLHttpRequest = new XMLHttpRequest();
      file.open("GET", _filename, false);
      file.send();
      let data: ParticleEffectData = JSON.parse(file.responseText);
      return this.parseFile(data);
    }

    /**
     * Parse the data from json file and return a particle effect definition
     * @param _data the data to parse
     * @returns a definition of the particle effect containing the closure for translation, rotation etc.
     */
    private parseFile(_data: ParticleEffectData): ParticleEffectData {
      // console.log(_data);

      // pre parse storage and initialize stored values
      this.preParseStorage(<ParticleEffectData>_data["storage"]);

      this.parseDataRecursively(_data);

      return _data;
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

    // TODO: COMMENT
    private parseDataRecursively(_data: ParticleEffectData): void {
      for (const key in _data) {
        let value: Object = _data[key];
        if (typeof value === "string" || typeof value === "number" || "function" in <ParticleEffectData>value)
          _data[key] = this.parseClosure(<ClosureData>value);
        else {
          this.parseDataRecursively(<ParticleEffectData>value);
        }
      }
    }

    /**
     * Parse the given closure data recursivley. If _data is undefined return a function which returns the given _undefinedValue,
     * e.g. undefined scaling data (x,y,z values) should be set to 1 instead of 0.
     * @param _data The closure data to parse recursively
     * @param _undefinedValue The number which will be returned by the function if _data is undefined
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

          let closure: Function = FudgeCore.ClosureFactory.getClosure(_data.function, parameters);

          return closure;

        case "string":
          if (_data in this.storedValues) {
            return () => {
              FudgeCore.Debug.log("Variable", `"${_data}"`, this.storedValues[<string>_data]);
              return this.storedValues[<string>_data];
            };
          }
          else {
            throw `"${_data}" is not defined`;
          }

        case "number":
          return function (): number {
            FudgeCore.Debug.log("Constant", _data);
            return <number>_data;
          };
      }
    }
  }
}