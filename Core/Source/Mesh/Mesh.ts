namespace FudgeCore {
  /**
   * Abstract base class for all meshes. 
   * Meshes provide indexed vertices, the order of indices to create trigons and normals, and texture coordinates
   * 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019/22
   */
  @RenderInjectorMesh.decorate
  export abstract class Mesh extends Mutable implements SerializableResource {
    /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
    public static readonly baseClass: typeof Mesh = Mesh;
    /** list of all the subclasses derived from this class, if they registered properly*/
    public static readonly subclasses: typeof Mesh[] = [];

    // TODO: at this time, creating the buffers for flat shading is a brute force algorithm and should be optimized in the different subclasses
    // TODO: rename vertices to verticesSmooth or just cloud, and cloud to vertices
    // 

    public idResource: string = undefined;
    public name: string = "Mesh";

    public renderBuffers: RenderBuffers; /* defined by RenderInjector*/

    // new base structure for meshes in FUDGE
    protected cloud: Vertices = new Vertices();
    protected faces: Face[] = [];

    // TODO: move all ƒ-Stuff to the RenderInjector...
    /** vertices of the actual point cloud, some points might be in the same location in order to refer to different texels */
    protected ƒvertices: Float32Array;
    /** indices to create faces from the vertices, rotation determines direction of face-normal */
    protected ƒindices: Uint16Array;
    /** texture coordinates associated with the vertices by the position in the array */
    protected ƒtextureUVs: Float32Array;
    /** normals of the faces, not used for rendering but computation of flat- and vertex-normals */
    protected ƒnormalsFaceUnscaled: Float32Array;
    /** vertex normals for smooth shading, interpolated between vertices during rendering */
    protected ƒnormalsVertex: Float32Array;

    /** flat-shading: normalized face normals, every third entry is used only */
    protected ƒnormalsFlat: Float32Array;
    /** flat-shading: extra vertex array, since using vertices with multiple faces is rarely possible due to the limitation above */
    protected ƒverticesFlat: Float32Array;
    /** flat-shading: therefore an extra indices-array is needed */
    protected ƒindicesFlat: Uint16Array;
    /** flat-shading: and an extra textureUV-array */
    protected ƒtextureUVsFlat: Float32Array;

    /** bounding box AABB */
    protected ƒbox: Box;
    // TODO: explore mathematics for easy transformations of radius 
    /** bounding radius */
    protected ƒradius: number;


    public constructor(_name: string = "Mesh") {
      super();
      this.name = _name;
      this.clear();
      Project.register(this);
    }

    public static getBufferSpecification(): BufferSpecification {
      return { size: 3, dataType: WebGL2RenderingContext.FLOAT, normalize: false, stride: 0, offset: 0 };
    }

    protected static registerSubclass(_subClass: typeof Mesh): number { return Mesh.subclasses.push(_subClass) - 1; }

    public get type(): string {
      return this.constructor.name;
    }

    public get vertices(): Float32Array {
      return this.ƒvertices || ( // return cache or ...
        // ... flatten all vertex positions from cloud into a typed array
        this.ƒvertices = new Float32Array(this.cloud.flatMap((_vertex: Vertex, _index: number) => {
          return [...this.cloud.position(_index).get()];
        })));
    }

    public get indices(): Uint16Array {
      return this.ƒindices || ( // return cache or ...
        // ... flatten all indices from the faces into a typed array
        this.ƒindices = new Uint16Array(this.faces.flatMap((_face: Face) => [..._face.indices])
        ));
    }

    public get normalsVertex(): Float32Array {
      if (this.ƒnormalsVertex == null) {
        // sum up all unscaled normals of faces connected to one vertex...
        this.cloud.forEach(_vertex => _vertex.normal.set(0, 0, 0));
        for (let face of this.faces)
          for (let index of face.indices) {
            this.cloud.normal(index).add(face.normalUnscaled);
          }
        // ... and normalize them
        this.cloud.forEach(_vertex => {
          // some vertices might be unused and yield a zero-normal...
          if (_vertex.normal.magnitudeSquared > 0)
            _vertex.normal.normalize();
        });

        // this.ƒnormalsVertex = new Float32Array(normalsVertex.flatMap((_normal: Vector3) => [..._normal.get()]));

        this.ƒnormalsVertex = new Float32Array(this.cloud.flatMap((_vertex: Vertex, _index: number) => {
          return [...this.cloud.normal(_index).get()];
        }));
      }

      return this.ƒnormalsVertex;
    }

    public get textureUVs(): Float32Array {
      return this.ƒtextureUVs || ( // return cache or ...
        // ... flatten all uvs from the clous into a typed array
        this.ƒtextureUVs = new Float32Array(this.cloud.flatMap((_vertex: Vertex) => [..._vertex.uv.get()])
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

    public get boundingBox(): Box {
      if (this.ƒbox == null)
        this.ƒbox = this.createBoundingBox();

      return this.ƒbox;
    }
    public get radius(): number {
      if (this.ƒradius == null)
        this.ƒradius = this.createRadius();

      return this.ƒradius;
    }

    public useRenderBuffers(_shader: typeof Shader, _mtxWorld: Matrix4x4, _mtxProjection: Matrix4x4, _id?: number): number { return 0; /* injected by RenderInjector*/ }
    public createRenderBuffers(): void {/* injected by RenderInjector*/ }
    public deleteRenderBuffers(_shader: typeof Shader): void {/* injected by RenderInjector*/ }

    public clear(): void {
      // buffers for smooth shading
      this.ƒvertices = undefined;
      this.ƒindices = undefined;
      this.ƒtextureUVs = undefined;
      this.ƒnormalsVertex = undefined;

      // special buffers for flat shading
      this.ƒnormalsFlat = undefined;
      this.ƒverticesFlat = undefined;
      this.ƒindicesFlat = undefined;
      this.ƒtextureUVsFlat = undefined;

      // 
      this.ƒnormalsFaceUnscaled = undefined;
      this.ƒbox = undefined;
      this.ƒradius = undefined;

      this.renderBuffers = null;
    }

    // public create(): void {
    //   // TODO: should actually not be called since it opposes lazy pattern
    //   this.ƒvertices = this.createVertices();
    //   this.ƒindices = this.createIndices();
    //   this.ƒtextureUVs = this.createTextureUVs();
    //   this.ƒverticesFlat = this.createVerticesFlat();
    //   // this.ƒnormalsFaceUnscaled = this.calculateFaceCrossProducts();
    //   // this.ƒnormalsFlat = this.createFlatNormals();
    //   // this.ƒnormalsVertex = this.createVertexNormals();
    //   this.createRenderBuffers();
    // }

    //#region Transfer
    // Serialize/Deserialize for all meshes that calculate without parameters
    public serialize(): Serialization {
      let serialization: Serialization = {
        idResource: this.idResource,
        name: this.name,
        type: this.type // store for editor view
      }; // no data needed ...
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      Project.register(this, _serialization.idResource);
      this.name = _serialization.name;
      // type is an accessor and must not be deserialized
      return this;
    }

    protected reduceMutator(_mutator: Mutator): void {
      // TODO: so much to delete... rather just gather what to mutate
      delete _mutator.ƒbox;
      delete _mutator.ƒradius;
      delete _mutator.ƒvertices;
      delete _mutator.ƒindices;
      delete _mutator.ƒnormalsVertex;
      delete _mutator.ƒnormalsFaceUnscaled;
      delete _mutator.ƒtextureUVs;
      delete _mutator.ƒnormalsFlat;
      delete _mutator.ƒverticesFlat;
      delete _mutator.ƒindicesFlat;
      delete _mutator.ƒtextureUVsFlat;

      delete _mutator.renderBuffers;
    }
    //#endregion

    // protected createTextureUVs(): Float32Array { return null; }
    // protected createIndices(): Uint16Array { return null; }
    // protected createNormals(): Float32Array { return null; }

    protected createVerticesFlat(): Float32Array {
      let positions: Vector3[] = [];
      let indices: number[] = [];
      let i: number = 0;
      for (let face of this.faces)
        for (let index of face.indices) {
          indices.push(i++);
          positions.push(this.cloud.position(index));
        }
        
      this.ƒindicesFlat = new Uint16Array(indices);
      return new Float32Array(positions.flatMap(_v => [..._v.get()]));
    }

    protected createNormalsFlat(): Float32Array {
      let normals: Vector3[] = [];
      let zero: Vector3 = Vector3.ZERO();
      for (let face of this.faces) {
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

    protected calculateFaceCrossProducts(): Float32Array {
      let crossProducts: number[] = [];
      let vertices: Vector3[] = [];

      for (let v: number = 0; v < this.vertices.length; v += 3)
        vertices.push(new Vector3(this.vertices[v], this.vertices[v + 1], this.vertices[v + 2]));

      for (let i: number = 0; i < this.indices.length; i += 3) {
        let trigon: number[] = [this.indices[i], this.indices[i + 1], this.indices[i + 2]];

        let v0: Vector3 = Vector3.DIFFERENCE(vertices[trigon[0]], vertices[trigon[1]]);
        let v1: Vector3 = Vector3.DIFFERENCE(vertices[trigon[0]], vertices[trigon[2]]);
        let crossProduct: Vector3 = Vector3.CROSS(v0, v1);
        let index: number = trigon[2] * 3;
        crossProducts[index] = crossProduct.x;
        crossProducts[index + 1] = crossProduct.y;
        crossProducts[index + 2] = crossProduct.z;
      }
      return new Float32Array(crossProducts);
    }

    protected createRadius(): number {
      let radius: number = 0;
      for (let vertex: number = 0; vertex < this.vertices.length; vertex += 3) {
        radius = Math.max(radius, Math.hypot(this.vertices[vertex], this.vertices[vertex + 1], this.vertices[vertex + 2]));
      }
      return radius;
    }

    protected createBoundingBox(): Box {
      let box: Box = Recycler.get(Box);
      box.set();
      for (let vertex: number = 0; vertex < this.vertices.length; vertex += 3) {
        box.min.x = Math.min(this.vertices[vertex], box.min.x);
        box.max.x = Math.max(this.vertices[vertex], box.max.x);
        box.min.y = Math.min(this.vertices[vertex + 1], box.min.y);
        box.max.y = Math.max(this.vertices[vertex + 1], box.max.y);
        box.min.z = Math.min(this.vertices[vertex + 2], box.min.z);
        box.max.z = Math.max(this.vertices[vertex + 2], box.max.z);
      }
      return box;
    }


  }
}