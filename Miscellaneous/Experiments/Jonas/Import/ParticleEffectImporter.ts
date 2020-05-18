namespace Import {

  interface ClosureStorage {
    [key: string]: Function;
  }

  export interface ParticleEffectDefinition {
    storage?: ClosureStorage;
    // TODO: refactor this because translation/rotation/transWolrd split causes lots of code duplication
    translation?: ClosureStorage;
    rotation?: ClosureStorage;
    translationWorld?: ClosureStorage;
  }

  export class ParticleEffectImporter {
    private storedValues: StoredValues;
    private randomNumbers: number[];
    private definition: ParticleEffectDefinition = {};

    constructor(_storedValues: StoredValues, _randomNumbers: number[]) {
      this.storedValues = _storedValues;
      this.randomNumbers = _randomNumbers;
    }

    public importFile(_filename: string): void {
      //TODO: import file
    }

    /**
     * Parse the data from json file and return a particle effect definition
     * @param _data the data to parse
     * @returns a definition of the particle effect containing the closure for translation, rotation etc.
     */
    public parseFile(_data: ParticleEffectData): ParticleEffectDefinition {

      // pre parse storage and initialize stored values
      for (const key in _data.storage) {
        if (key in this.storedValues) {
          console.error("Predfined varaiables can not be overwritten");
          return null;
        }
        else
          this.storedValues[key] = 0;
      }

      // initialize effect definition
      let vectorDefinition: Array<string> = ["x", "y", "z"];
      this.definition.storage = {};
      this.definition.translation = {};
      this.definition.rotation = {};
      this.definition.translationWorld = {};
      let nullFunction: Function = function(): number {
        return 0;
      };
      for (const coordinate of vectorDefinition) {
        this.definition.translation[coordinate] = nullFunction;
        this.definition.rotation[coordinate] = nullFunction;
        this.definition.translationWorld[coordinate] = nullFunction;
      }


      // parse storage
      for (const key in _data.storage) {
        this.definition.storage[key] = this.parseClosure(_data.storage[key]);
      }

      // parse translation locale
      for (const key in _data.translation) {
        if (vectorDefinition.includes(key)) {
          this.definition.translation[key] = this.parseClosure(_data.translation[key]);
        } else {
          console.error(`"${key}" is not part of a translation`);
        }
      }

      // parse rotation
      for (const key in _data.rotation) {
        if (vectorDefinition.includes(key)) {
          this.definition.rotation[key] = this.parseClosure(_data.rotation[key]);
        } else {
          console.error(`"${key}" is not part of a rotation`);
        }
      }

      // parse translation world
      for (const key in _data.translationWorld) {
        if (vectorDefinition.includes(key)) {
          this.definition.translationWorld[key] = this.parseClosure(_data.translationWorld[key]);
        } else {
          console.error(`"${key}" is not part of a translation`);
        }
      }

      return this.definition;
    }

    /**
     * 
     * @param _data the closure data to parse recursively
     */
    private parseClosure(_data: ClosureData): Function {
      if (!_data.function) {
        console.error("Error, no operation defined");
        return null;
      }

      let parameters: Function[] = [];

      for (let param of _data.parameters) {
        switch (typeof (param)) {
          case "object":
            let result: Function = this.parseClosure(<ClosureData>param);
            parameters.push(result);
            break;
          case "string":
            if (param in this.storedValues) {
              parameters.push(() => {
                console.log("Variable", `"${param}"`, this.storedValues[<string>param]);
                return this.storedValues[<string>param];
              });
            }
            else {
              console.error(`"${param}" is not defined`);
              return null;
            }
            break;
          case "number":
            parameters.push(function (): number {
              console.log("Constant", param);
              return <number>param;
            });
            break;
        }
      }

      if (_data.function == "random") {
        parameters.push(() => {
          return this.randomNumbers;
        });
      }

      let closure: Function = ClosureFactory.getClosure(_data.function, parameters);

      // pre evaluate closure so that only the result will be saved
      if (_data.preEvaluate) {
        console.log("PreEvaluate");
        let result: number = closure();
        closure = () => {
          console.log("preEvaluated", result);
          return result;
        };
      }

      return closure;
    }
  }
}