namespace Fudge {

    export class Vector3 {
        private data: number[];

        public constructor(_x: number = 0, _y: number = 0, _z: number = 0) {
            this.data = [_x, _y, _z];
        }

        // Vectormath methods.######################################################################################
        /**
         * Adds two vectors.
         * @param _a The vector to add to.
         * @param _b The vector to add
         */
        public static add(_a: Vector3, _b: Vector3): Vector3 {
            let vector: Vector3 = new Vector3;
            vector.data = [_a.X + _b.X, _a.Y + _b.Y, _a.Z + _b.Z];
            return vector;
        }
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         */
        public static subtract(_a: Vector3, _b: Vector3): Vector3 {
            let vector: Vector3 = new Vector3;
            vector.data = [_a.X - _b.X, _a.Y - _b.Y, _a.Z - _b.Z];
            return vector;
        }
        /**
         * Computes the crossproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         */
        public static cross(_a: Vector3, _b: Vector3): Vector3 {
            let vector: Vector3 = new Vector3;
            vector.data = [
                _a.Y * _b.Z - _a.Z * _b.Y,
                _a.Z * _b.X - _a.X * _b.Z,
                _a.X * _b.Y - _a.Y * _b.X];
            return vector;
        }
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         */
        public static dot(_a: Vector3, _b: Vector3): number {
            let scalarProduct: number = _a.X * _b.X + _a.Y * _b.Y + _a.Z * _b.Z;
            return scalarProduct;
        }
        /**
         * Normalizes a vector.
         * @param _vector The vector to normalize.
         */
        public static normalize(_vector: Vector3): Vector3 {
            let length: number = Math.sqrt(_vector.X * _vector.X + _vector.Y * _vector.Y + _vector.Z * _vector.Z);
            let vector: Vector3 = new Vector3;
            // make sure we don't divide by 0.
            if (length > 0.00001) {
                vector.data = [_vector.X / length, _vector.Y / length, _vector.Z / length];
            } else {
                vector.data = [0, 0, 0];
            }
            return vector;
        }


        // Get methods.######################################################################################
        get Data(): number[] {
            return this.data;
        }
        get X(): number {
            return this.data[0];
        }
        get Y(): number {
            return this.data[1];
        }
        get Z(): number {
            return this.data[2];
        }
        public static get Up(): Vector3 {
            let vector: Vector3 = new Vector3;
            vector.data = [0, 1, 0];
            return vector;
        }
        public static get Down(): Vector3 {
            let vector: Vector3 = new Vector3;
            vector.data = [0, -1, 0];
            return vector;
        }
        public static get Forward(): Vector3 {
            let vector: Vector3 = new Vector3;
            vector.data = [0, 0, 1];
            return vector;
        }
        public static get Backward(): Vector3 {
            let vector: Vector3 = new Vector3;
            vector.data = [0, 0, -1];
            return vector;
        }
        public static get Right(): Vector3 {
            let vector: Vector3 = new Vector3;
            vector.data = [1, 0, 0];
            return vector;
        }
        public static get Left(): Vector3 {
            let vector: Vector3 = new Vector3;
            vector.data = [-1, 0, 0];
            return vector;
        }

    }
}