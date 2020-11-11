namespace Fudge {
  export class ModifiableMesh extends ƒ.Mesh {
    private _uniqueVertices: UniqueVertex[];

    constructor() {
      super();
      this._uniqueVertices = [
        new UniqueVertex(new ƒ.Vector3(-1, 1, 1),   {0: [2, 5 ], 8:  [22    ], 16: [31    ]}),
        new UniqueVertex(new ƒ.Vector3(-1, -1, 1),  {1: [0    ], 9:  [19, 21], 17: [26, 29]}),
        new UniqueVertex(new ƒ.Vector3(1, -1, 1),   {2: [1, 3 ], 10: [12    ], 18: [28    ]}),
        new UniqueVertex(new ƒ.Vector3(1, 1, 1),    {3: [4    ], 11: [14, 17], 19: [32, 35]}),
        new UniqueVertex(new ƒ.Vector3(-1, 1, -1),  {4: [10   ], 12: [20, 23], 20: [30, 34]}),
        new UniqueVertex(new ƒ.Vector3(-1, -1, -1), {5: [7, 9 ], 13: [18    ], 21: [24    ]}),
        new UniqueVertex(new ƒ.Vector3(1, -1, -1),  {6: [6    ], 14: [13, 15], 22: [25, 27]}),
        new UniqueVertex(new ƒ.Vector3(1, 1, -1),   {7: [8, 11], 15: [16    ], 23: [33    ]})
      ];
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

    public updatePositionOfVertices(selectedIndices: number[], diffToOldPosition: ƒ.Vector3, oldVertexPositions: Record<number, ƒ.Vector3>): void {
      if (!selectedIndices) 
        return;
      
      for (let selection of selectedIndices) {
        let currentVertex: ƒ.Vector3 = oldVertexPositions[selection];
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
    protected findOrderOfTrigonFromSelectedVertex(selectedIndices: number[]): Array<Array<number>> {
      let trigons: Array<Array<number>> = [];
      for (let selectedIndex of selectedIndices) {
        for (let vertexIndex in this._uniqueVertices[selectedIndex].indices) {
          for (let indexInIndicesArray of this._uniqueVertices[selectedIndex].indices[vertexIndex]) {
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

    protected updatePositionOfVertex(vertexIndex: number, newPosition: ƒ.Vector3): void {
      this._uniqueVertices[vertexIndex].position = newPosition;
      for (let index in this._uniqueVertices[vertexIndex].indices) {
        this.vertices.set([this._uniqueVertices[vertexIndex].position.x, this._uniqueVertices[vertexIndex].position.y, this._uniqueVertices[vertexIndex].position.z], <number> <unknown> index * 3);
      }
      // this.update();
    }

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

      // TODO use dynamic length here (or rather use new array as parameter)
      let vertices: Float32Array = new Float32Array(8 * 3 * 3);
      for (let vertex of this._uniqueVertices) {
        for (let index of Object.keys(vertex.indices)) {
          vertices.set([vertex.position.x, vertex.position.y, vertex.position.z], <number> <unknown> index * 3);
        }
      }

      return vertices;
    }

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
        for (let index in vertex.indices) {
          for (let value of vertex.indices[index]) {
            indexArray[value] = <number> <unknown> index;
          }
        }
      }
      return new Uint16Array(indexArray);
    }
    protected createFaceNormals(): Float32Array {
      let normals: Float32Array = new Float32Array([
        // front
        /*0*/ 0, 0, 1, /*1*/ 0, 0, 1, /*2*/ 0, 0, 1, /*3*/ 0, 0, 1,
        // back
        /*4*/ 0, 0, -1, /*5*/ 0, 0, -1, /*6*/ 0, 0, -1, /*7*/ 0, 0, -1,
        // right
        /*8*/ 1, 0, 0, /*9*/ 1, 0, 0, /*10*/ 1, 0, 0, /*11*/ 1, 0, 0,
        // left
        /*12*/ -1, 0, 0, /*13*/ -1, 0, 0, /*14*/ -1, 0, 0, /*15*/ -1, 0, 0,
        // bottom
        /*16*/ 0, -1, 0, /*17*/ 0, -1, 0, /*18*/ 0, -1, 0, /*19*/ 0, -1, 0,
        // top 
        /*20*/ 0, 1, 0, /*21*/ 0, 1, 0, /*22*/ 0, 1, 0, /*23*/ 0, 1, 0
      ]);
      return normals;
    }

    private updateNormals(trigons: Array<Array<number>>): void {
      for (let trigon of trigons) {
        let vertexA: ƒ.Vector3 = new ƒ.Vector3(this.vertices[3 * trigon[0]], this.vertices[3 * trigon[0] + 1], this.vertices[3 * trigon[0] + 2]);
        let vertexB: ƒ.Vector3 = new ƒ.Vector3(this.vertices[3 * trigon[1]], this.vertices[3 * trigon[1] + 1], this.vertices[3 * trigon[1] + 2]);
        let vertexC: ƒ.Vector3 = new ƒ.Vector3(this.vertices[3 * trigon[2]], this.vertices[3 * trigon[2] + 1], this.vertices[3 * trigon[2] + 2]);
      
        let newNormal: ƒ.Vector3 = ƒ.Vector3.NORMALIZATION(ƒ.Vector3.CROSS(ƒ.Vector3.DIFFERENCE(vertexB, vertexA), ƒ.Vector3.DIFFERENCE(vertexC, vertexB)));
        this.normalsFace.set([newNormal.x, newNormal.y, newNormal.z], 3 * trigon[0]);
        this.normalsFace.set([newNormal.x, newNormal.y, newNormal.z], 3 * trigon[1]);
        this.normalsFace.set([newNormal.x, newNormal.y, newNormal.z], 3 * trigon[2]);
      }
    }

    private update(): void {
      this.createRenderBuffers();      
    }

  }
}