namespace FudgeCore {

  /** 
   * This function type takes x and z as Parameters and returns a number between -1 and 1 to be used as a heightmap. 
   * x * z * 2 represent the amout of faces which are created. As a result you get 1 vertex more in each direction (x and z axis)
   * The y-component of the resulting mesh may be moved to values between 0 and a maximum height.
   * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021-2022
   */
  export type HeightMapFunction = (x: number, z: number) => number;

  export class TerrainInfo {
    /** the position of the point vertically projected on the terrain in world coordinates */
    position: Vector3;
    /** the normal of the face of the terrain under the point in world coordinates */
    normal: Vector3;
    /** the point retransformed into mesh coordinates of the terrain */
    positionMesh: Vector3;
    /** vertical distance of the point to the terrain, negative if below */
    distance: number;
  }

  /**
   * Generates a planar grid and applies a heightmap-function to it. 
   * Standard function is the simplex noise implemented with FUDGE, but another function can be given.
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021-2022 | Simon Storl-Schulke, HFU, 2020 | Moritz Beaugrand, HFU, 2021
   */
  export class MeshTerrain extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshTerrain);
    protected resolution: Vector2;
    protected scale: Vector2;
    protected seed: number;
    protected heightMapFunction: HeightMapFunction = null;

    public constructor(_name: string = "MeshTerrain", _resolution: Vector2 = Vector2.ONE(2), _scaleInput: Vector2 = Vector2.ONE(), _functionOrSeed: HeightMapFunction | number = 0) {
      super(_name);
      this.create(_resolution, _scaleInput, _functionOrSeed);
    }

    public create(_resolution: Vector2 = Vector2.ONE(2), _scaleInput: Vector2 = Vector2.ONE(), _functionOrSeed: HeightMapFunction | number = 0): void {
      this.clear();
      this.seed = undefined;
      this.resolution = _resolution.clone;
      this.scale = _scaleInput.clone;

      if (_functionOrSeed instanceof Function)
        this.heightMapFunction = _functionOrSeed;
      else if (typeof (_functionOrSeed) == "number") {
        this.seed = _functionOrSeed;
        let prng: Random = new Random(this.seed);
        this.heightMapFunction = new Noise2(() => prng.getNorm()).sample; // TODO call PRNG
      }
      else
        this.heightMapFunction = new Noise2().sample;

      this.cloud = new Vertices();
      //Iterate over each cell to generate grid of vertices
      for (let z: number = 0; z <= this.resolution.y; z++) {
        for (let x: number = 0; x <= this.resolution.x; x++) {
          let xNorm: number = x / this.resolution.x;
          let zNorm: number = z / this.resolution.y;
          this.cloud.push(new Vertex(
            new Vector3(xNorm - 0.5, this.heightMapFunction(xNorm * this.scale.x, zNorm * this.scale.y), zNorm - 0.5),
            new Vector2(xNorm, zNorm)
          ));
        }
      }

      let quads: Quad[] = [];
      for (let z: number = 0; z < this.resolution.y; z++)
        for (let x: number = 0; x < this.resolution.x; x++) {
          quads.push(new Quad(
            this.cloud,
            (x + 0) + (z + 0) * (this.resolution.x + 1),
            (x + 0) + (z + 1) * (this.resolution.x + 1),
            (x + 1) + (z + 1) * (this.resolution.x + 1),
            (x + 1) + (z + 0) * (this.resolution.x + 1)
          ));
        }
      this.faces = quads.flatMap((quad: Quad) => quad.faces);

      console.log(this.cloud, this.faces, quads);
    }


    public getTerrainInfo(_position: Vector3, _mtxWorld: Matrix4x4 = Matrix4x4.IDENTITY(), _mtxInverse?: Matrix4x4): TerrainInfo {
      if (!_mtxInverse)
        _mtxInverse = Matrix4x4.INVERSION(_mtxWorld);

      let terrainInfo: TerrainInfo = new TerrainInfo;

      let posLocal: Vector3 = terrainInfo.positionMesh = Vector3.TRANSFORMATION(_position, _mtxInverse, true);
      let nearestFace: DistanceToFaceVertices = this.findNearestFace(posLocal);

      terrainInfo.position = new Vector3(posLocal.x, this.calculateHeight(nearestFace, posLocal), posLocal.z);
      let normal: Vector3 = nearestFace.faceNormal;

      terrainInfo.position = Vector3.TRANSFORMATION(terrainInfo.position, _mtxWorld, true);
      terrainInfo.normal = Vector3.TRANSFORMATION(normal, Matrix4x4.TRANSPOSE(_mtxInverse), false);
      terrainInfo.normal.normalize();

      terrainInfo.distance = _position.y - terrainInfo.position.y;

      return terrainInfo;
    }

    //#region Transfer
    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.seed = this.seed;
      serialization.scale = this.scale.serialize();
      serialization.resolution = this.resolution.serialize();
      return serialization;
    }
    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization);
      await this.resolution.deserialize(_serialization.resolution);
      await this.scale.deserialize(_serialization.scale);
      this.seed = _serialization.seed;
      this.create(this.resolution, this.scale, this.seed);
      return this;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(
        new Vector2(_mutator.resolution.x, _mutator.resolution.y),
        new Vector2(_mutator.scale.x, _mutator.scale.y),
        _mutator.seed
      );
    }
    //#endregion

    private calculateHeight(face: DistanceToFaceVertices, relativePosObject: Vector3): number {
      let ray: Ray = new Ray(new Vector3(0, 1, 0), relativePosObject);
      let intersection: Vector3 = ray.intersectPlane(face.vertexONE, face.faceNormal);

      return intersection.y;
    }

    private findNearestFace(relativPosObject: Vector3): DistanceToFaceVertices {
      let vertices: Float32Array = this.vertices;
      let indices: Uint16Array = this.indices;

      let row: number = Math.floor((relativPosObject.z + 0.5) * this.resolution.y);
      let column: number = Math.floor((relativPosObject.x + 0.5) * this.resolution.x);

      if (row >= this.resolution.y) row = this.resolution.y - 1;
      if (row < 0) row = 0;
      if (column >= this.resolution.x) column = this.resolution.y - 1;
      if (column < 0) column = 0;

      let field: number = ((row * this.resolution.x) + column) * 6;

      let vertexONE1: Vector3 = new Vector3(vertices[indices[field] * 3], vertices[indices[field] * 3 + 1], vertices[indices[field] * 3 + 2]);
      let vertexTWO1: Vector3 = new Vector3(vertices[indices[field + 1] * 3], vertices[indices[field + 1] * 3 + 1], vertices[indices[field + 1] * 3 + 2]);
      let vertexTHREE1: Vector3 = new Vector3(vertices[indices[field + 2] * 3], vertices[indices[field + 2] * 3 + 1], vertices[indices[field + 2] * 3 + 2]);

      let face1: DistanceToFaceVertices = new DistanceToFaceVertices(vertexONE1, vertexTWO1, vertexTHREE1, relativPosObject);

      field = field + 3;

      let vertexONE2: Vector3 = new Vector3(vertices[indices[field] * 3], vertices[indices[field] * 3 + 1], vertices[indices[field] * 3 + 2]);
      let vertexTWO2: Vector3 = new Vector3(vertices[indices[field + 1] * 3], vertices[indices[field + 1] * 3 + 1], vertices[indices[field + 1] * 3 + 2]);
      let vertexTHREE2: Vector3 = new Vector3(vertices[indices[field + 2] * 3], vertices[indices[field + 2] * 3 + 1], vertices[indices[field + 2] * 3 + 2]);

      let face2: DistanceToFaceVertices = new DistanceToFaceVertices(vertexONE2, vertexTWO2, vertexTHREE2, relativPosObject);

      if (face1.distance < face2.distance)
        return face1;
      else return face2;

    }
  }

  class DistanceToFaceVertices {
    public vertexONE: Vector3;
    public vertexTWO: Vector3;
    public vertexTHREE: Vector3;

    public distanceONE: number;
    public distanceTWO: number;
    public distanceTHREE: number;

    public distance: number;

    public faceNormal: Vector3;

    public constructor(vertexONE: Vector3, vertexTWO: Vector3, vertexTHREE: Vector3, relativPosObject: Vector3) {
      this.vertexONE = vertexONE;
      this.vertexTWO = vertexTWO;
      this.vertexTHREE = vertexTHREE;

      this.distanceONE = new Vector2(vertexONE.x - relativPosObject.x, vertexONE.z - relativPosObject.z).magnitude;
      this.distanceTWO = new Vector2(vertexTWO.x - relativPosObject.x, vertexTWO.z - relativPosObject.z).magnitude;
      this.distanceTHREE = new Vector2(vertexTHREE.x - relativPosObject.x, vertexTHREE.z - relativPosObject.z).magnitude;

      this.distance = this.distanceONE + this.distanceTWO + this.distanceTHREE;

      this.calculateFaceNormal();

    }

    private calculateFaceNormal(): void {
      let v1: Vector3 = Vector3.DIFFERENCE(this.vertexTWO, this.vertexONE);
      let v2: Vector3 = Vector3.DIFFERENCE(this.vertexTHREE, this.vertexONE);

      this.faceNormal = Vector3.CROSS(v1, v2);
    }
  }
}