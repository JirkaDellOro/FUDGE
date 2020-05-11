namespace Import {
  // export enum CLOSURE_TYPE {
  //   ADDITION = "addition",
  //   MULTIPLICATION = "multiplication",
  //   DIVISION = "division",
  //   MODULO = "modulo",
  //   LINEAR = "linear",
  //   POLYNOMIAL3 = "polynomial3",
  //   RANDOM = "random"
  // }

  export class ClosureFactory {
    // private inputFactors: { [key: string]: number };

    // constructor(_inputFactors: { [key: string]: number }) {
    //   this.inputFactors = _inputFactors;
    // }
    // public static inputFactors: { [key: string]: number };
    // private static closures: Map<CLOSURE_TYPE, Function> = ClosureFactory.createClosures();
    private static closures: { [key: string]: Function } = {
      "addition": ClosureFactory.createClosureAddition,
      "multiplication": ClosureFactory.createClosureMultiplication,
      "division": ClosureFactory.createClosureDivision,
      "modulo": ClosureFactory.createClosureModulo,
      "linear": ClosureFactory.createClosureLinear,
      "polynomial": ClosureFactory.createClosurePolynomial3,
      "random": ClosureFactory.createClosureRandom
    };

    public static getClosure(_operation: string, _parameters: Function[]/*, _inputFactors?: { [key: string]: number }, _randomNumbers?: number[]*/): Function {
      let closure: Function = this.closures[_operation];
      if (_operation in this.closures)
        return closure(_parameters);
      else {
        console.error(`"${_operation}" is not an operation`);
        return null;
      }
    }

    // private static createClosures(): Map<CLOSURE_TYPE, Function> {
    //   return new Map<CLOSURE_TYPE, Function>([
    //     [CLOSURE_TYPE.ADDITION, this.createClosureAddition],
    //     [CLOSURE_TYPE.MULTIPLICATION, this.createClosureMultiplication],
    //     [CLOSURE_TYPE.DIVISION, this.createClosureDivision],
    //     [CLOSURE_TYPE.MODULO, this.createClosureModulo],
    //     [CLOSURE_TYPE.LINEAR, this.createClosureLinear],
    //     [CLOSURE_TYPE.POLYNOMIAL3, this.createClosurePolynomial3],
    //     [CLOSURE_TYPE.RANDOM, this.createClosureRandom],
    //   ]);
    // }

    private static createClosureAddition(_parameters: Function[]): Function {
      return function (): number {
        console.group("ClosureAddition");
        let result: number = 0;
        for (const param of _parameters) {
          result += param();
        }
        console.groupEnd();
        return result;
      };
    }

    private static createClosureMultiplication(_parameters: Function[]): Function {
      return function (): number {
        console.group("ClosureMultiplication");
        let result: number = 1;
        for (const param of _parameters) {
          result *= param();
        }
        console.groupEnd();
        return result;
      };
    }

    private static createClosureDivision(_parameters: Function[]): Function {
      return function (): number {
        console.group("ClosureDivision");
        let result: number = _parameters[0]() / _parameters[1]();
        console.groupEnd();
        return result;
      };
    }

    private static createClosureModulo(_parameters: Function[]): Function {
      return function (): number {
        console.group("ClosureModulo");
        let result: number = _parameters[0]() % _parameters[1]();
        console.groupEnd();
        return result;
      };
    }

    private static createClosureLinear(_parameters: Function[]): Function {
      let xStart: number = _parameters[1]();
      let xEnd: number = _parameters[2]();
      let yStart: number = _parameters[3]();
      let yEnd: number = _parameters[4]();
      return function (): number {
        console.group("ClosureLinear");
        let x: number = _parameters[0]();
        let y: number = yStart + (x - xStart) * (yEnd - yStart) / (xEnd - xStart);
        console.groupEnd();
        return y;
      };
    }

    private static createClosurePolynomial3(_parameters: Function[]): Function {
      let a: number = _parameters[1]();
      let b: number = _parameters[2]();
      let c: number = _parameters[3]();
      let d: number = _parameters[4]();
      return function (): number {
        console.group("ClosurePolynomial3");
        let x: number = _parameters[0]();
        let y: number = a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
        console.groupEnd();
        return y;
      };
    }

    private static createClosureRandom(_parameters: Function[]): Function {
      return function (): number {
        console.group("ClosureRandom");
        let result: number = _parameters[1]()[_parameters[0]()];
        console.groupEnd();
        return result;
      };
    }
  }
}