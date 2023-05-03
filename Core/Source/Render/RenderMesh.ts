namespace FudgeCore {
  /**
   * Inserted into a {@link Mesh}, an instance of this class calculates and represents the mesh data in the form needed by the render engine
   */
  export interface RenderBuffers {
    vertices?: WebGLBuffer;
    indices?: WebGLBuffer;
    textureUVs?: WebGLBuffer;
    normals?: WebGLBuffer;
    tangents?: WebGLBuffer;
    biTangents?: WebGLBuffer;
    iBones?: WebGLBuffer;
    weights?: WebGLBuffer;
    nIndices?: number;
  }

  export class RenderMesh {
    public smooth: RenderBuffers = null;
    public flat: RenderBuffers = null;
    public mesh: Mesh;

    /** vertices of the actual point cloud, some points might be in the same location in order to refer to different texels */
    protected ƒvertices: Float32Array;
    /** indices to create faces from the vertices, rotation determines direction of face-normal */
    protected ƒindices: Uint16Array;
    /** texture coordinates associated with the vertices by the position in the array */
    protected ƒtextureUVs: Float32Array;
    /** vertex normals for smooth shading, interpolated between vertices during rendering */
    protected ƒnormalsVertex: Float32Array;
    /** vertex tangents for normal mapping, based on the vertex normals and the UV coordinates */
    protected ƒtangentsVertex: Float32Array;
    /** vertex bitangents for normal mapping, based on the vertex normals and vertex tangents */
    protected ƒbitangentsVertex: Float32Array;
    /** bones */
    protected ƒiBones: Uint8Array;
    protected ƒweights: Float32Array;

    /** flat-shading: normalized face normals, every third entry is used only */
    protected ƒnormalsFlat: Float32Array;
    /** flat-shading: extra vertex array, since using vertices with multiple faces is rarely possible due to the limitation above */
    protected ƒverticesFlat: Float32Array;
    /** flat-shading: therefore an extra indices-array is needed */
    protected ƒindicesFlat: Uint16Array;
    /** flat-shading: and an extra textureUV-array */
    protected ƒtextureUVsFlat: Float32Array;
    /** bones */
    protected ƒiBonesFlat: Uint8Array;
    protected ƒweightsFlat: Float32Array;

    constructor(_mesh: Mesh) {
      this.mesh = _mesh;
    }

    public get iBones(): Uint8Array {
      return this.ƒiBones || ( // return cache or ...
        this.ƒiBones = new Uint8Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
          return [...this.mesh.vertices.bones(_index).map(_bone => _bone.index)];
        })));
    }

    public get weights(): Float32Array {
      return this.ƒweights || ( // return cache or ...
        this.ƒweights = new Float32Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
          return [...this.mesh.vertices.bones(_index).map(_bone => _bone.weight)];
        }))
      );
    }

    public get vertices(): Float32Array {
      return this.ƒvertices || ( // return cache or ...
        // ... flatten all vertex positions from cloud into a typed array
        this.ƒvertices = new Float32Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
          return [...this.mesh.vertices.position(_index).get()];
        })));
    }

    public get indices(): Uint16Array {
      return this.ƒindices || ( // return cache or ...
        // ... flatten all indices from the faces into a typed array
        this.ƒindices = new Uint16Array(this.mesh.faces.flatMap((_face: Face) => [..._face.indices])
        ));
    }

    public get normalsVertex(): Float32Array {
      if (this.ƒnormalsVertex == null) {
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

        this.ƒnormalsVertex = new Float32Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
          return [...this.mesh.vertices.normal(_index).get()];
        }));
      }

      return this.ƒnormalsVertex;
    }

    public get tangentsVertex(): Float32Array {
      if (this.ƒtangentsVertex == null) {
        this.mesh.vertices.forEach(_vertex => _vertex.tangent.set(0, 0, 0));
        this.mesh.vertices.forEach(_vertex => _vertex.bitangent.set(0, 0, 0));
        
        for (let face of this.mesh.faces) {
          //vertices surrounding one triangle
          let v0: Vector3 = this.mesh.vertices[face.indices[0]].position;
          let v1: Vector3 = this.mesh.vertices[face.indices[1]].position;
          let v2: Vector3 = this.mesh.vertices[face.indices[2]].position;

          if (typeof v0 === "undefined") {
            v0 = new Vector3(0, 0, 0);
          }
          if (typeof v1 === "undefined") {
            v1 = new Vector3(0, 0, 0);
          }
          if (typeof v2 === "undefined") {
            v2 = new Vector3(0, 0, 0);
          }

          //their UVs
          let uv0: Vector2 = this.mesh.vertices[face.indices[0]].uv;
          let uv1: Vector2 = this.mesh.vertices[face.indices[1]].uv;
          let uv2: Vector2 = this.mesh.vertices[face.indices[2]].uv;

          //We compute the edges of the triangle...
          let deltaPos1: Vector3 = Vector3.DIFFERENCE(v1, v0);
          let deltaPos2: Vector3 = Vector3.DIFFERENCE(v2, v0);

          //...and the edges of the triangles in UV space...
          let deltaUV1: Vector2 = Vector2.DIFFERENCE(uv1, uv0);
          let deltaUV2: Vector2 = Vector2.DIFFERENCE(uv2, uv0);

          //...and compute the tangent
          let r: number = 1 / (deltaUV1.x * deltaUV2.y - deltaUV1.y * deltaUV2.x);
          let tempTangent: Vector3 = Vector3.SCALE(Vector3.DIFFERENCE(Vector3.SCALE(deltaPos1, deltaUV2.y), Vector3.SCALE(deltaPos2, deltaUV1.y)), r);
          let tempBitangent: Vector3 = Vector3.SCALE(Vector3.DIFFERENCE(Vector3.SCALE(deltaPos2, deltaUV1.x), Vector3.SCALE(deltaPos1, deltaUV2.x)), r);

          
          tempBitangent.scale(-1);

          this.mesh.vertices[face.indices[0]].tangent.add(tempTangent);
          this.mesh.vertices[face.indices[1]].tangent.add(tempTangent);
          this.mesh.vertices[face.indices[2]].tangent.add(tempTangent);

          this.mesh.vertices[face.indices[0]].bitangent.add(tempBitangent);
          this.mesh.vertices[face.indices[1]].bitangent.add(tempBitangent);
          this.mesh.vertices[face.indices[2]].bitangent.add(tempBitangent);
        }

        //Now we orthagonalize the calculated tangents and bitangents to the vertex normal
        this.mesh.vertices.forEach(_vertex => _vertex.tangent.add(Vector3.SCALE(_vertex.normal, - Vector3.DOT(_vertex.normal, _vertex.tangent))));
        this.mesh.vertices.forEach(_vertex => _vertex.bitangent.add(Vector3.SCALE(_vertex.normal, - Vector3.DOT(_vertex.normal, _vertex.bitangent))));

        //TODO: In some cases (when uvs are mirrored) the tangents would have to be flipped in order to work properly

        //At last, all the tangents and bitangents are stored in their respective Float32Array
        this.ƒtangentsVertex = new Float32Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
          return [...this.mesh.vertices.tangent(_index).get()];
        }));
        this.ƒbitangentsVertex = new Float32Array(this.mesh.vertices.flatMap((_vertex: Vertex, _index: number) => {
          return [...this.mesh.vertices.bitangent(_index).get()];
        }));
      }
      return this.ƒtangentsVertex;
    }

    public get bitangentsVertex(): Float32Array {
      if (this.ƒbitangentsVertex == null) {
        console.log("please calculate the tangents before calculating the bitangents");
      }
      return this.ƒbitangentsVertex;
    }

    public get textureUVs(): Float32Array {
      return this.ƒtextureUVs || ( // return cache or ...
        // ... flatten all uvs from the clous into a typed array
        this.ƒtextureUVs = new Float32Array(this.mesh.vertices.flatMap((_vertex: Vertex) => [..._vertex.uv.get()])
        ));
    }


    public get verticesFlat(): Float32Array {
      return this.ƒverticesFlat || (this.ƒverticesFlat = this.createVerticesFlat());
    }

    public get indicesFlat(): Uint16Array {
      return this.ƒindicesFlat;
    }

    public get normalsFlat(): Float32Array {
      return this.ƒnormalsFlat || (this.ƒnormalsFlat = this.createNormalsFlat());
    }

    public get textureUVsFlat(): Float32Array {
      return this.ƒtextureUVsFlat || (this.ƒtextureUVsFlat = this.createTextureUVsFlat());
    }

    public get iBonesFlat(): Uint8Array {
      return this.ƒiBonesFlat;
    }

    public get weightsFlat(): Float32Array {
      return this.ƒweightsFlat;
    }


    public clear(): void {
      this.smooth = null;
      this.flat = null;
      // buffers for smooth shading
      this.ƒvertices = undefined;
      this.ƒindices = undefined;
      this.ƒtextureUVs = undefined;
      this.ƒnormalsVertex = undefined;
      this.ƒtangentsVertex = undefined;
      this.ƒbitangentsVertex = undefined;

      // special buffers for flat shading
      this.ƒnormalsFlat = undefined;
      this.ƒverticesFlat = undefined;
      this.ƒindicesFlat = undefined;
      this.ƒtextureUVsFlat = undefined;

      this.ƒiBones = undefined;
      this.ƒweights = undefined;
    }

    protected createVerticesFlat(): Float32Array {
      let positions: Vector3[] = [];
      let bones: Bone[][] = [];
      let indices: number[] = [];
      let i: number = 0;
      for (let face of this.mesh.faces)
        for (let index of face.indices) {
          indices.push(i++);
          positions.push(this.mesh.vertices.position(index));
          let bone: Bone[] = this.mesh.vertices.bones(index);
          if (bone)
            bones.push(bone);
        }

      this.ƒindicesFlat = new Uint16Array(indices);

      this.ƒiBonesFlat = new Uint8Array(bones.flatMap((_bones: Bone[]) => {
        return [..._bones.map(_bone => _bone.index)];
      }));

      this.ƒweightsFlat = new Float32Array(bones.flatMap((_bones: Bone[]) => {
        return [..._bones.map(_bone => _bone.weight)];
      }));

      return new Float32Array(positions.flatMap(_v => [..._v.get()]));
    }

    protected createNormalsFlat(): Float32Array {
      let normals: Vector3[] = [];
      let zero: Vector3 = Vector3.ZERO();
      for (let face of this.mesh.faces) {
        // store the face normal at the position of the third vertex
        normals.push(zero);
        normals.push(zero);
        normals.push(face.normal);
      }
      this.ƒnormalsFlat = new Float32Array(normals.flatMap(_n => [..._n.get()]));
      return this.ƒnormalsFlat;
    }

    protected createTextureUVsFlat(): Float32Array {
      let uv: number[] = [];
      // create unique vertices for each face, tripling the number
      for (let i: number = 0; i < this.indices.length; i++) {
        let index: number = this.indices[i] * 2;
        uv.push(this.textureUVs[index], this.textureUVs[index + 1]);
      }
      return new Float32Array(uv);
    }
  }
}