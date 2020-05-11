namespace Import {
  interface Storage {
    [key: string]: Function;
  }

  interface StoredValues {
    [key: string]: number;
  }
  
  let storedClosures: Storage = {

  };

  let storedValues: StoredValues = {
    "time": 0.5,
    "index": 0,
    "size": 1
  };
  let randomNumbers: number[] = [42];
  test();

  function test(): void {
    console.log(data);
    parseFile(data);
  }

  function parseFile(_data: SystemData): void {
    for (const key in _data.particle.store) {
      if (storedValues[key])
        console.error("Predfined varaiables can not be overwritten");
      else
        storedClosures[key] = parseOperation(_data.particle.store[key]);
    }
    let closureX: Function = parseOperation(_data.particle.translation["x"]);
    let closureY: Function = parseOperation(_data.particle.translation["y"]);

    for (const key in storedClosures) {
      console.groupCollapsed(`Evaluate storage "${key}"`);
      storedValues[key] = storedClosures[key]();
      console.log(`Stored "${key}"`, storedValues[key]);
      console.groupEnd();
    }

    console.groupCollapsed("Evaluate x");
    console.log("x =", closureX());
    console.groupEnd();

    console.groupCollapsed("Evaluate y");
    console.log("y =", closureY());
    console.groupEnd();
  }

  function parseOperation(_data: ParticleClosure): Function {
    if (!_data.operation) {
      console.log("Error, no operation defined");
      return null;
    }

    let parameters: Function[] = [];

    for (let arg of _data.arguments) {
      switch (typeof (arg)) {
        case "object":
          let result: Function = parseOperation(<ParticleClosure>arg);
          parameters.push(result);
          break;
        case "string":
          if (arg in storedClosures || arg in storedValues) {
            parameters.push(function (): number {
              console.log("Variable", `"${arg}"`, storedValues[<string>arg]);
              return storedValues[<string>arg];
            });
          }
          else {
            console.error(`"${arg}" is not defined`);
            return null;
          }
          break;
        case "number":
          parameters.push(function (): number {
            console.log("Constant", arg);
            return <number>arg;
          });
          break;
      }
    }

    if (_data.operation == "random") {
      parameters.push(function (): number[] {
        return randomNumbers;
      });
    }

    let closure: Function = ClosureFactory.getClosure(_data.operation, parameters);
    return closure;
  }
}