namespace FudgeCore {
    /**
     * Generate a Torus with a given thickness and the number of major- and minor segments
     * @authors Simon Storl-Schulke, HFU, 2020 | Jirka Dell'Oro-Friedl, HFU, 2020
     */
    export class MeshTorus extends Mesh {
        public static readonly iSubclass: number = Mesh.registerSubclass(MeshSphere);

        public normals: Float32Array;
        
        public constructor(
            private _thickness: number = 0.25,
            private _majorSegments: number = 32,
            private _minorSegments: number = 12) {
            super();

            //Clamp resolution to prevent performance issues
            this._majorSegments = Math.min(_majorSegments, 128);
            this._minorSegments = Math.min(_minorSegments, 128);

            if (_majorSegments < 3 || _minorSegments < 3) {
                Debug.warn("Torus must have at least 3 major and minor segments");
                this._majorSegments = Math.max(3, _majorSegments);
                this._minorSegments = Math.max(3, _minorSegments);
            }

            this.create();
        }

        public create(): void {
            let vertices: Array<number> = [];
            let normals: number[] = [];
            let textureUVs: number[] = [];

            let center: number[] = [0, 0, 0];


            let x: number, y: number, z: number;
            let PI2: number = Math.PI * 2;
            for (let j: number = 0; j <= this._minorSegments; j++) {
                for (let i: number = 0; i <= this._majorSegments; i++) {
                    let u: number = i / this._majorSegments * PI2;
                    let v: number = j / this._minorSegments * PI2;

                    center[0] = Math.cos(u);
                    center[1] = Math.sin(u);

                    x = (1 + this._thickness * Math.cos(v)) * Math.sin(u);
                    y = this._thickness * Math.sin(v);
                    z = (1 + this._thickness * Math.cos(v)) * Math.cos(u);

                    vertices.push(x, y, z);
                    let normal: Vector3 = new Vector3(x - center[0], y - center[1], z);
                    normal.normalize();
                    normals.push(normal.x, normal.y, normal.z);

                    textureUVs.push(i / this._majorSegments, j / this._minorSegments);
                }
            }

            // scale down
            vertices = vertices.map(_value => _value / 2.5);

            this.textureUVs = new Float32Array(textureUVs);
            this.normals = new Float32Array(normals);
            this.vertices = new Float32Array(vertices);
            this.normalsFace = this.createFaceNormals();
            this.indices = this.createIndices();
            this.createRenderBuffers();
        }

        protected createIndices(): Uint16Array {
            let inds: Array<number> = [];

            for (let j = 1; j <= this._minorSegments; j++) {
                for (let i = 1; i <= this._majorSegments; i++) {
                    let a: number = (this._majorSegments + 1) * j + i - 1;
                    let b: number = (this._majorSegments + 1) * (j - 1) + i - 1;
                    let c: number = (this._majorSegments + 1) * (j - 1) + i;
                    let d: number = (this._majorSegments + 1) * j + i;

                    inds.push(a, b, d, b, c, d);
                }
            }
            let indices: Uint16Array = new Uint16Array(inds);
            return indices;
        }

        protected createVertices(): Float32Array {
            return this.vertices;
        }

        protected createTextureUVs(): Float32Array {
            return this.textureUVs;
        }

        //TODO: we also need REAL face normals
        protected createFaceNormals(): Float32Array {
            return this.normals;
        }
    }
}