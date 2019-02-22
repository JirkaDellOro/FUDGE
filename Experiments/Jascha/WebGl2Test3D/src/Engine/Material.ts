namespace WebEngine{

    /**
     * Baseclass for materials. Sets up attribute- and uniform locations to supply data to a shaderprogramm.
     */
    export class Material {
        private name : string; // The name to call the Material by.
        private shader: Shader; // The shader program used by this BaseMaterial
        private positionAttributeLocation: number; // The attribute on the shader that takes the meshs vertexpositions.
        private colorAttributeLocation: number; // The attribute on the shader that takes a materials colorvalues.
        private textureCoordinateAtributeLocation: number; // The attribute on the shader that takes the meshs texturecoordinates.
        private matrixLocation: WebGLUniformLocation; // The uniform on the shader to multiply the vertexpositions by to place them in viewspace.

        private color: Vec3;
        private textureEnabled: boolean;
        private textureSource: string;
        private colorBufferSpecification: BufferSpecification;
        private textureBufferSpecification: BufferSpecification;
        

        public constructor(_name:string, _color:Vec3,_shader: Shader) {
            this.name = _name
            this.shader = _shader;
            this.positionAttributeLocation = this.shader.getAttributeLocation("a_position");
            this.colorAttributeLocation = this.shader.getAttributeLocation("a_color");
            this.textureCoordinateAtributeLocation = this.shader.getAttributeLocation("a_textureCoordinate");
            this.matrixLocation = this.shader.getUniformLocation("u_matrix");

            this.color = _color;
            this.colorBufferSpecification = {
                size: 3,
                dataType: gl2.UNSIGNED_BYTE,
                normalize: true,
                stride: 0,
                offset: 0,
            };
            this.textureBufferSpecification = {
                size: 2,
                dataType: gl2.FLOAT,
                normalize: true,
                stride: 0,
                offset: 0,
            };
            this.textureEnabled = false;
            this.textureSource = "";
            AssetManager.addAsset(this);
        }

        // Get methods. ######################################################################################
        public get Shader() {
            return this.shader;
        }
        public get Name(){
            return this.name;
        }
        public get Color():Vec3{
            return this.color;
        }
        public set Color(_color : Vec3){
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
            return this.textureSource
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
            return this.textureCoordinateAtributeLocation
        }

        // Color and Texture methods.######################################################################################
        /**
         * Adds and enables a Texture passed to this material.
         * @param _textureSource A string holding the path to the location of the texture.
         */
        public addTexture(_textureSource: string): void {
            this.textureEnabled = true;
            this.textureSource = _textureSource;
        }
        /**
         * Removes and disables a texture that was added to this material.
         */
        public removeTexture():void{
            this.textureEnabled = false;
            this.textureSource = "";
        }

    }
}