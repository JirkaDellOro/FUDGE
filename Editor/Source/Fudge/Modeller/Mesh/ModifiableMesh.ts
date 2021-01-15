namespace Fudge {
  export class ModifiableMesh extends ƒ.Mesh {
    public static readonly vertexSize: number = ƒ.Mesh.getBufferSpecification().size;
    private _uniqueVertices: UniqueVertex[];

    constructor() {
      super();

      this._uniqueVertices = [
        new UniqueVertex(new ƒ.Vector3(-1, 1, 1),   new Map([[0, {indices: [2, 5], face: 0, edges: [1, 2]}], [8, {indices: [22], face: 2, edges: [12]}], [16, {indices: [31], face: 5, edges: [19]}]])),
        new UniqueVertex(new ƒ.Vector3(-1, -1, 1),  new Map([[1, {indices: [0], face: 0, edges: [2]}], [9, {indices: [19, 21], face: 2, edges: [8, 12]}], [17, {indices: [26, 29], face: 4, edges: [21, 22]}]])), 
        new UniqueVertex(new ƒ.Vector3(1, -1, 1),   new Map([[2, {indices: [1, 3], face: 0, edges: [0, 3]}], [10, {indices: [12], face: 3, edges: [14]}], [18, {indices: [28], face: 4, edges: [17]}]])), 
        new UniqueVertex(new ƒ.Vector3(1, 1, 1),    new Map([[3, {indices: [4], face: 0, edges: [0]}], [11, {indices: [14, 17], face: 3, edges: [10, 14]}], [19, {indices: [32, 35], face: 5, edges: [20, 23]}]])), 
        new UniqueVertex(new ƒ.Vector3(-1, 1, -1),  new Map([[4, {indices: [10], face: 1, edges: [7]}], [12, {indices: [20, 23], face: 2, edges: [9, 13]}], [20, {indices: [30, 34], face: 5, edges: [16, 19]}]])), 
        new UniqueVertex(new ƒ.Vector3(-1, -1, -1), new Map([[5, {indices: [7, 9], face: 1, edges: [4, 7]}], [13, {indices: [18], face: 2, edges: [9]}], [21, {indices: [24], face: 4, edges: [22]}]])), 
        new UniqueVertex(new ƒ.Vector3(1, -1, -1),  new Map([[6, {indices: [6], face: 1, edges: [5]}], [14, {indices: [13, 15], face: 3, edges: [11, 15]}], [22, {indices: [25, 27], face: 4, edges: [17, 18]}]])), 
        new UniqueVertex(new ƒ.Vector3(1, 1, -1),   new Map([[7, {indices: [8, 11], face: 1, edges: [5, 6]}], [15, {indices: [16], face: 3, edges: [11]}], [23, {indices: [33], face: 5, edges: [20]}]])) 
      ];

      // this._uniqueVertices = [
      //   new UniqueVertex(new ƒ.Vector3(-1, 1, 1),   new Map([[0, [2, 5]], [8, [22]], [16, [31]]])),
      //   new UniqueVertex(new ƒ.Vector3(-1, -1, 1),  new Map([[1, [0]], [9, [19, 21]], [17, [26, 29]]])), 
      //   new UniqueVertex(new ƒ.Vector3(1, -1, 1),   new Map([[2, [1, 3]], [10, [12]], [18, [28]]])), 
      //   new UniqueVertex(new ƒ.Vector3(1, 1, 1),    new Map([[3, [4]], [11, [14, 17]], [19, [32, 35]]])), 
      //   new UniqueVertex(new ƒ.Vector3(-1, 1, -1),  new Map([[4, [10]], [12, [20, 23]], [20, [30, 34]]])), 
      //   new UniqueVertex(new ƒ.Vector3(-1, -1, -1), new Map([[5, [7, 9]], [13, [18]], [21, [24]]])), 
      //   new UniqueVertex(new ƒ.Vector3(1, -1, -1),  new Map([[6, [6]], [14, [13, 15]], [22, [25, 27]]])), 
      //   new UniqueVertex(new ƒ.Vector3(1, 1, -1),   new Map([[7, [8, 11]], [15, [16]], [23, [33]]])) 
      // ];

      // TODO: maybe get around looping at bit less here
      for (let vertex of this._uniqueVertices) {
        vertex.position.x = vertex.position.x / 2;
        vertex.position.y = vertex.position.y / 2;
        vertex.position.z = vertex.position.z / 2;
      }

      this.create();
    }

    public get uniqueVertices(): UniqueVertex[] {
      return this._uniqueVertices;
    }

    public getState(): string {
      let serializable: Array<Object> = [];
      for (let vertex of this._uniqueVertices) {
        let vertexSerialization: any = {};
        vertexSerialization.position = [vertex.position.x, vertex.position.y, vertex.position.z];
        let indicesSerialized: Array<Object> = [];
        for (let index of vertex.vertexToData.keys()) {
          indicesSerialized.push({
            vertexIndex: index,
            triangleIndices: vertex.vertexToData.get(index).indices,
            faceIndex: vertex.vertexToData.get(index).face
          });
        } 
        vertexSerialization.indices = indicesSerialized;
        serializable.push(vertexSerialization);
      }
      return JSON.stringify(serializable);
    }

    public retrieveState(state: string): void {
      let data: Array<any> = JSON.parse(state);
      let result: Array<UniqueVertex> = [];
      for (let vertex of data) {
        let position: ƒ.Vector3 = new ƒ.Vector3(vertex.position[0], vertex.position[1], vertex.position[2]);
        let indicesMap: Map<number, {indices: number[], face?: number}> = new Map();
        for (let indices of vertex.indices) {
          indicesMap.set(indices.vertexIndex, {indices: indices.triangleIndices, face: indices.faceIndex});
        }
        let uniqueVertex: UniqueVertex = new UniqueVertex(position, indicesMap);
        result.push(uniqueVertex);
      }
      this._uniqueVertices = result;
      this.create();
      console.log(result);
    }

    // TODO: use proper typing here
    public export(): string {
      let serialization: Object = {
        vertices: Array.from(this.vertices),
        indices: Array.from(this.indices),
        normals: Array.from(this.normalsFace),
        textureCoordinates: Array.from(this.textureUVs)
      };
      return JSON.stringify(serialization, null, 2);
    }

    public updateMesh(): void {
      this.vertices = this.createVertices();
      this.normalsFace = this.createFaceNormals();
      this.createRenderBuffers();
    }

    public getCentroid(selection: number[] = Array.from(Array(this.uniqueVertices.length).keys())): ƒ.Vector3 {
      let sum: ƒ.Vector3 = new ƒ.Vector3();
      let numberOfVertices: number = 0;
      for (let index of selection) {
        sum.x += (this._uniqueVertices[index].position.x * this._uniqueVertices[index].vertexToData.size);
        sum.y += (this._uniqueVertices[index].position.y * this._uniqueVertices[index].vertexToData.size);
        sum.z += (this._uniqueVertices[index].position.z * this._uniqueVertices[index].vertexToData.size);
        numberOfVertices += this._uniqueVertices[index].vertexToData.size;
      }
      sum.x /= numberOfVertices;
      sum.y /= numberOfVertices;
      sum.z /= numberOfVertices;
      return sum;
    }

    public removeFace(selection: number[]): void {
      let starttime: number = new Date().getTime();
      let correctVertices: Map<number, number> = this.findCorrectFaceWithoutNormals(selection);
      let removedIndices: number[] = [];
      for (let vertex of correctVertices.keys()) {
        let result: number[] = this._uniqueVertices[correctVertices.get(vertex)].vertexToData.get(vertex).indices;
        removedIndices.push(...result);
        this._uniqueVertices[correctVertices.get(vertex)].vertexToData.delete(vertex);
      }
      removedIndices.sort();
      for (let vertex of this._uniqueVertices) {
        let tempMap: Map<number, {indices: number[], face?: number}> = new Map(vertex.vertexToData);
        //let keys: IterableIterator<number> = vertex.indices.keys();
        for (let [vertexIndex, indicesIndex] of tempMap) {
          for (let i: number = 0; i < indicesIndex.indices.length; i++) {
            let index: number = indicesIndex.indices[i];
            let subtraction: number = 0;
            for (let removedIndex of removedIndices) {
              if (removedIndex < index) 
                subtraction++;
            }
            index -= subtraction;
            indicesIndex.indices[i] = index;
          }

          let vertexSubtraction: number = 0;
          for (let removedVertex of correctVertices.keys()) {
            if (removedVertex < vertexIndex) 
              vertexSubtraction++;
          }

          if (vertexSubtraction != 0) {
            let indicesTemp: {indices: number[], face?: number} = indicesIndex;
            vertex.vertexToData.delete(vertexIndex);
            vertex.vertexToData.set(vertexIndex - vertexSubtraction, indicesTemp);
          }
        }
      }
      this.vertices = this.createVertices();
      this.indices = this.createIndices();
      this.normalsFace = this.calculateFaceNormals();
      this.createRenderBuffers();
      
      console.log(new Date().getTime() - starttime);
    }

    public updateNormals(): void {
      this.normalsFace = this.createFaceNormals();
      this.createRenderBuffers();
    }

    public scaleBy(matrix: ƒ.Matrix4x4, oldVertices: Map<number, ƒ.Vector3>, centroid: ƒ.Vector3, selection: number[] = Array.from(Array(this.uniqueVertices.length).keys())): void {
      // let centroid: ƒ.Vector3 = this.getCentroid(selection);
      for (let vertexIndex of selection) {
        let currentVertex: ƒ.Vector3 = oldVertices.get(vertexIndex);
        let newVertex: ƒ.Vector3 = new ƒ.Vector3(currentVertex.x - centroid.x, currentVertex.y - centroid.y, currentVertex.z - centroid.z);
        newVertex.transform(matrix);
        newVertex.x += centroid.x;
        newVertex.y += centroid.y;
        newVertex.z += centroid.z;
        console.log("new vertex: " + newVertex);
        console.log("old vertex: " + currentVertex);
        console.log("matrix: " + matrix);
        console.log("centroid: " + centroid);
        this._uniqueVertices[vertexIndex].position = newVertex;
      }
      this.vertices = this.createVertices();
      this.createRenderBuffers();
    }

    public translateVertices(difference: ƒ.Vector3, selection: number[]): void {
      for (let vertexIndex of selection) {
        this._uniqueVertices[vertexIndex].position.add(difference);
      }
      this.vertices = this.createVertices();
      this.createRenderBuffers();
    }

    public rotateBy(matrix: ƒ.Matrix4x4, center: ƒ.Vector3, selection: number[] = Array.from(Array(this.uniqueVertices.length).keys())): void {
      // TODO: actually rotate around world coordinates here
      for (let vertexIndex of selection) {
        let newVertexPos: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(this.uniqueVertices[vertexIndex].position, center);
        newVertexPos.transform(matrix);
        this.uniqueVertices[vertexIndex].position = ƒ.Vector3.SUM(newVertexPos, center);
      }
      this.vertices = this.createVertices();
      // this.updateNormals(this.findOrderOfTrigonFromSelectedVertex(selection));
      this.createRenderBuffers();
    }


    // double clicking makes normal caclulation impossible right now because old and new vertices are at the same position, maybe add some small increment initially?
    public extrude(selectedIndices: number[]): number[] {
      let meshUtils: MeshUtils = new MeshUtils(this.countNumberOfFaces(), this.vertices.length / ModifiableMesh.vertexSize, this._uniqueVertices, this.indices.length, this.vertices);
      // we prolly need to fix this for selection.length == 2
      meshUtils.extrude(selectedIndices);

      // switch (selectedIndices.length) {
      //   case 4:
      //     let faceVertices: Map<number, number> = this.findCorrectFaceWithoutNormals(selectedIndices);
      //     this.addIndicesToNewVertices(this.findEdgesFrom(faceVertices), this.getNewVertices(faceVertices));
      //     break;
      //   default:
      //     let meshUtils: MeshUtils = new MeshUtils(this.countNumberOfFaces(), this.vertices.length / ModifiableMesh.vertexSize, this._uniqueVertices, this.indices.length, this.vertices);
      //     // we prolly need to fix this for selection.length == 2
      //     meshUtils.extrude(selectedIndices);
      //     // meshUtils.extrudeEdge(selectedIndices);
      //     // meshUtils.addNewTriangles();

      //     //this.extrude3Vertices(selectedIndices);
      //     break;
      // }
      this.vertices = this.createVertices();
      this.indices = this.createIndices();

      let newSelection: number[] = [];
      for (let i: number = 0; i < selectedIndices.length; i++) 
        newSelection.push(this.uniqueVertices.length - selectedIndices.length + i);

      // let trigons: Array<Array<number>> = this.findOrderOfTrigonFromSelectedVertex(newSelection);
      // this.updateNormals(trigons);
      console.log(this.uniqueVertices);

      this.createRenderBuffers();
      return newSelection;
    }

    public updatePositionOfVertices(selectedIndices: number[], oldVertexPositions: Map<number, ƒ.Vector3>, diffToOldPosition: ƒ.Vector3, offset: ƒ.Vector3): void {
      if (!selectedIndices) 
        return;
      
      for (let selection of selectedIndices) {
        let currentVertex: ƒ.Vector3 = oldVertexPositions.get(selection);
        this.updatePositionOfVertex(selection, new ƒ.Vector3(currentVertex.x + diffToOldPosition.x - offset.x, currentVertex.y + diffToOldPosition.y - offset.y, currentVertex.z + diffToOldPosition.z - offset.z));
      }

      // let trigons: Array<number> = this.findOrderOfTrigonFromSelectedVertex(selectedIndices);
      // this.updateNormals(trigons);
      this.createRenderBuffers();
    }

    private findEdgesNew(selection: number[]): {start: number, end: number}[] {
      let pickedIndices: boolean[] = new Array(this.indices.length).fill(false);
      let vertexToOriginalVertexMap: Map<number, number> = new Map();
      let indexToVertexMap: Map<number, number> = new Map();
      for (let selectedVertex of selection) {
        for (let [vertexIndex, data] of this._uniqueVertices[selectedVertex].vertexToData) {
          vertexToOriginalVertexMap.set(vertexIndex, selectedVertex);
          for (let index of data.indices) {
            pickedIndices[index] = true;
            indexToVertexMap.set(index, vertexIndex);
          }
        }
      }
      while (pickedIndices.length % 3 !== 0) {
        pickedIndices.push(false);
      }
      let edges: {start: number, end: number}[] = [];

      for (let index: number = 0; index < pickedIndices.length; index++) {
        // if (index % 3 === 2) {
        //   if (pickedIndices[index] && pickedIndices[index - 2]) {
        //     addEdge(index - 2, index);
        //   }
        // }
        if (index % 3 !== 2) {
          if (pickedIndices[index] && pickedIndices[index + 1]) {
            addEdge(index, index + 1);
          }
        }
      }

      // quick hack
      for (let edge of edges) {
        edge.start = vertexToOriginalVertexMap.get(edge.start);
        edge.end = vertexToOriginalVertexMap.get(edge.end);
      }

      return edges;

      function getUniqueVertexFromIndex(index: number): number {
        return vertexToOriginalVertexMap.get(indexToVertexMap.get(index));
      }

      function getVertexFromIndex(index: number): number {
        return indexToVertexMap.get(index);
      }

      function addEdge(start: number, end: number): void {
        let isAddable: boolean = true;
        for (let i: number = 0; i < edges.length; i++) {
          // delete the reverse (interior) edges
          if (edges[i].end === getVertexFromIndex(start) && edges[i].start === getVertexFromIndex(end)) {
            edges.splice(i, 1);
            isAddable = false;
          }
          // don't add duplicate edges of a different face again
          if ((edges[i].start === getUniqueVertexFromIndex(start) && edges[i].end === getUniqueVertexFromIndex(end)) ||
          (edges[i].end === getUniqueVertexFromIndex(start) && edges[i].start === getUniqueVertexFromIndex(end))) {
            isAddable = false;
          }
        }
        if (isAddable) {
          edges.push({start: getVertexFromIndex(start), end: getVertexFromIndex(end)});
        }
      }
    }

    private extrude3Vertices(selection: number[]): void {
      let meshUtils: MeshUtils = new MeshUtils(this.countNumberOfFaces(), this.vertices.length / ModifiableMesh.vertexSize, this._uniqueVertices, this.indices.length, this.vertices);
      meshUtils.extrude(selection);
      // let edges: {start: number, end: number}[] = meshUtils.findEdgesFromData(selection);
      // for (let edge of edges) {
      //   meshUtils.extrudeEdge([edge.start, edge.end]);
      // }
      // meshUtils.addNewTriangles();
    }
    
    private addIndicesToNewVertices(edges: {start: number, end: number}[], mapping: {vertexToUniqueVertex: Map<number, number>, reverse: Map<number, number[]>, originalToNewVertex: Map<number, number>}): void {
      let vertexToUniqueVertexMap: Map<number, number> = mapping.vertexToUniqueVertex;
      let reverse: Map<number, number[]> = mapping.reverse;
      let originalToNewVertex: Map<number, number> = mapping.originalToNewVertex;
      let isLowMap: Map<number, boolean> = new Map();

      let numberOfFaces: number = this.countNumberOfFaces();
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
        newTriangles.push({index: a, face: numberOfFaces});
        newTriangles.push({index: b, face: numberOfFaces});
        newTriangles.push({index: bPlusN, face: numberOfFaces});
        newTriangles.push({index: bPlusN, face: numberOfFaces});
        newTriangles.push({index: aPlusN, face: numberOfFaces});
        newTriangles.push({index: a, face: numberOfFaces});
        numberOfFaces++;
      }

      for (let i: number = 0; i < newTriangles.length; i++) {
        this.uniqueVertices[vertexToUniqueVertexMap.get(newTriangles[i].index)].vertexToData.get(newTriangles[i].index).indices.push(this.indices.length + i);
        this.uniqueVertices[vertexToUniqueVertexMap.get(newTriangles[i].index)].vertexToData.get(newTriangles[i].index).face = newTriangles[i].face;
      }
    }

    /*
      loops over the selection and adds a new vertex for every selected vertex
      which new vertex belongs to which original vertex is then stored in an object and returned for further processing
    */
    private getNewVertices(faceVertices: Map<number, number>): {vertexToUniqueVertex: Map<number, number>, reverse: Map<number, number[]>, originalToNewVertex: Map<number, number>} {       
      let originalLength: number = this.uniqueVertices.length;
      // use an index here to take care of ordering
      let iterator: number = 0;
      let vertexToUniqueVertex: Map<number, number> = new Map();
      let reverse: Map<number, number[]> = new Map();
      let originalToNewVertexMap: Map<number, number> = new Map();
      for (let faceVertex of faceVertices.keys()) {
        // get the indices from the original face; they will be deleted later
        let originalvertexToData: {indices: number[], face?: number} = this._uniqueVertices[faceVertices.get(faceVertex)].vertexToData.get(faceVertex);
        let newVertex: UniqueVertex = new UniqueVertex(new ƒ.Vector3(this.vertices[faceVertex * ModifiableMesh.vertexSize + 0], this.vertices[faceVertex * ModifiableMesh.vertexSize + 1], this.vertices[faceVertex * ModifiableMesh.vertexSize + 2]), new Map());
        
        reverse.set(faceVertex, []);
        let lengthOffset: number = faceVertices.size;
        // one index is added for the new vertex for every index of the original vertex
        // TODO make this more general incase not a face is selected
        for (let i: number = 0; i < 3; i++) {
          newVertex.vertexToData.set(this.vertices.length / ModifiableMesh.vertexSize + iterator + lengthOffset, {indices: []});
          vertexToUniqueVertex.set(this.vertices.length / ModifiableMesh.vertexSize + iterator + lengthOffset, originalLength + iterator);
          reverse.get(faceVertex).push(this.vertices.length / ModifiableMesh.vertexSize + iterator + lengthOffset);
          lengthOffset += faceVertices.size;
        }

        // add one more set of vertices to the original face
        this.uniqueVertices[faceVertices.get(faceVertex)].vertexToData.set(this.vertices.length / ModifiableMesh.vertexSize + iterator, {indices: []});
        vertexToUniqueVertex.set(this.vertices.length / ModifiableMesh.vertexSize + iterator, faceVertices.get(faceVertex));
        originalToNewVertexMap.set(faceVertex, this.vertices.length / ModifiableMesh.vertexSize + iterator);

        // the new front face has the indices of the original face
        for (let index of originalvertexToData.indices) {
          newVertex.vertexToData.get(this.vertices.length / ModifiableMesh.vertexSize + iterator + faceVertices.size).indices.push(index);
        }
        newVertex.vertexToData.get(this.vertices.length / ModifiableMesh.vertexSize + iterator + faceVertices.size).face = originalvertexToData.face;
        
        // the old front face is deleted
        vertexToUniqueVertex.set(faceVertex, faceVertices.get(faceVertex));
        this._uniqueVertices[faceVertices.get(faceVertex)].vertexToData.set(faceVertex, {indices: []});

        this.uniqueVertices.push(newVertex);
        iterator++;
      }
      return {vertexToUniqueVertex: vertexToUniqueVertex, reverse: reverse, originalToNewVertex: originalToNewVertexMap};
    }

    /* 
      find the boundary edges from selection
    */
    private findEdgesFrom(selection: Map<number, number>): {start: number, end: number}[] {
      let indices: number[] = [];

      for (let vertex of selection.keys()) {
        let indicesArray: number[] = this.uniqueVertices[selection.get(vertex)].vertexToData.get(vertex).indices;
        for (let index of indicesArray) {
          indices.push(index);
        }
      }
      indices.sort();
      let triangles: number[][] = [];

      for (let i: number = 0; i < indices.length; i += 3) {
        triangles.push([this.indices[indices[(i)]], this.indices[indices[(i + 1)]], this.indices[indices[(i + 2)]]]);
      }
      let edges: {start: number, end: number}[] = [];

      for (let triangle of triangles) {
        for (let i: number = 0; i < triangle.length; i++) {
          let isInObjectReversed: boolean = false;
          let indexOfEdge: number = -1;
          for (let j: number = 0; j < edges.length; j++) {
            if (edges[j].start === triangle[(i + 1) % triangle.length] && edges[j].end === triangle[i]) {
              isInObjectReversed = true;
              indexOfEdge = j;
            }
          }
          if (isInObjectReversed) {
            edges.splice(indexOfEdge, 1);
          } else {
            edges.push({start: triangle[i], end: triangle[(i + 1) % triangle.length]});
          }
        }
      }
      return edges;
    }

    // maybe just store the number of faces somewhere
    private countNumberOfFaces(): number {
      let faces: Set<number> = new Set();
      for (let vertex of this._uniqueVertices) {
        for (let vertexIndex of vertex.vertexToData.keys()) {
          faces.add(vertex.vertexToData.get(vertexIndex).face);
        }
      }
      return faces.size;
    }
    
    private findCorrectFaceWithoutNormals(selectedIndices: number[]): Map<number, number> {
      let faceVerticesMap: Map<number, number> = new Map();
      let faceToVerticesMap: Map<number, Array<{selectedIndex: number, vertexIndex: number}>> = new Map();
       
      for (let selectedIndex of selectedIndices) {
        for (let vertex of this._uniqueVertices[selectedIndex].vertexToData.keys()) {
          if (faceToVerticesMap.has(this._uniqueVertices[selectedIndex].vertexToData.get(vertex).face)) {
            faceToVerticesMap.get(this._uniqueVertices[selectedIndex].vertexToData.get(vertex).face).push({selectedIndex: selectedIndex, vertexIndex: vertex});
          } else {
            faceToVerticesMap.set(this._uniqueVertices[selectedIndex].vertexToData.get(vertex).face, [{selectedIndex: selectedIndex, vertexIndex: vertex}]);
          }
        }
      }
      for (let face of faceToVerticesMap.keys()) {
        if (faceToVerticesMap.get(face).length == selectedIndices.length) {
          for (let indices of faceToVerticesMap.get(face)) {
            faceVerticesMap.set(indices.vertexIndex, indices.selectedIndex);
          }
        }
      } 
      return faceVerticesMap;
    }

    // tslint:disable-next-line: member-ordering
    protected updatePositionOfVertex(vertexIndex: number, newPosition: ƒ.Vector3): void {
      this._uniqueVertices[vertexIndex].position = newPosition;
      for (let index of this._uniqueVertices[vertexIndex].vertexToData.keys()) {
        this.vertices.set([this._uniqueVertices[vertexIndex].position.x, this._uniqueVertices[vertexIndex].position.y, this._uniqueVertices[vertexIndex].position.z], index * ModifiableMesh.vertexSize);
      }
    }    

    /*
      finds the ordering of the trigons by searching for the selected vertex in the indices array
      returns an array with another array which stores the correct ordering
      not used anymore since we just recompute all the normals at the end
    */
    // tslint:disable-next-line: member-ordering
    protected findOrderOfTrigonFromSelectedVertex(selectedIndices: number[]): Array<number> {
      // let trigons: Array<Array<number>> = [];
      let trigons: Array<number> = [];
      for (let selectedIndex of selectedIndices) {
        for (let vertexIndex of this._uniqueVertices[selectedIndex].vertexToData.keys()) {
          for (let indexInIndicesArray of this._uniqueVertices[selectedIndex].vertexToData.get(vertexIndex).indices) {
            // let trigon: Array<number> = [];
            switch (indexInIndicesArray % 3) {
              case 0: 
                trigons.push(this.indices[indexInIndicesArray], this.indices[indexInIndicesArray + 1], this.indices[indexInIndicesArray + 2]);
                break;
              case 1:
                trigons.push(this.indices[indexInIndicesArray - 1], this.indices[indexInIndicesArray], this.indices[indexInIndicesArray + 1]);
                break;
              case 2:
                trigons.push(this.indices[indexInIndicesArray - 2], this.indices[indexInIndicesArray - 1], this.indices[indexInIndicesArray]);
                break;
            }
            // trigons.push(trigon);  
          }
        }
      }
      return trigons;
    }


    // tslint:disable-next-line: member-ordering
    protected createVertices(): Float32Array {
      // TODO maybe don't loop here too somehow?
      let length: number = 0;
      for (let vertex of this._uniqueVertices) {
        length += vertex.vertexToData.size * ModifiableMesh.vertexSize;
      }
      let vertices: Float32Array = new Float32Array(length);
      for (let vertex of this._uniqueVertices) {
        for (let index of vertex.vertexToData.keys()) {
          vertices.set([vertex.position.x, vertex.position.y, vertex.position.z], index * ModifiableMesh.vertexSize);
        }
      }
      return vertices;
    }

    // tslint:disable-next-line: member-ordering
    protected createTextureUVs(): Float32Array {
      let textureUVs: Float32Array = new Float32Array([
        // front
        /*0*/ 0, 0, /*1*/ 0, 1,  /*2*/ 1, 1, /*3*/ 1, 0,
        // back
        /*4*/ 3, 0, /*5*/ 3, 1,  /*6*/ 2, 1, /*7*/ 2, 0,

        // right / left
        /*0,8*/ 0, 0, /*1,9*/ 0, 1, /*2,10*/ 1, 1, /*3,11*/ 1, 0,
        /*4,12*/ -1, 0, /*5,13*/ -1, 1, /*6,14*/ 2, 1, /*7,15*/ 2, 0,

        // bottom / top
        /*0,16*/ 1, 0, /*1,17*/ 1, 1, /*2,18*/ 1, 2,  /*3,19*/ 1, -1,  
        /*4,20*/ 0, 0, /*5,21*/ 0, 1, /*6,22*/ 0, 2, /*7,23*/ 0, -1
      ]);
      return textureUVs;
    }

    // tslint:disable-next-line: member-ordering
    protected createIndices(): Uint16Array {
      // let indices: Uint16Array = new Uint16Array([
      //   // front 0-5
      //   1, 2, 0, 2, 3, 0,
      //   // back 6-11
      //   6, 5, 7, 5, 4, 7,
      //   // right 12-17
      //   2 + 8, 6 + 8, 3 + 8, 6 + 8, 7 + 8, 3 + 8,
      //   // left 18-23
      //   5 + 8, 1 + 8, 4 + 8, 1 + 8, 0 + 8, 4 + 8,
      //   // bottom 24-29
      //   5 + 16, 6 + 16, 1 + 16, 6 + 16, 2 + 16, 1 + 16,
      //   // top 30-35
      //   4 + 16, 0 + 16, 3 + 16, 7 + 16, 4 + 16, 3 + 16
      // ]);

      let indexArray: number[] = [];
      for (let vertex of this._uniqueVertices) {
        for (let index of vertex.vertexToData.keys()) {
          let array: number[] = vertex.vertexToData.get(index).indices;
          for (let value of array) {
            indexArray[value] = index;
          }
        }
      }
      return new Uint16Array(indexArray);
    }

    // tslint:disable-next-line: member-ordering
    protected createFaceNormals(trigons: Array<number> = Array.from(this.indices)): Float32Array {
      // let normals: Float32Array = new Float32Array([
      //   // front
      //   /*0*/ 0, 0, 1, /*1*/ 0, 0, 1, /*2*/ 0, 0, 1, /*3*/ 0, 0, 1,
      //   // back
      //   /*4*/ 0, 0, -1, /*5*/ 0, 0, -1, /*6*/ 0, 0, -1, /*7*/ 0, 0, -1,
      //   // right
      //   /*8*/ -1, 0, 0, /*9*/ -1, 0, 0, /*10*/ 1, 0, 0, /*11*/ 1, 0, 0,
      //   // left
      //   /*12*/ -1, 0, 0, /*13*/ -1, 0, 0, /*14*/ 1, 0, 0, /*15*/ 1, 0, 0,
      //   // bottom
      //   /*16*/ 0, 1, 0, /*17*/ 0, -1, 0, /*18*/ 0, -1, 0, /*19*/ 0, 1, 0,
      //   // top 
      //   /*20*/ 0, 1, 0, /*21*/ 0, -1, 0, /*22*/ 0, -1, 0, /*23*/ 0, 1, 0
      // ]);
      return this.calculateNormals(trigons);
    }

    /* 
      likely a small performance optimization for very big meshes
      TODO: needs fix
    */
    // private updateNormals(trigons: Array<number>): void { // Array<Array<number>>
    //   let newNormals: Float32Array = new Float32Array(this.vertices.length);
    //   // TODO: fix incase length of vertices decreases
    //   newNormals.set(this.normalsFace);
    //   this.normalsFace = this.calculateNormals(trigons, newNormals);
    //   // for (let trigon of trigons) {
    //   //   let vertexA: ƒ.Vector3 = new ƒ.Vector3(this.vertices[3 * trigon[0]], this.vertices[3 * trigon[0] + 1], this.vertices[3 * trigon[0] + 2]);
    //   //   let vertexB: ƒ.Vector3 = new ƒ.Vector3(this.vertices[3 * trigon[1]], this.vertices[3 * trigon[1] + 1], this.vertices[3 * trigon[1] + 2]);
    //   //   let vertexC: ƒ.Vector3 = new ƒ.Vector3(this.vertices[3 * trigon[2]], this.vertices[3 * trigon[2] + 1], this.vertices[3 * trigon[2] + 2]);
      
    //   //   let newNormal: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(ƒ.Vector3.CROSS(ƒ.Vector3.DIFFERENCE(vertexB, vertexA), ƒ.Vector3.DIFFERENCE(vertexC, vertexB)));
    //   //   newNormals.set([newNormal.x, newNormal.y, newNormal.z], 3 * trigon[0]);
    //   //   newNormals.set([newNormal.x, newNormal.y, newNormal.z], 3 * trigon[1]);
    //   //   newNormals.set([newNormal.x, newNormal.y, newNormal.z], 3 * trigon[2]);
    //   // }
    //   // this.normalsFace = newNormals;
    // }

    private calculateNormals(trigons: Array<number>, normals: Float32Array = new Float32Array(this.vertices.length)): Float32Array {
      for (let index: number = 0; index < trigons.length; index += ModifiableMesh.vertexSize) {
        let vertexA: ƒ.Vector3 = new ƒ.Vector3(this.vertices[ModifiableMesh.vertexSize * trigons[index]], this.vertices[ModifiableMesh.vertexSize * trigons[index] + 1], this.vertices[3 * this.indices[index] + 2]);
        let vertexB: ƒ.Vector3 = new ƒ.Vector3(this.vertices[ModifiableMesh.vertexSize * trigons[index + 1]], this.vertices[ModifiableMesh.vertexSize * trigons[index + 1] + 1], this.vertices[3 * this.indices[index + 1] + 2]);
        let vertexC: ƒ.Vector3 = new ƒ.Vector3(this.vertices[ModifiableMesh.vertexSize * trigons[index + 2]], this.vertices[ModifiableMesh.vertexSize * trigons[index + 2] + 1], this.vertices[3 * this.indices[index + 2] + 2]);
        
        let newNormal: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(ƒ.Vector3.CROSS(ƒ.Vector3.DIFFERENCE(vertexB, vertexA), ƒ.Vector3.DIFFERENCE(vertexC, vertexB)));
        normals.set([newNormal.x, newNormal.y, newNormal.z], ModifiableMesh.vertexSize * trigons[index]);
        normals.set([newNormal.x, newNormal.y, newNormal.z], ModifiableMesh.vertexSize * trigons[index + 1]);
        normals.set([newNormal.x, newNormal.y, newNormal.z], ModifiableMesh.vertexSize * trigons[index + 2]);
      }
      return normals;
    }
  }
}