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

  /**
   * @class Factory class to create closures.
   */
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

    /**
     * Creates a closure for the given function type and the parameters.
     * @param _function the function type of the closure you want to create.
     * @param _parameters the parameters, which should be functions themselves, given to the created closure.
     * @returns 
     */
    public static getClosure(_function: string, _parameters: Function[]/*, _inputFactors?: { [key: string]: number }, _randomNumbers?: number[]*/): Function {
      let closure: Function = this.closures[_function];
      if (_function in this.closures)
        return closure(_parameters);
      else {
        console.error(`"${_function}" is not an operation`);
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

    /**
     * Calculates the sum of the given parameters.
     *  i.e. parameter[0] + ... + parameter[n]
     */
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

    /**
      * Calculates the product of the given parameters. 
      *   i.e. parameter[0] * ... * parameter[n]
      */
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

    /**
     * Calculates the division of the given parameters. 
     *  i.e. parameter[0] / parameter[1]
     */
    private static createClosureDivision(_parameters: Function[]): Function {
      return function (): number {
        console.group("ClosureDivision");
        let result: number = _parameters[0]() / _parameters[1]();
        console.groupEnd();
        return result;
      };
    }

    /**
     * Calculates the modulo of the given parameters.
     *  i.e. parameter[0] % parameter[1]
     */
    private static createClosureModulo(_parameters: Function[]): Function {
      return function (): number {
        console.group("ClosureModulo");
        let result: number = _parameters[0]() % _parameters[1]();
        console.groupEnd();
        return result;
      };
    }

    /**
     * Interpolates a linear function between two given points.
     *  parameter[0] will be the input value for the function.
     *  parameter[1] - parameter[4] describe the points between which will be interpoleted
     */
    private static createClosureLinear(_parameters: Function[]): Function {
      let xStart: number = _parameters[1]();
      let xEnd: number = _parameters[2]();
      let yStart: number = _parameters[3]();
      let yEnd: number = _parameters[4]();
      return function (): number {
        console.group("ClosureLinear");
        let x: number = _parameters[0]();
        let y: number = yStart + (x - xStart) * (yEnd - yStart) / (xEnd - xStart);
        console.log(xEnd);
        console.groupEnd();
        return y;
      };
    }

    /**
     * Creates a polynomial of third degree.
     *  parameter[0] will be the input value for the function.
     *  parameter[1] - parameter[4] representing a,b,c,d
     */
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

    /**
     * Creates a closure which will return number chosen from the given array of numbers.
     *  parameter[0] representing the index of the number which will be chosen.
     *  parameter[1] representing the array of random numbers to choose from.
     */
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