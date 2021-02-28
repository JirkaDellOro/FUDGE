namespace Fudge {
  export class ModifiableMesh extends ƒ.Mesh {
    public static readonly vertexSize: number = ƒ.Mesh.getBufferSpecification().size;
    #uniqueVertices: UniqueVertex[];

    constructor() {
      super();

      this.#uniqueVertices = [
        new UniqueVertex(new ƒ.Vector3(-1, 1, 1), new Map([[0, { indices: [2, 5], face: 0, edges: [1, 2] }], [8, { indices: [22], face: 2, edges: [12] }], [16, { indices: [31], face: 5, edges: [19] }]])),
        new UniqueVertex(new ƒ.Vector3(-1, -1, 1), new Map([[1, { indices: [0], face: 0, edges: [2] }], [9, { indices: [19, 21], face: 2, edges: [8, 12] }], [17, { indices: [26, 29], face: 4, edges: [21, 22] }]])),
        new UniqueVertex(new ƒ.Vector3(1, -1, 1), new Map([[2, { indices: [1, 3], face: 0, edges: [0, 3] }], [10, { indices: [12], face: 3, edges: [14] }], [18, { indices: [28], face: 4, edges: [17] }]])),
        new UniqueVertex(new ƒ.Vector3(1, 1, 1), new Map([[3, { indices: [4], face: 0, edges: [0] }], [11, { indices: [14, 17], face: 3, edges: [10, 14] }], [19, { indices: [32, 35], face: 5, edges: [20, 23] }]])),
        new UniqueVertex(new ƒ.Vector3(-1, 1, -1), new Map([[4, { indices: [10], face: 1, edges: [7] }], [12, { indices: [20, 23], face: 2, edges: [9, 13] }], [20, { indices: [30, 34], face: 5, edges: [16, 19] }]])),
        new UniqueVertex(new ƒ.Vector3(-1, -1, -1), new Map([[5, { indices: [7, 9], face: 1, edges: [4, 7] }], [13, { indices: [18], face: 2, edges: [9] }], [21, { indices: [24], face: 4, edges: [22] }]])),
        new UniqueVertex(new ƒ.Vector3(1, -1, -1), new Map([[6, { indices: [6], face: 1, edges: [5] }], [14, { indices: [13, 15], face: 3, edges: [11, 15] }], [22, { indices: [25, 27], face: 4, edges: [17, 18] }]])),
        new UniqueVertex(new ƒ.Vector3(1, 1, -1), new Map([[7, { indices: [8, 11], face: 1, edges: [5, 6] }], [15, { indices: [16], face: 3, edges: [11] }], [23, { indices: [33], face: 5, edges: [20] }]]))
      ];
      for (let vertex of this.#uniqueVertices) {
        vertex.position.x = vertex.position.x / 2;
        vertex.position.y = vertex.position.y / 2;
        vertex.position.z = vertex.position.z / 2;
      }

      this.create();
    }

    public get uniqueVertices(): UniqueVertex[] {
      return this.#uniqueVertices;
    }


    /* 
      get the current state of the mesh for reload
    */
    public getState(): string {
      let serializable: Array<Object> = [];
      for (let vertex of this.#uniqueVertices) {
        let vertexSerialization: any = {};
        vertexSerialization.position = [vertex.position.x, vertex.position.y, vertex.position.z];
        let dataSerialized: Array<Object> = [];
        for (let index of vertex.vertexToData.keys()) {
          dataSerialized.push({
            vertexIndex: index,
            triangleIndices: vertex.vertexToData.get(index).indices,
            faceIndex: vertex.vertexToData.get(index).face,
            edges: vertex.vertexToData.get(index).edges
          });
        }
        vertexSerialization.data = dataSerialized;
        serializable.push(vertexSerialization);
      }
      return JSON.stringify(serializable);
    }

    /* 
      reload the old state
    */
    public retrieveState(state: string): void {
      let json: Array<any> = JSON.parse(state);
      let result: Array<UniqueVertex> = [];
      for (let vertex of json) {
        let position: ƒ.Vector3 = new ƒ.Vector3(vertex.position[0], vertex.position[1], vertex.position[2]);
        let dataMap: Map<number, { indices: number[], face?: number, edges?: number[] }> = new Map();
        for (let data of vertex.data) {
          dataMap.set(data.vertexIndex, { indices: data.triangleIndices, face: data.faceIndex, edges: data.edges });
        }
        let uniqueVertex: UniqueVertex = new UniqueVertex(position, dataMap);
        result.push(uniqueVertex);
      }
      this.#uniqueVertices = result;
      this.create();
      console.log(result);
    }
    /*
      export the mesh in json to use it in different fudge applications 
    */
    public export(): string {
      let serialization: {vertices: number[], indices: number[], normals: number[], textureCoordinates: number[]} = {
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

    /* 
      find the centroid of the selected mesh
    */
    public getCentroid(selection: number[] = Array.from(Array(this.uniqueVertices.length).keys())): ƒ.Vector3 {
      let sum: ƒ.Vector3 = new ƒ.Vector3();
      let numberOfVertices: number = 0;
      for (let index of selection) {
        sum.x += (this.#uniqueVertices[index].position.x * this.#uniqueVertices[index].vertexToData.size);
        sum.y += (this.#uniqueVertices[index].position.y * this.#uniqueVertices[index].vertexToData.size);
        sum.z += (this.#uniqueVertices[index].position.z * this.#uniqueVertices[index].vertexToData.size);
        numberOfVertices += this.#uniqueVertices[index].vertexToData.size;
      }
      sum.x /= numberOfVertices;
      sum.y /= numberOfVertices;
      sum.z /= numberOfVertices;
      return sum;
    }

    public removeFace(selection: number[]): void {
      let faceData: { correctVertices: Map<number, number>, face: number } = this.findCorrectFace(selection);
      let correctVertices: Map<number, number> = faceData.correctVertices;
      if (correctVertices.size !== 4)
        return;
      let faceIndex: number = faceData.face;
      let removedIndices: number[] = [];
      for (let vertex of correctVertices.keys()) {
        let result: number[] = this.#uniqueVertices[correctVertices.get(vertex)].vertexToData.get(vertex).indices;
        removedIndices.push(...result);
        this.#uniqueVertices[correctVertices.get(vertex)].vertexToData.delete(vertex);
      }
      removedIndices.sort();
      let oldVertexToNewVertexMap: Map<number, number> = this.rearrangeIndicesAfterRemove(correctVertices, removedIndices, faceIndex);
      for (let uniqueVertex of this.#uniqueVertices) {
        for (let [vertexIndex, data] of uniqueVertex.vertexToData) {
          for (let i: number = 0; i < data.edges.length; i++) {
            for (let [oldVertexIndex, newVertexIndex] of oldVertexToNewVertexMap) {
              if (data.edges[i] === oldVertexIndex) {
                data.edges[i] = newVertexIndex;
                break;
              }
            }
          }
        }
      }
      this.vertices = this.createVertices();
      this.indices = this.createIndices();
      this.normalsFace = this.createFaceNormals();
      this.createRenderBuffers();
    }

    public updateNormals(): void {
      this.normalsFace = this.createFaceNormals();
      this.createRenderBuffers();
    }

    public invertFace(selection: number[]): void {
      console.log("invert face called");
      if (selection.length !== 4)
        return;
      let faceToVertexMap: Map<number, number[]> = new Map();
      let vertexToUniqueVertexMap: Map<number, number> = new Map();
      for (let selectedVertex of selection) {
        for (let [vertex, data] of this.uniqueVertices[selectedVertex].vertexToData) {
          vertexToUniqueVertexMap.set(vertex, selectedVertex);
          if (faceToVertexMap.has(data.face)) {
            faceToVertexMap.get(data.face).push(vertex);
          } else {
            faceToVertexMap.set(data.face, [vertex]);
          }
        }
      }

      let indexToVertexMap: Map<number, number> = new Map();
      for (let [face, vertices] of faceToVertexMap) {
        if (vertices.length === 4) {
          for (let vertex of vertices) {
            let indices: number[] = this.uniqueVertices[vertexToUniqueVertexMap.get(vertex)].vertexToData.get(vertex).indices;
            for (let i: number = 0; i < indices.length; i++) {
              switch (indices[i] % 3) {
                case 0:
                  indices[i] = indices[i] + 2;
                  break;
                case 2:
                  indices[i] = indices[i] - 2;
                  break;
              }
              indexToVertexMap.set(indices[i], vertex);
            }
          }

          for (let vertex of vertices) {
            let indices: number[] = this.uniqueVertices[vertexToUniqueVertexMap.get(vertex)].vertexToData.get(vertex).indices;
            let edges: number[] = this.uniqueVertices[vertexToUniqueVertexMap.get(vertex)].vertexToData.get(vertex).edges = [];
            for (let i: number = 0; i < indices.length; i++) {
              switch (indices[i] % 3) {
                case 0:
                case 1:
                  edges.push(indexToVertexMap.get(indices[i] + 1));
                  break;
                case 2:
                  edges.push(indexToVertexMap.get(indices[i] - 2));
                  break;
              }
            }
          }
        }
      }
      this.indices = this.createIndices();
      this.normalsFace = this.createFaceNormals();
      this.createRenderBuffers();
    }

    public scaleBy(scaleMatrix: ƒ.Matrix4x4, oldVertices: Map<number, ƒ.Vector3>, selection: number[] = Array.from(Array(this.uniqueVertices.length).keys())): void {
      for (let vertexIndex of selection) {
        let currentVertex: ƒ.Vector3 = oldVertices.get(vertexIndex);
        let newVertex: ƒ.Vector3 = new ƒ.Vector3(currentVertex.x, currentVertex.y, currentVertex.z);
        newVertex.transform(scaleMatrix);
        this.#uniqueVertices[vertexIndex].position = newVertex;
      }
      this.vertices = this.createVertices();
      this.createRenderBuffers();
    }
    
    public translateVertices(difference: ƒ.Vector3, selection: number[]): void {
      for (let vertexIndex of selection) {
        this.#uniqueVertices[vertexIndex].position.add(difference);
      }
      this.vertices = this.createVertices();
      this.createRenderBuffers();
    }

    public rotateBy(matrix: ƒ.Matrix4x4, center: ƒ.Vector3, selection: number[] = Array.from(Array(this.uniqueVertices.length).keys())): void {
      for (let vertexIndex of selection) {
        let newVertexPos: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(this.uniqueVertices[vertexIndex].position, center);
        newVertexPos.transform(matrix);
        this.uniqueVertices[vertexIndex].position = ƒ.Vector3.SUM(newVertexPos, center);
      }
      this.vertices = this.createVertices();
      this.createRenderBuffers();
    }


    // double clicking makes normal calculation impossible right now because old and new vertices are at the same position, maybe add some small increment initially?
    public extrude(selectedVertices: number[]): ƒ.Vector3 {
      if (selectedVertices.length < 2)
        return;
      let meshUtils: MeshExtrude = new MeshExtrude(this.countNumberOfFaces(), this.vertices, this.#uniqueVertices, this.indices.length);
      let oldVertices: number[] = meshUtils.extrude(selectedVertices);
      
      let finalNormal: ƒ.Vector3 = null;
      if (oldVertices) {
        finalNormal = new ƒ.Vector3();
        for (let i: number = 0; i < oldVertices.length; i++) {
          let subnormal: ƒ.Vector3 = new ƒ.Vector3(this.normalsFace[oldVertices[i] * 3], this.normalsFace[oldVertices[i] * 3 + 1], this.normalsFace[oldVertices[i] * 3 + 2]);
          finalNormal.add(subnormal);
        }
        finalNormal.normalize();  
      }
      this.vertices = this.createVertices();
      this.indices = this.createIndices();
      this.createRenderBuffers();
      return finalNormal;
    }

    public updatePositionOfVertices(selectedIndices: number[], oldVertexPositions: Map<number, ƒ.Vector3>, diffToOldPosition: ƒ.Vector3, offset: ƒ.Vector3): void {
      if (!selectedIndices)
        return;

      for (let selection of selectedIndices) {
        let currentVertex: ƒ.Vector3 = oldVertexPositions.get(selection);
        this.updatePositionOfVertex(selection, new ƒ.Vector3(currentVertex.x + diffToOldPosition.x - offset.x, currentVertex.y + diffToOldPosition.y - offset.y, currentVertex.z + diffToOldPosition.z - offset.z));
      }
      this.createRenderBuffers();
    }

    private rearrangeIndicesAfterRemove(_correctVertices: Map<number, number>, _removedIndices: number[], _face: number): Map<number, number> {
      let oldVertexToNewVertexMap: Map<number, number> = new Map();
      for (let i: number = 0; i < this.#uniqueVertices.length; i++) {
        let tempMap: Map<number, { indices: number[], face?: number, edges?: number[] }> = new Map(this.#uniqueVertices[i].vertexToData);
        for (let [vertexIndex, indicesIndex] of tempMap) {
          for (let i: number = 0; i < indicesIndex.indices.length; i++) {
            let index: number = indicesIndex.indices[i];
            let subtraction: number = 0;
            for (let removedIndex of _removedIndices) {
              if (removedIndex < index)
                subtraction++;
            }
            index -= subtraction;
            indicesIndex.indices[i] = index;
          }

          let vertexSubtraction: number = 0;
          for (let removedVertex of _correctVertices.keys()) {
            if (removedVertex < vertexIndex)
              vertexSubtraction++;
          }

          if (vertexSubtraction != 0) {
            let indicesTemp: { indices: number[], face?: number, edges?: number[] } = indicesIndex;
            if (indicesTemp.face > _face)
              indicesTemp.face--;

            this.#uniqueVertices[i].vertexToData.delete(vertexIndex);
            this.#uniqueVertices[i].vertexToData.set(vertexIndex - vertexSubtraction, indicesTemp);
            oldVertexToNewVertexMap.set(vertexIndex, vertexIndex - vertexSubtraction);
          }

        }

        if (this.#uniqueVertices[i].vertexToData.size === 0) {
          this.#uniqueVertices.splice(i, 1);
        }
      }
      return oldVertexToNewVertexMap;
    }

    // maybe just store the number of faces somewhere
    private countNumberOfFaces(): number {
      let faces: Set<number> = new Set();
      for (let vertex of this.#uniqueVertices) {
        for (let vertexIndex of vertex.vertexToData.keys()) {
          faces.add(vertex.vertexToData.get(vertexIndex).face);
        }
      }
      return faces.size;
    }

    private findCorrectFace(selectedIndices: number[]): { correctVertices: Map<number, number>, face: number } {
      let faceVerticesMap: Map<number, number> = new Map();
      let faceToVerticesMap: Map<number, Array<{ selectedIndex: number, vertexIndex: number }>> = new Map();
      let indexOfFace: number;

      for (let selectedIndex of selectedIndices) {
        for (let vertex of this.#uniqueVertices[selectedIndex].vertexToData.keys()) {
          if (faceToVerticesMap.has(this.#uniqueVertices[selectedIndex].vertexToData.get(vertex).face)) {
            faceToVerticesMap.get(this.#uniqueVertices[selectedIndex].vertexToData.get(vertex).face).push({ selectedIndex: selectedIndex, vertexIndex: vertex });
          } else {
            faceToVerticesMap.set(this.#uniqueVertices[selectedIndex].vertexToData.get(vertex).face, [{ selectedIndex: selectedIndex, vertexIndex: vertex }]);
          }
        }
      }
      for (let face of faceToVerticesMap.keys()) {
        if (faceToVerticesMap.get(face).length == selectedIndices.length) {
          indexOfFace = face;
          for (let indices of faceToVerticesMap.get(face)) {
            faceVerticesMap.set(indices.vertexIndex, indices.selectedIndex);
          }
        }
      }
      return { correctVertices: faceVerticesMap, face: indexOfFace };
    }

    // tslint:disable-next-line: member-ordering
    protected updatePositionOfVertex(vertexIndex: number, newPosition: ƒ.Vector3): void {
      this.#uniqueVertices[vertexIndex].position = newPosition;
      for (let index of this.#uniqueVertices[vertexIndex].vertexToData.keys()) {
        this.vertices.set([this.#uniqueVertices[vertexIndex].position.x, this.#uniqueVertices[vertexIndex].position.y, this.#uniqueVertices[vertexIndex].position.z], index * ModifiableMesh.vertexSize);
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
        for (let vertexIndex of this.#uniqueVertices[selectedIndex].vertexToData.keys()) {
          for (let indexInIndicesArray of this.#uniqueVertices[selectedIndex].vertexToData.get(vertexIndex).indices) {
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
          }
        }
      }
      return trigons;
    }


    // tslint:disable-next-line: member-ordering
    protected createVertices(): Float32Array {
      let length: number = 0;
      for (let vertex of this.#uniqueVertices) {
        length += vertex.vertexToData.size * ModifiableMesh.vertexSize;
      }
      let vertices: Float32Array = new Float32Array(length);
      for (let vertex of this.#uniqueVertices) {
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
      for (let vertex of this.#uniqueVertices) {
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