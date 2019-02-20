var WebEngine;
(function (WebEngine) {
    /**
     * Utility class to sore and/or wrap some functionality.
     */
    class GLUtil {
        /**
         * Sets up canvas and renderingcontext. If no canvasID is passed, a canvas will be created.
         * @param _elementID Optional: ID of a predefined canvaselement.
         */
        static initializeContext(_elementID) {
            let canvas;
            if (_elementID !== undefined) { // Check if ID was passed. 
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
            WebEngine.gl2 = canvas.getContext("webgl2");
            if (WebEngine.gl2 === undefined) {
                throw new Error("Unable to initialize WebGL2");
            }
            return canvas;
        }
        /**
         * Wrapper function to utilize the BufferData interface when passing data to the shader via a buffer.
         * @param _attributeLocation // The location of the attribute on the shader, to which they data will be passed.
         * @param _bufferData // Interface passing datapullspecifications to the buffer.
         */
        static attributePointer(_attributeLocation, _bufferData) {
            WebEngine.gl2.vertexAttribPointer(_attributeLocation, _bufferData.size, _bufferData.dataType, _bufferData.normalize, _bufferData.stride, _bufferData.offset);
        }
        ;
        /**
         * Wrapperclass that binds and initializes a texture.
         * @param _textureSource A string containing the path to the texture.
         */
        static createTexture(_textureSource) {
            let texture = WebEngine.gl2.createTexture();
            WebEngine.gl2.bindTexture(WebEngine.gl2.TEXTURE_2D, texture);
            // Fill the texture with a 1x1 blue pixel.
            WebEngine.gl2.texImage2D(WebEngine.gl2.TEXTURE_2D, 0, WebEngine.gl2.RGBA, 1, 1, 0, WebEngine.gl2.RGBA, WebEngine.gl2.UNSIGNED_BYTE, new Uint8Array([170, 170, 255, 255]));
            // Asynchronously load an image
            let image = new Image();
            image.crossOrigin = "anonymous";
            image.src = _textureSource;
            image.onload = function () {
                WebEngine.gl2.bindTexture(WebEngine.gl2.TEXTURE_2D, texture);
                WebEngine.gl2.texImage2D(WebEngine.gl2.TEXTURE_2D, 0, WebEngine.gl2.RGBA, WebEngine.gl2.RGBA, WebEngine.gl2.UNSIGNED_BYTE, image);
                WebEngine.gl2.generateMipmap(WebEngine.gl2.TEXTURE_2D);
            };
        }
    } // End class.
    WebEngine.GLUtil = GLUtil;
})(WebEngine || (WebEngine = {})); // End namespace.
//# sourceMappingURL=GlUtil.js.map