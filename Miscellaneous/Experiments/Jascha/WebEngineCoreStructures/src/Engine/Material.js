var WebEngine;
(function (WebEngine) {
    /**
     * Baseclass for materials. Sets up attribute- and uniform locations to supply data to a shaderprogramm.
     */
    class Material {
        constructor(_name, _color, _shader) {
            this.name = _name;
            this.shader = _shader;
            this.positionAttributeLocation = this.shader.getAttributeLocation("a_position");
            this.colorAttributeLocation = this.shader.getAttributeLocation("a_color");
            this.textureCoordinateAtributeLocation = this.shader.getAttributeLocation("a_textureCoordinate");
            this.matrixLocation = this.shader.getUniformLocation("u_matrix");
            this.color = _color;
            this.colorBufferSpecification = {
                size: 3,
                dataType: WebEngine.gl2.UNSIGNED_BYTE,
                normalize: true,
                stride: 0,
                offset: 0,
            };
            this.textureBufferSpecification = {
                size: 2,
                dataType: WebEngine.gl2.FLOAT,
                normalize: true,
                stride: 0,
                offset: 0,
            };
            this.textureEnabled = false;
            this.textureSource = "";
            WebEngine.AssetManager.addAsset(this);
        }
        // Get methods. ######################################################################################
        get Shader() {
            return this.shader;
        }
        get Name() {
            return this.name;
        }
        get Color() {
            return this.color;
        }
        set Color(_color) {
            this.color = _color;
        }
        get ColorBufferSpecification() {
            return this.colorBufferSpecification;
        }
        get TextureBufferSpecification() {
            return this.textureBufferSpecification;
        }
        get TextureEnabled() {
            return this.textureEnabled;
        }
        get TextureSource() {
            return this.textureSource;
        }
        get PositionAttributeLocation() {
            return this.positionAttributeLocation;
        }
        get ColorAttributeLocation() {
            return this.colorAttributeLocation;
        }
        get MatrixUniformLocation() {
            return this.matrixLocation;
        }
        get TextureCoordinateLocation() {
            return this.textureCoordinateAtributeLocation;
        }
        // Color and Texture methods.######################################################################################
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
    }
    WebEngine.Material = Material;
})(WebEngine || (WebEngine = {}));
//# sourceMappingURL=Material.js.map