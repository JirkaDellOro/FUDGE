namespace Fudge {
    export interface BufferSpecification {
        size: number;   // The size of the datasample.
        dataType: number; // The datatype of the sample (e.g. gl.FLOAT, gl.BYTE, etc.)
        normalize: boolean; // Flag to normalize the data.
        stride: number; // Number of indices that will be skipped each iteration.
        offset: number; // Index of the element to begin with.
    }
    /*
    interface MapNodeToRenderData {
        [key: Node]: RenderData
    }
    */
    interface RenderData {
        shader: Shader;
        material: Material;
        mesh: Mesh;
        doneTranformToWorld: boolean;
    }
    interface ShaderProgram {
        webGLProgram: WebGLProgram;
        attributes: { [name: string]: number };
        uniforms: { [name: string]: WebGLUniformLocation };
    }
    class Reference<T> {
        private reference: T;
        private count: number = 0;

        constructor(_reference: T) {
            this.reference = _reference;
        }

        public increaseCounter(): number {
            this.count++;
            return this.count;
        }
        public decreaseCounter(): number {
            if (this.count == 0) throw (new Error("Negative reference counter"));
            this.count--;
            return this.count;
        }
    }
    export class WebGL {
        private canvas: HTMLCanvasElement; //offscreen render buffer
        private crc3: WebGL2RenderingContext;
        private programs: Map<Shader, Reference<WebGLProgram>> = new Map();
        private parameters: Map<Material, Reference<WebGLVertexArrayObject>> = new Map();
        private buffers: Map<Mesh, Reference<WebGLBuffer>> = new Map();
        private nodes: Map<Node, RenderData> = new Map();

        public addNode(_node: Node): void {
            if (this.nodes.get(_node))
                return;

            let shader: Shader = (<ComponentMaterial>(_node.getComponents(ComponentMaterial)[0])).Material.Shader;
            let rfrProgram: Reference<WebGLProgram>;
            rfrProgram = this.programs.get(shader);
            if (rfrProgram)
                rfrProgram.increaseCounter();
            else {
                let program: WebGLProgram = this.createProgram(shader);
                rfrProgram = new Reference<WebGLProgram>(program);
                rfrProgram.increaseCounter();
                this.programs.set(shader, rfrProgram);
            }

            let material: Material = (<ComponentMaterial>(_node.getComponents(ComponentMaterial)[0])).Material;
            let rfrParameter: Reference<WebGLVertexArrayObject>;
            rfrProgram = this.parameters.get(material);
            if (rfrParameter)
                rfrParameter.increaseCounter();
            else {
                let parameter: WebGLVertexArrayObject = this.createParameter(material);
                rfrParameter = new Reference<WebGLVertexArrayObject>(parameter);
                rfrParameter.increaseCounter();
                this.parameters.set(material, rfrParameter);
            }
        }

        //function createReference(_in: Map, )

        private createProgram(_shader: Shader): ShaderProgram {
            let crc3: WebGL2RenderingContext = this.crc3;
            let shaderProgram: WebGLProgram = new WebGLProgram();
            crc3.attachShader(shaderProgram, GLUtil.assert<WebGLShader>(compileShader(_shader.loadVertexShaderSource(), crc3.VERTEX_SHADER)));
            crc3.attachShader(shaderProgram, GLUtil.assert<WebGLShader>(compileShader(_shader.loadFragmentShaderSource(), crc3.FRAGMENT_SHADER)));
            crc3.linkProgram(shaderProgram);
            let error: string = GLUtil.assert<string>(crc3.getProgramInfoLog(shaderProgram));
            if (error !== "") {
                throw new Error("Error linking Shader: " + error);
            }
            let program: ShaderProgram = {
                webGLProgram: shaderProgram,
                attributes: detectAttributes(),
                uniforms: detectUniforms()
            }
            return program;


            function compileShader(_shaderCode: string, _shaderType: GLenum): WebGLShader | null {
                let webGLShader: WebGLShader = crc3.createShader(_shaderType);
                crc3.shaderSource(webGLShader, _shaderCode);
                crc3.compileShader(webGLShader);
                let error: string = GLUtil.assert<string>(crc3.getShaderInfoLog(webGLShader));
                if (error !== "") {
                    throw new Error("Error compiling shader: " + error);
                }
                // Check for any compilation errors.
                if (!crc3.getShaderParameter(webGLShader, crc3.COMPILE_STATUS)) {
                    alert(crc3.getShaderInfoLog(webGLShader));
                    return null;
                }
                return webGLShader;
            }
            function detectAttributes(): { [name: string]: number } {
                let detectedAttributes: { [name: string]: number } = {};
                let attributeCount: number = crc3.getProgramParameter(shaderProgram, crc3.ACTIVE_ATTRIBUTES);
                for (let i: number = 0; i < attributeCount; i++) {
                    let attributeInfo: WebGLActiveInfo = GLUtil.assert<WebGLActiveInfo>(crc3.getActiveAttrib(shaderProgram, i));
                    if (!attributeInfo) {
                        break;
                    }
                    detectedAttributes[attributeInfo.name] = crc3.getAttribLocation(shaderProgram, attributeInfo.name);
                }
                return detectedAttributes;
            }
            function detectUniforms(): { [name: string]: WebGLUniformLocation } {
                let detectedUniforms: { [name: string]: WebGLUniformLocation } = {};
                let uniformCount: number = crc3.getProgramParameter(shaderProgram, crc3.ACTIVE_UNIFORMS);
                for (let i: number = 0; i < uniformCount; i++) {
                    let info: WebGLActiveInfo = GLUtil.assert<WebGLActiveInfo>(crc3.getActiveUniform(shaderProgram, i));
                    if (!info) {
                        break;
                    }
                    detectedUniforms[info.name] = GLUtil.assert<WebGLUniformLocation>(crc3.getUniformLocation(shaderProgram, info.name));
                }
                return detectedUniforms;
            }
        }

        private deleteProgram(_program: ShaderProgram): void {
            if (_program) {
                this.crc3.deleteProgram(_program.webGLProgram);
                delete _program.attributes;
                delete _program.uniforms;
            }

        }
        private createParameter(_material: Material): WebGLVertexArrayObject {
            return new WebGLVertexArrayObject();
        }

        private createBuffer(_mesh: Mesh): WebGLBuffer {
            let crc3: WebGL2RenderingContext = this.crc3;
            let bufferCreated: WebGLBuffer | null = crc3.createBuffer();
            if (bufferCreated === null)
                return;
            let buffer: WebGLBuffer = bufferCreated;
            let vertexArrayObjectCreated: WebGLVertexArrayObject | null = crc3.createVertexArray();
            if (vertexArrayObjectCreated === null) return;
            let vertexArrayObject: WebGLVertexArrayObject = vertexArrayObjectCreated;
            crc3.bindVertexArray(vertexArrayObject);
            crc3.bindBuffer(crc3.ARRAY_BUFFER, buffer);
            crc3.bufferData(crc3.ARRAY_BUFFER, _mesh.getVertices(), crc3.STATIC_DRAW);
            return buffer;
        }

        private deleteBuffer(_buffer: WebGLBuffer): void {
            if (_buffer)
                this.crc3.deleteBuffer(_buffer);
        }
    }
}