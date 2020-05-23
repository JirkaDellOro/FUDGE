/// <reference types="../../../../core/build/fudgecore" />
/// <reference types="../../../../aid/build/fudgeaid" />
declare namespace Import {
    export import f = FudgeCore;
    export import fAid = FudgeAid;
    /**
     * @class Factory class to create closures.
     */
    class ClosureFactory {
        private static closures;
        /**
         * Creates a closure for the given function type and the parameters.
         * @param _function the function type of the closure you want to create.
         * @param _parameters the parameters, which should be functions themselves, given to the created closure.
         * @returns
         */
        static getClosure(_function: string, _parameters: Function[]): Function;
        /**
         * Calculates the sum of the given parameters.
         *  i.e. parameter[0] + ... + parameter[n]
         */
        private static createClosureAddition;
        /**
          * Calculates the product of the given parameters.
          *   i.e. parameter[0] * ... * parameter[n]
          */
        private static createClosureMultiplication;
        /**
         * Calculates the division of the given parameters.
         *  i.e. parameter[0] / parameter[1]
         */
        private static createClosureDivision;
        /**
         * Calculates the modulo of the given parameters.
         *  i.e. parameter[0] % parameter[1]
         */
        private static createClosureModulo;
        /**
         * Interpolates a linear function between two given points.
         *  parameter[0] will be the input value for the function.
         *  parameter[1] - parameter[4] describe the points between which will be interpoleted
         */
        private static createClosureLinear;
        /**
         * Creates a polynomial of third degree.
         *  parameter[0] will be the input value for the function.
         *  parameter[1] - parameter[4] representing a,b,c,d
         */
        private static createClosurePolynomial3;
        /**
         * Creates a closure which will return the square root of the given parameter
         *  parameter[0] will be the input value for the function.
         */
        private static createClosureSquareRoot;
        /**
         * Creates a closure which will return a number chosen from the given array of numbers.
         *  parameter[0] representing the index of the number which will be chosen.
         *  parameter[1] representing the array of random numbers to choose from.
         */
        private static createClosureRandom;
        /**
         * Creates a closure which will return the input value
         */
        private static createClosureIdentity;
    }
}
