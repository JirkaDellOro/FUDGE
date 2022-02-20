// /<reference path="MeshPolygon.ts"/>
namespace FudgeCore {
  /**
   * Generates a rotation of a polygon around the y-axis
   * ```plaintext  
   * ```
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export class MeshRotation extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshRotation);
    protected static verticesDefault: Vector2[] = [ // line is the minimal shape
      new Vector2(0.5, 0.5),
      new Vector2(0.5, -0.5)
    ];
    protected shape: MutableArray<Vector2> = new MutableArray<Vector2>();
    protected sectors: number;

    public constructor(_name: string = "MeshRotation", _shape: Vector2[] = MeshRotation.verticesDefault, _sectors: number = 3) {
      super(_name);
      this.rotate(_shape, _sectors);
      // console.log("Mutator", this.getMutator());
    }

    protected get minVertices(): number {
      return 2;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.shape = Serializer.serializeArray(Vector2, this.shape);
      serialization.sectors = this.sectors;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      let shape: Vector2[] = <Vector2[]>await Serializer.deserializeArray(_serialization.shape);
      this.sectors = _serialization.sectors;
      this.rotate(shape, this.sectors);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      await super.mutate(_mutator);
      this.rotate(this.shape, this.sectors);
      this.dispatchEvent(new Event(EVENT.MUTATE));
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
    }
    //#endregion

    protected rotate(_shape: Vector2[], _sectors: number): void {
      this.shape = <MutableArray<Vector2>>MutableArray.from(_shape.map(_vertex => _vertex.clone));
      this.clear();
      this.sectors = Math.round(_sectors);
      let angle: number = 360 / this.sectors;
      let mtxRotate: Matrix4x4 = Matrix4x4.ROTATION_Y(angle);
      // copy original polygon as Vector3 array
      let polygon: Vector3[] = [];
      let distances: number[] = [0];
      let total: number = 0;
      for (let i: number = 0; i < this.shape.length; i++) {
        polygon.push(this.shape[i].toVector3());
        if (i > 0) {
          let distance: number = Vector2.DIFFERENCE(this.shape[i], this.shape[i - 1]).magnitude;
          total += distance;
          distances.push(total);
        }
      }
      distances.forEach((entry, index) => { distances[index] = entry / total });

      let nVerticesPolygon: number = polygon.length;

      let cloud: Vertices = new Vertices();
      for (let sector: number = 0; sector <= this.sectors; sector++) {
        for (let i: number = 0; i < nVerticesPolygon; i++) {
          let uv: Vector2 = new Vector2(sector / this.sectors, distances[i]);
          // TODO: last sector should only be references to the first meridian
          if (sector == this.sectors)
            cloud.push(new Vertex(i, uv));
          else {
            if (sector > 0 && this.shape[i].x == 0) // use a single vertex when it's on the rotation axis
              cloud.push(new Vertex(i, uv));
            else
              cloud.push(new Vertex(polygon[i].clone, uv));
          }
        }
        polygon.forEach((_vector: Vector3) => _vector.transform(mtxRotate));
      }


      // copy indices to new index array
      let faces: Face[] = [];

      for (let sector: number = 0; sector < this.sectors; sector++) {
        for (let stack: number = 0; stack < nVerticesPolygon - 1; stack++) {
          let start: number = sector * nVerticesPolygon + stack;
          let quad: Quad = new Quad(cloud, start + 1, start + 1 + nVerticesPolygon, start + nVerticesPolygon, start);
          faces.push(...quad.faces);
          // TODO: catch invalid faces right here...
        }
      }

      this.cloud = cloud;
      this.faces = faces;
    }
  }
}