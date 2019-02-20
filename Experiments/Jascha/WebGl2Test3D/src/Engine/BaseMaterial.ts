namespace WebEngine{

    /**
     * Baseclass for materials. Sets up attribute- and uniform locations to supply data to a shaderprogramm
     */
    export class BaseMaterial {

        private shader: Shader; // The shader program used by this BaseMaterial
        private positionAttributeLocation: number; // The attribute on the shader that takes the meshs vertexpositions.
        private colorAttributeLocation: number; // The attribute on the shader that takes a materials colorvalues.
        private textureCoordinateAtributeLocation: number; // The attribute on the shader that takes the meshs texturecoordinates.
        private matrixLocation: WebGLUniformLocation; // The uniform on the shader to multiply the vertexpositions by to place them in viewspace.

        public constructor(_shader: Shader) {
            this.shader = _shader;
            this.positionAttributeLocation = this.shader.getAttributeLocation("a_position");
            this.colorAttributeLocation = this.shader.getAttributeLocation("a_color");
            this.textureCoordinateAtributeLocation = this.shader.getAttributeLocation("a_textureCoordinate");
            this.matrixLocation = this.shader.getUniformLocation("u_matrix");
        }

        // Get methods. ######################################################################################
        public get Shader() {
            return this.shader;
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
    }
}