namespace Fudge {
    /**
     * Class storing and manipulating a threedimensional vector
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Vector3 {
        private data: number[]; // TODO: check why this shouldn't be x,y,z as numbers...

        public constructor(_x: number = 0, _y: number = 0, _z: number = 0) {
            this.data = [_x, _y, _z];
        }

        // TODO: implement equals-functions

        // Get methods.######################################################################################
        get Data(): number[] {
            return this.data;
        }
        get x(): number {
            return this.data[0];
        }
        get y(): number {
            return this.data[1];
        }
        get z(): number {
            return this.data[2];
        }
        /**
         * The up-Vector (0, 1, 0)
         */
        public static get up(): Vector3 {
            let vector: Vector3 = new Vector3(0, 1, 0);
            return vector;
        }
        /**
         * The down-Vector (0, -1, 0)
         */
        public static get down(): Vector3 {
            let vector: Vector3 = new Vector3(0, -1, 0);
            return vector;
        }
        /**
         * The forward-Vector (0, 0, 1)
         */
        public static get forward(): Vector3 {
            let vector: Vector3 = new Vector3(0, 0, 1);
            return vector;
        }
        /**
         * The backward-Vector (0, 0, -1)
         */
        public static get backward(): Vector3 {
            let vector: Vector3 = new Vector3(0, 0, -1);
            return vector;
        }
        /**
         * The right-Vector (1, 0, 0)
         */
        public static get right(): Vector3 {
            let vector: Vector3 = new Vector3(1, 0, 0);
            return vector;
        }
        /**
         * The left-Vector (-1, 0, 0)
         */
        public static get left(): Vector3 {
            let vector: Vector3 = new Vector3(-1, 0, 0);
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
                result.data = [result.x + vector.x, result.y + vector.y, result.z + vector.z];
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
            vector.data = [_a.x - _b.x, _a.y - _b.y, _a.z - _b.z];
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
            vector.data = [
                _a.y * _b.z - _a.z * _b.y,
                _a.z * _b.x - _a.x * _b.z,
                _a.x * _b.y - _a.y * _b.x];
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
            let length: number = Math.sqrt(_vector.x * _vector.x + _vector.y * _vector.y + _vector.z * _vector.z);
            let vector: Vector3 = new Vector3;
            // make sure we don't divide by 0. TODO: see if it's appropriate to use try/catch here
            if (length > 0.00001) {
                vector.data = [_vector.x / length, _vector.y / length, _vector.z / length];
            } else {
                vector.data = [0, 0, 0];
            }
            return vector;
        }

        /**
         * Retrieve the vector as an array with three elements
         */
        public getArray(): Float32Array {
            return new Float32Array(this.data);
        }
    }
}