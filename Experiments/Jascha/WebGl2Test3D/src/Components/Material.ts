namespace WebEngine {


    /**
     * Class that holds all data concerning color and texture, to pass and apply to the node it is attached to.
     */
    export class Material extends Component {

        private baseMaterial: BaseMaterial;
        private color: Vec3;
        private textureEnabled: boolean;
        private textureSource: string;
        private colorBufferData: BufferData;
        private textureBufferData: BufferData;

        public constructor( _baseMaterial: BaseMaterial, _color: Vec3 = new Vec3, _size: number = 3, _dataType = gl2.UNSIGNED_BYTE, _normalize: boolean = true) {
            super();
            this.name = "Material";
            this.baseMaterial = _baseMaterial;
            this.color = _color;
            this.colorBufferData = {
                size: _size,
                dataType: _dataType,
                normalize: _normalize,
                stride: 0,
                offset: 0,
            };
            this.textureBufferData = {
                size: 2,
                dataType: gl2.FLOAT,
                normalize: true,
                stride: 0,
                offset: 0,
            };
            this.textureEnabled = false;
            this.textureSource = "";
        }

        // Get and set methods.######################################################################################
        public get BaseMaterial(): BaseMaterial {
            return this.baseMaterial;
        }
        public get Color():Vec3{
            return this.color;
        }
        public set Color(_color : Vec3){
            this.color = _color;
        }
        public get ColorBufferData(): BufferData {
            return this.colorBufferData;
        }
        public get TextureBufferData(): BufferData {
            return this.textureBufferData;
        }
        public get TextureEnabled(): boolean {
            return this.textureEnabled;
        }
        public get TextureSource(): string {
            return this.textureSource
        }

        // Color and Texture methods.######################################################################################
        /**
         * Sets the color for each vertex to this.color and supplies the data to the colorbuffer.
         * @param _vertexCount The number of vertices for which a color must be passed.
         */
        public applyColor(_vertexCount): void {

            let colorPerPosition: number[] = [];
            for (let i: number = 0; i < _vertexCount; i++) {
                colorPerPosition.push(this.color.X, this.color.Y, this.color.Z);
            }
            gl2.bufferData(gl2.ARRAY_BUFFER, new Uint8Array(colorPerPosition), gl2.STATIC_DRAW)
        }

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

        /**
         * Generates UV coordinates for the texture based on the vertices of the mesh the texture
         * was added to.
         * @param _vertexCount The number of vertices for which the UV coordinates have to be generated.
         */
        public setTextureCoordinates(_vertexCount: number): void {
            let textureCoordinates: number[] = [];
            let quadCount: number = _vertexCount / 6;
            for (let i: number = 0; i < quadCount; i++) {
                textureCoordinates.push(
                    0, 1,
                    1, 1,
                    0, 0,
                    0, 0,
                    1, 1,
                    1, 0,
                )
            }
            gl2.bufferData(gl2.ARRAY_BUFFER, new Float32Array(textureCoordinates), gl2.STATIC_DRAW);
        }
    }// End class.
}// End namespace.