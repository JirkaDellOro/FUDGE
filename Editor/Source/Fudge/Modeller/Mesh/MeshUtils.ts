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
      let iterator: number = 0;
      for (let vertex of vertices) {
        let originalVertexToData: {indices: number[], face?: number, edges?: number[]} = this.uniqueVertices[this.vertexToUniqueVertexMap.get(vertex)].vertexToData.get(vertex);
        this.uniqueVertices[this.originalVertexToNewUniqueVertexMap.get(this.vertexToUniqueVertexMap.get(vertex))].vertexToData.set(vertex, {indices: originalVertexToData.indices, face: originalVertexToData.face, edges: originalVertexToData.edges});
        this.uniqueVertices[this.vertexToUniqueVertexMap.get(vertex)].vertexToData.delete(vertex);
      }

    }

    /*
      loops over the selection and adds a new vertex for every selected vertex
      which new vertex belongs to which original vertex is then stored in an object and returned for further processing
      faceVertices: key = vertexIndex, value = uniqueVertexIndex
      this was a quick hack to extrude a face (instead of single edges)
      we don't need this anymore since we now use the same algorithm for both cases and just alter the front face at the end
    */
   private getNewVertices(selectedVertices: Array<number>): {vertexToUniqueVertex: Map<number, number>, reverse: Map<number, number[]>, originalToNewVertex: Map<number, number>} {       
    let originalLength: number = this.uniqueVertices.length;
    // use an index here to take care of ordering
    let iterator: number = 0;
    let vertexToUniqueVertex: Map<number, number> = new Map();
    let reverse: Map<number, number[]> = new Map();
    let originalToNewVertexMap: Map<number, number> = new Map();
    let originalVertexCount: number = this.vertexCount;
    let newVertices: UniqueVertex[] = [];
    let newVertexToFrontVertexMap: Map<UniqueVertex, number> = new Map();
    let selectedVertexToNewVertexMap: Map<number, number> = new Map();

    for (let selectedVertex of selectedVertices) {
      // get the indices from the original face; they will be deleted later
      let originalvertexToData: {indices: number[], face?: number, edges?: number[]} = this.uniqueVertices[this.vertexToUniqueVertexMap.get(selectedVertex)].vertexToData.get(selectedVertex);
      let newVertex: UniqueVertex = new UniqueVertex(new ƒ.Vector3(this.vertices[selectedVertex * ModifiableMesh.vertexSize + 0], this.vertices[selectedVertex * ModifiableMesh.vertexSize + 1], this.vertices[selectedVertex * ModifiableMesh.vertexSize + 2]), new Map());
      
      reverse.set(selectedVertex, []);
      let lengthOffset: number = selectedVertices.length;
      // one index is added for the new vertex for every index of the original vertex
      for (let i: number = 0; i < 3; i++) {
        newVertex.vertexToData.set(this.vertexCount + iterator + lengthOffset, {indices: [], edges: []});
        vertexToUniqueVertex.set(this.vertexCount + iterator + lengthOffset, originalLength + iterator);
        reverse.get(selectedVertex).push(this.vertexCount + iterator + lengthOffset);
        lengthOffset += selectedVertices.length;
      }
      // add one more set of vertices to the original face
      this.uniqueVertices[this.vertexToUniqueVertexMap.get(selectedVertex)].vertexToData.set(this.vertexCount + iterator, {indices: [], edges: []});
      vertexToUniqueVertex.set(this.vertexCount + iterator, this.vertexToUniqueVertexMap.get(selectedVertex));
      originalToNewVertexMap.set(selectedVertex, this.vertexCount + iterator);
      this.originalVertexToNewVertexMap.set(selectedVertex, this.vertexCount + iterator);
      this.originalVertexToNewUniqueVertexMap.set(this.vertexToUniqueVertexMap.get(selectedVertex), this.uniqueVertices.length);

      // the new front face has the indices of the original face
      newVertex.vertexToData.get(originalVertexCount + iterator + selectedVertices.length).indices = originalvertexToData.indices;
      newVertex.vertexToData.get(originalVertexCount + iterator + selectedVertices.length).edges = originalvertexToData.edges;
      newVertex.vertexToData.get(originalVertexCount + iterator + selectedVertices.length).face = originalvertexToData.face;
      newVertexToFrontVertexMap.set(newVertex, originalVertexCount + iterator + selectedVertices.length);
      selectedVertexToNewVertexMap.set(selectedVertex, originalVertexCount + iterator + selectedVertices.length);

      // the old front face is deleted
      vertexToUniqueVertex.set(selectedVertex, this.vertexToUniqueVertexMap.get(selectedVertex));
      this.uniqueVertices[this.vertexToUniqueVertexMap.get(selectedVertex)].vertexToData.set(selectedVertex, {indices: [], edges: []});
      
      this.uniqueVertices.push(newVertex);
      newVertices.push(newVertex);
      iterator++;
    }

    // add the edges of the new front face
    for (let newVertex of newVertices) {
      let edgesOfNewVertex: number[] = newVertex.vertexToData.get(newVertexToFrontVertexMap.get(newVertex)).edges;
      for (let i: number = 0; i < edgesOfNewVertex.length; i++) {
        edgesOfNewVertex[i] = selectedVertexToNewVertexMap.get(edgesOfNewVertex[i]);
      }
    }

    this.vertexCount += 4 * selectedVertices.length;
    return {vertexToUniqueVertex: vertexToUniqueVertex, reverse: reverse, originalToNewVertex: originalToNewVertexMap};
  }


    private addIndicesToNewVertices(edges: {start: number, end: number}[], mapping: {vertexToUniqueVertex: Map<number, number>, reverse: Map<number, number[]>, originalToNewVertex: Map<number, number>}): void {
      let vertexToUniqueVertexMap: Map<number, number> = mapping.vertexToUniqueVertex;
      let reverse: Map<number, number[]> = mapping.reverse;
      let originalToNewVertex: Map<number, number> = mapping.originalToNewVertex;
      let isLowMap: Map<number, boolean> = new Map();

      let newTriangles: Array<{index: number, face: number}> = [];

      for (let edge of edges) {
        let aPlusNArray: number[] = reverse.get(edge.start);
        let bPlusNArray: number[] = reverse.get(edge.end);
        let a: number;
        let b: number;
        let aPlusN: number;
        let bPlusN: number;

        if (isLowMap.get(edge.start) || isLowMap.get(edge.end)) {
          a = originalToNewVertex.get(edge.start);
          b = originalToNewVertex.get(edge.end);
          aPlusN = aPlusNArray[2];
          bPlusN = bPlusNArray[2];
          isLowMap.set(edge.start, false);
          isLowMap.set(edge.end, false);  
        } else {
          a = edge.start;
          b = edge.end;
          aPlusN = aPlusNArray[1];
          bPlusN = bPlusNArray[1];
          isLowMap.set(edge.start, true);
          isLowMap.set(edge.end, true);  
        }
        newTriangles.push({index: a, face: this.numberOfFaces});
        newTriangles.push({index: b, face: this.numberOfFaces});
        newTriangles.push({index: bPlusN, face: this.numberOfFaces});
        newTriangles.push({index: bPlusN, face: this.numberOfFaces});
        newTriangles.push({index: aPlusN, face: this.numberOfFaces});
        newTriangles.push({index: a, face: this.numberOfFaces});
        this.numberOfFaces++;
      }

      for (let i: number = 0; i < newTriangles.length; i++) {
        this.uniqueVertices[vertexToUniqueVertexMap.get(newTriangles[i].index)].vertexToData.get(newTriangles[i].index).indices.push(this.numberOfIndices);
        this.uniqueVertices[vertexToUniqueVertexMap.get(newTriangles[i].index)].vertexToData.get(newTriangles[i].index).face = newTriangles[i].face;
        if (this.numberOfIndices % 3 !== 2) {
          this.uniqueVertices[vertexToUniqueVertexMap.get(newTriangles[i].index)].vertexToData.get(newTriangles[i].index).edges.push(newTriangles[i + 1].index);
        } else {
          this.uniqueVertices[vertexToUniqueVertexMap.get(newTriangles[i].index)].vertexToData.get(newTriangles[i].index).edges.push(newTriangles[i - 2].index);
        }
        this.numberOfIndices++;
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