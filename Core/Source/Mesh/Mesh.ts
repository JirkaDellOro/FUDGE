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

    // TODO: check if these arrays must be cached like this or if calling the methods is better.
    public vertices: Float32Array;
    public indices: Uint16Array;
    public textureUVs: Float32Array;
    public normalsFace: Float32Array;

    public idResource: string = undefined;
    public name: string = "Mesh";

    public renderBuffers: RenderBuffers; /* defined by RenderInjector*/

    public static getBufferSpecification(): BufferSpecification {
      return { size: 3, dataType: WebGL2RenderingContext.FLOAT, normalize: false, stride: 0, offset: 0 };
    }

    protected static registerSubclass(_subClass: typeof Mesh): number { return Mesh.subclasses.push(_subClass) - 1; }

    public get type(): string {
      return this.constructor.name;
    }

    public useRenderBuffers(_shader: typeof Shader, _world: Matrix4x4, _projection: Matrix4x4, _id?: number): void {/* injected by RenderInjector*/ }
    public createRenderBuffers(): void {/* injected by RenderInjector*/ }
    public deleteRenderBuffers(_shader: typeof Shader): void {/* injected by RenderInjector*/ }

    public getVertexCount(): number {
      return this.vertices.length / Mesh.getBufferSpecification().size;
    }
    public getIndexCount(): number {
      return this.indices.length;
    }

    public create(): void {
      this.vertices = this.createVertices();
      this.indices = this.createIndices();
      this.textureUVs = this.createTextureUVs();
      this.normalsFace = this.createFaceNormals();
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
      this.idResource = _serialization.idResource;
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
      for (let i: number = 0; i < this.indices.length - 2; i += 3 ) {
        let i0: number = this.indices[i];
        this.indices[i] = this.indices[i + 1];
        this.indices[i + 1] = i0;
      }
      this.createRenderBuffers();
    }

    // public abstract create(): void;

    protected calculateFaceNormals(): Float32Array {
      let normals: number[] = [];
      let vertices: Vector3[] = [];

      for (let v: number = 0; v < this.vertices.length; v += 3)
        vertices.push(new Vector3(this.vertices[v], this.vertices[v + 1], this.vertices[v + 2]));

      for (let i: number = 0; i < this.indices.length; i += 3) {
        let vertex: number[] = [this.indices[i], this.indices[i + 1], this.indices[i + 2]];

        let v0: Vector3 = Vector3.DIFFERENCE(vertices[vertex[0]], vertices[vertex[1]]);
        let v1: Vector3 = Vector3.DIFFERENCE(vertices[vertex[0]], vertices[vertex[2]]);
        let normal: Vector3 = Vector3.NORMALIZATION(Vector3.CROSS(v0, v1));
        let index: number = vertex[2] * 3;
        normals[index] = normal.x;
        normals[index + 1] = normal.y;
        normals[index + 2] = normal.z;
      }
      return new Float32Array(normals);
    }

    protected abstract createVertices(): Float32Array;
    protected abstract createTextureUVs(): Float32Array;
    protected abstract createIndices(): Uint16Array;
    protected abstract createFaceNormals(): Float32Array;

    protected reduceMutator(_mutator: Mutator): void { 
      // delete _mutator.idResource; 
    }
  }
}