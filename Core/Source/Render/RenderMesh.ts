namespace FudgeCore {

  export interface RenderBuffers {
    vertices?: WebGLBuffer;
    indices?: WebGLBuffer;
    textureUVs?: WebGLBuffer;
    normals?: WebGLBuffer;
    colors?: WebGLBuffer;
    iBones?: WebGLBuffer;
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
    /** bones */
    protected ƒiBones: Uint8Array;
    protected ƒweights: Float32Array;

    public constructor(_mesh: Mesh) {
      this.mesh = _mesh;
    }

    public get iBones(): Uint8Array {
      return this.ƒiBones || ( // return cache or ...
        this.ƒiBones = this.mesh.vertices.some(_vertex => _vertex.bones) ?
          new Uint8Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
            const bones: Bone[] = this.mesh.vertices.bones(_index);
            return [bones?.[0]?.index || 0, bones?.[1]?.index || 0, bones?.[2]?.index || 0, bones?.[3]?.index || 0];
          })) :
          undefined
      );
    }
    public set iBones(_iBones: Uint8Array) {
      this.ƒiBones = _iBones;
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
      if (this.ƒnormals == null) {
        // sum up all unscaled normals of faces connected to one vertex...
        this.mesh.vertices.forEach(_vertex => _vertex.normal.set(0, 0, 0));
        for (let face of this.mesh.faces)
          for (let index of face.indices) {
            this.mesh.vertices.normal(index).add(face.normalUnscaled);
          }
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

      this.ƒiBones = undefined;
      this.ƒweights = undefined;
    }
  }
}