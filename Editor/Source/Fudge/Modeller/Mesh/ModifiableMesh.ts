namespace Fudge {
  export class ModifiableMesh extends ƒ.Mesh {
    private _uniqueVertices: UniqueVertex[];

    constructor() {
      super();

      this._uniqueVertices = [
        new UniqueVertex(new ƒ.Vector3(-1, 1, 1),   new Map([[0, [2, 5]], [8, [22]], [16, [31]]])),
        new UniqueVertex(new ƒ.Vector3(-1, -1, 1),  new Map([[1, [0]], [9, [19, 21]], [17, [26, 29]]])), 
        new UniqueVertex(new ƒ.Vector3(1, -1, 1),   new Map([[2, [1, 3]], [10, [12]], [18, [28]]])), 
        new UniqueVertex(new ƒ.Vector3(1, 1, 1),    new Map([[3, [4]], [11, [14, 17]], [19, [32, 35]]])), 
        new UniqueVertex(new ƒ.Vector3(-1, 1, -1),  new Map([[4, [10]], [12, [20, 23]], [20, [30, 34]]])), 
        new UniqueVertex(new ƒ.Vector3(-1, -1, -1), new Map([[5, [7, 9]], [13, [18]], [21, [24]]])), 
        new UniqueVertex(new ƒ.Vector3(1, -1, -1),  new Map([[6, [6]], [14, [13, 15]], [22, [25, 27]]])), 
        new UniqueVertex(new ƒ.Vector3(1, 1, -1),   new Map([[7, [8, 11]], [15, [16]], [23, [33]]])) 
      ];

      // this._uniqueVertices = [
      //   new UniqueVertex(new ƒ.Vector3(-1, 1, 1),   {0: [2, 5 ], 8:  [22    ], 16: [31    ]}),
      //   new UniqueVertex(new ƒ.Vector3(-1, -1, 1),  {1: [0    ], 9:  [19, 21], 17: [26, 29]}),
      //   new UniqueVertex(new ƒ.Vector3(1, -1, 1),   {2: [1, 3 ], 10: [12    ], 18: [28    ]}),
      //   new UniqueVertex(new ƒ.Vector3(1, 1, 1),    {3: [4    ], 11: [14, 17], 19: [32, 35]}),
      //   new UniqueVertex(new ƒ.Vector3(-1, 1, -1),  {4: [10   ], 12: [20, 23], 20: [30, 34]}),
      //   new UniqueVertex(new ƒ.Vector3(-1, -1, -1), {5: [7, 9 ], 13: [18    ], 21: [24    ]}),
      //   new UniqueVertex(new ƒ.Vector3(1, -1, -1),  {6: [6    ], 14: [13, 15], 22: [25, 27]}),
      //   new UniqueVertex(new ƒ.Vector3(1, 1, -1),   {7: [8, 11], 15: [16    ], 23: [33    ]}),
      // ];

      // this._uniqueVertices = [
      //   new UniqueVertex(new ƒ.Vector3(-1, 1, 1), [0, 8, 16]),
      //   new UniqueVertex(new ƒ.Vector3(-1, -1, 1), [1, 9, 17]),
      //   new UniqueVertex(new ƒ.Vector3(1, -1, 1), [2, 10, 18]),
      //   new UniqueVertex(new ƒ.Vector3(1, 1, 1), [3, 11, 19]),
      //   new UniqueVertex(new ƒ.Vector3(-1, 1, -1), [4, 12, 20]),
      //   new UniqueVertex(new ƒ.Vector3(-1, -1, -1), [5, 13, 21]),
      //   new UniqueVertex(new ƒ.Vector3(1, -1, -1), [6, 14, 22]),
      //   new UniqueVertex(new ƒ.Vector3(1, 1, -1), [7, 15, 23])
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

    public testNormals() {
      this.normalsFace = this.calculateFaceNormals();
    }

    public extrude(selectedIndices: number[]): number[] {
      let faceVertices: Map<number, number> = this.findCorrectFace(selectedIndices);
      this.addIndicesToNewVertices(this.findEdgesFrom(faceVertices), this.getNewVertices(faceVertices));
      this.vertices = this.createVertices();
      this.indices = this.createIndices();

      let newSelection: number[] = [];
      for (let i: number = 0; i < faceVertices.size; i++) 
        newSelection.push(this.uniqueVertices.length - faceVertices.size + i);

      // let trigons: Array<Array<number>> = this.findOrderOfTrigonFromSelectedVertex(newSelection);
      // this.updateNormals(trigons);

      this.createRenderBuffers();
      return newSelection;
    }

    private addIndicesToNewVertices(edges: Map<number, number>, mapping: {vertexToUniqueVertex: Map<number, number>, reverse: Map<number, number[]>, originalToNewVertex: Map<number, number>}): void {
      let vertexToUniqueVertexMap: Map<number, number> = mapping.vertexToUniqueVertex;
      let reverse: Map<number, number[]> = mapping.reverse;
      let originalToNewVertex: Map<number, number> = mapping.originalToNewVertex;
      let newTriangles: number[] = [];
      let isLowMap: Map<number, boolean> = new Map();

      for (let edge of edges.keys()) {
        let aPlusNArray: number[] = reverse.get(edge);
        let bPlusNArray: number[] = reverse.get(edges.get(edge));
        let a: number;
        let b: number;
        let aPlusN: number;
        let bPlusN: number;

        if (isLowMap.get(edge) || isLowMap.get(edges.get(edge))) {
          a = originalToNewVertex.get(edge);
          b = originalToNewVertex.get(edges.get(edge));
          aPlusN = aPlusNArray[2];
          bPlusN = bPlusNArray[2];
          isLowMap.set(edge, false);
          isLowMap.set(edges.get(edge), false);  
        } else {
          a = edge;
          b = edges.get(edge);
          aPlusN = aPlusNArray[1];
          bPlusN = bPlusNArray[1];
          isLowMap.set(edge, true);
          isLowMap.set(edges.get(edge), true);  
        }
        newTriangles.push(a);
        newTriangles.push(b);
        newTriangles.push(bPlusN);
        newTriangles.push(bPlusN);
        newTriangles.push(aPlusN);
        newTriangles.push(a);
      }

      for (let i: number = 0; i < newTriangles.length; i++) {
        this.uniqueVertices[vertexToUniqueVertexMap.get(newTriangles[i])].indices.get(newTriangles[i]).push(this.indices.length + i);
      }
    }

    /*
      loops over the selection and adds a new vertex for every selected vertex
      which new vertex belongs to which original vertex is then stored in an object and returned for further processing
    */
    private getNewVertices(faceVertices: Map<number, number>): {vertexToUniqueVertex: Map<number, number>, reverse: Map<number, number[]>, originalToNewVertex: Map<number, number>} { // Array<UniqueVertex>  Map<number, number>
      let originalLength: number = this.uniqueVertices.length;
      // use an index here to take care of ordering
      let iterator: number = 0;
      let vertexToUniqueVertex: Map<number, number> = new Map();
      let reverse: Map<number, number[]> = new Map();
      let originalToNewVertexMap: Map<number, number> = new Map();

      for (let faceVertex of faceVertices.keys()) {
        // get the indices from the original face; they will be deleted later
        let indexArray: number[] = this._uniqueVertices[faceVertices.get(faceVertex)].indices.get(faceVertex);
        // TODO: set position to old position and only move in onmove function
        let newVertex: UniqueVertex = new UniqueVertex(new ƒ.Vector3(this.vertices[faceVertex * 3 + 0], this.vertices[faceVertex * 3 + 1], this.vertices[faceVertex * 3 + 2]), new Map());
        
        reverse.set(faceVertex, []);
        let lengthOffset: number = faceVertices.size;
        // one index is added for the new vertex for every index of the original vertex
        for (let oldVertex of this.uniqueVertices[faceVertices.get(faceVertex)].indices.keys()) {
          newVertex.indices.set(this.vertices.length / 3 + iterator + lengthOffset, []);
          vertexToUniqueVertex.set(this.vertices.length / 3 + iterator + lengthOffset, originalLength + iterator);
          reverse.get(faceVertex).push(this.vertices.length / 3 + iterator + lengthOffset);
          lengthOffset += faceVertices.size;
        }

        // add one more set of vertices to the original face
        this.uniqueVertices[faceVertices.get(faceVertex)].indices.set(this.vertices.length / 3 + iterator, []);
        vertexToUniqueVertex.set(this.vertices.length / 3 + iterator, faceVertices.get(faceVertex));
        originalToNewVertexMap.set(faceVertex, this.vertices.length / 3 + iterator);

        // the new front face has the indices of the original face
        for (let index of indexArray) {
          newVertex.indices.get(this.vertices.length / 3 + iterator + faceVertices.size).push(index);
        }

        // the old front face is deleted
        vertexToUniqueVertex.set(faceVertex, faceVertices.get(faceVertex));
        this._uniqueVertices[faceVertices.get(faceVertex)].indices.set(faceVertex, []);

        this.uniqueVertices.push(newVertex);
        iterator++;
      }
      return {vertexToUniqueVertex: vertexToUniqueVertex, reverse: reverse, originalToNewVertex: originalToNewVertexMap};
    }

    /* 
      find the boundary corresponding edges from the selection
    */
    private findEdgesFrom(selection: Map<number, number>): Map<number, number> {
      let indices: number[] = [];

      for (let vertex of selection.keys()) {
        let indicesArray: number[] = this.uniqueVertices[selection.get(vertex)].indices.get(vertex);
        for (let index of indicesArray) {
          indices.push(index);
        }
      }
      indices.sort();
      let edges: Map<number, number> = new Map();
      //let triangles: Array<number> = [];

      // find the boundary edges, internal edges (duplicates) are deleted
      for (let i: number = 0; i < indices.length; i++) {
        if (edges.get(this.indices[indices[(i + 1) % indices.length]]) == this.indices[indices[i]]) {
          edges.delete(this.indices[indices[(i + 1) % indices.length]]);
        } else {
          edges.set(this.indices[indices[i]], this.indices[indices[(i + 1) % indices.length]]);
        }
        //triangles.push(this.indices[indices[i]]);
      }
      return edges;
    }

    // hacky method needs revamp
    private findCorrectFace(selectedIndices: number[]): Map<number, number> {
      let faceVerticesMap: Map<number, number> = new Map();
      let normalToVertexTable: Map<string, Array<{selectedIndex: number, vertexIndex: number}>> = new Map();

      // this will likely not work after some processing because of floating point precision 
      for (let selectedIndex of selectedIndices) {
        for (let vertexIndex of this._uniqueVertices[selectedIndex].indices.keys()) {
          let normal: ƒ.Vector3 = new ƒ.Vector3(this.normalsFace[vertexIndex * 3], this.normalsFace[vertexIndex * 3 + 1], this.normalsFace[vertexIndex * 3 + 2]);        
          if (!normalToVertexTable.has(normal.toString())) {
            normalToVertexTable.set(normal.toString(), [{selectedIndex: selectedIndex, vertexIndex: vertexIndex}]);
          } else {
            normalToVertexTable.get(normal.toString()).push({selectedIndex: selectedIndex, vertexIndex: vertexIndex});
          }
        }
      }
      for (let normal of normalToVertexTable.keys()) {
        if (normalToVertexTable.get(normal).length == selectedIndices.length) {
          for (let indices of normalToVertexTable.get(normal)) {
            faceVerticesMap.set(indices.vertexIndex, indices.selectedIndex);
          }
        }
      }
      return faceVerticesMap;
    }

    // tslint:disable-next-line: member-ordering
    public updatePositionOfVertices(selectedIndices: number[], diffToOldPosition: ƒ.Vector3, oldVertexPositions: Map<number, ƒ.Vector3>): void {
      if (!selectedIndices) 
        return;
      
      for (let selection of selectedIndices) {
        let currentVertex: ƒ.Vector3 = oldVertexPositions.get(selection);
        this.updatePositionOfVertex(selection, new ƒ.Vector3(currentVertex.x + diffToOldPosition.x, currentVertex.y + diffToOldPosition.y, currentVertex.z + diffToOldPosition.z));
      }

      let trigons: Array<Array<number>> = this.findOrderOfTrigonFromSelectedVertex(selectedIndices);
      this.updateNormals(trigons);
      this.createRenderBuffers();
    }

    /*
      finds the ordering of the trigons by searching for the selected vertex in the indices array
      returns an array with another array, that stores the correct ordering
    */
    // tslint:disable-next-line: member-ordering
    protected findOrderOfTrigonFromSelectedVertex(selectedIndices: number[]): Array<Array<number>> {
      let trigons: Array<Array<number>> = [];
      for (let selectedIndex of selectedIndices) {
        for (let vertexIndex of this._uniqueVertices[selectedIndex].indices.keys()) {
          for (let indexInIndicesArray of this._uniqueVertices[selectedIndex].indices.get(vertexIndex)) {
            let trigon: Array<number> = [];
            switch (indexInIndicesArray % 3) {
              case 0: 
                trigon.push(this.indices[indexInIndicesArray], this.indices[indexInIndicesArray + 1], this.indices[indexInIndicesArray + 2]);
                break;
              case 1:
                trigon.push(this.indices[indexInIndicesArray - 1], this.indices[indexInIndicesArray], this.indices[indexInIndicesArray + 1]);
                break;
              case 2:
                trigon.push(this.indices[indexInIndicesArray - 2], this.indices[indexInIndicesArray - 1], this.indices[indexInIndicesArray]);
                break;
            }
            trigons.push(trigon);  
          }
        }
      }
      return trigons;
    }

    // tslint:disable-next-line: member-ordering
    protected updatePositionOfVertex(vertexIndex: number, newPosition: ƒ.Vector3): void {
      this._uniqueVertices[vertexIndex].position = newPosition;
      for (let index of this._uniqueVertices[vertexIndex].indices.keys()) {
        this.vertices.set([this._uniqueVertices[vertexIndex].position.x, this._uniqueVertices[vertexIndex].position.y, this._uniqueVertices[vertexIndex].position.z], index * 3);
      }
      // this.update();
    }

    // tslint:disable-next-line: member-ordering
    protected createVertices(): Float32Array {
      // TODO maybe don't loop here too somehow?
      // let length: number = 0;
      // for (let vertex of this._uniqueVertices) {
      //   length += vertex.indices.length;
      // }
      // let vertices: Float32Array = new Float32Array(length * 3);
      // for (let vertex of this._uniqueVertices) {
      //   for (let index of vertex.indices) {
      //     vertices.set([vertex.position.x, vertex.position.y, vertex.position.z], index * 3);
      //   }
      // }
      let length: number = 0;
      for (let vertex of this._uniqueVertices) {
        length += vertex.indices.size * 3;
      }
      let vertices: Float32Array = new Float32Array(length);
      for (let vertex of this._uniqueVertices) {
        for (let index of vertex.indices.keys()) {
          vertices.set([vertex.position.x, vertex.position.y, vertex.position.z], index * 3);
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
        for (let index of vertex.indices.keys()) {
          let array: number[] = vertex.indices.get(index);
          for (let value of array) {
            indexArray[value] = index;
          }
        }
      }
      return new Uint16Array(indexArray);
    }

    // tslint:disable-next-line: member-ordering
    protected createFaceNormals(): Float32Array {
      let normals: Float32Array = new Float32Array([
        // front
        /*0*/ 0, 0, 1, /*1*/ 0, 0, 1, /*2*/ 0, 0, 1, /*3*/ 0, 0, 1,
        // back
        /*4*/ 0, 0, -1, /*5*/ 0, 0, -1, /*6*/ 0, 0, -1, /*7*/ 0, 0, -1,
        // right
        /*8*/ -1, 0, 0, /*9*/ -1, 0, 0, /*10*/ 1, 0, 0, /*11*/ 1, 0, 0,
        // left
        /*12*/ -1, 0, 0, /*13*/ -1, 0, 0, /*14*/ 1, 0, 0, /*15*/ 1, 0, 0,
        // bottom
        /*16*/ 0, 1, 0, /*17*/ 0, -1, 0, /*18*/ 0, -1, 0, /*19*/ 0, 1, 0,
        // top 
        /*20*/ 0, 1, 0, /*21*/ 0, -1, 0, /*22*/ 0, -1, 0, /*23*/ 0, 1, 0
      ]);

      return normals;
    }

    private updateNormals(trigons: Array<Array<number>>): void {
      let newNormals: Float32Array = new Float32Array(this.vertices.length);
      // fix incase length of vertices decreases
      newNormals.set(this.normalsFace);
      for (let trigon of trigons) {
        let vertexA: ƒ.Vector3 = new ƒ.Vector3(this.vertices[3 * trigon[0]], this.vertices[3 * trigon[0] + 1], this.vertices[3 * trigon[0] + 2]);
        let vertexB: ƒ.Vector3 = new ƒ.Vector3(this.vertices[3 * trigon[1]], this.vertices[3 * trigon[1] + 1], this.vertices[3 * trigon[1] + 2]);
        let vertexC: ƒ.Vector3 = new ƒ.Vector3(this.vertices[3 * trigon[2]], this.vertices[3 * trigon[2] + 1], this.vertices[3 * trigon[2] + 2]);
      
        let newNormal: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(ƒ.Vector3.CROSS(ƒ.Vector3.DIFFERENCE(vertexB, vertexA), ƒ.Vector3.DIFFERENCE(vertexC, vertexB)));
        newNormals.set([newNormal.x, newNormal.y, newNormal.z], 3 * trigon[0]);
        newNormals.set([newNormal.x, newNormal.y, newNormal.z], 3 * trigon[1]);
        newNormals.set([newNormal.x, newNormal.y, newNormal.z], 3 * trigon[2]);
      }
      this.normalsFace = newNormals;
    }

    private update(): void {
      this.createRenderBuffers();      
    }

  }
}

      // let test: Array<{vertexIndex: number, indices: number[]}> = [];
      // for (let selectedIndex of selectedIndices) {
      //   for (let vertexIndex in this._uniqueVertices[selectedIndex].indices) {
      //     for (let indexInIndicesArray of this._uniqueVertices[selectedIndex].indices[vertexIndex]) {
      //       let arrayToCheck: number[] = [];
      //       switch (indexInIndicesArray % 3) {
      //         case 0: 
      //           arrayToCheck.push(this.indices[indexInIndicesArray + 1]);
      //           arrayToCheck.push(this.indices[indexInIndicesArray + 2]);
      //           break;
      //         case 1:
      //           arrayToCheck.push(this.indices[indexInIndicesArray - 1]);
      //           arrayToCheck.push(this.indices[indexInIndicesArray + 1]);
      //           break;
      //         case 2:
      //           arrayToCheck.push(this.indices[indexInIndicesArray - 1]);
      //           arrayToCheck.push(this.indices[indexInIndicesArray - 2]);
      //           break;
      //       }

      //       test.push({vertexIndex: Number.parseInt(vertexIndex), indices: arrayToCheck});
      //     }
      //   }
      // }
      // // for (let obj of test) {
      // //   for (let selectedIndex of selectedIndices) {
      // //     let wasSelected: boolean = true;
      // //     let index: number;
      // //     for (let vertexIndex in this.uniqueVertices[selectedIndex].indices) {
      // //       if (!obj.indices.includes(Number.parseInt(vertexIndex))) {
      // //         index = Number.parseInt(vertexIndex);
      // //         wasSelected = false;
      // //       } 
      // //     }
      // //     if (wasSelected) 
      // //       faceVertices.push(index);
      // //   }
      // // } 
      // for (let i: number = 0; i < test.length; i++) {
      //   for (let j: number = 0; j < test.length; i++) {
      //     if (i == j)
      //       continue;
      //     if (test[i].indices[0] == test[j].indices[0] || 
      //       test[i].indices[1] == test[j].indices[1] || 
      //       test[i].indices[1] == test[j].indices[0] ||
      //       test[i].indices[0] == test[j].indices[1] || 
      //       test[i].indices[0] == test[j].vertexIndex ||
      //       test[i].indices[1] == test[j].vertexIndex ||
      //       test[i].vertexIndex == test[j].indices[0] ||
      //       test[i].vertexIndex == test[j].indices[1] ||
      //       test[i].vertexIndex == test[j].vertexIndex) 
      //       faceVertices.push(test[i].vertexIndex);
      //   }
      // }