namespace Fudge {
    /**
     * Class storing and manipulating a threedimensional vector
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Vector3 {
        private data: Float32Array; // TODO: check why this shouldn't be x,y,z as numbers...

        public constructor(_x: number = 0, _y: number = 0, _z: number = 0) {
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

        public static get ZERO(): Vector3 {
            const vector: Vector3 = new Vector3(0, 0, 0);
            return vector;
        }

        // Vectormath methods.######################################################################################
        /**
         * Adds two vectors.
         * @param _a The first vector to add
         * @param _b The second vector to add
         * @returns A new vector representing the sum of the given vectors
         */
        public static add(_a: Vector3, _b: Vector3): Vector3 {
            let vector: Vector3 = new Vector3(_a.x + _b.x, _a.y + _b.y, _a.z + _b.z);
            return vector;
        }
        /**
        * Sums up multiple vectors.
        * @param _a The first vector to add
        * @param _b The second vector to add
        * @returns A new vector representing the sum of the given vectors
        */
        public static sum(..._vectors: Vector3[]): Vector3 {
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
        public static subtract(_a: Vector3, _b: Vector3): Vector3 {
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
        public static cross(_a: Vector3, _b: Vector3): Vector3 {
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
        public static dot(_a: Vector3, _b: Vector3): number {
            let scalarProduct: number = _a.x * _b.x + _a.y * _b.y + _a.z * _b.z;
            return scalarProduct;
        }
        /**
         * Normalizes a vector.
         * @param _vector The vector to normalize.
         * @returns A new vector representing the given vector scaled to the length of 1
         */
        public static normalize(_vector: Vector3): Vector3 {
            let [x, y, z] = _vector.data;
            let length: number = Math.hypot(x, y, z);
            let vector: Vector3 = new Vector3;
            // make sure we don't divide by 0. TODO: see if it's appropriate to use try/catch here
            if (length > 0.00001) {
                vector.data = new Float32Array([_vector.x / length, _vector.y / length, _vector.z / length]);
            } else {
                vector.data = new Float32Array([0, 0, 0]);
            }
            return vector;
        }

        public set(_x: number = 0, _y: number = 0, _z: number = 0): void {
            this.data = new Float32Array([_x, _y, _z]);
        }
        /**
         * Retrieve the vector as an array with three elements
         */
        public get(): Float32Array {
            return new Float32Array(this.data);
        }

        public transform(_matrix: Matrix4x4): void {
            let result: Vector3 = new Vector3();
            let m: Float32Array = _matrix.data;
            let [x, y, z] = this.get();
            result.x = m[0] * x + m[4] * y + m[8] * z + m[12];
            result.y = m[1] * x + m[5] * y + m[9] * z + m[13];
            result.z = m[2] * x + m[6] * y + m[10] * z + m[14];
            this.data = result.data;
        }
    }
}