var WebEngine;
(function (WebEngine) {
    /**
     * Class to hold all data needed by the WebGL vertexbuffer to draw the shape of an object.
     */
    class MeshComponent extends WebEngine.Component {
        constructor(_positions, _size = 3, _dataType = WebEngine.gl2.FLOAT, _normalize = false) {
            super();
            this.name = "Mesh";
            this.positions = _positions;
            this.bufferSpecification = {
                size: _size,
                dataType: _dataType,
                normalize: _normalize,
                stride: 0,
                offset: 0,
            };
            this.vertexCount = this.positions.length / this.bufferSpecification.size;
            if ((this.vertexCount % this.bufferSpecification.size) != 0) {
                console.log(this.vertexCount);
                throw new Error("Number of entries in positions[] and size do not match.");
            }
            this.normals = this.computeNormals();
        }
        // Get and set methods.######################################################################################
        get Positions() {
            return this.positions;
        }
        get BufferSpecification() {
            return this.bufferSpecification;
        }
        get VertexCount() {
            return this.vertexCount;
        }
        get Normals() {
            return this.normals;
        }
        /**
         * Computes the normal for each triangle of this meshand applies it to each of the triangles vertices.
         */
        computeNormals() {
            let normals = [];
            let normal = new WebEngine.Vec3;
            for (let i = 0; i < this.positions.length; i += 9) {
                let vector1 = new WebEngine.Vec3(this.positions[i + 3] - this.positions[i], this.positions[i + 4] - this.positions[i + 1], this.positions[i + 5] - this.positions[i + 2]);
                let vector2 = new WebEngine.Vec3(this.positions[i + 6] - this.positions[i], this.positions[i + 7] - this.positions[i + 1], this.positions[i + 8] - this.positions[i + 2]);
                normal = WebEngine.Vec3.normalize(WebEngine.Vec3.cross(vector1, vector2));
                normals.push(normal.X, normal.Y, normal.Z);
                normals.push(normal.X, normal.Y, normal.Z);
                normals.push(normal.X, normal.Y, normal.Z);
            }
            return new Float32Array(normals);
        }
        /**
 * Sets the color for each vertex to the referenced material's color and supplies the data to the colorbuffer.
 * @param _materialComponent The materialcomponent attached to the same fudgenode.
 */
        applyColor(_materialComponent) {
            let colorPerPosition = [];
            for (let i = 0; i < this.vertexCount; i++) {
                colorPerPosition.push(_materialComponent.Material.Color.X, _materialComponent.Material.Color.Y, _materialComponent.Material.Color.Z);
            }
            WebEngine.gl2.bufferData(WebEngine.gl2.ARRAY_BUFFER, new Uint8Array(colorPerPosition), WebEngine.gl2.STATIC_DRAW);
        }
        /**
         * Generates UV coordinates for the texture based on the vertices of the mesh the texture
         * was added to.
         */
        setTextureCoordinates() {
            let textureCoordinates = [];
            let quadCount = this.vertexCount / 6;
            for (let i = 0; i < quadCount; i++) {
                textureCoordinates.push(0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0);
            }
            WebEngine.gl2.bufferData(WebEngine.gl2.ARRAY_BUFFER, new Float32Array(textureCoordinates), WebEngine.gl2.STATIC_DRAW);
        }
    } // End class.
    WebEngine.MeshComponent = MeshComponent;
})(WebEngine || (WebEngine = {})); // End namespace.
//# sourceMappingURL=MeshComponent.js.map