namespace WebGl2Test3D {

    export class M3 {

        public matrix: number[];

        public static identity(): number[] {
            return [
                1, 0, 0,
                0, 1, 0,
                0, 0, 1
            ];
        }


        private static translation(_xTranslation, _yTranslation): number[] {
            return [
                1, 0, 0,
                0, 1, 0,
                _xTranslation, _yTranslation, 1
            ];
        }


        public static translate(_matrix: number[], _xTranslation, _yTranslation) {
            return M3.multiply(_matrix, M3.translation(_xTranslation, _yTranslation));
        }

        public static moveOriginMatrix(_x: number, _y: number): number[]{
            return M3.translation(_x,_y);
        }

        private static rotation(_angleInDegrees: number): number[] {
            var angleInDegrees = 360 - _angleInDegrees;
            var angleInRadians = angleInDegrees * Math.PI / 180;
            var sin = Math.sin(angleInRadians);
            var cos = Math.cos(angleInRadians);
            return [
                cos, -sin, 0,
                sin, cos, 0,
                0, 0, 1
            ];
        }


        public static rotate(_matrix: number[], _angleInDegrees: number): number[] {
            return M3.multiply(_matrix, M3.rotation(_angleInDegrees));
        }

        private static scaling(_xScale, _yScale): number[] {
            return [
                _xScale, 0, 0,
                0, _yScale, 0,
                0, 0, 1
            ];
        }

        public static scale(_matrix: number[], _xScale: number, _yscale: number) {
            return M3.multiply(_matrix, M3.scaling(_xScale, _yscale));
        }

        public static multiply(_a, _b): number[] {
            var a00 = _a[0 * 3 + 0];
            var a01 = _a[0 * 3 + 1];
            var a02 = _a[0 * 3 + 2];
            var a10 = _a[1 * 3 + 0];
            var a11 = _a[1 * 3 + 1];
            var a12 = _a[1 * 3 + 2];
            var a20 = _a[2 * 3 + 0];
            var a21 = _a[2 * 3 + 1];
            var a22 = _a[2 * 3 + 2];
            var b00 = _b[0 * 3 + 0];
            var b01 = _b[0 * 3 + 1];
            var b02 = _b[0 * 3 + 2];
            var b10 = _b[1 * 3 + 0];
            var b11 = _b[1 * 3 + 1];
            var b12 = _b[1 * 3 + 2];
            var b20 = _b[2 * 3 + 0];
            var b21 = _b[2 * 3 + 1];
            var b22 = _b[2 * 3 + 2];

            return [
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
        }

        public static projection(_width: number, _height: number): number[] {
            return [
                2 / _width, 0, 0,
                0, -2 / _height, 0,
                -1, 1, 1
            ]
        }
    }

}
