namespace Fudge {
  export class MeshExtrude {
    private numberOfFaces: number;
    private vertexCount: number;
    private uniqueVertices: UniqueVertex[];
    private newTriangles: number[] = [];
    private numberOfIndices: number;
    private newVertexToOriginalVertexMap: Map<number, number> = new Map();
    private originalVertexToNewVertexMap: Map<number, number> = new Map();
    private vertexToUniqueVertexMap: Map<number, number> = new Map();
    private vertices: Float32Array;
    private originalVertexToNewUniqueVertexMap: Map<number, number> = new Map();

    constructor(_numberOfFaces: number, _vertices: Float32Array, _uniqueVertices: UniqueVertex[], _numberOfIndices: number) {
      this.numberOfFaces = _numberOfFaces;
      this.vertexCount = _vertices.length / ModifiableMesh.vertexSize;
      this.uniqueVertices = _uniqueVertices;
      this.numberOfIndices = _numberOfIndices;
      this.vertices = _vertices;
    }

    public extrude(selection: number[]): number[] {
      this.fillVertexMap(selection);
      let edges: {start: number, end: number}[] = this.findEdgesFromData(selection);
      let faceToEdgesMap: Map<number, {edge: {start: number, end: number}, index: number}[]> = this.getInnerEdges(edges);
      let edgesToRemove: number[] = this.findEdgesToRemove(faceToEdgesMap, edges);

      for (let edgeToRemove of edgesToRemove) {
        edges.splice(edgeToRemove, 1);
      }

      this.removeDuplicateEdges(edges, faceToEdgesMap);

      let result: number[] = [];
      // extrude all the edges
      for (let edge of edges) {
        this.extrudeEdge([edge.start, edge.end]);
        result.push(edge.start);
      }

      this.addFrontFaces(faceToEdgesMap);
      this.addNewTriangles();
      return result;
    }

    /*
      loop over the stored (half-)edges and finds the correct ones  
    */
    private findEdgesFromData(selection: number[]): {start: number, end: number}[] {
      let edges: {start: number, end: number}[] = [];

      for (let [vertexIndex, uniqueIndex] of this.vertexToUniqueVertexMap) {
        for (let endPoint of this.uniqueVertices[uniqueIndex].vertexToData.get(vertexIndex).edges) {
          let isAddable: boolean = false;
          for (let vertex of selection) {
            if (vertex === this.vertexToUniqueVertexMap.get(endPoint))
              isAddable = true;
          }

          if (isAddable) {
            edges.push({start: vertexIndex, end: endPoint});
          }
        }
      }

      this.removeInteriorEdges(edges);
      return edges;
    }

    private extrudeEdge(selection: number[]): number[] {
      let newTriangles: Array<number> = [];
      let reverseVertices: Map<number, number> = new Map();
      let iterator: number = 0;
      for (let vertex of selection) {
        let vertexArrayIndex: number = this.vertexToUniqueVertexMap.get(vertex);
        this.uniqueVertices[vertexArrayIndex].vertexToData.set(this.vertexCount + iterator, {indices: [], face: this.numberOfFaces, edges: []});
        this.newVertexToOriginalVertexMap.set(this.vertexCount + iterator, vertexArrayIndex);
        if (!this.originalVertexToNewUniqueVertexMap.has(vertexArrayIndex)) {
          let newVertex: UniqueVertex = new UniqueVertex(
            new ƒ.Vector3(this.uniqueVertices[vertexArrayIndex].position.x, this.uniqueVertices[vertexArrayIndex].position.y, this.uniqueVertices[vertexArrayIndex].position.z), 
            new Map([[this.vertexCount + iterator + selection.length, {indices: [], face: this.numberOfFaces, edges: []}]]));
          this.newVertexToOriginalVertexMap.set(this.vertexCount + iterator + selection.length, this.uniqueVertices.length);
          this.originalVertexToNewUniqueVertexMap.set(vertexArrayIndex, this.uniqueVertices.length);
          this.uniqueVertices.push(newVertex);
        } else {
          this.uniqueVertices[this.originalVertexToNewUniqueVertexMap.get(vertexArrayIndex)].vertexToData.set(this.vertexCount + iterator + selection.length, {indices: [], face: this.numberOfFaces, edges: []});
          this.newVertexToOriginalVertexMap.set(this.vertexCount + iterator + selection.length, this.originalVertexToNewUniqueVertexMap.get(vertexArrayIndex)); // this.newVertexToOriginalVertexMap.get(this.originalVertexToNewVertexMap.get(vertex)));
        }
        this.originalVertexToNewVertexMap.set(vertex, this.vertexCount + iterator + selection.length);
        reverseVertices.set(vertexArrayIndex, this.vertexCount + iterator);
        iterator++;
      }
      this.vertexCount += 4;
      this.numberOfFaces++;

      // a, a + n, b + n
      this.newTriangles.push(reverseVertices.get(this.vertexToUniqueVertexMap.get(selection[0])));
      this.newTriangles.push(this.originalVertexToNewVertexMap.get(selection[0]));
      this.newTriangles.push(this.originalVertexToNewVertexMap.get(selection[1]));
      // a, b + n, b
      this.newTriangles.push(reverseVertices.get(this.vertexToUniqueVertexMap.get(selection[0])));
      this.newTriangles.push(this.originalVertexToNewVertexMap.get(selection[1]));
      this.newTriangles.push(reverseVertices.get(this.vertexToUniqueVertexMap.get(selection[1])));

      return newTriangles;
    }

