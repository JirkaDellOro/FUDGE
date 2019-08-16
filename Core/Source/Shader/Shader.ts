/// <reference path="../Coat/Coat.ts"/>
namespace FudgeCore {
    /**
     * Static superclass for the representation of WebGl shaderprograms. 
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */

     // TODO: define attribute/uniforms as layout and use those consistently in shaders
     
    export class Shader {
        /** The type of coat that can be used with this shader to create a material */
        public static getCoat(): typeof Coat { return null; }
        public static getVertexShaderSource(): string { return null; }
        public static getFragmentShaderSource(): string { return null; }
    }
}