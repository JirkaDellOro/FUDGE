"use strict";
///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>
var Import;
///<reference types="../../../../Core/Build/FudgeCore"/>
///<reference types="../../../../Aid/Build/FudgeAid"/>
(function (Import) {
    Import.f = FudgeCore;
    Import.fAid = FudgeAid;
    /**
     * @class Factory class to create closures.
     */
    class ClosureFactory {
        /**
         * Creates a closure for the given function type and the parameters.
         * @param _function the function type of the closure you want to create.
         * @param _parameters the parameters, which should be functions themselves, given to the created closure.
         * @returns
         */
        static getClosure(_function, _parameters /*, _inputFactors?: { [key: string]: number }, _randomNumbers?: number[]*/) {
            let closure = this.closures[_function];
            if (_function in this.closures)
                return closure(_parameters);
            else {
                Import.f.Debug.error(`"${_function}" is not an operation`);
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
        static createClosureAddition(_parameters) {
            return function () {
                Import.f.Debug.group("ClosureAddition");
                let result = 0;
                for (const param of _parameters) {
                    result += param();
                }
                Import.f.Debug.groupEnd();
                return result;
            };
        }
        /**
          * Calculates the product of the given parameters.
          *   i.e. parameter[0] * ... * parameter[n]
          */
        static createClosureMultiplication(_parameters) {
            return function () {
                Import.f.Debug.log("ClosureMultiplication");
                let result = 1;
                for (const param of _parameters) {
                    result *= param();
                }
                Import.f.Debug.groupEnd();
                return result;
            };
        }
        /**
         * Calculates the division of the given parameters.
         *  i.e. parameter[0] / parameter[1]
         */
        static createClosureDivision(_parameters) {
            return function () {
                Import.f.Debug.group("ClosureDivision");
                let result = _parameters[0]() / _parameters[1]();
                Import.f.Debug.groupEnd();
                return result;
            };
        }
        /**
         * Calculates the modulo of the given parameters.
         *  i.e. parameter[0] % parameter[1]
         */
        static createClosureModulo(_parameters) {
            return function () {
                Import.f.Debug.group("ClosureModulo");
                let result = _parameters[0]() % _parameters[1]();
                Import.f.Debug.groupEnd();
                return result;
            };
        }
        /**
         * Interpolates a linear function between two given points.
         *  parameter[0] will be the input value for the function.
         *  parameter[1] - parameter[4] describe the points between which will be interpoleted
         */
        static createClosureLinear(_parameters) {
            let xStart = _parameters[1]();
            let xEnd = _parameters[2]();
            let yStart = _parameters[3]();
            let yEnd = _parameters[4]();
            return function () {
                Import.f.Debug.group("ClosureLinear");
                let x = _parameters[0]();
                let y = yStart + (x - xStart) * (yEnd - yStart) / (xEnd - xStart);
                Import.f.Debug.log(xEnd);
                Import.f.Debug.groupEnd();
                return y;
            };
        }
        /**
         * Creates a polynomial of third degree.
         *  parameter[0] will be the input value for the function.
         *  parameter[1] - parameter[4] representing a,b,c,d
         */
        static createClosurePolynomial3(_parameters) {
            let a = _parameters[1]();
            let b = _parameters[2]();
            let c = _parameters[3]();
            let d = _parameters[4]();
            return function () {
                Import.f.Debug.group("ClosurePolynomial3");
                let x = _parameters[0]();
                let y = a * Math.pow(x, 3) + b * Math.pow(x, 2) + c * x + d;
                Import.f.Debug.groupEnd();
                return y;
            };
        }
        /**
         * Creates a closure which will return the square root of the given parameter
         *  parameter[0] will be the input value for the function.
         */
        static createClosureSquareRoot(_parameters) {
            return function () {
                Import.f.Debug.group("ClosureSquareRoot");
                let x = _parameters[0]();
                let y = Math.sqrt(x);
                Import.f.Debug.groupEnd();
                return y;
            };
        }
        /**
         * Creates a closure which will return a number chosen from the given array of numbers.
         *  parameter[0] representing the index of the number which will be chosen.
         *  parameter[1] representing the array of random numbers to choose from.
         */
        static createClosureRandom(_parameters) {
            return function () {
                Import.f.Debug.group("ClosureRandom");
                let result = _parameters[1]()[_parameters[0]()];
                Import.f.Debug.groupEnd();
                return result;
            };
        }
        /**
         * Creates a closure which will return the input value
         */
        static createClosureIdentity(_parameters) {
            return function () {
                Import.f.Debug.group("ClosureIdentity");
                let result = _parameters[0]();
                Import.f.Debug.groupEnd();
                return result;
            };
        }
    }
    ClosureFactory.closures = {
        "addition": ClosureFactory.createClosureAddition,
        "multiplication": ClosureFactory.createClosureMultiplication,
        "division": ClosureFactory.createClosureDivision,
        "modulo": ClosureFactory.createClosureModulo,
        "linear": ClosureFactory.createClosureLinear,
        "polynomial": ClosureFactory.createClosurePolynomial3,
        "squareRoot": ClosureFactory.createClosureSquareRoot,
        "random": ClosureFactory.createClosureRandom,
        "identity": ClosureFactory.createClosureIdentity
    };
    Import.ClosureFactory = ClosureFactory;
})(Import || (Import = {}));
//# sourceMappingURL=ClosureFactory.js.map