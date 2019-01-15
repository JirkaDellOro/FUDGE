var WebGl2Test3D;
(function (WebGl2Test3D) {
    /** Sets up WebGL2 renderingContext on a (given) canvaselement. */
    var GLUtil = /** @class */ (function () {
        function GLUtil() {
        }
        /**
         *
         * @param _elementID Optional: ID of a predefined canvaselement.
         */
        GLUtil.initialize = function (_elementID) {
            var canvas;
            if (_elementID !== undefined) { // Check if ID was given. 
                canvas = document.getElementById(_elementID);
                if (canvas === undefined) { // Check if element by passed ID exists. Otherwise throw Error.
                    throw new Error("Cannot find a canvas Element named: " + _elementID);
                }
            }
            else { // If no Canvas ID was passed, create new canvas with default width and height. 
                console.log("Creating new canvas...");
                canvas = document.createElement("canvas");
                canvas.id = "canvas";
                canvas.width = 1260;
                canvas.height = 1080;
                document.body.appendChild(canvas);
            }
            WebGl2Test3D.gl2 = canvas.getContext("webgl2");
            if (WebGl2Test3D.gl2 === undefined) {
                throw new Error("Unable to initialize WebGL2");
            }
            return canvas;
        };
        GLUtil.resizeCanvasToDisplaySize = function (canvas, multiplier) {
            multiplier = multiplier || 1;
            var width = canvas.clientWidth * multiplier | 0;
            var height = canvas.clientHeight * multiplier | 0;
            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
            }
        };
        return GLUtil;
    }());
    WebGl2Test3D.GLUtil = GLUtil;
})(WebGl2Test3D || (WebGl2Test3D = {}));
//# sourceMappingURL=GlUtil.js.map