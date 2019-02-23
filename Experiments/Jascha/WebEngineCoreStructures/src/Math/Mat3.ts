namespace WebEngine {

    /**
     * Simple class for 3x3 matrix operations (This class can only handle 2D
     * transformations. Could be removed after applying full 2D compatibility to Mat4).
     */
    export class Mat3 {

        public data: number[];

        public constructor() {
            this.data = [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1,
            ]
        }

    

        public get Data(): number[] {
            return this.data;
        }

        public identity(): Mat3 {
            return new Mat3;
        }


        private translation(_xTranslation: number, _yTranslation: number): Mat3 {
            let matrix: Mat3 = new Mat3;
            matrix.data = [
                1, 0, 0,
                0, 1, 0,
                _xTranslation, _yTranslation, 1
            ];
            return matrix;
        }


        public translate(_matrix: Mat3, _xTranslation : number, _yTranslation:number): Mat3 {
            return this.multiply(_matrix, this.translation(_xTranslation, _yTranslation));
        }

        private rotation(_angleInDegrees: number): Mat3 {
            let angleInDegrees: number = 360 - _angleInDegrees;
            let angleInRadians: number = angleInDegrees * Math.PI / 180;
            let sin: number = Math.sin(angleInRadians);
            let cos: number = Math.cos(angleInRadians);
            let matrix: Mat3 = new Mat3;
            matrix.data = [
                cos, -sin, 0,
                sin, cos, 0,
                0, 0, 1
            ];
            return matrix;
        }


        public rotate(_matrix: Mat3, _angleInDegrees: number): Mat3 {
            return this.multiply(_matrix, this.rotation(_angleInDegrees));
        }

        private scaling(_xScale, _yScale): Mat3 {
            let matrix: Mat3 = new Mat3;
            matrix.data = [
                _xScale, 0, 0,
                0, _yScale, 0,
                0, 0, 1
            ];
            return matrix;
        }

        public scale(_matrix: Mat3, _xScale: number, _yscale: number) : Mat3 {
            return this.multiply(_matrix, this.scaling(_xScale, _yscale));
        }

        public multiply(_a: Mat3, _b: Mat3): Mat3 {
            let a00: number = _a.data[0 * 3 + 0];
            let a01: number = _a.data[0 * 3 + 1];
            let a02: number = _a.data[0 * 3 + 2];
            let a10: number = _a.data[1 * 3 + 0];
            let a11: number = _a.data[1 * 3 + 1];
            let a12: number = _a.data[1 * 3 + 2];
            let a20: number = _a.data[2 * 3 + 0];
            let a21: number = _a.data[2 * 3 + 1];
            let a22: number = _a.data[2 * 3 + 2];
            let b00: number = _b.data[0 * 3 + 0];
            let b01: number = _b.data[0 * 3 + 1];
            let b02: number = _b.data[0 * 3 + 2];
            let b10: number = _b.data[1 * 3 + 0];
            let b11: number = _b.data[1 * 3 + 1];
            let b12: number = _b.data[1 * 3 + 2];
            let b20: number = _b.data[2 * 3 + 0];
            let b21: number = _b.data[2 * 3 + 1];
            let b22: number = _b.data[2 * 3 + 2];
            let matrix: Mat3 = new Mat3;
            matrix.data = [
                b00 * a00 + b01 * a10 + b02 * a20,
                b00 * a01 + b01 * a11 + b02 * a21,
                b00 * a02 + b01 * a12 + b02 * a22,
                b10 * a00 + b11 * a10 + b12 * a20,
                b10 * a01 + b11 * a11 + b12 * a21,
                b10 * a02 + b11 * a12 + b12 * a22,
                b20 * a00 + b21 * a10 + b22 * a20,
                b20 * a01 + b21 * a11 + b22 * a21,
                b20 * a02 + b21 * a12 + b22 * a22,
            ];
            return matrix;
        }

        public static projection(_width: number, _height: number): Mat3 {
            let matrix: Mat3 = new Mat3;
            matrix.data = [
                2 / _width, 0, 0,
                0, -2 / _height, 0,
                -1, 1, 1
            ]
            return matrix;
        }
    }

}
