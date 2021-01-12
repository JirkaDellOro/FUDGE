namespace Fudge {
  export class MeshUtils {
    private numberOfFaces: number;
    private vertexCount: number;
    private uniqueVertices: UniqueVertex[];
    private newTriangles: number[] = [];
    private numberOfIndices: number;
    private newVertexToOriginalVertexMap: Map<number, number> = new Map();
    private originalVertexToNewVertexMap: Map<number, number> = new Map();
    private vertexToUniqueVertexMap: Map<number, number> = new Map();

    constructor(_numberOfFaces: number, _vertexCount: number, _uniqueVertices: UniqueVertex[], _numberOfIndices: number) {
      this.numberOfFaces = _numberOfFaces;
      this.vertexCount = _vertexCount;
      this.uniqueVertices = _uniqueVertices;
      this.numberOfIndices = _numberOfIndices;
    }

    /*
      loop over the stored (half-)edges and find the correct ones  
    */
    public findEdgesFromData(selection: number[]): {start: number, end: number}[] {
      this.fillVertexMap(selection);
      let edges: {start: number, end: number}[] = [];

      for (let [vertexIndex, uniqueIndex] of this.vertexToUniqueVertexMap) {
        for (let endPoint of this.uniqueVertices[uniqueIndex].vertexToData.get(vertexIndex).edges) {
          let isAddable: boolean = false;
          for (let vertex of selection) {
            if (vertex === this.vertexToUniqueVertexMap.get(endPoint) || vertex === endPoint) 
              isAddable = true;
          }

          if (isAddable) {
            edges.push({start: vertexIndex, end: endPoint});
          }
        }
      }

      this.removeInteriorEdges(edges);
      let faceToEdgesMap: Map<number, {edge: {start: number, end: number}, index: number}[]> = this.removeInnerEdges(edges);

      for (let [face, edgesOfFace] of faceToEdgesMap) {
        if (edgesOfFace.length === 4) {

        } else if (edgesOfFace.length === 2) {
          edges.splice(edgesOfFace[0].index, 1);
          edges.splice(edgesOfFace[1].index, 1);
        }
      }

      // this.removeDuplicateEdges(edges);
      let newEdges: {start: number, end: number}[] = [];

      for (let edge of edges) {
        edge.start = this.vertexToUniqueVertexMap.get(edge.start);
        edge.end = this.vertexToUniqueVertexMap.get(edge.end);
        // newEdges.push({start: edge.end, end: edge.start});
        newEdges.push(edge);
      }

      return newEdges;
    }

    // there can only be 2 and 4
    private removeInnerEdges(edges: {start: number, end: number}[]): Map<number, {edge: {start: number, end: number}, index: number}[]> {
      let faceToEdgesMap: Map<number, {edge: {start: number, end: number}, index: number}[]> = new Map();
      for (let i: number = 0; i < edges.length; i++) {
        for (let j: number = 0; j < edges.length; j++) {
          if (edges[i] === edges[j])
            continue;
          
          let faceOfEdge1: number = this.uniqueVertices[this.vertexToUniqueVertexMap.get(edges[i].start)].vertexToData.get(edges[i].start).face;
          let faceOfEdge2: number = this.uniqueVertices[this.vertexToUniqueVertexMap.get(edges[j].start)].vertexToData.get(edges[j].start).face;

          if (faceOfEdge1 === faceOfEdge2) {
            let isAlreadyInDict: boolean = false;
            if (!faceToEdgesMap.has(faceOfEdge1)) {
              faceToEdgesMap.set(faceOfEdge1, []);
            } else {
              for (let [face, edgesOfFace] of faceToEdgesMap) {
                if (edgesOfFace[0].edge === edges[i] || edgesOfFace[1].edge === edges[i])
                  isAlreadyInDict = true;
              }
            }

            if (isAlreadyInDict)
              continue;

            if (j > i) {
              faceToEdgesMap.get(faceOfEdge1).push({edge: edges[j], index: j});
              faceToEdgesMap.get(faceOfEdge1).push({edge: edges[i], index: i});
            } else {
              faceToEdgesMap.get(faceOfEdge1).push({edge: edges[i], index: i});
              faceToEdgesMap.get(faceOfEdge1).push({edge: edges[j], index: j});
            }
          }
        }
      } 
      return faceToEdgesMap;
    }


    public extrudeEdge(selection: number[]): number[] {
      let newTriangles: Array<number> = [];
      let reverseVertices: Map<number, number> = new Map();
      let iterator: number = 0;
      for (let vertex of selection) {
        this.uniqueVertices[vertex].vertexToData.set(this.vertexCount + iterator, {indices: [], face: this.numberOfFaces, edges: []});
        this.newVertexToOriginalVertexMap.set(this.vertexCount + iterator, vertex);
        if (!this.originalVertexToNewVertexMap.has(vertex)) {
          let newVertex: UniqueVertex = new UniqueVertex(
            new ƒ.Vector3(this.uniqueVertices[vertex].position.x, this.uniqueVertices[vertex].position.y, this.uniqueVertices[vertex].position.z), 
            new Map([[this.vertexCount + iterator + selection.length, {indices: [], face: this.numberOfFaces, edges: []}]]));
          this.newVertexToOriginalVertexMap.set(this.vertexCount + iterator + selection.length, this.uniqueVertices.length);
          this.uniqueVertices.push(newVertex);
        } else {
          this.uniqueVertices[this.newVertexToOriginalVertexMap.get(this.originalVertexToNewVertexMap.get(vertex))].vertexToData.set(this.vertexCount + iterator + selection.length, {indices: [], face: this.numberOfFaces, edges: []});
          this.newVertexToOriginalVertexMap.set(this.vertexCount + iterator + selection.length, this.newVertexToOriginalVertexMap.get(this.originalVertexToNewVertexMap.get(vertex)));
        }
        this.originalVertexToNewVertexMap.set(vertex, this.vertexCount + iterator + selection.length);
        reverseVertices.set(vertex, this.vertexCount + iterator);
        iterator++;
      }
      this.vertexCount += 4;
      this.numberOfFaces++;

      // a, a + n, b + n
      this.newTriangles.push(reverseVertices.get(selection[0]));
      this.newTriangles.push(this.originalVertexToNewVertexMap.get(selection[0]));
      this.newTriangles.push(this.originalVertexToNewVertexMap.get(selection[1]));
      // a, b + n, b
      this.newTriangles.push(reverseVertices.get(selection[0]));
      this.newTriangles.push(this.originalVertexToNewVertexMap.get(selection[1]));
      this.newTriangles.push(reverseVertices.get(selection[1]));
      //this.newTriangles.push(this.originalVertexToNewVertexMap.get(selection[0]));
      //this.newTriangles.push(reverseVertices.get(selection[0]));

      return newTriangles;
    }

    /*
      update the indices and edges of the newly created vertices according to the data in the newTriangles array
    */
    public addNewTriangles(): void {
      for (let i: number = 0; i < this.newTriangles.length; i++) {
        this.uniqueVertices[this.newVertexToOriginalVertexMap.get(this.newTriangles[i])].vertexToData.get(this.newTriangles[i]).indices.push(this.numberOfIndices);
        if (this.numberOfIndices % 3 !== 2) {
          this.uniqueVertices[this.newVertexToOriginalVertexMap.get(this.newTriangles[i])].vertexToData.get(this.newTriangles[i]).edges.push(this.newTriangles[i + 1]);
        } else {
          this.uniqueVertices[this.newVertexToOriginalVertexMap.get(this.newTriangles[i])].vertexToData.get(this.newTriangles[i]).edges.push(this.newTriangles[i - 2]);
        }
        this.numberOfIndices++;
      }
    }

    private fillVertexMap(selection: number[]): void {
      for (let selectedVertex of selection) {
        for (let [vertexIndex, data] of this.uniqueVertices[selectedVertex].vertexToData) {
          this.vertexToUniqueVertexMap.set(vertexIndex, selectedVertex);
        }
      }
    }

    /*
      remove the interior edges, i.e. the duplicate edges in opposite directions
    */
    private removeInteriorEdges(edges: {start: number, end: number}[]): void {
      for (let i: number = 0; i < edges.length; i++) {
        for (let j: number = 0; j < edges.length; j++) {
          if (i === j) 
            continue;
          if (edges[i].start === edges[j].end && edges[j].start === edges[i].end) {
            if (j > i) {
              edges.splice(j, 1);
              edges.splice(i, 1);
            } else {
              edges.splice(i, 1);
              edges.splice(j, 1);
            }
          }
        }
      }
    }

    // remove duplicate edges with different indices
    private removeDuplicateEdges(edges: {start: number, end: number}[]): void {
      for (let i: number = 0; i < edges.length; i++) {
        for (let j: number = 0; j < edges.length; j++) {
          if (i === j) 
            continue;
          let edgeStartI: number = this.vertexToUniqueVertexMap.get(edges[i].start);
          let edgeStartJ: number = this.vertexToUniqueVertexMap.get(edges[j].start);
          let edgeEndI: number = this.vertexToUniqueVertexMap.get(edges[i].end);
          let edgeEndJ: number = this.vertexToUniqueVertexMap.get(edges[j].end);
          if (
            ((edgeStartI === edgeStartJ && edgeEndI === edgeEndJ) || 
              (edgeStartI === edgeEndJ && edgeEndI === edgeStartJ)) && 
            (!((edges[i].start === edges[j].start && edges[i].end === edges[j].end) || 
              (edges[i].start === edges[j].end && edges[i].end === edges[j].start)))) {
            edges.splice(j, 1);
          }
        }
      }
    }

  }
}