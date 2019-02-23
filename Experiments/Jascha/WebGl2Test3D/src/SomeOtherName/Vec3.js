var WebEngine;
(function (WebEngine) {
    class Vec3 {
        constructor(_x = 0, _y = 0, _z = 0) {
            this.data = [_x, _y, _z];
        }
        // Get methods.######################################################################################
        get Data() {
            return this.data;
        }
        get X() {
            return this.data[0];
        }
        get Y() {
            return this.data[1];
        }
        get Z() {
            return this.data[2];
        }
        static get Up() {
            let vector = new Vec3;
            vector.data = [0, 1, 0];
            return vector;
        }
        static get Down() {
            let vector = new Vec3;
            vector.data = [0, -1, 0];
            return vector;
        }
        static get Forward() {
            let vector = new Vec3;
            vector.data = [0, 0, 1];
            return vector;
        }
        static get Backward() {
            let vector = new Vec3;
            vector.data = [0, 0, -1];
            return vector;
        }
        static get Right() {
            let vector = new Vec3;
            vector.data = [1, 0, 0];
            return vector;
        }
        static get Left() {
            let vector = new Vec3;
            vector.data = [-1, 0, 0];
            return vector;
        }
        // Vectormath methods.######################################################################################
        /**
         * Adds two vectors.
         * @param _a The vector to add to.
         * @param _b The vector to add
         */
        static add(_a, _b) {
            let vector = new Vec3;
            vector.data = [_a.X + _b.X, _a.Y + _b.Y, _a.Z + _b.Z];
            return vector;
        }
        /**
         * Subtracts two vectors.
         * @param _a The vector to subtract from.
         * @param _b The vector to subtract.
         */
        static subtract(_a, _b) {
            let vector = new Vec3;
            vector.data = [_a.X - _b.X, _a.Y - _b.Y, _a.Z - _b.Z];
            return vector;
        }
        /**
         * Computes the crossproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         */
        static cross(_a, _b) {
            let vector = new Vec3;
            vector.data = [
                _a.Y * _b.Z - _a.Z * _b.Y,
                _a.Z * _b.X - _a.X * _b.Z,
                _a.X * _b.Y - _a.Y * _b.X
            ];
            return vector;
        }
        /**
         * Computes the dotproduct of 2 vectors.
         * @param _a The vector to multiply.
         * @param _b The vector to multiply by.
         */
        static dot(_a, _b) {
            let scalarProduct = _a.X * _b.X + _a.Y * _b.Y + _a.Z * _b.Z;
            return scalarProduct;
        }
        /**
         * Normalizes a vector.
         * @param _vector The vector to normalize.
         */
        static normalize(_vector) {
            let length = Math.sqrt(_vector.X * _vector.X + _vector.Y * _vector.Y + _vector.Z * _vector.Z);
            let vector = new Vec3;
            // make sure we don't divide by 0.
            if (length > 0.00001) {
                vector.data = [_vector.X / length, _vector.Y / length, _vector.Z / length];
            }
            else {
                vector.data = [0, 0, 0];
            }
            return vector;
        }
    }
    WebEngine.Vec3 = Vec3;
})(WebEngine || (WebEngine = {}));
//# sourceMappingURL=Vec3.js.map