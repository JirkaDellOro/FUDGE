var WebEngine;
(function (WebEngine) {
    /**
     * Simple class to compute the vertexpositions for a box.
     */
    class BoxGeometry {
        constructor(_width, _height, _depth) {
            this.width = _width;
            this.height = _height;
            this.depth = _depth;
            this.positions = [
                //front
                -this.width / 2, -this.height / 2, this.depth / 2,
                this.width / 2, -this.height / 2, this.depth / 2,
                -this.width / 2, this.height / 2, this.depth / 2,
                -this.width / 2, this.height / 2, this.depth / 2,
                this.width / 2, -this.height / 2, this.depth / 2,
                this.width / 2, this.height / 2, this.depth / 2,
                //back
                this.width / 2, -this.height / 2, -this.depth / 2,
                -this.width / 2, -this.height / 2, -this.depth / 2,
                this.width / 2, this.height / 2, -this.depth / 2,
                this.width / 2, this.height / 2, -this.depth / 2,
                -this.width / 2, -this.height / 2, -this.depth / 2,
                -this.width / 2, this.height / 2, -this.depth / 2,
                //left
                -this.width / 2, -this.height / 2, -this.depth / 2,
                -this.width / 2, -this.height / 2, this.depth / 2,
                -this.width / 2, this.height / 2, -this.depth / 2,
                -this.width / 2, this.height / 2, -this.depth / 2,
                -this.width / 2, -this.height / 2, this.depth / 2,
                -this.width / 2, this.height / 2, this.depth / 2,
                //right
                this.width / 2, -this.height / 2, this.depth / 2,
                this.width / 2, -this.height / 2, -this.depth / 2,
                this.width / 2, this.height / 2, this.depth / 2,
                this.width / 2, this.height / 2, this.depth / 2,
                this.width / 2, -this.height / 2, -this.depth / 2,
                this.width / 2, this.height / 2, -this.depth / 2,
                //top
                -this.width / 2, this.height / 2, this.depth / 2,
                this.width / 2, this.height / 2, this.depth / 2,
                -this.width / 2, this.height / 2, -this.depth / 2,
                -this.width / 2, this.height / 2, -this.depth / 2,
                this.width / 2, this.height / 2, this.depth / 2,
                this.width / 2, this.height / 2, -this.depth / 2,
                //bottom
                -this.width / 2, -this.height / 2, -this.depth / 2,
                this.width / 2, -this.height / 2, -this.depth / 2,
                -this.width / 2, -this.height / 2, this.depth / 2,
                -this.width / 2, -this.height / 2, this.depth / 2,
                this.width / 2, -this.height / 2, -this.depth / 2,
                this.width / 2, -this.height / 2, this.depth / 2,
            ];
        }
        // Get method.######################################################################################
        get Positions() {
            return this.positions;
        }
    } // End class.
    WebEngine.BoxGeometry = BoxGeometry;
})(WebEngine || (WebEngine = {})); // End Namespace.
//# sourceMappingURL=BoxGeometry.js.map