    /*
      update the indices and edges of the newly created vertices according to the data in the newTriangles array
    */
    private addNewTriangles(): void {
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

    private getInnerEdges(edges: {start: number, end: number}[]): Map<number, {edge: {start: number, end: number}, index: number}[]> {
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
              for (let edgesOfFace of faceToEdgesMap.get(faceOfEdge1)) {
                if (edgesOfFace.edge === edges[j]) {
                  isAlreadyInDict = true;
                }
              }
            }

            if (isAlreadyInDict)
              continue;

            faceToEdgesMap.get(faceOfEdge1).push({edge: edges[j], index: j});
          }
        }
      } 
      return faceToEdgesMap;
    }

    /*
      remove the edges surrounding a face and invert the edges of the face
    */
    private findEdgesToRemove(faceToEdgesMap: Map<number, {edge: {start: number, end: number}, index: number}[]>, edges: {start: number, end: number}[]): number[] {
      let edgesToRemove: number[] = [];
      for (let [face, edgesOfFace] of faceToEdgesMap) {
        if (edgesOfFace.length === 4) {
          for (let edgeOfFace of edgesOfFace) {
            for (let i: number = 0; i < edges.length; i++) {
              if ((this.areEdgesDuplicate(edges[i], edgeOfFace.edge)) && edges[i] !== edgeOfFace.edge) {
                edgesToRemove.push(i);
              }
            }
            // test this
            let oldStart: number = edges[edgeOfFace.index].start;
            edges[edgeOfFace.index].start = edges[edgeOfFace.index].end;
            edges[edgeOfFace.index].end = oldStart;
          }
        }
      }
      edgesToRemove.sort((a, b) => b - a);
      return edgesToRemove;
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

    /*
      i and j are found randomly for single faces, maybe add some functionality to make the user swap normals
    */
    private removeDuplicateEdges(edges: {start: number, end: number}[], faceToEdgesMap: Map<number, {edge: {start: number, end: number}, index: number}[]>): void {
      let edgesToRemove: number[] = [];
      let duplicateEdges: Set<number> = new Set();
      for (let i: number = 0; i < edges.length; i++) {
        for (let j: number = 0; j < edges.length; j++) {
          if (i === j) 
            continue;
          if (this.areEdgesDuplicate(edges[i], edges[j])) {
            if (duplicateEdges.has(i) || duplicateEdges.has(j))
              continue;

            let iIsPartOfFace: boolean = false;
            for (let [face, edgesOfFace] of faceToEdgesMap) {
              for (let edgeOfFace of edgesOfFace) {
                if (edgeOfFace.edge === edges[i]) {
                  iIsPartOfFace = true;
                }
              }
            }
            // maybe change this to:
            // edgesToRemove.push(j);
            // duplicateEdges.add(i);

            // if (iIsPartOfFace) {
            //   let oldStart: number = edges[i].start;
            //   edges[i].start = edges[i].end;
            //   edges[i].end = oldStart;
            // } 

            if (iIsPartOfFace) {
              edgesToRemove.push(i);
              duplicateEdges.add(j);
            } else {
              edgesToRemove.push(j);
              duplicateEdges.add(i);
            }
          }
        }
      }
      edgesToRemove.sort((a, b) => b - a);

      for (let edgeToRemove of edgesToRemove) {
        edges.splice(edgeToRemove, 1);
      }
    }

    /*
      add the front face at the end incase a full face is selected
      TODO: check if this really works if multiple faces are selected
    */
    private addFrontFaces(faceToEdgesMap: Map<number, {edge: {start: number, end: number}, index: number}[]>): void {
      let vertices: number[] = [];
      for (let [face, edgesOfFace] of faceToEdgesMap) {
        if (edgesOfFace.length === 4) {
          for (let edgeOfFace of edgesOfFace) {
            vertices.push(edgeOfFace.edge.start);
          }
        }
      }
      for (let vertex of vertices) {
        let originalVertexToData: {indices: number[], face?: number, edges?: number[]} = this.uniqueVertices[this.vertexToUniqueVertexMap.get(vertex)].vertexToData.get(vertex);
        this.uniqueVertices[this.originalVertexToNewUniqueVertexMap.get(this.vertexToUniqueVertexMap.get(vertex))].vertexToData.set(vertex, {indices: originalVertexToData.indices, face: originalVertexToData.face, edges: originalVertexToData.edges});
        this.uniqueVertices[this.vertexToUniqueVertexMap.get(vertex)].vertexToData.delete(vertex);
      }

    }

    private areEdgesDuplicate(edge1: {start: number, end: number}, edge2: {start: number, end: number}): boolean {
      return (this.vertexToUniqueVertexMap.get(edge1.start) === this.vertexToUniqueVertexMap.get(edge2.start) && 
              this.vertexToUniqueVertexMap.get(edge1.end) === this.vertexToUniqueVertexMap.get(edge2.end)) || 
             (this.vertexToUniqueVertexMap.get(edge1.start) === this.vertexToUniqueVertexMap.get(edge2.end) && 
              this.vertexToUniqueVertexMap.get(edge1.end) === this.vertexToUniqueVertexMap.get(edge2.start));
    }
  }
}