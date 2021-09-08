namespace FudgeCore {

  /** 
   * This function type takes x and z as Parameters and returns a number between -1 and 1 to be used as a heightmap. 
   * x * z * 2 represent the amout of faces which are created. As a result you get 1 vertex more in each direction (x and z axis)
   * The y-component of the resulting mesh may be moved to values between 0 and a maximum height.
   * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2021
   */
  export type HeightMapFunction = (x: number, z: number) => number;

  export class PositionOnTerrain {
    position: Vector3;
    normal: Vector3;
  }

  /**
   * Generates a planar grid and applies a heightmap-function to it.
   * @authors Jirka Dell'Oro-Friedl, HFU, 2021 | Simon Storl-Schulke, HFU, 2020 | Moritz Beaugrand, HFU, 2021
   */
  export class MeshTerrain extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshTerrain);
    protected resolution: Vector2;
    protected scale: Vector2;
    protected seed: number;
    protected heightMapFunction: HeightMapFunction = null;

    public constructor(_name: string = "MeshTerrain", _resolution: Vector2 = Vector2.ONE(10), _scaleInput: Vector2 = Vector2.ONE(), _functionOrSeed?: HeightMapFunction | number) {
      super(_name);
      this.create(_resolution, _scaleInput, _functionOrSeed);
    }

    public create(_resolution: Vector2 = Vector2.ONE(10), _scaleInput: Vector2 = Vector2.ONE(), _functionOrSeed?: HeightMapFunction | number): void {
      this.clear();
      this.resolution = _resolution.copy;
      
      if (_functionOrSeed instanceof Function)
        this.heightMapFunction = _functionOrSeed;
      else if (typeof (_functionOrSeed) == "number")
        this.heightMapFunction = new Noise2().sample; // TODO call PRNG
      else
        this.heightMapFunction = new Noise2().sample;

      // if (_size < 1 || _sizeX < 1) {
      //   Debug.warn("HeightMap resolution < 1, corrected to 1");
      //   this.size.x = Math.max(1, this.size.x);
      //   this.size.y = Math.max(1, this.size.y);
      // }


      this.ƒnormalsFace = this.createFaceNormals();
      this.ƒindices = this.createIndices();
    }


    public getPositionOnTerrain(position: Vector3, mtxWorld?: Matrix4x4): PositionOnTerrain {
      let relPosObject: Vector3 = position;

      if (mtxWorld)
        relPosObject = Vector3.TRANSFORMATION(position, Matrix4x4.INVERSION(mtxWorld), true);

      let nearestFace: DistanceToFaceVertices = this.findNearestFace(relPosObject);
      let posOnTerrain: PositionOnTerrain = new PositionOnTerrain;

      let origin: Vector3 = new Vector3(relPosObject.x, this.calculateHeight(nearestFace, relPosObject), relPosObject.z);
      let direction: Vector3 = nearestFace.faceNormal;

      if (mtxWorld) {
        origin = Vector3.TRANSFORMATION(origin, mtxWorld, true);
        direction = Vector3.TRANSFORMATION(direction, mtxWorld, false);
      }

      posOnTerrain.position = origin;
      posOnTerrain.normal = direction;

      return posOnTerrain;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      this.create(new Vector2(_mutator.resolution.x, _mutator.resolution.y));
    }

    protected createVertices(): Float32Array {
      let vertices: Float32Array = new Float32Array((this.resolution.x + 1) * (this.resolution.y + 1) * 3);
      //Iterate over each cell to generate grid of vertices
      let i: number = 0;
      for (let z: number = 0; z <= this.resolution.y; z++) {
        for (let x: number = 0; x <= this.resolution.x; x++) {
          let xNorm: number = x / this.resolution.x;
          let zNorm: number = z / this.resolution.y;
          vertices[i] = xNorm - 0.5;
          vertices[i + 1] = this.heightMapFunction(xNorm, zNorm);
          vertices[i + 2] = zNorm - 0.5;
          i += 3;
        }
      }
      return vertices;
    }

    protected createIndices(): Uint16Array {
      let vert: number = 0;
      let tris: number = 0;

      let indices: Uint16Array = new Uint16Array(this.resolution.x * this.resolution.y * 6);

      let switchOrientation: Boolean = false;

      for (let z: number = 0; z < this.resolution.y; z++) {
        for (let x: number = 0; x < this.resolution.x; x++) {

          if (!switchOrientation) {
            // First triangle of each uneven grid-cell
            indices[tris + 0] = vert + 0;
            indices[tris + 1] = vert + this.resolution.x + 1;
            indices[tris + 2] = vert + 1;

            // Second triangle of each uneven grid-cell
            indices[tris + 3] = vert + 1;
            indices[tris + 4] = vert + this.resolution.x + 1;
            indices[tris + 5] = vert + this.resolution.x + 2;
          }
          else {
            // First triangle of each even grid-cell
            indices[tris + 0] = vert + 0;
            indices[tris + 1] = vert + this.resolution.x + 1;
            indices[tris + 2] = vert + this.resolution.x + 2;

            // Second triangle of each even grid-cell
            indices[tris + 3] = vert + 0;
            indices[tris + 4] = vert + this.resolution.x + 2;
            indices[tris + 5] = vert + 1;
          }

          switchOrientation = !switchOrientation;
          vert++;
          tris += 6;
        }
        if (this.resolution.x % 2 == 0)
          switchOrientation = !switchOrientation;
        vert++;
      }
      return indices;
    }

    protected createTextureUVs(): Float32Array {
      let textureUVs: Float32Array = new Float32Array(this.indices.length * 2);

      for (let i: number = 0, z: number = 0; z <= this.resolution.y; z++) {
        for (let x: number = 0; x <= this.resolution.x; x++) {
          textureUVs[i] = x / this.resolution.x;
          textureUVs[i + 1] = z / this.resolution.y;
          i += 2;
        }
      }
      return textureUVs;
    }

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