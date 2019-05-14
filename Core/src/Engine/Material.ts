namespace Fudge {
    /**
     * Baseclass for materials. Sets up attribute- and uniform locations to supply data to a shaderprogramm.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Material {
        private name: string; // The name to call the Material by.
        private shaderClass: typeof Shader; // The shader program used by this BaseMaterial

        private color: Color;
        private textureEnabled: boolean;
        private textureSource: string;

        // TODO: verify the connection of shader and material. The shader actually defines the properties of the material
        public constructor(_name: string, _color: Color, _shader: typeof Shader) {
            this.name = _name;
            this.shaderClass = _shader;
            this.color = _color;
            // this.textureBufferSpecification = { size: 2, dataType: gl2.FLOAT, normalize: true, stride: 0, offset: 0 };
            this.textureEnabled = false;
            this.textureSource = "";
        }

        // Get methods. ######################################################################################
        public get Shader(): typeof Shader {
            return this.shaderClass;
        }
        public get Name(): string {
            return this.name;
        }
        public get Color(): Color {
            return this.color;
        }
        public set Color(_color: Color) {
            this.color = _color;
        }
        public get TextureEnabled(): boolean {
            return this.textureEnabled;
        }
        public get TextureSource(): string {
            return this.textureSource;
        }

        // Color and Texture methods.######################################################################################
        /**
         * Adds and enables a Texture passed to this material.
         * @param _textureSource A string holding the path to the location of the texture.
         */
        // public addTexture(_textureSource: string): void {
        //     this.textureEnabled = true;
        //     this.textureSource = _textureSource;
        //     this.textureCoordinateAtributeLocation = GLUtil.assert<number>(this.shader.getAttributeLocation("a_textureCoordinate"));
        // }
        /**
         * Removes and disables a texture that was added to this material.
         */
        // public removeTexture(): void {
        //     this.textureEnabled = false;
        //     this.textureSource = "";
        // }
    }
}