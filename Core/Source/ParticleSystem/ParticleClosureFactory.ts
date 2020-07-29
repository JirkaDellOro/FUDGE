namespace FudgeCore {

  /**
   * A function taking input factors (time, index, size and self defined ones) as the argument. Returning a number.
  */
  export interface ParticleClosure {
    (_inputFactors: ParticleInputFactors): number;
  }

  /**
   * Factory class to create closures.
   * @author Jonas Plotzky, HFU, 2020
   */
  export class ParticleClosureFactory {
    private static closures: { [key: string]: Function } = {
      "addition": ParticleClosureFactory.createClosureAddition,
      "subtraction": ParticleClosureFactory.createClosureSubtraction,
      "multiplication": ParticleClosureFactory.createClosureMultiplication,
      "division": ParticleClosureFactory.createClosureDivision,
      "modulo": ParticleClosureFactory.createClosureModulo,
      "linear": ParticleClosureFactory.createClosureLinear,
      "polynomial": ParticleClosureFactory.createClosurePolynomial3,
      "squareRoot": ParticleClosureFactory.createClosureSquareRoot,
      "random": ParticleClosureFactory.createClosureRandom
    };

    /**
     * Creates a closure of the given function type and passes the parameters to it.
     * @param _function The function type of the closure you want to create.
     * @param _parameters The parameters, which should be functions themselves, passed to the created closure.
     */
    public static getClosure(_function: string, _parameters: Function[]): ParticleClosure {
      let closure: Function = this.closures[_function];
      if (_function in this.closures)
        return closure(_parameters);
      else
        throw `"${_function}" is not an operation`;
    }

    /**
     * Creates a closure which will return the sum of the given parameters,  
     *  i.e. ```_parameters[0] + ... + _parameters[n]```.
     */
    private static createClosureAddition(_parameters: Function[]): Function {
      return function (_inputFactors: ParticleInputFactors): number {
        Debug.group("ClosureAddition");
        let result: number = 0;
        for (const param of _parameters) {
          result += param(_inputFactors);
        }
        Debug.groupEnd();
        return result;
      };
    }

    /**
     * Creates a closure which will return the subtraction of the given parameters,  
     *  i.e. ```_parameters[0] - _parameters[1]```.
     */
    private static createClosureSubtraction(_parameters: Function[]): Function {
      return function (_inputFactors: ParticleInputFactors): number {
        Debug.group("ClosureSubtraction");
        let result: number = _parameters[0](_inputFactors) - _parameters[1](_inputFactors);
        Debug.groupEnd();
        return result;
      };
    }

    /**
      * Creates a closure which will return the product of the given parameters,  
      *  i.e. ```_parameters[0] * ... * _parameters[n]```.
      */
    private static createClosureMultiplication(_parameters: Function[]): Function {
      return function (_inputFactors: ParticleInputFactors): number {
        Debug.log("ClosureMultiplication");
        let result: number = 1;
        for (const param of _parameters) {
          result *= param(_inputFactors);
        }
        Debug.groupEnd();
        return result;
      };
    }

    /**
     * Creates a closure which will return the division of the given parameters,  
     *  i.e. ```_parameters[0] / _parameters[1]```.
     */
    private static createClosureDivision(_parameters: Function[]): Function {
      return function (_inputFactors: ParticleInputFactors): number {
        Debug.group("ClosureDivision");
        let result: number = _parameters[0](_inputFactors) / _parameters[1](_inputFactors);
        Debug.groupEnd();
        return result;
      };
    }

    /**
     * Creates a closure which will return the modulo of the given parameters,  
     *  i.e. ```_parameters[0] % _parameters[1]```.
     */
    private static createClosureModulo(_parameters: Function[]): Function {
      return function (_inputFactors: ParticleInputFactors): number {
        Debug.group("ClosureModulo");
        let result: number = _parameters[0](_inputFactors) % _parameters[1](_inputFactors);
        Debug.groupEnd();
        return result;
      };
    }

    /**
     * Interpolates a linear function between two given points.
     * - ```_parameters[0]``` will be the input value for the function.
     * - ```_parameters[1]``` x start value.
     * - ```_parameters[2]``` y start value.
     * - ```_parameters[3]``` x end value.
     * - ```_parameters[4]``` y end value.
     */
    private static createClosureLinear(_parameters: Function[]): Function {
      let xStart: number = _parameters[1]();
      let yStart: number = _parameters[2]();
      let xEnd: number = _parameters[3]();
      let yEnd: number = _parameters[4]();
      return function (_inputFactors: ParticleInputFactors): number {
        Debug.group("ClosureLinear");
        let x: number = _parameters[0](_inputFactors);
        let y: number = yStart + (x - xStart) * (yEnd - yStart) / (xEnd - xStart);
        Debug.log(xEnd);
        Debug.groupEnd();
        return y;
      };
    }

    /**
     * Creates a polynomial function of third degree. A,b,c and d will be evaluated while parsing.
     * - ```_parameters[0]``` will be the input value for the function.  
     * - ```_parameters[1]``` a value.
     * - ```_parameters[2]``` b value.
     * - ```_parameters[3]``` c value.
     * - ```_parameters[4]``` d value.
     */
    private static createClosurePolynomial3(_parameters: Function[]): Function {
      let a: number = _parameters[1]();
      let b: number = _parameters[2]();
      let c: number = _parameters[3]();
      let d: number = _parameters[4]();
      return function (_inputFactors: ParticleInputFactors): number {
        Debug.group("ClosurePolynomial3");
        let x: number = _parameters[0](_inputFactors);
        let y: number = a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
        Debug.groupEnd();
        return y;
      };
    }

    /**
     * Creates a closure which will return the square root of the given parameter,  
     * ```parameters[0]``` will be the input value for the function.
     */
    private static createClosureSquareRoot(_parameters: Function[]): Function {
      return function (_inputFactors: ParticleInputFactors): number {
        Debug.group("ClosureSquareRoot");
        let x: number = _parameters[0](_inputFactors);
        let y: number = Math.sqrt(x);
        Debug.groupEnd();
        return y;
      };
    }

    /**
     * Creates a closure which will return a number chosen from the given array of numbers.
     * - ```_parameters[0]``` representing the index of the number which will be chosen.  
     * - ```_parameters[1]``` representing the array of random numbers to choose from.
     */
    private static createClosureRandom(_parameters: Function[]): Function {
      return function (_inputFactors: ParticleInputFactors): number {
        Debug.group("ClosureRandom");
        let result: number = _parameters[1]()[_parameters[0](_inputFactors)];
        Debug.groupEnd();
        return result;
      };
    }
  }
}