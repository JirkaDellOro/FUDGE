namespace Fudge {

    /**
     * Simple class to compute the vertexpositions for a box.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class MeshCube {
        private positions: Float32Array;

        public constructor(_width: number, _height: number, _depth: number) {

            this.positions = new Float32Array([

                //front
                -_width / 2, -_height / 2, _depth / 2,
                _width / 2, -_height / 2, _depth / 2,
                -_width / 2, _height / 2, _depth / 2,
                -_width / 2, _height / 2, _depth / 2,
                _width / 2, -_height / 2, _depth / 2,
                _width / 2, _height / 2, _depth / 2,

                //back
                _width / 2, -_height / 2, -_depth / 2,
                -_width / 2, -_height / 2, -_depth / 2,
                _width / 2, _height / 2, -_depth / 2,
                _width / 2, _height / 2, -_depth / 2,
                -_width / 2, -_height / 2, -_depth / 2,
                -_width / 2, _height / 2, -_depth / 2,

                //left
                -_width / 2, -_height / 2, -_depth / 2,
                -_width / 2, -_height / 2, _depth / 2,
                -_width / 2, _height / 2, -_depth / 2,
                -_width / 2, _height / 2, -_depth / 2,
                -_width / 2, -_height / 2, _depth / 2,
                -_width / 2, _height / 2, _depth / 2,

                //right

                _width / 2, -_height / 2, _depth / 2,
                _width / 2, -_height / 2, -_depth / 2,
                _width / 2, _height / 2, _depth / 2,
                _width / 2, _height / 2, _depth / 2,
                _width / 2, -_height / 2, -_depth / 2,
                _width / 2, _height / 2, -_depth / 2,

                //top
                -_width / 2, _height / 2, _depth / 2,
                _width / 2, _height / 2, _depth / 2,
                -_width / 2, _height / 2, -_depth / 2,
                -_width / 2, _height / 2, -_depth / 2,
                _width / 2, _height / 2, _depth / 2,
                _width / 2, _height / 2, -_depth / 2,

                //bottom
                -_width / 2, -_height / 2, -_depth / 2,
                _width / 2, -_height / 2, -_depth / 2,
                -_width / 2, -_height / 2, _depth / 2,
                -_width / 2, -_height / 2, _depth / 2,
                _width / 2, -_height / 2, -_depth / 2,
                _width / 2, -_height / 2, _depth / 2]);
        }

        // Get method.######################################################################################
        public get Positions(): Float32Array {
            return this.positions;
        }
    }
}