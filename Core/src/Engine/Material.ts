namespace Fudge {
    /**
     * Baseclass for materials. Sets up attribute- and uniform locations to supply data to a shaderprogramm.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Material {
        public name: string; // The name to call the Material by.
        private shaderType: typeof Shader; // The shader program used by this BaseMaterial
        private coat: Coat;

        // private color: Color;
        // private textureEnabled: boolean;
        // private textureSource: string;

        // TODO: verify the connection of shader and material. The shader actually defines the properties of the material
        public constructor(_name: string, _shader?: typeof Shader, _coat?: Coat) {
            this.name = _name;
            this.shaderType = _shader;
            if (_shader) {
                if (_coat)
                    this.setCoat(_coat);
                else
                    this.setCoat(this.createCoatMatchingShader());
            }
            // this.textureBufferSpecification = { size: 2, dataType: gl2.FLOAT, normalize: true, stride: 0, offset: 0 };
            //this.textureEnabled = false;
            //this.textureSource = "";
        }

        public createCoatMatchingShader(): Coat {
            let coat: Coat = new (this.shaderType.getCoat())();
            return coat;
        }

        public setCoat(_coat: Coat): void {
            if (_coat.constructor != this.shaderType.getCoat())
                throw (new Error("Shader and coat don't match"));
            this.coat = _coat;
        }

        public getCoat(): Coat {
            return this.coat;
        }

        public setShader(_shaderType: typeof Shader): void {
            this.shaderType = _shaderType;
            let coat: Coat = this.createCoatMatchingShader();
            coat.mutate(this.coat.getMutator());
        }

        // Get methods. ######################################################################################
        public getShader(): typeof Shader {
            return this.shaderType;
        }
        // public get Color(): Color {
        //     return this.color;
        // }
        // public set Color(_color: Color) {
        //     this.color = _color;
        // }
        // public get TextureEnabled(): boolean {
        //     return this.textureEnabled;
        // }
        // public get TextureSource(): string {
        //     return this.textureSource;
        // }

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