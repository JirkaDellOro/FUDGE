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
    // base structure for meshes in FUDGE
    public vertices: Vertices = new Vertices();
    public faces: Face[] = [];

    // public renderBuffers: RenderBuffers; /* defined by RenderInjector*/
    protected renderMesh: RenderMesh; /* defined by RenderInjector*/


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

    protected static registerSubclass(_subClass: typeof Mesh): number { return Mesh.subclasses.push(_subClass) - 1; }

    public get type(): string {
      return this.constructor.name;
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

    public useRenderBuffers(_shader: ShaderInterface, _mtxMeshToWorld: Matrix4x4, _mtxMeshToView: Matrix4x4, _id?: number): RenderBuffers { return null; /* injected by RenderInjector*/ }
    public getRenderBuffers(_shader: ShaderInterface): RenderBuffers { return null; /* injected by RenderInjector*/ }
    public deleteRenderBuffers(_shader: ShaderInterface): void {/* injected by RenderInjector*/ }

    public clear(): void {
      this.ƒbox = undefined;
      this.ƒradius = undefined;

      this.renderMesh?.clear();
    }

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

      delete _mutator.renderBuffers;
    }
    //#endregion


    protected createRadius(): number {
      //TODO: radius and bounding box could be created on construction of vertex-array
      let radius: number = 0;
      for (let i: number = 0; i < this.vertices.length; i++) {
        radius = Math.max(radius, this.vertices.position(i).magnitudeSquared);
      }
      return Math.sqrt(radius);
    }

    protected createBoundingBox(): Box {
      let box: Box = Recycler.get(Box);
      box.set();
      for (let i: number = 0; i < this.vertices.length; i ++) {
        let point: Vector3 = this.vertices.position(i);
        box.expand(point);
      }
      return box;
    }
  }
}