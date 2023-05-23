///<reference path="MeshPolygon.ts"/>
namespace FudgeCore {
  /**
   * Generates an extrusion of a polygon by a series of transformations
   * ```plaintext  
   *                      ____
   * Polygon         ____╱╲   ╲                             y
   * Transform 0  → ╱ ╲__╲_╲___╲ ← Transform 2          z __│
   * (base)         ╲_╱__╱ ╱   ╱   (lid)                     ╲       
   *     Transform 1  →  ╲╱___╱                               x
   * ```
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021-2022
   */
  export class MeshExtrusion extends MeshPolygon {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshExtrusion);
    protected static mtxDefaults: Matrix4x4[] = [ // offset of +0.5z and -0.5z as default
      Matrix4x4.TRANSLATION(Vector3.Z(0.5)),
      Matrix4x4.TRANSLATION(Vector3.Z(-0.5))
    ];
    private mtxTransforms: MutableArray<Matrix4x4> = new MutableArray(Matrix4x4);

    public constructor(_name: string = "MeshExtrusion", _vertices: Vector2[] = MeshPolygon.shapeDefault, _mtxTransforms: Matrix4x4[] = MeshExtrusion.mtxDefaults, _fitTexture: boolean = true) {
      super(_name, _vertices, _fitTexture);
      this.extrude(_mtxTransforms);
      // console.log("Mutator", this.getMutator());
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.transforms = Serializer.serializeArray(Matrix4x4, this.mtxTransforms);
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      let mtxTransforms: Matrix4x4[];
      if (_serialization.transforms)
        mtxTransforms = <Matrix4x4[]>await Serializer.deserializeArray(_serialization.transforms);
      this.extrude(mtxTransforms);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      await super.mutate(_mutator);
      this.extrude(this.mtxTransforms);
      this.dispatchEvent(new Event(EVENT.MUTATE));
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
    }
    //#endregion


    private extrude(_mtxTransforms: Matrix4x4[] = MeshExtrusion.mtxDefaults): void {
      this.mtxTransforms = <MutableArray<Matrix4x4>>MutableArray.from(<MutableArray<Matrix4x4>>_mtxTransforms);
      let nTransforms: number = _mtxTransforms.length;
      let nVerticesShape: number = this.vertices.length;

      // create new vertex cloud, current cloud holds MeshPolygon
      let vertices: Vertices = new Vertices();

      // create base by transformation of polygon with first transform
      let base: Vertex[] = this.vertices.map((_v: Vertex) => new Vertex(Vector3.TRANSFORMATION(_v.position, _mtxTransforms[0], true), _v.uv));
      vertices.push(...base);
      // create lid by transformation of polygon with last transform
      let lid: Vertex[] = this.vertices.map((_v: Vertex) => new Vertex(Vector3.TRANSFORMATION(_v.position, _mtxTransforms[nTransforms - 1], true), _v.uv));
      vertices.push(...lid);

      // recreate base faces to recalculate normals
      this.faces = this.faces.map((_face: Face) => new Face(vertices, _face.indices[0], _face.indices[1], _face.indices[2]));
      // create the lid faces using the indices of the base faces, but with an index offset and reverse order of indices
      this.faces.push(...this.faces.map(_face =>
        new Face(vertices, _face.indices[2] + nVerticesShape, _face.indices[1] + nVerticesShape, _face.indices[0] + nVerticesShape)
      ));

      for (let t: number = 0; t < nTransforms; t++) {
        let mtxTransform: Matrix4x4 = _mtxTransforms[t];
        let referToClose: number = vertices.length;
        let wrap: Vertex[] = this.vertices.map((_v: Vertex, _i: number) =>
          new Vertex(Vector3.TRANSFORMATION(_v.position, mtxTransform, true), new Vector2(_i / nVerticesShape, t / nTransforms))
        );
        vertices.push(...wrap);
        vertices.push(new Vertex(referToClose, new Vector2(1, t / nTransforms)));
        // if (i > 0 && i < nTransforms - 1)
        //   vertices.push(...wrap.map((_vector: Vector3) => _vector.clone)); <- no slicing for flat shading yet...
      }

      // create indizes for wrapper
      for (let t: number = 0; t < nTransforms - 1; t++)
        for (let i: number = 0; i < nVerticesShape; i++) {
          let index: number =
            + 2 * nVerticesShape // base & lid are offsets 
            + t * (nVerticesShape + 1) // offset for each transformation
            + i;
          let quad: Quad = new Quad(vertices, index, index + nVerticesShape + 1, index + nVerticesShape + 2, index + 1, QUADSPLIT.AT_0);
          this.faces.push(...quad.faces);
        }

      this.vertices = vertices;
      return;
    }


    // private calculatePolygonLengths(): number[] {
    //   let result: number[] = [];
    //   let first: Vector3;
    //   let prev: Vector3;
    //   for (let i: number = 0; i < this.vertices.length; i += 3) {
    //     let current: Vector3 = new Vector3(this.vertices[i], this.vertices[i + 1], this.vertices[i + 2]);
    //     if (prev)
    //       result.push(Vector3.DIFFERENCE(current, prev).magnitude);
    //     else
    //       first = current;
    //     prev = current;
    //   }
    //   result.push(Vector3.DIFFERENCE(first, prev).magnitude);
    //   return result;
    // }
  }
}