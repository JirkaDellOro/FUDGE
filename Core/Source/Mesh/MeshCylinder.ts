namespace FudgeCore {
  export class MeshCylinder extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshCylinder);
    private segments: number;

    public normals: Float32Array;

    public constructor(_segments: number = 8) {
      super();
      this.segments = _segments;

      this.create();
    }
    
    public create(): void {
      let vertices: Array<number> = [];
      let normals: Array<number> = [];
      let texCoords: Array<number> = [];

      let unitVertices = this.getUnitVertices();

      for (let i: number = 0; i < 2; i++) {
        let valueZ = -1 + i * 2;

        // center point
        vertices.push(0); vertices.push(0); vertices.push(valueZ);
        normals.push(0); normals.push(0); normals.push(valueZ);
        texCoords.push(0.5); texCoords.push(0.5); 

        for (let j: number = 0, k: number = 0; j < this.segments; j++, k += 3) {
          let unitX = unitVertices[k];
          let unitY = unitVertices[k + 1];
         
          // vertex bottom/top with x, y, z
          vertices.push(unitX);
          vertices.push(unitY);
          vertices.push(valueZ);

          //normals bottom/top with x, y, z
          normals.push(0);
          normals.push(0);
          normals.push(valueZ);

          // texCoords bottom/top with u, v
          texCoords.push(-unitX * 0.5 + 0.5);
          texCoords.push(-unitY * 0.5 + 0.5);
        }
      }       

      for (let i: number = 0; i < 2; i++) {
        let valueZ: number = -1 + i * 2;
        let t: number = 1 - i;

        for (let j: number = 0, k: number = 0; j < this.segments; j++, k += 3) {
          let unitX = unitVertices[k];
          let unitY = unitVertices[k + 1];
          let unitZ = unitVertices[k + 2];
          // vertex side with x, y, z
          vertices.push(unitX);
          vertices.push(unitY);
          vertices.push(valueZ);

          // normal side with x, y, z
          normals.push(unitX);
          normals.push(unitY);
          normals.push(unitZ);

          // texCoords side with u, v
          texCoords.push(j / this.segments);
          texCoords.push(t)
        }
      }       
      this.vertices = new Float32Array(vertices);
      this.normals = new Float32Array(normals);
      this.textureUVs = new Float32Array(texCoords);
      this.normalsFace = this.normals;
      this.indices = this.createIndices();
      this.createRenderBuffers();
    }

    private getUnitVertices(): Array<number> {
      let delta: number = (2 * Math.PI) / this.segments;
      let angle: number;

      let unitVertices: Array<number> = [];

      for (let i: number = 0; i < this.segments; i++) {
        angle = delta * i;
        unitVertices.push(Math.cos(angle));
        unitVertices.push(Math.sin(angle));
        unitVertices.push(0);
      }
      return unitVertices;
    }

    protected createVertices(): Float32Array {
      return this.vertices;
    }
    protected createTextureUVs(): Float32Array {
      return this.textureUVs;
    }

    protected createIndices(): Uint16Array {
      let baseCenterIndex: number = 0;
      let topCenterIndex: number = baseCenterIndex + this.segments + 1; // include center vertex

      let indices: Array<number> = [];

      // starting index for bottom/top vertices
      let k: number = baseCenterIndex + 1;

      for (let i = 0; i < this.segments; i++, k++) {
        if (i < this.segments - 1) {
          // bottom indices right -> center -> left
          indices.push(baseCenterIndex);
          indices.push(k + 1);
          indices.push(k);
        } else { 
          // loops back for the last index
          indices.push(baseCenterIndex);
          indices.push(baseCenterIndex + 1);
          indices.push(k);
        }
      }

      k = topCenterIndex + 1;

      for (let i = 0; i < this.segments; i++, k++) {
        if (i < this.segments - 1) {
          // top indices right -> center -> left
          indices.push(topCenterIndex);
          indices.push(k);
          indices.push(k + 1);
        } else { 
          indices.push(topCenterIndex);
          indices.push(k);
          indices.push(topCenterIndex + 1);
        }
      }

      // offset for the side vertices, since the bottom/top are placed first in the array
      let k1: number = this.segments * 2 + 2;
      let k2: number = k1 + this.segments;
      // save k1 here for the wraparound on the last triangle
      k = k1;

      for (let i = 0; i < this.segments; i++, k1++, k2++) {
        // side indices: top right -> top left -> bottom right
        indices.push(k1);
        indices.push(k1 + 1);
        indices.push(k2);

        // side indices: bottom right -> rop left -> bottom left
        if (i != this.segments - 1) {
          indices.push(k2);
          indices.push(k1 + 1);
          indices.push(k2 + 1);
        } else {
          indices.push(k1);
          indices.push(k);
          indices.push(k1 + 1);
        }
      }

      return new Uint16Array(indices);
    }

    //TODO: we also need REAL face normals
    protected createFaceNormals(): Float32Array {
      return this.normals;
    }
  }
}