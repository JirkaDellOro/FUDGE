namespace FudgeCore {

  /** This function type takes x and z as Parameters and returns a number - to be used as a heightmap. 
   * x and z are mapped from 0 to 1 when used to generate a Heightmap Mesh
   * x * z * 2 represent the amout of faces whiche are created. As a result you get 1 Vertice more in each direction (x and z achsis)
   * For Example: x = 4, z = 4, 16 squares (32 Faces), 25 vertices 
   * @authors Simon Storl-Schulke, HFU, 2020*/
  export type HeightMapFunction = (x: number, z: number) => number;

  export class PositionOnTerrain {
    position: Vector3;
    normal: Vector3;
  }

  /**
   * Generates a planar Grid and applies a Heightmap-Function to it.
   * @authors Jirka Dell'Oro-Friedl, Simon Storl-Schulke, Moritz Beaugrand HFU, 2020
   */
  export class MeshTerrain extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshTerrain);

    public resolutionX: number;
    public resolutionZ: number;
    public imgScale: number = 255;
    public node: Node;
    private heightMapFunction: HeightMapFunction;
    private image: TextureImage;

    /**
     * HeightMapFunction or PNG 
     * @param _name 
     * @param source 
     * @param _resolutionX 
     * @param _resolutionZ 
     */
    public constructor(_name: string = "MeshHeightMap", source?: HeightMapFunction | TextureImage, _resolutionX: number = 16, _resolutionZ: number = 16) {
      super(_name);
      this.resolutionX = _resolutionX;
      this.resolutionZ = _resolutionZ;

      if (_resolutionZ || _resolutionX <= 0) {
        Debug.warn("HeightMap Mesh cannot have resolution values < 1. ");
        this.resolutionX = Math.max(1, this.resolutionX);
        this.resolutionZ = Math.max(1, this.resolutionZ);
      }

      if (!(source instanceof TextureImage)) {
        this.heightMapFunction = source;
        this.image = null;
      }
      else this.heightMapFunction = null;

      if (source instanceof TextureImage) {
        this.image = source;
        this.resolutionX = source.image.width - 1;
        this.resolutionZ = source.image.height - 1;
      }
      else this.image = null;

      this.ƒnormalsFace = this.createFaceNormals();
      this.ƒindices = this.createIndices();
    }


    public getPositionOnTerrain(position: Vector3, mtxWorld?: Matrix4x4): PositionOnTerrain {

      let relPosObject: Vector3 = position;

      if (mtxWorld) {
        relPosObject = Vector3.TRANSFORMATION(position, Matrix4x4.INVERSION(mtxWorld), true);
      }

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

    protected createVertices(): Float32Array {
      let vertices: Float32Array = new Float32Array((this.resolutionX + 1) * (this.resolutionZ + 1) * 3);

      if (this.heightMapFunction != null) {
        //Iterate over each cell to generate grid of vertices
        for (let i: number = 0, z: number = 0; z <= this.resolutionZ; z++) {
          for (let x: number = 0; x <= this.resolutionX; x++) {
            // X
            vertices[i] = x / this.resolutionX - 0.5;
            // Apply heightmap to y coordinate
            vertices[i + 1] = this.heightMapFunction(x / this.resolutionX, z / this.resolutionZ);
            // Z
            vertices[i + 2] = z / this.resolutionZ - 0.5;
            i += 3;
          }
        }
        return vertices;
      }
      else if (this.image != null) {
        let imgArray: Uint8ClampedArray = this.imageToClampedArray(this.image);
        console.log(imgArray);
        let px: number = 0;

        for (let i: number = 0, z: number = 0; z <= this.resolutionZ; z++) {
          for (let x: number = 0; x <= this.resolutionX; x++) {
            // X
            vertices[i] = x / this.resolutionX - 0.5;
            // Apply heightmap to y coordinate
            vertices[i + 1] = imgArray[px * 4] / this.imgScale;
            // Z
            vertices[i + 2] = z / this.resolutionZ - 0.5;
            i += 3;
            px++;
          }
        }

        return vertices;

      }
      else {
        throw new Error("No Source for Vertices is given, must be function or image");
      }
    }

    protected createIndices(): Uint16Array {
      let vert: number = 0;
      let tris: number = 0;

      let indices: Uint16Array = new Uint16Array(this.resolutionX * this.resolutionZ * 6);

      let switchOrientation: Boolean = false;

      for (let z: number = 0; z < this.resolutionZ; z++) {
        for (let x: number = 0; x < this.resolutionX; x++) {

          if (!switchOrientation) {
            // First triangle of each uneven grid-cell
            indices[tris + 0] = vert + 0;
            indices[tris + 1] = vert + this.resolutionX + 1;
            indices[tris + 2] = vert + 1;

            // Second triangle of each uneven grid-cell
            indices[tris + 3] = vert + 1;
            indices[tris + 4] = vert + this.resolutionX + 1;
            indices[tris + 5] = vert + this.resolutionX + 2;
          }
          else {
            // First triangle of each even grid-cell
            indices[tris + 0] = vert + 0;
            indices[tris + 1] = vert + this.resolutionX + 1;
            indices[tris + 2] = vert + this.resolutionX + 2;

            // Second triangle of each even grid-cell
            indices[tris + 3] = vert + 0;
            indices[tris + 4] = vert + this.resolutionX + 2;
            indices[tris + 5] = vert + 1;
          }

          switchOrientation = !switchOrientation;
          vert++;
          tris += 6;
        }
        if (this.resolutionX % 2 == 0)
          switchOrientation = !switchOrientation;
        vert++;
      }
      return indices;
    }

    protected createTextureUVs(): Float32Array {
      let textureUVs: Float32Array = new Float32Array(this.indices.length * 2);

      for (let i: number = 0, z: number = 0; z <= this.resolutionZ; z++) {
        for (let x: number = 0; x <= this.resolutionX; x++) {
          textureUVs[i] = x / this.resolutionX;
          textureUVs[i + 1] = z / this.resolutionZ;
          i += 2;
        }
      }
      return textureUVs;
    }

    protected imageToClampedArray(image: TextureImage): Uint8ClampedArray {
      let trImport: Uint8ClampedArray;

      let canvasImage: HTMLCanvasElement = document.createElement("canvas");
      canvasImage.width = image.image.width;
      canvasImage.height = image.image.height;

      let crcHeightMap: CanvasRenderingContext2D = canvasImage.getContext("2d");
      crcHeightMap.imageSmoothingEnabled = false;
      crcHeightMap.drawImage(image.image, 0, 0);

      trImport = crcHeightMap.getImageData(0, 0, image.image.width, image.image.height).data;

      return trImport;
    }

    private calculateHeight(face: DistanceToFaceVertices, relativePosObject: Vector3): number {

      let ray: Ray = new Ray(new Vector3(0, 1, 0), relativePosObject);
      let intersection: Vector3 = ray.intersectPlane(face.vertexONE, face.faceNormal);

      return intersection.y;
    }

    private findNearestFace(relativPosObject: Vector3): DistanceToFaceVertices {
      let vertices: Float32Array = this.vertices;
      let indices: Uint16Array = this.indices;

      let row: number = Math.floor((relativPosObject.z + 0.5) * this.resolutionZ);
      let column: number = Math.floor((relativPosObject.x + 0.5) * this.resolutionX);

      if (row >= this.resolutionZ) row = this.resolutionZ - 1;
      if (row < 0) row = 0;
      if (column >= this.resolutionX) column = this.resolutionZ - 1;
      if (column < 0) column = 0;

      let field: number = ((row * this.resolutionX) + column) * 6;

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