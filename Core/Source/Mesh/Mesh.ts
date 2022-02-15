namespace FudgeCore {
  /**
   * Abstract base class for all meshes. 
   * Meshes provide indexed vertices, the order of indices to create trigons and normals, and texture coordinates
   * 
   * @authors Jirka Dell'Oro-Friedl, HFU, 2019
   */
  @RenderInjectorMesh.decorate
  export abstract class Mesh extends Mutable implements SerializableResource {
    /** refers back to this class from any subclass e.g. in order to find compatible other resources*/
    public static readonly baseClass: typeof Mesh = Mesh;
    /** list of all the subclasses derived from this class, if they registered properly*/
    public static readonly subclasses: typeof Mesh[] = [];


    public idResource: string = undefined;
    public name: string = "Mesh";

    public renderBuffers: RenderBuffers; /* defined by RenderInjector*/

    // new base structure for meshes in FUDGE
    protected cloud: Vertex[] = [];
    protected faces: Face[] = [];

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
    protected ƒindicesFlat: Float32Array;
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

    /**
     * Takes an array of four indices for a quad and returns an array of six indices for two trigons cutting that quad.
     * If the quad is planar (default), the trigons end on the same index, allowing a single normal for both faces on the referenced vertex 
     */
    protected static getTrigonsFromQuad(_quad: number[], _even: boolean = true): number[] {
      // TODO: add parameters for other diagonal and reversion of rotation
      let indices: number[];
      if (_even)
        indices = [_quad[0], _quad[1], _quad[2], _quad[3], _quad[0], _quad[2]];
      else
        indices = [_quad[0], _quad[1], _quad[2], _quad[0], _quad[2], _quad[3]];
      return indices;
    }

    // TODO: become Face-method?
    protected static deleteInvalidIndices(_indices: number[], _vertices: Vector3[]): void {
      //delete "non"-faces with two identical vectors
      for (let i: number = _indices.length - 3; i >= 0; i -= 3) {
        let v0: Vector3 = _vertices[_indices[i]];
        let v1: Vector3 = _vertices[_indices[i + 1]];
        let v2: Vector3 = _vertices[_indices[i + 2]];
        if (v0.equals(v1) || v2.equals(v1) || v0.equals(v2))
          _indices.splice(i, 3);
      }
    }

    public get type(): string {
      return this.constructor.name;
    }

    public get vertices(): Float32Array {
      if (this.ƒvertices == null)
        this.ƒvertices = this.createVertices();

      return this.ƒvertices; // optimize:  || (this.ƒvertices = this.createVertices());
    }
    public get indices(): Uint16Array {
      if (this.ƒindices == null)
        this.ƒindices = this.createIndices();

      return this.ƒindices;
    }
    public get normalsFaceUnscaled(): Float32Array {
      if (this.ƒnormalsFaceUnscaled == null)
        this.ƒnormalsFaceUnscaled = this.calculateFaceCrossProducts();

      return this.ƒnormalsFaceUnscaled;
    }
    public get normalsVertex(): Float32Array {
      if (this.ƒnormalsVertex == null)
        this.ƒnormalsVertex = this.createVertexNormals();

      return this.ƒnormalsVertex;
    }
    public get textureUVs(): Float32Array {
      if (this.ƒtextureUVs == null)
        this.ƒtextureUVs = this.createTextureUVs();

      return this.ƒtextureUVs;
    }

    public get normalsFlat(): Float32Array {
      return this.ƒnormalsFlat || (this.ƒnormalsFlat = this.createFlatNormals());
    }
    public get verticesFlat(): Float32Array {
      return this.ƒverticesFlat || (this.ƒverticesFlat = this.createFlatVertices());
    }
    public get textureUVsFlat(): Float32Array {
      return this.ƒtextureUVsFlat || (this.ƒtextureUVsFlat = this.createFlatTextureUVs());
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


    public useRenderBuffers(_shader: typeof Shader, _mtxWorld: Matrix4x4, _mtxProjection: Matrix4x4, _id?: number): void {/* injected by RenderInjector*/ }
    public createRenderBuffers(): void {/* injected by RenderInjector*/ }
    public deleteRenderBuffers(_shader: typeof Shader): void {/* injected by RenderInjector*/ }

    public getVertexCount(): number {
      return this.vertices.length / Mesh.getBufferSpecification().size;
    }
    public getIndexCount(): number {
      return this.indices.length;
    }

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

    public create(): void {
      this.ƒvertices = this.createVertices();
      this.ƒindices = this.createIndices();
      this.ƒtextureUVs = this.createTextureUVs();
      this.ƒnormalsFaceUnscaled = this.calculateFaceCrossProducts();
      this.ƒnormalsFlat = this.createFlatNormals();
      this.ƒnormalsVertex = this.createVertexNormals();
      this.createRenderBuffers();
    }

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

    /**Flip the Normals of a Mesh to render opposite side of each polygon*/
    public flipNormals(): void {

      //invertNormals
      for (let n: number = 0; n < this.normalsFlat.length; n++) {
        this.normalsFlat[n] = -this.normalsFlat[n];
      }

      //flip indices direction
      for (let i: number = 0; i < this.indices.length - 2; i += 3) {
        let i0: number = this.indices[i];
        this.indices[i] = this.indices[i + 1];
        this.indices[i + 1] = i0;
      }
      this.createRenderBuffers();
    }


    protected createVertices(): Float32Array { return null; }
    protected createTextureUVs(): Float32Array { return null; }
    protected createIndices(): Uint16Array { return null; }
    protected createNormals(): Float32Array { return null; }

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

    // TODO: this method doesn't appear to make sense, since there is no relation to any vertex-array
    protected createFlatNormals(): Float32Array {
      let normals: number[] = [];
      let faceCrossProducts: Float32Array = this.normalsFaceUnscaled;

      for (let n: number = 0; n < faceCrossProducts.length; n += 3) {
        // normals.push(0, 0, 0);
        // normals.push(0, 0, 0);
        // only third entry used
        let normal: Vector3 = new Vector3(faceCrossProducts[n], faceCrossProducts[n + 1], faceCrossProducts[n + 2]);
        normal = Vector3.NORMALIZATION(normal);
        normals.push(normal.x, normal.y, normal.z);
      }
      return new Float32Array(normals);
    }

    /*Luis Keck: Calculates vertex normals for smooth shading.
    New function needed because faces do not share vertices currently */
    protected createVertexNormals(): Float32Array {
      let vertexNormals: number[] = [];
      let done: boolean[] = new Array<boolean>(this.vertices.length);
      let iVertex: Vector3 = new Vector3();
      let jVertex: Vector3 = new Vector3();
      //goes through all vertices
      for (let i: number = 0; i < this.vertices.length; i += 3) {
        if (done[i])
          continue;
        iVertex.set(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]);
        let samePosVerts: number[] = [i];
        done[i] = true;

        //finds vertices that share position with the vertex of current iteration
        for (let j: number = i + 3; j < this.vertices.length; j += 3) {
          if (done[j])
            continue;
          jVertex.set(this.vertices[j], this.vertices[j + 1], this.vertices[j + 2]);
          done[j] = (iVertex.equals(jVertex, 0.01));
          if (done[j])
            samePosVerts.push(j);
        }

        let sum: Vector3 = Vector3.ZERO();
        //adds the face normals of all faces that would share these vertices
        for (let z of samePosVerts)
          sum = Vector3.SUM(sum, new Vector3(
            this.normalsFaceUnscaled[z + 0],
            this.normalsFaceUnscaled[z + 1],
            this.normalsFaceUnscaled[z + 2])
          );

        if (sum.magnitude != 0)
          sum = Vector3.NORMALIZATION(sum);  // appears to be obsolete

        for (let z of samePosVerts) {
          vertexNormals[z] = sum.x;
          vertexNormals[z + 1] = sum.y;
          vertexNormals[z + 2] = sum.z;
        }
      }
      return new Float32Array(vertexNormals);
    }

    createFlatVertices(): Float32Array {
      let vertices: number[] = [];
      let indices: number[] = [];
      // create unique vertices for each face, tripling the number
      for (let i: number = 0; i < this.indices.length; i++) {
        indices.push(i); // index is then simply a subsequent number
        let index: number = this.indices[i] * 3;
        vertices.push(this.vertices[index], this.vertices[index + 1], this.vertices[index + 2]);
      }

      this.ƒindicesFlat = new Float32Array(indices);
      return new Float32Array(vertices);
    }

    createFlatTextureUVs(): Float32Array {
      let uv: number[] = [];
      // create unique vertices for each face, tripling the number
      for (let i: number = 0; i < this.indices.length; i++) {
        let index: number = this.indices[i] * 2;
        uv.push(this.textureUVs[index], this.textureUVs[index + 1]);
      }
      return new Float32Array(uv);
    }

    // protected createVertexNormals(): Float32Array {
    //   let normals: Vector3[] = [];
    //   let faceCrossProducts: Float32Array = this.faceCrossProducts;

    //   for (let v: number = 0; v < this.vertices.length; v += 3)
    //     normals.push(Vector3.ZERO());

    //   for (let i: number = 0; i < this.indices.length; i += 3) {
    //     let trigon: number[] = [this.indices[i], this.indices[i + 1], this.indices[i + 2]];
    //     let index: number = trigon[2] * 3;
    //     let normalFace: Vector3 = new Vector3(faceCrossProducts[index], faceCrossProducts[index + 1], faceCrossProducts[index + 2]);

    //     for (let index of trigon)
    //       normals[index].add(normalFace);
    //   }
    //   let vertexNormals: number[] = [];
    //   for (let n: number = 0; n < normals.length; n++) {
    //     // if (normals[n].magnitude != 0)
    //     //   normals[n] = Vector3.NORMALIZATION(normals[n]);
    //     vertexNormals.push(normals[n].x, normals[n].y, normals[n].z);
    //   }
    //   return new Float32Array(vertexNormals);
    // }

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

    // public getMutator(): Mutator {
    //   let mutator: Mutator = {
    //     name: this.name,
    //     idResource: this.idResource
    //   }
    //   return mutator;
    // }

    // protected reduceMutator(_mutator: Mutator): void {
    //   // nothing to reduce...
    // }

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
      delete _mutator.ƒindicesFlat
      delete _mutator.ƒtextureUVsFlat;

      delete _mutator.renderBuffers;
    }
  }
}