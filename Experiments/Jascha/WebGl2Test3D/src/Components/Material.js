var WebEngine;
(function (WebEngine) {
    /**
     * Class that holds all data concerning color and texture, to pass and apply to the node it is attached to.
     */
    class Material extends WebEngine.Component {
        constructor(_baseMaterial, _color = new WebEngine.Vec3, _size = 3, _dataType = WebEngine.gl2.UNSIGNED_BYTE, _normalize = true) {
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
                dataType: WebEngine.gl2.FLOAT,
                normalize: true,
                stride: 0,
                offset: 0,
            };
            this.textureEnabled = false;
            this.textureSource = "";
        }
        // Get and set methods.######################################################################################
        get BaseMaterial() {
            return this.baseMaterial;
        }
        get Color() {
            return this.color;
        }
        set Color(_color) {
            this.color = _color;
        }
        get ColorBufferData() {
            return this.colorBufferData;
        }
        get TextureBufferData() {
            return this.textureBufferData;
        }
        get TextureEnabled() {
            return this.textureEnabled;
        }
        get TextureSource() {
            return this.textureSource;
        }
        // Color and Texture methods.######################################################################################
        /**
         * Sets the color for each vertex to this.color and supplies the data to the colorbuffer.
         * @param _vertexCount The number of vertices for which a color must be passed.
         */
        applyColor(_vertexCount) {
            let colorPerPosition = [];
            for (let i = 0; i < _vertexCount; i++) {
                colorPerPosition.push(this.color.X, this.color.Y, this.color.Z);
            }
            WebEngine.gl2.bufferData(WebEngine.gl2.ARRAY_BUFFER, new Uint8Array(colorPerPosition), WebEngine.gl2.STATIC_DRAW);
        }
        /**
         * Adds and enables a Texture passed to this material.
         * @param _textureSource A string holding the path to the location of the texture.
         */
        addTexture(_textureSource) {
            this.textureEnabled = true;
            this.textureSource = _textureSource;
        }
        /**
         * Removes and disables a texture that was added to this material.
         */
        removeTexture() {
            this.textureEnabled = false;
            this.textureSource = "";
        }
        /**
         * Generates UV coordinates for the texture based on the vertices of the mesh the texture
         * was added to.
         * @param _vertexCount The number of vertices for which the UV coordinates have to be generated.
         */
        setTextureCoordinates(_vertexCount) {
            let textureCoordinates = [];
            let quadCount = _vertexCount / 6;
            for (let i = 0; i < quadCount; i++) {
                textureCoordinates.push(0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0);
            }
            WebEngine.gl2.bufferData(WebEngine.gl2.ARRAY_BUFFER, new Float32Array(textureCoordinates), WebEngine.gl2.STATIC_DRAW);
        }
    } // End class.
    WebEngine.Material = Material;
})(WebEngine || (WebEngine = {})); // End namespace.
//# sourceMappingURL=Material.js.map