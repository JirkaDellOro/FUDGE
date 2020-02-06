namespace FudgeCore {
    /**
     * Generate a UV Sphere with a given number of sectors and stacks (clamped at 128*128)
     * Implementation based on http://www.songho.ca/opengl/gl_sphere.html
     * @authors Jirka Dell'Oro-Friedl, Simon Storl-Schulke, HFU, 2020
     */
    export class MeshSphere extends Mesh {
        
        private _sectors: number; get sectors(): number {return this._sectors;}
        private _stacks: number; get stacks(): number {return this._stacks;}
        
        // Dirty Workaround to have access to the normals from createVertices()
        private _normals: Array<number> = [];
        private _textureUVs: Array<number> = [];

        public constructor(_sectors: number = 12, _stacks: number = 8) {
            super();

            //Clamp resolution to prevent performance issues
            this._sectors = Math.min(_sectors, 128);
            this._stacks =  Math.min(_stacks, 128);

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
            let xz: number;
            let y: number;
            

            let sectorStep: number = 2 * Math.PI / this._sectors;
            let stackStep: number = Math.PI / this._stacks;
            let stackAngle: number;
            let sectorAngle: number;
            
            /* add (sectorCount+1) vertices per stack.
            the first and last vertices have same position and normal, 
            but different tex coords */
            for (let i = 0; i <= this._stacks; ++i) {
                stackAngle = Math.PI / 2 - i * stackStep;
                xz = Math.cos(stackAngle);
                y = Math.sin(stackAngle);
                
                // add (sectorCount+1) vertices per stack
                // the first and last vertices have same position and normal, but different tex coords
                for (let j = 0; j <= this._sectors; ++j) {
                    sectorAngle = j * sectorStep;

                    //vertex position
                    x = xz * Math.cos(sectorAngle);
                    z = xz * Math.sin(sectorAngle);
                    verts.push(x);
                    verts.push(y);
                    verts.push(z);

                    //normals
                    this._normals.push(x);
                    this._normals.push(y);
                    this._normals.push(z);

                    //UV Coords
                    this._textureUVs.push(j / this._sectors);
                    this._textureUVs.push(i / this._stacks);
                }
            }

            let vertices: Float32Array = new Float32Array(verts);

            // scale down
            vertices = vertices.map(_value => _value / 2);
            return vertices;
        }

        protected createIndices(): Uint16Array {
            let inds: Array<number> = [];

            let k1: number;
            let k2: number;
            
            for (let i = 0; i < this._stacks; ++i) {
                k1 = i * (this._sectors + 1);   // beginning of current stack
                k2 = k1 + this._sectors + 1;    // beginning of next stack

                for (let j = 0; j < this._sectors; ++j, ++k1, ++k2) {

                    // 2 triangles per sector excluding first and last stacks
                    // k1 => k2 => k1+1
                    if (i != 0) {
                        inds.push(k1);
                        inds.push(k1 + 1);
                        inds.push(k2);
                    }
                    
                    if (i != (this._stacks - 1)) {
                        inds.push(k1 + 1);
                        inds.push(k2 + 1);
                        inds.push(k2);
                    }
                }
            }
            let indices: Uint16Array = new Uint16Array(inds);
            return indices;
        }
        protected createTextureUVs(): Float32Array {
            let textureUVs: Float32Array = new Float32Array(this._textureUVs);
            return textureUVs;
        }

        protected createFaceNormals(): Float32Array {
            let normals: Float32Array = new Float32Array(this._normals);
            return normals;
        }
    }
}