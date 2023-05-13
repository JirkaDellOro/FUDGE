namespace FudgeCore {

  /** 
   * This function type takes x and z as Parameters and returns a number between -1 and 1 to be used as a heightmap. 
   * x * z * 2 represent the amout of faces which are created. As a result you get 1 vertex more in each direction (x and z axis)
   * The y-component of the resulting mesh may be moved to values between 0 and a maximum height.
   * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021-2022
   */
  export type HeightMapFunction = (x: number, z: number) => number;

  /**
   * Information about the vertical projection of a given position onto the terrain
   */
  export class TerrainInfo {
    /** the position of the point vertically projected on the terrain in world coordinates */
    position: Vector3;
    /** the normal of the face of the terrain under the point in world coordinates */
    normal: Vector3;
    /** vertical distance of the point to the terrain, negative if below */
    distance: number;
    /** the position in face coordinates */
    positionFace: Vector3;
    /** the index of the face the position is inside */
    index: number;
    /** the grid coordinates of the quad the face belongs to */
    grid: Vector2;
  }

  /**
   * A terrain spreads out in the x-z-plane, y is the height derived from the heightmap function. 
   * The terrain is always 1 in size in all dimensions, fitting into the unit-cube. 
   * Resolution determines the number of quads in x and z dimension, scale the factor applied to the x,z-coordinates passed to the heightmap function.
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
      this.resolution = new Vector2(Math.round(_resolution.x), Math.round(_resolution.y));
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

      this.vertices = new Vertices();
      //Iterate over each cell to generate grid of vertices
      for (let z: number = 0; z <= this.resolution.y; z++) {
        for (let x: number = 0; x <= this.resolution.x; x++) {
          let xNorm: number = x / this.resolution.x;
          let zNorm: number = z / this.resolution.y;
          this.vertices.push(new Vertex(
            new Vector3(xNorm - 0.5, this.heightMapFunction(xNorm * this.scale.x, zNorm * this.scale.y), zNorm - 0.5),
            new Vector2(xNorm, zNorm)
          ));
        }
      }

      let quads: Quad[] = [];
      let split: QUADSPLIT = QUADSPLIT.AT_0;
      for (let z: number = 0; z < this.resolution.y; z++) {
        for (let x: number = 0; x < this.resolution.x; x++) {
          quads.push(new Quad(
            this.vertices,
            (x + 0) + (z + 0) * (this.resolution.x + 1),
            (x + 0) + (z + 1) * (this.resolution.x + 1),
            (x + 1) + (z + 1) * (this.resolution.x + 1),
            (x + 1) + (z + 0) * (this.resolution.x + 1),
            split
          ));
          split = (split == QUADSPLIT.AT_0) ? QUADSPLIT.AT_1 : QUADSPLIT.AT_0;
        }
        if (this.resolution.x % 2 == 0) // reverse last split change if x-resolution is even
          split = (split == QUADSPLIT.AT_0) ? QUADSPLIT.AT_1 : QUADSPLIT.AT_0;
      }
      this.faces = quads.flatMap((quad: Quad) => quad.faces);
    }

    /**
     * Returns information about the vertical projection of the given position onto the terrain.
     * Pass the overall world transformation of the terrain if the position is given in world coordinates.
     * If at hand, pass the inverse too to avoid unnecessary calculation.
     */
    public getTerrainInfo(_position: Vector3, _mtxWorld: Matrix4x4 = Matrix4x4.IDENTITY(), _mtxInverse?: Matrix4x4): TerrainInfo {
      if (!_mtxInverse)
        _mtxInverse = Matrix4x4.INVERSION(_mtxWorld);

      let terrainInfo: TerrainInfo = new TerrainInfo;

      let posLocal: Vector3 = Vector3.TRANSFORMATION(_position, _mtxInverse, true);


      let z: number = Math.floor((posLocal.z + 0.5) * this.resolution.y);
      let x: number = Math.floor((posLocal.x + 0.5) * this.resolution.x);
      if (z < 0 || z > this.resolution.y - 1 || x < 0 || x > this.resolution.x - 1)
        return null;

      let index: number = (z * this.resolution.x + x) * 2;
      let face: Face = this.faces[index];

      let ray: Ray = new Ray(Vector3.Y(), posLocal);
      let point: Vector3 = ray.intersectFacePlane(face);
      if (!face.isInside(point)) {
        index++;
        face = this.faces[index];
        point = ray.intersectFacePlane(face);
      }

      terrainInfo.index = index;
      terrainInfo.positionFace = point;
      terrainInfo.position = Vector3.TRANSFORMATION(point, _mtxWorld, true);
      terrainInfo.normal = Vector3.TRANSFORMATION(face.normal, Matrix4x4.TRANSPOSE(_mtxInverse), false);
      terrainInfo.distance = _position.y - terrainInfo.position.y;
      terrainInfo.grid = this.getGridFromFaceIndex(index);
      return terrainInfo;
    }

    public getGridFromFaceIndex(_index: number): Vector2 {
      let result: Vector2 = Recycler.get(Vector2);
      let iQuad: number = Math.floor(_index / 2);
      result.set(iQuad % this.resolution.y, Math.floor(iQuad / this.resolution.x));
      return result;
    }

    public getFaceIndicesFromGrid(_grid: Vector2): number[] {
      let iQuad: number = _grid.y * 2 * this.resolution.x + _grid.x * 2;
      return [iQuad, iQuad + 1];
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
      this.create(this.resolution, this.scale, this.seed);
    }
    //#endregion
  }
}