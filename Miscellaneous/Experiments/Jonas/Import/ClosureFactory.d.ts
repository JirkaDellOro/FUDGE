declare namespace Import {
    class ClosureFactory {
        private static closures;
        static getClosure(_operation: string, _parameters: Function[]): Function;
        private static createClosureAddition;
        private static createClosureMultiplication;
        private static createClosureDivision;
        private static createClosureModulo;
        private static createClosureLinear;
        private static createClosurePolynomial3;
        private static createClosureRandom;
    }
}
