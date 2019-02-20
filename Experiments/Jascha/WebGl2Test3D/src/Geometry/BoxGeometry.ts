namespace WebEngine {

    /**
     * Simple class to compute the vertexpositions for a box.
     */
    export class BoxGeometry {

        private width: number; // The box' width.
        private height: number; // The box' height.
        private depth: number; // The box' depth.
        private positions: number[]; //Array holding x, y, and z-positions for each vertex.

        public constructor(_width: number, _height: number, _depth: number) {

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
                this.width / 2, -this.height / 2, this.depth / 2,];
        }

        // Get method.######################################################################################
        public get Positions() {
            return this.positions;
        }
    } // End class.
} // End Namespace.