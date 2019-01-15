namespace WebGl2Test2D {

    export var gl2: WebGL2RenderingContext;

    /** Sets up WebGL2 renderingContext on a (given) canvaselement. */
    export class GLUtil {

        /**
         * 
         * @param _elementID Optional: ID of a predefined canvaselement.
         */
        public static initialize(_elementID?: string): HTMLCanvasElement {
            let canvas: HTMLCanvasElement;

            if (_elementID !== undefined) {         // Check if ID was given. 
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
                canvas.height = 600;
                document.body.appendChild(canvas);
            }

            gl2 = canvas.getContext("webgl2");
            if (gl2 === undefined) {
                throw new Error("Unable to initialize WebGL2");
            }
            return canvas;
        }

        public static resizeCanvasToDisplaySize(canvas:HTMLCanvasElement, multiplier?:number):void {
            multiplier = multiplier || 1;
            const width  = canvas.clientWidth  * multiplier | 0;
            const height = canvas.clientHeight * multiplier | 0;
            if (canvas.width !== width ||  canvas.height !== height) {
              canvas.width  = width;
              canvas.height = height;
            }
          }
        
    }
}