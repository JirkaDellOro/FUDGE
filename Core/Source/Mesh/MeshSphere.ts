namespace FudgeCore {
    /**
     * Generate a UV Sphere with a given number of sectors and stacks.
     * @authors Jirka Dell'Oro-Friedl, Simon Storl-Schulke, HFU, 2020
     */
    export class MeshSphere extends Mesh {
        
        private _sectors: number; get sectors(): number {return this._sectors;}
        private _stacks: number; get stacks(): number {return this._stacks;}
        
        private normals: Array<number> = [];

        public constructor(_meridians: number = 12, _parallels: number = 8) {
            super();
            this._sectors = _meridians;
            this._stacks = _parallels;
            this.create();
        }
        
        public create(): void {
            this.vertices = this.createVertices();
            this.indices = this.createIndices();
            this.textureUVs = this.createTextureUVs();
            this.normalsFace = this.createFaceNormals();
        }


        protected createVertices(): Float32Array {

            let verts: Array<number> = [];
            
            let x: number;
            let z: number;
            let y: number;
            let xy: number;
            
            let sectorStep: number = 2 * Math.PI / this._sectors;
            let stackStep: number = Math.PI / this._stacks;
            let stackAngle: number;
            let sectorAngle: number;
            
            for (let i = 0; i <= this._stacks; i++) {
                stackAngle = Math.PI / 2 - i * stackStep;
                xy = Math.cos(stackAngle);
                z = Math.sin(stackAngle);
                
                for (let j = 0; j <= this._sectors; j++) {
                    sectorAngle = j * sectorStep;

                    //Vertex Pos
                    x = xy * Math.cos(sectorAngle);
                    y = xy * Math.sin(sectorAngle);
                    verts.push(x);
                    verts.push(y);
                    verts.push(z);

                    //Normals
                    this.normals.push(x);
                    this.normals.push(y);
                    this.normals.push(z);
                }
                
            }

            let vertices: Float32Array = new Float32Array(verts);
            console.log(vertices.length);
            return vertices;
        }

        protected createIndices(): Uint16Array {
            let inds: Array<number> = [];

            let k1: number;
            let k2: number;
            
            for (let i = 0; i < this._stacks; i++) {
                k1 = i * (this._sectors + 1);   // beginning of current stack
                k2 = k1 + this._sectors + 1;    // beginning of next stack

                for (let j = 0; j < this._sectors; j++, ++k1, ++k2) {
                    if (i != 0) {
                        inds.push(k1);
                        inds.push(k2);
                        inds.push(k1 + 1);
                    }

                    if (i != (this._stacks - 1)) {
                        inds.push(k1 + 1);
                        inds.push(k2);
                        inds.push(k2 + 1);
                    }
                }
            }

            let indices: Uint16Array = new Uint16Array(inds);
            console.log(indices);
            return indices;
        }
        protected createTextureUVs(): Float32Array {
            let textureUVs: Float32Array = new Float32Array([
                // TODO
            ]);
            return textureUVs;
        }

        protected createFaceNormals(): Float32Array {
            let normals: Float32Array = new Float32Array(this.normals);
            return normals;
        }
    }
}