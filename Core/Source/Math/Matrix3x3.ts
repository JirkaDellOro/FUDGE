namespace FudgeCore {

    /**
     * Simple class for 3x3 matrix operations (This class can only handle 2D
     * transformations. Could be removed after applying full 2D compatibility to Mat4).
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Matrix3x3 {

        public data: number[];

        public constructor() {
            this.data = [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ];
        }

        public static projection(_width: number, _height: number): Matrix3x3 {
            let matrix: Matrix3x3 = new Matrix3x3;
            matrix.data = [
                2 / _width, 0, 0,
                0, -2 / _height, 0,
                -1, 1, 1
            ];
            return matrix;
        }

        public get Data(): number[] {
            return this.data;
        }

        public identity(): Matrix3x3 {
            return new Matrix3x3;
        }
        public translate(_matrix: Matrix3x3, _xTranslation: number, _yTranslation: number): Matrix3x3 {
            return this.multiply(_matrix, this.translation(_xTranslation, _yTranslation));
        }

        public rotate(_matrix: Matrix3x3, _angleInDegrees: number): Matrix3x3 {
            return this.multiply(_matrix, this.rotation(_angleInDegrees));
        }

        public scale(_matrix: Matrix3x3, _xScale: number, _yscale: number): Matrix3x3 {
            return this.multiply(_matrix, this.scaling(_xScale, _yscale));
        }

        public multiply(_a: Matrix3x3, _b: Matrix3x3): Matrix3x3 {
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
            let matrix: Matrix3x3 = new Matrix3x3;
            matrix.data = [
                b00 * a00 + b01 * a10 + b02 * a20,
                b00 * a01 + b01 * a11 + b02 * a21,
                b00 * a02 + b01 * a12 + b02 * a22,
                b10 * a00 + b11 * a10 + b12 * a20,
                b10 * a01 + b11 * a11 + b12 * a21,
                b10 * a02 + b11 * a12 + b12 * a22,
                b20 * a00 + b21 * a10 + b22 * a20,
                b20 * a01 + b21 * a11 + b22 * a21,
                b20 * a02 + b21 * a12 + b22 * a22
            ];
            return matrix;
        }

        private translation(_xTranslation: number, _yTranslation: number): Matrix3x3 {
            let matrix: Matrix3x3 = new Matrix3x3;
            matrix.data = [
                1, 0, 0,
                0, 1, 0,
                _xTranslation, _yTranslation, 1
            ];
            return matrix;
        }

        private scaling(_xScale: number, _yScale: number): Matrix3x3 {
            let matrix: Matrix3x3 = new Matrix3x3;
            matrix.data = [
                _xScale, 0, 0,
                0, _yScale, 0,
                0, 0, 1
            ];
            return matrix;
        }

        private rotation(_angleInDegrees: number): Matrix3x3 {
            let angleInDegrees: number = 360 - _angleInDegrees;
            let angleInRadians: number = angleInDegrees * Math.PI / 180;
            let sin: number = Math.sin(angleInRadians);
            let cos: number = Math.cos(angleInRadians);
            let matrix: Matrix3x3 = new Matrix3x3;
            matrix.data = [
                cos, -sin, 0,
                sin, cos, 0,
                0, 0, 1
            ];
            return matrix;
        }


    }

}
