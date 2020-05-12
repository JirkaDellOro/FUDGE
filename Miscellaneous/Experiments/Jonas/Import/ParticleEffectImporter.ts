namespace Import {
  interface ClosureStorage {
    [key: string]: Function;
  }

  export interface ParticleEffectDefinition {
    system?: ClosureStorage;
    storage?: ClosureStorage;
    translation?: ClosureStorage;
    rotation?: ClosureStorage;
  }

  export class ParticleEffectImporter {
    public storedValues: StoredValues;
    public randomNumbers: number[];
    private definition: ParticleEffectDefinition = {};

    public importFile(_filename: string): void {
      //TODO: import file
    }

    public parseFile(_data: ParticleSystemData): ParticleEffectDefinition {
      this.definition.storage = {};
      for (const key in _data.particle.store) {
        if (key in this.storedValues)
          console.error("Predfined varaiables can not be overwritten");
        else
          this.definition.storage[key] = this.parseClosure(_data.particle.store[key]);
      }

      this.definition.translation = {};
      for (const key in _data.particle.translation) {
        if (["x", "y", "z"].includes(key)) { //TODO: define only once
          this.definition.translation[key] = this.parseClosure(_data.particle.translation[key]);
        } else {
          console.error(`"${key}" is not part of a translation`);
        }
      }

      return this.definition;
    }

    private parseClosure(_data: ClosureData): Function {
      if (!_data.operation) {
        console.error("Error, no operation defined");
        return null;
      }

      let parameters: Function[] = [];

      for (let argument of _data.arguments) {
        switch (typeof (argument)) {
          case "object":
            let result: Function = this.parseClosure(<ClosureData>argument);
            parameters.push(result);
            break;
          case "string":
            if (argument in this.definition.storage || argument in this.storedValues) {
              parameters.push(() => {
                console.log("Variable", `"${argument}"`, this.storedValues[<string>argument]);
                return this.storedValues[<string>argument];
              });
            }
            else {
              console.error(`"${argument}" is not defined`);
              return null;
            }
            break;
          case "number":
            parameters.push(function (): number {
              console.log("Constant", argument);
              return <number>argument;
            });
            break;
        }
      }

      if (_data.operation == "random") {
        parameters.push(() => {
          return this.randomNumbers;
        });
      }

      let closure: Function = ClosureFactory.getClosure(_data.operation, parameters);
      return closure;
    }
  }
}