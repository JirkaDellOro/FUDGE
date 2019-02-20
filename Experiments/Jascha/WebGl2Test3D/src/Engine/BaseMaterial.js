var WebEngine;
(function (WebEngine) {
    /**
     * Baseclass for materials. Sets up attribute- and uniform locations to supply data to a shaderprogramm
     */
    class BaseMaterial {
        constructor(_shader) {
            this.shader = _shader;
            this.positionAttributeLocation = this.shader.getAttributeLocation("a_position");
            this.colorAttributeLocation = this.shader.getAttributeLocation("a_color");
            this.textureCoordinateAtributeLocation = this.shader.getAttributeLocation("a_textureCoordinate");
            this.matrixLocation = this.shader.getUniformLocation("u_matrix");
        }
        // Get methods. ######################################################################################
        get Shader() {
            return this.shader;
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
    }
    WebEngine.BaseMaterial = BaseMaterial;
})(WebEngine || (WebEngine = {}));
//# sourceMappingURL=BaseMaterial.js.map