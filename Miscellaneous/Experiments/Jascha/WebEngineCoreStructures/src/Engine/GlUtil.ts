namespace WebEngine {


    export let gl2: WebGL2RenderingContext; // The renderingcontext to be used over all classes.
    /**
     * Utility class to sore and/or wrap some functionality.
     */
    export abstract class GLUtil {
        /**
         * Sets up canvas and renderingcontext. If no canvasID is passed, a canvas will be created.
         * @param _elementID Optional: ID of a predefined canvaselement.
         */
        public static initializeContext(_elementID?: string): HTMLCanvasElement {
            let canvas: HTMLCanvasElement;

            if (_elementID !== undefined) {         // Check if ID was passed. 
                canvas = <HTMLCanvasElement>document.getElementById(_elementID);
                if (canvas === undefined) {         // Check if element by passed ID exists. Otherwise throw Error.
                    throw new Error("Cannot find a canvas Element named: " + _elementID);
                }
            }
            else { // If no Canvas ID was passed, create new canvas with default width and height. 
                console.log("Creating new canvas...")
                canvas = <HTMLCanvasElement>document.createElement("canvas");
                canvas.id = "canvas";
                canvas.width = 800;
                canvas.height = 640;
                document.body.appendChild(canvas);
            }

            gl2 = canvas.getContext("webgl2");
            if (gl2 === undefined) {
                throw new Error("The Browser does not support WebGl2.");
            }
            return canvas;
        }

        /**
         * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
         * @param _attributeLocation // The location of the attribute on the shader, to which they data will be passed.
         * @param _bufferSpecification // Interface passing datapullspecifications to the buffer.
         */
        public static attributePointer(_attributeLocation: number, _bufferSpecification: BufferSpecification): void {
            gl2.vertexAttribPointer(_attributeLocation, _bufferSpecification.size, _bufferSpecification.dataType, _bufferSpecification.normalize, _bufferSpecification.stride, _bufferSpecification.offset);
        };
        /**
         * Wrapperclass that binds and initializes a texture.
         * @param _textureSource A string containing the path to the texture.
         */
        public static createTexture(_textureSource: string): void {
            let texture: WebGLTexture = gl2.createTexture();
            gl2.bindTexture(gl2.TEXTURE_2D, texture);
            // Fill the texture with a 1x1 blue pixel.
            gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RGBA, 1, 1, 0, gl2.RGBA, gl2.UNSIGNED_BYTE, new Uint8Array([170, 170, 255, 255]));
            // Asynchronously load an image
            let image = new Image();
            image.crossOrigin = "anonymous";
            image.src = _textureSource;
            image.onload = function () {
                gl2.bindTexture(gl2.TEXTURE_2D, texture);
                gl2.texImage2D(gl2.TEXTURE_2D, 0, gl2.RGBA, gl2.RGBA, gl2.UNSIGNED_BYTE, image);
                gl2.generateMipmap(gl2.TEXTURE_2D);
            }
        }
    } // End class.
}// End namespace.