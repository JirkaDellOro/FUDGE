namespace FudgeCore {

  export interface RenderBuffers {
    vertices?: WebGLBuffer;
    indices?: WebGLBuffer;
    textureUVs?: WebGLBuffer;
    normals?: WebGLBuffer;
    colors?: WebGLBuffer;
    bones?: WebGLBuffer;
    tangents?: WebGLBuffer;
    weights?: WebGLBuffer;
    nIndices?: number;
  }

  /**
   * Inserted into a {@link Mesh}, an instance of this class calculates and represents the mesh data in the form needed by the render engine
   * @internal
   */
  export class RenderMesh {
    public buffers: RenderBuffers = null;
    public mesh: Mesh;

    // TODO: could make these java script private i.e. #vertices, #indices...
    /** vertices of the actual point cloud, some points might be in the same location in order to refer to different texels */
    protected ƒvertices: Float32Array;
    /** indices to create faces from the vertices, rotation determines direction of face-normal */
    protected ƒindices: Uint16Array;
    /** texture coordinates associated with the vertices by the position in the array */
    protected ƒtextureUVs: Float32Array;
    /** vertex normals for smooth shading, interpolated between vertices during rendering */
    protected ƒnormals: Float32Array;
    /* colors */
    protected ƒcolors: Float32Array;
    /** vertex tangents for normal mapping, based on the vertex normals and the UV coordinates */
    protected ƒtangents: Float32Array;
    /** bones */
    protected ƒbones: Uint8Array;
    protected ƒweights: Float32Array;

    public constructor(_mesh: Mesh) {
      this.mesh = _mesh;
    }

    public get bones(): Uint8Array {
      return this.ƒbones || ( // return cache or ...
        this.ƒbones = this.mesh.vertices.some(_vertex => _vertex.bones) ?
          new Uint8Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
            const bones: Bone[] = this.mesh.vertices.bones(_index);
            return [bones?.[0]?.index || 0, bones?.[1]?.index || 0, bones?.[2]?.index || 0, bones?.[3]?.index || 0];
          })) :
          undefined
      );
    }
    public set bones(_iBones: Uint8Array) {
      this.ƒbones = _iBones;
    }

    public get weights(): Float32Array {
      return this.ƒweights || ( // return cache or ...
        this.ƒweights = this.mesh.vertices.some(_vertex => _vertex.bones) ?
          new Float32Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
            const bones: Bone[] = this.mesh.vertices.bones(_index);
            return [bones?.[0]?.weight || 0, bones?.[1]?.weight || 0, bones?.[2]?.weight || 0, bones?.[3]?.weight || 0];
          })) :
          undefined
      );
    }
    public set weights(_weights: Float32Array) {
      this.ƒweights = _weights;
    }

    public get vertices(): Float32Array {
      return this.ƒvertices || ( // return cache or ...
        // ... flatten all vertex positions from cloud into a typed array
        this.ƒvertices = new Float32Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
          return [...this.mesh.vertices.position(_index).get()];
        })));
    }
    public set vertices(_vertices: Float32Array) {
      this.ƒvertices = _vertices;
    }

    public get indices(): Uint16Array {
      return this.ƒindices || ( // return cache or ...
        // ... flatten all indices from the faces into a typed array
        this.ƒindices = new Uint16Array(this.mesh.faces.flatMap((_face: Face) => [..._face.indices])
        ));
    }
    public set indices(_indices: Uint16Array) {
      this.ƒindices = _indices;
    }

    public get normals(): Float32Array {
      // TODO: this should use the normals from the vertices and only calculate them if they are not present
      if (this.ƒnormals == null) {
        // sum up all unscaled normals of faces connected to one vertex, weighted by the angle between the two neighbour vertices...
        this.mesh.vertices.forEach(_vertex => _vertex.normal.set(0, 0, 0));

        for (let face of this.mesh.faces)
          face.indices.forEach((_iVertex, _iFaceVertex) => {
            this.mesh.vertices.normal(_iVertex).add(Vector3.SCALE(face.normalUnscaled, face.angles[_iFaceVertex]));
          });
        // ... and normalize them
        this.mesh.vertices.forEach(_vertex => {
          // some vertices might be unused and yield a zero-normal...
          if (_vertex.normal.magnitudeSquared > 0)
            _vertex.normal.normalize();
        });

        // this.ƒnormalsVertex = new Float32Array(normalsVertex.flatMap((_normal: Vector3) => [..._normal.get()]));

        this.ƒnormals = new Float32Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
          return [...this.mesh.vertices.normal(_index).get()];
        }));
      }

      return this.ƒnormals;
    }
    public set normals(_normals: Float32Array) {
      this.ƒnormals = _normals;
    }

    public get tangents(): Float32Array {
      if (this.ƒtangents == null) {
        if (this.mesh.vertices.some(_vertex => !_vertex.uv))
          return new Float32Array(); // no texture coordinates, no tangents

        // TODO: this should use the tangents from the vertices and only calculate them if they are not present
        this.mesh.vertices.forEach(_vertex => _vertex.tangent.set(0, 0, 0)); // ???
        for (let face of this.mesh.faces) {
          let i0: number = face.indices[0];
          let i1: number = face.indices[1];
          let i2: number = face.indices[2];

          //vertices surrounding one triangle
          let v0: Vector3 = this.mesh.vertices.position(i0);
          let v1: Vector3 = this.mesh.vertices.position(i1);
          let v2: Vector3 = this.mesh.vertices.position(i2);

          //their UVs
          let uv0: Vector2 = this.mesh.vertices.uv(i0);
          let uv1: Vector2 = this.mesh.vertices.uv(i1);
          let uv2: Vector2 = this.mesh.vertices.uv(i2);

          //We compute the edges of the triangle...
          let deltaPos1: Vector3 = Vector3.DIFFERENCE(v1, v0);
          let deltaPos2: Vector3 = Vector3.DIFFERENCE(v2, v0);

          //...and the edges of the triangles in UV space...
          let deltaUV1: Vector2 = Vector2.DIFFERENCE(uv1, uv0);
          let deltaUV2: Vector2 = Vector2.DIFFERENCE(uv2, uv0);

          //...and compute the tangent
          let r: number = 1 / (deltaUV1.x * deltaUV2.y - deltaUV1.y * deltaUV2.x);
          let tempTangent: Vector3 = Vector3.SCALE(Vector3.DIFFERENCE(Vector3.SCALE(deltaPos1, deltaUV2.y), Vector3.SCALE(deltaPos2, deltaUV1.y)), r);

          this.mesh.vertices[i0].tangent = tempTangent;
          this.mesh.vertices[i1].tangent = tempTangent;
          this.mesh.vertices[i2].tangent = tempTangent;
        }

        // Orthagonalize the calculated tangents to the vertex normal
        this.mesh.vertices.forEach(_vertex => _vertex.tangent.add(Vector3.SCALE(_vertex.normal, - Vector3.DOT(_vertex.normal, _vertex.tangent))));

        //TODO: In some cases (when uvs are mirrored) the tangents would have to be flipped in order to work properly

        //All faces have their individual tangents, which leads to shading artifacts, which is accounted for here
        for (let vertex of this.mesh.vertices) {
          if (typeof vertex.referTo !== "undefined") {
            if (vertex.uv.equals(this.mesh.vertices[vertex.referTo].uv)) {
              //TODO: It would be ideal to compare all vertices first and average out the different tangents between the ones with the same position, UV-position and vertex-normal but this approach is taken for its lower computational impact
              vertex.tangent = this.mesh.vertices[vertex.referTo].tangent;
              //This however leeds to minor artifacts along UV-seams
            }
          }
        }

        //At last, all the tangents are stored in their respective Float32Array
        this.ƒtangents = new Float32Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
          return [...this.mesh.vertices[_index].tangent.get()];
        }));

      }

      return this.ƒtangents;
    }

    public get textureUVs(): Float32Array {
      return this.ƒtextureUVs || ( // return cache or ...
        // ... flatten all uvs from the clous into a typed array
        this.ƒtextureUVs = new Float32Array(this.mesh.vertices
          .filter(_vertex => _vertex.uv)
          .flatMap((_vertex: Vertex) => [..._vertex.uv.get()])
        ));
    }
    public set textureUVs(_textureUVs: Float32Array) {
      this.ƒtextureUVs = _textureUVs;
    }

    public get colors(): Float32Array {
      return this.ƒcolors || (
        this.ƒcolors = new Float32Array(this.mesh.vertices
          .filter(_vertex => _vertex.color)
          .flatMap(_vertex => [..._vertex.color.getArray()])
        ));
    }
    public set colors(_colors: Float32Array) {
      this.ƒcolors = _colors;
    }

    /**
     * Clears this render mesh and all its buffers
     */
    public clear(): void {
      this.buffers = null;
      this.ƒvertices = undefined;
      this.ƒindices = undefined;
      this.ƒtextureUVs = undefined;
      this.ƒnormals = undefined;
      this.ƒcolors = undefined;
      this.ƒtangents = undefined;

      this.ƒbones = undefined;
      this.ƒweights = undefined;
    }
  }
}