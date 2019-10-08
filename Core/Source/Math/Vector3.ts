namespace FudgeCore {
    /**
     * Stores and manipulates a threedimensional vector comprised of the components x, y and z
     * ```plaintext
     *            +y
     *             |__ +x
     *            /
     *          +z   
     * ```
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Vector3 extends Mutable {
        private data: Float32Array; // TODO: check why this shouldn't be x,y,z as numbers...

        public constructor(_x: number = 0, _y: number = 0, _z: number = 0) {
            super();
            this.data = new Float32Array([_x, _y, _z]);
        }

        // TODO: implement equals-functions
        get x(): number {
            return this.data[0];
        }
        get y(): number {
            return this.data[1];
        }
        get z(): number {
            return this.data[2];
        }

        set x(_x: number) {
            this.data[0] = _x;
        }
        set y(_y: number) {
            this.data[1] = _y;
        }
        set z(_z: number) {
            this.data[2] = _z;
        }

        public static X(_scale: number = 1): Vector3 {
            const vector: Vector3 = new Vector3(_scale, 0, 0);
            return vector;
        }

        public static Y(_scale: number = 1): Vector3 {
            const vector: Vector3 = new Vector3(0, _scale, 0);
            return vector;
        }

        public static Z(_scale: number = 1): Vector3 {
            const vector: Vector3 = new Vector3(0, 0, _scale);
            return vector;
        }

        public static ZERO(): Vector3 {
            const vector: Vector3 = new Vector3(0, 0, 0);
            return vector;
        }

        public static ONE(_scale: number = 1): Vector3 {
            const vector: Vector3 = new Vector3(_scale, _scale, _scale);
            return vector;
        }

        public static TRANSFORMATION(_vector: Vector3, _matrix: Matrix4x4): Vector3 {
            let result: Vector3 = new Vector3();
            let m: Float32Array = _matrix.get();
            let [x, y, z] = _vector.get();
            result.x = m[0] * x + m[4] * y + m[8] * z + m[12];
            result.y = m[1] * x + m[5] * y + m[9] * z + m[13];
            result.z = m[2] * x + m[6] * y + m[10] * z + m[14];
            return result;
        }


        public static NORMALIZATION(_vector: Vector3, _length: number = 1): Vector3 {
            let vector: Vector3 = Vector3.ZERO();
            try {
                let [x, y, z] = _vector.data;
                let factor: number = _length / Math.hypot(x, y, z);
                vector.data = new Float32Array([_vector.x * factor, _vector.y * factor, _vector.z * factor]);
            } catch (_e) {
                Debug.warn(_e);
            }
            return vector;
        }

        /**
         * Sums up multiple vectors.
         * @param _vectors A series of vectors to sum up
         * @returns A new vector representing the sum of the given vectors
         */
        public static SUM(..._vectors: Vector3[]): Vector3 {
            let result: Vector3 = new Vector3();
            for (let vector of _vectors)
                result.data = new Float32Array([result.x + vector.x, result.y + vector.y, result.z + vector.z]);
            return result;
        }
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         * @returns A new vector representing the difference of the given vectors
         */
        public static DIFFERENCE(_a: Vector3, _b: Vector3): Vector3 {
            let vector: Vector3 = new Vector3;
            vector.data = new Float32Array([_a.x - _b.x, _a.y - _b.y, _a.z - _b.z]);
            return vector;
        }
        /**
         * Computes the crossproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the crossproduct of the given vectors
         */
        public static CROSS(_a: Vector3, _b: Vector3): Vector3 {
            let vector: Vector3 = new Vector3;
            vector.data = new Float32Array([
                _a.y * _b.z - _a.z * _b.y,
                _a.z * _b.x - _a.x * _b.z,
                _a.x * _b.y - _a.y * _b.x]);
            return vector;
        }
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         * @returns A new vector representing the dotproduct of the given vectors
         */
        public static DOT(_a: Vector3, _b: Vector3): number {
            let scalarProduct: number = _a.x * _b.x + _a.y * _b.y + _a.z * _b.z;
            return scalarProduct;
        }

        public add(_addend: Vector3): void {
            this.data = new Vector3(_addend.x + this.x, _addend.y + this.y, _addend.z + this.z).data;
        }
        public subtract(_subtrahend: Vector3): void {
            this.data = new Vector3(this.x - _subtrahend.x, this.y - _subtrahend.y, this.z - _subtrahend.z).data;
        }
        public scale(_scale: number): void {
            this.data = new Vector3(_scale * this.x, _scale * this.y, _scale * this.z).data;
        }

        public normalize(_length: number = 1): void {
            this.data = Vector3.NORMALIZATION(this, _length).data;
        }

        public set(_x: number = 0, _y: number = 0, _z: number = 0): void {
            this.data = new Float32Array([_x, _y, _z]);
        }

        public get(): Float32Array {
            return new Float32Array(this.data);
        }

        public get copy(): Vector3 {
            return new Vector3(this.x, this.y, this.z);
        }

        public transform(_matrix: Matrix4x4): void {
            this.data = Vector3.TRANSFORMATION(this, _matrix).data;
        }


        public getMutator(): Mutator {
            let mutator: Mutator = {
                x: this.data[0], y: this.data[1], z: this.data[2]
            };
            return mutator;
        }
        protected reduceMutator(_mutator: Mutator): void {/** */ }
    }
}