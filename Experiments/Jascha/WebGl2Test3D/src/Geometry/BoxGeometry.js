var WebEngine;
(function (WebEngine) {
    /**
     * Simple class to compute the vertexpositions for a box.
     */
    class BoxGeometry {
        constructor(_width, _height, _depth) {
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
                _width / 2, -_height / 2, _depth / 2,
            ]);
        }
        // Get method.######################################################################################
        get Positions() {
            return this.positions;
        }
    } // End class.
    WebEngine.BoxGeometry = BoxGeometry;
})(WebEngine || (WebEngine = {})); // End Namespace.
//# sourceMappingURL=BoxGeometry.js.map