namespace FudgeCore {
    /**
     * Defines a color as values in the range of 0 to 1 for the four channels red, green, blue and alpha (for opacity)
     */
    export class Color extends Mutable { //implements Serializable {
        public r: number;
        public g: number;
        public b: number;
        public a: number;

        constructor(_r: number, _g: number, _b: number, _a: number) {
            super();
            this.r = _r;
            this.g = _g;
            this.b = _b;
            this.a = _a;
        }

        public getArray(): Float32Array {
            return new Float32Array([this.r, this.g, this.b, this.a]);
        }

        protected reduceMutator(_mutator: Mutator): void {/** */}
    }
}