namespace FudgeCore {
    /**
     * Baseclass for different kinds of textures. 
     * @authors Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export abstract class Texture extends Mutable {
        protected reduceMutator(): void {/**/ }
    }

    /**
     * Texture created from an existing image
     */
    export class TextureImage extends Texture {
        public image: HTMLImageElement = null;
    }
    /**
     * Texture created from a canvas
     */
    export class TextureCanvas extends Texture {
    }
    /**
     * Texture created from a FUDGE-Sketch
     */
    export class TextureSketch extends TextureCanvas {
    }
    /**
     * Texture created from an HTML-page
     */
    export class TextureHTML extends TextureCanvas {
    }
}