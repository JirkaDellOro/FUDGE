var WebEngine;
(function (WebEngine) {
    /**
     * Class to hold all data needed by the WebGL vertexbuffer to draw the an object.
     */
    class Mesh extends WebEngine.Component {
        constructor(_positions, _size = 3, _dataType = WebEngine.gl2.FLOAT, _normalize = false) {
            super();
            this.name = "Mesh";
            this.positions = _positions;
            this.bufferData = {
                size: _size,
                dataType: _dataType,
                normalize: _normalize,
                stride: 0,
                offset: 0,
            };
            this.vertexCount = this.positions.length / this.bufferData.size;
            if ((this.vertexCount % this.bufferData.size) != 0) {
                console.log(this.vertexCount);
                throw new Error("Number of entries in positions[] and size do not match.");
            }
            this.normals = this.setNormals();
        }
        // Get and set methods.######################################################################################
        get Positions() {
            return this.positions;
        }
        get BufferData() {
            return this.bufferData;
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
        setNormals() {
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
            return normals;
        }
    } // End class.
    WebEngine.Mesh = Mesh;
})(WebEngine || (WebEngine = {})); // End namespace.
//# sourceMappingURL=Mesh.js.map