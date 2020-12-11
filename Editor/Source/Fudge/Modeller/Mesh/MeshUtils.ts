namespace Fudge {
  export class MeshUtils {
    private numberOfFaces: number;
    private vertexCount: number;
    private uniqueVertices: UniqueVertex[];
    private newTriangles: number[] = [];
    private numberOfIndices: number;
    private vertexToUniqueVertexMap: Map<number, number> = new Map();
    private originalVertexToNewVertexMap: Map<number, number> = new Map();

    constructor(_numberOfFaces: number, _vertexCount: number, _uniqueVertices: UniqueVertex[], _numberOfIndices: number) {
      this.numberOfFaces = _numberOfFaces;
      this.vertexCount = _vertexCount;
      this.uniqueVertices = _uniqueVertices;
      this.numberOfIndices = _numberOfIndices;
    }

    public extrude2Vertices(selection: number[]): number[] {
      let newTriangles: Array<number> = [];
      let reverseVertices: Map<number, number> = new Map();
      let iterator: number = 0;
      for (let vertex of selection) {
        this.uniqueVertices[vertex].vertexToIndices.set(this.vertexCount + iterator, {indices: [], face: this.numberOfFaces});
        this.vertexToUniqueVertexMap.set(this.vertexCount + iterator, vertex);
        if (!this.originalVertexToNewVertexMap.has(vertex)) {
          let newVertex: UniqueVertex = new UniqueVertex(new ƒ.Vector3(this.uniqueVertices[vertex].position.x, this.uniqueVertices[vertex].position.y, this.uniqueVertices[vertex].position.z), new Map([[this.vertexCount + iterator + selection.length, {indices: [], face: this.numberOfFaces}]]));
          this.vertexToUniqueVertexMap.set(this.vertexCount + iterator + selection.length, this.uniqueVertices.length);
          this.uniqueVertices.push(newVertex);
        } else {
          this.uniqueVertices[this.vertexToUniqueVertexMap.get(this.originalVertexToNewVertexMap.get(vertex))].vertexToIndices.set(this.vertexCount + iterator + selection.length, {indices: [], face: this.numberOfFaces});
          this.vertexToUniqueVertexMap.set(this.vertexCount + iterator + selection.length, this.vertexToUniqueVertexMap.get(this.originalVertexToNewVertexMap.get(vertex)));
        }
        this.originalVertexToNewVertexMap.set(vertex, this.vertexCount + iterator + selection.length);
        reverseVertices.set(vertex, this.vertexCount + iterator);
        iterator++;
      }
      this.vertexCount += 4;
      this.numberOfFaces++;

      this.newTriangles.push(reverseVertices.get(selection[0]));
      this.newTriangles.push(reverseVertices.get(selection[1]));
      this.newTriangles.push(this.originalVertexToNewVertexMap.get(selection[1]));
      this.newTriangles.push(this.originalVertexToNewVertexMap.get(selection[1]));
      this.newTriangles.push(this.originalVertexToNewVertexMap.get(selection[0]));
      this.newTriangles.push(reverseVertices.get(selection[0]));

      return newTriangles;
    }

    public addNewTriangles(): void {
      for (let i: number = 0; i < this.newTriangles.length; i++) {
        this.uniqueVertices[this.vertexToUniqueVertexMap.get(this.newTriangles[i])].vertexToIndices.get(this.newTriangles[i]).indices.push(this.numberOfIndices);
        this.numberOfIndices++;
      }
    }
  }
}