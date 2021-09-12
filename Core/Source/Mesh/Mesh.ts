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

    // TODO: check if these arrays must be cached like this or if calling the methods is better.
    protected ƒvertices: Float32Array;
    protected ƒindices: Uint16Array;
    protected ƒtextureUVs: Float32Array;
    protected ƒnormalsFace: Float32Array;
    protected ƒnormals: Float32Array;
    protected ƒbox: Box;
    // TODO: explore mathematics for easy transformations of radius 
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

      return this.ƒvertices;
    }
    public get indices(): Uint16Array {
      if (this.ƒindices == null)
        this.ƒindices = this.createIndices();

      return this.ƒindices;
    }
    public get normalsFace(): Float32Array {
      if (this.ƒnormalsFace == null)
        this.ƒnormalsFace = this.createFaceNormals();

      return this.ƒnormalsFace;
    }
    public get textureUVs(): Float32Array {
      if (this.ƒtextureUVs == null)
        this.ƒtextureUVs = this.createTextureUVs();

      return this.ƒtextureUVs;
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
      this.ƒvertices = undefined;
      this.ƒindices = undefined;
      this.ƒtextureUVs = undefined;
      this.ƒnormalsFace = undefined;
      this.ƒnormals = undefined;
      this.ƒbox = undefined;
      this.ƒradius = undefined;

      this.renderBuffers = null;
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
      for (let n: number = 0; n < this.normalsFace.length; n++) {
        this.normalsFace[n] = -this.normalsFace[n];
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

    protected createFaceNormals(): Float32Array {
      let normals: Float32Array = new Float32Array(this.vertices.length);
      let vertices: Vector3[] = [];

      for (let v: number = 0; v < this.vertices.length; v += 3)
        vertices.push(new Vector3(...this.vertices.slice(v, v + 3)));

      for (let i: number = 0; i < this.indices.length; i += 3) {
        let trigon: number[] = [this.indices[i], this.indices[i + 1], this.indices[i + 2]];

        let v0: Vector3 = Vector3.DIFFERENCE(vertices[trigon[0]], vertices[trigon[1]]);
        let v1: Vector3 = Vector3.DIFFERENCE(vertices[trigon[0]], vertices[trigon[2]]);
        let normal: Vector3 = /* Vector3.NORMALIZATION */(Vector3.CROSS(v0, v1));
        let index: number = trigon[2] * 3;
        normals.set(normal.get(), index);
      }
      return normals;
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


    protected reduceMutator(_mutator: Mutator): void {
      delete _mutator.ƒbox;
      delete _mutator.ƒradius;
      delete _mutator.ƒvertices;
      delete _mutator.ƒindices;
      delete _mutator.ƒnormals;
      delete _mutator.ƒnormalsFace;
      delete _mutator.ƒtextureUVs;
      delete _mutator.renderBuffers;
    }
  }
}