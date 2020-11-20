namespace FudgeCore {
  export class MeshCylinder extends Mesh {
    public static readonly iSubclass: number = Mesh.registerSubclass(MeshCylinder);
    public normals: Float32Array;

    private sectors: number;
    public constructor(_name: string = "MeshCylinder", _sectors: number = 8) {
      super(_name);
      this.create(_sectors);
    }
    
    public create(_sectors: number = 8): void {
      this.sectors = Math.min(_sectors, 128);

      let vertices: Array<number> = [];
      let normals: Array<number> = [];
      let texCoords: Array<number> = [];

      let unitVertices: Array<number> = this.getUnitVertices();

      for (let i: number = 0; i < 2; i++) {
        let valueZ: number = -1 + i * 2;

        // center point
        vertices.push(0); vertices.push(0); vertices.push(valueZ);
        normals.push(0); normals.push(0); normals.push(valueZ);
        texCoords.push(0.5); texCoords.push(0.5); 

        for (let j: number = 0, k: number = 0; j < this.sectors; j++, k += 3) {
          let unitX: number = unitVertices[k];
          let unitY: number = unitVertices[k + 1];
         
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

        for (let j: number = 0, k: number = 0; j < this.sectors; j++, k += 3) {
          let unitX: number = unitVertices[k];
          let unitY: number = unitVertices[k + 1];
          let unitZ: number = unitVertices[k + 2];
          // vertex side with x, y, z
          vertices.push(unitX);
          vertices.push(unitY);
          vertices.push(valueZ);

          // normal side with x, y, z
          normals.push(unitX);
          normals.push(unitY);
          normals.push(unitZ);

          // texCoords side with u, v
          texCoords.push(j / this.sectors);
          texCoords.push(t);
        }
      }       
      this.vertices = new Float32Array(vertices);
      this.normals = new Float32Array(normals);
      this.textureUVs = new Float32Array(texCoords);
      this.normalsFace = this.normals;
      this.indices = this.createIndices();
      this.createRenderBuffers();
    }

    public serialize(): Serialization {
      let serialization: Serialization = super.serialize();
      serialization.sectors = this.sectors;
      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      super.deserialize(_serialization);
      this.create(_serialization.sectors);
      return this;
    }

    private getUnitVertices(): Array<number> {
      let delta: number = (2 * Math.PI) / this.sectors;
      let angle: number;

      let unitVertices: Array<number> = [];

      for (let i: number = 0; i < this.sectors; i++) {
        angle = delta * i;
        unitVertices.push(Math.cos(angle));
        unitVertices.push(Math.sin(angle));
        unitVertices.push(0);
      }
      return unitVertices;
    }

    public async mutate(_mutator: Mutator): Promise<void> {
      super.mutate(_mutator);
      let sectors: number = Math.round(_mutator.sectors);
      this.create(sectors);
    }

    protected createVertices(): Float32Array {
      return this.vertices;
    }
    protected createTextureUVs(): Float32Array {
      return this.textureUVs;
    }

    protected createIndices(): Uint16Array {
      let baseCenterIndex: number = 0;
      let topCenterIndex: number = baseCenterIndex + this.sectors + 1; // include center vertex

      let indices: Array<number> = [];

      // starting index for bottom/top vertices
      let k: number = baseCenterIndex + 1;

      for (let i: number = 0; i < this.sectors; i++, k++) {
        if (i < this.sectors - 1) {
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

      for (let i: number = 0; i < this.sectors; i++, k++) {
        if (i < this.sectors - 1) {
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
      let k1: number = this.sectors * 2 + 2;
      let k2: number = k1 + this.sectors;
      // save k1 here for the wraparound on the last triangle
      k = k1;

      for (let i: number = 0; i < this.sectors; i++, k1++, k2++) {
        // side indices: top right -> top left -> bottom right
        indices.push(k1);
        indices.push(k1 + 1);
        indices.push(k2);

        // side indices: bottom right -> rop left -> bottom left
        if (i != this.sectors - 1) {
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