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
   */
  export class RenderMesh {
    public buffers: RenderBuffers = null;
    public mesh: Mesh;

    /** vertices of the actual point cloud, some points might be in the same location in order to refer to different texels */
    #vertices: Float32Array;
    /** indices to create faces from the vertices, rotation determines direction of face-normal */
    #indices: Uint16Array;
    /** texture coordinates associated with the vertices by the position in the array */
    #textureUVs: Float32Array;
    /** vertex normals for smooth shading, interpolated between vertices during rendering */
    #normals: Float32Array;
    /* colors */
    #colors: Float32Array;
    /** vertex tangents for normal mapping, based on the vertex normals and the UV coordinates */
    #tangents: Float32Array;
    /** bones */
    #bones: Uint8Array;
    #weights: Float32Array;

    public constructor(_mesh: Mesh) {
      this.mesh = _mesh;
    }

    public get vertices(): Float32Array {
      return this.#vertices || ( // return cache or ...
        // ... flatten all vertex positions from cloud into a typed array
        this.#vertices = new Float32Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
          return [...this.mesh.vertices.position(_index).get()];
        })));
    }
    public set vertices(_vertices: Float32Array) {
      this.#vertices = _vertices;
    }

    public get indices(): Uint16Array {
      return this.#indices || ( // return cache or ...
        // ... flatten all indices from the faces into a typed array
        this.#indices = new Uint16Array(this.mesh.faces.flatMap((_face: Face) => [..._face.indices])
        ));
    }
    public set indices(_indices: Uint16Array) {
      this.#indices = _indices;
    }

    public get normals(): Float32Array {
      if (this.#normals == null) {

        // TODO: implement a check similiar to the one for tangents below, to see if normals are already present in the vertices

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

        this.#normals = new Float32Array(
          this.mesh.vertices.flatMap((_vertex, _index) => [...this.mesh.vertices.normal(_index).get()])
        );
      }

      return this.#normals;
    }
    public set normals(_normals: Float32Array) {
      this.#normals = _normals;
    }

    public get tangents(): Float32Array {
      if (this.#tangents == null) {

        if (this.mesh.vertices.some(_vertex => !_vertex.uv)) { // assume all vertices have texture coordinates or none
          this.#tangents = new Float32Array(); // no texture coordinates, no tangents
          return this.#tangents;
        }

        if (this.mesh.vertices.some(_vertex => !_vertex.tangent)) { // assume all vertices have tangents or none
          const tangents: Vector3[] = new Array(this.mesh.vertices.length);
          const bitangents: Vector3[] = new Array(this.mesh.vertices.length);
          for (let i: number = 0; i < tangents.length; i++) {
            tangents[i] = Vector3.ZERO();
            bitangents[i] = Vector3.ZERO();
          }

          // this.mesh.vertices.forEach(_vertex => _vertex.tangent.set(0, 0, 0));

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
            let deltaPos0: Vector3 = Vector3.DIFFERENCE(v1, v0);
            let deltaPos1: Vector3 = Vector3.DIFFERENCE(v2, v0);

            //...and the edges of the triangles in UV space...
            let deltaUV0: Vector2 = Vector2.DIFFERENCE(uv1, uv0);
            let deltaUV1: Vector2 = Vector2.DIFFERENCE(uv2, uv0);

            //...and compute the tangent
            let r: number = 1 / Vector2.CROSS(deltaUV0, deltaUV1);
            let faceTangent: Vector3 = Vector3.SCALE(Vector3.DIFFERENCE(Vector3.SCALE(deltaPos0, deltaUV1.y), Vector3.SCALE(deltaPos1, deltaUV0.y)), r);
            let faceBitangent: Vector3 = Vector3.SCALE(Vector3.DIFFERENCE(Vector3.SCALE(deltaPos1, -deltaUV0.x), Vector3.SCALE(deltaPos0, -deltaUV1.x)), r); // for winding order counter clockwise
            
            tangents[i0].add(Vector3.SCALE(faceTangent, face.angles[0]));
            tangents[i1].add(Vector3.SCALE(faceTangent, face.angles[1]));
            tangents[i2].add(Vector3.SCALE(faceTangent, face.angles[2]));

            bitangents[i0].add(Vector3.SCALE(faceBitangent, face.angles[0]));
            bitangents[i1].add(Vector3.SCALE(faceBitangent, face.angles[1]));
            bitangents[i2].add(Vector3.SCALE(faceBitangent, face.angles[2]));
          }

          this.mesh.vertices.forEach((_vertex, _index) => {
            let normal: Vector3 = this.mesh.vertices.normal(_index);
            let tangent: Vector3 = tangents[_index];
            let bitangent: Vector3 = bitangents[_index];

            // reorthogonalize
            tangent.add(Vector3.SCALE(normal, - Vector3.DOT(normal, tangent)));
            if (tangent.magnitudeSquared > 0) // some vertices might be unused and yield a zero-tangent...
              tangent.normalize();

            let handedness: number = (Vector3.DOT(Vector3.CROSS(normal, tangent), bitangent) < 0) ? -1 : 1;

            _vertex.tangent = new Vector4(tangent.x, tangent.y, tangent.z, handedness);
          });
        }

        this.#tangents = new Float32Array(
          this.mesh.vertices.flatMap(_vertex => _vertex.tangent.get())
        );
      }

      return this.#tangents;
    }
    public set tangents(_tangents: Float32Array) {
      this.#tangents = _tangents;
    }

    public get textureUVs(): Float32Array {
      return this.#textureUVs || ( // return cache or ...
        // ... flatten all uvs from the clous into a typed array
        this.#textureUVs = new Float32Array(this.mesh.vertices
          .filter(_vertex => _vertex.uv)
          .flatMap((_vertex: Vertex) => [..._vertex.uv.get()])
        ));
    }
    public set textureUVs(_textureUVs: Float32Array) {
      this.#textureUVs = _textureUVs;
    }

    public get colors(): Float32Array {
      return this.#colors || (
        this.#colors = new Float32Array(this.mesh.vertices
          .filter(_vertex => _vertex.color)
          .flatMap(_vertex => [..._vertex.color.getArray()])
        ));
    }
    public set colors(_colors: Float32Array) {
      this.#colors = _colors;
    }

    public get bones(): Uint8Array {
      return this.#bones || ( // return cache or ...
        this.#bones = this.mesh.vertices.some(_vertex => _vertex.bones) ?
          new Uint8Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
            const bones: Bone[] = this.mesh.vertices.bones(_index);
            return [bones?.[0]?.index || 0, bones?.[1]?.index || 0, bones?.[2]?.index || 0, bones?.[3]?.index || 0];
          })) :
          undefined
      );
    }
    public set bones(_iBones: Uint8Array) {
      this.#bones = _iBones;
    }

    public get weights(): Float32Array {
      return this.#weights || ( // return cache or ...
        this.#weights = this.mesh.vertices.some(_vertex => _vertex.bones) ?
          new Float32Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
            const bones: Bone[] = this.mesh.vertices.bones(_index);
            return [bones?.[0]?.weight || 0, bones?.[1]?.weight || 0, bones?.[2]?.weight || 0, bones?.[3]?.weight || 0];
          })) :
          undefined
      );
    }
    public set weights(_weights: Float32Array) {
      this.#weights = _weights;
    }

    /**
     * Clears this render mesh and all its buffers
     */
    public clear(): void {
      this.buffers = null;

      this.#vertices = null;
      this.#indices = null;
      this.#textureUVs = null;
      this.#normals = null;
      this.#colors = null;
      this.#tangents = null;

      this.#bones = null;
      this.#weights = null;
    }
  }
}