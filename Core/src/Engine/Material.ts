namespace Fudge {
    /**
     * Baseclass for materials. Sets up attribute- and uniform locations to supply data to a shaderprogramm.
     * @authors Jascha Karagöl, HFU, 2019 | Jirka Dell'Oro-Friedl, HFU, 2019
     */
    export class Material {
        private name: string; // The name to call the Material by.
        private shader: Shader; // The shader program used by this BaseMaterial
        private positionAttributeLocation: number; // The attribute on the shader that takes the meshs vertexpositions.
        private colorAttributeLocation: number; // The attribute on the shader that takes a materials colorvalues.
        private textureCoordinateAtributeLocation: number; // The attribute on the shader that takes the meshs texturecoordinates.
        private matrixLocation: WebGLUniformLocation; // The uniform on the shader to multiply the vertexpositions by to place them in viewspace.

        private color: Vector3;
        private textureEnabled: boolean;
        private textureSource: string;
        private colorBufferSpecification: BufferSpecification;
        private textureBufferSpecification: BufferSpecification;

        // TODO: verify the connection of shader and material. The shader actually defines the properties of the material

        public constructor(_name: string, _color: Vector3, _shader: Shader) {
            this.name = _name;
            this.shader = _shader;
            this.positionAttributeLocation = GLUtil.assert<number>(this.shader.getAttributeLocation("a_position"));
            this.colorAttributeLocation = GLUtil.assert<number>(this.shader.getAttributeLocation("a_color"));
            this.matrixLocation = GLUtil.assert<WebGLUniformLocation>(this.shader.getUniformLocation("u_matrix"));

            this.color = _color;
            this.colorBufferSpecification = {
                size: 3,
                dataType: gl2.UNSIGNED_BYTE,
                normalize: true,
                stride: 0,
                offset: 0
            };
            this.textureBufferSpecification = {
                size: 2,
                dataType: gl2.FLOAT,
                normalize: true,
                stride: 0,
                offset: 0
            };
            this.textureEnabled = false;
            this.textureSource = "";
        }

        // Get methods. ######################################################################################
        public get Shader(): Shader {
            return this.shader;
        }
        public get Name(): string {
            return this.name;
        }
        public get Color(): Vector3 {
            return this.color;
        }
        public set Color(_color: Vector3) {
            this.color = _color;
        }
        public get ColorBufferSpecification(): BufferSpecification {
            return this.colorBufferSpecification;
        }
        public get TextureBufferSpecification(): BufferSpecification {
            return this.textureBufferSpecification;
        }
        public get TextureEnabled(): boolean {
            return this.textureEnabled;
        }
        public get TextureSource(): string {
            return this.textureSource;
        }

        public get PositionAttributeLocation(): number {
            return this.positionAttributeLocation;
        }
        public get ColorAttributeLocation(): number {
            return this.colorAttributeLocation;
        }
        public get MatrixUniformLocation(): WebGLUniformLocation {
            return this.matrixLocation;
        }
        public get TextureCoordinateLocation(): number {
            return this.textureCoordinateAtributeLocation;
        }

        // Color and Texture methods.######################################################################################
        /**
         * Adds and enables a Texture passed to this material.
         * @param _textureSource A string holding the path to the location of the texture.
         */
        public addTexture(_textureSource: string): void {
            this.textureEnabled = true;
            this.textureSource = _textureSource;
            this.textureCoordinateAtributeLocation = GLUtil.assert<number>(this.shader.getAttributeLocation("a_textureCoordinate"));
        }
        /**
         * Removes and disables a texture that was added to this material.
         */
        public removeTexture(): void {
            this.textureEnabled = false;
            this.textureSource = "";
        }
    }
}