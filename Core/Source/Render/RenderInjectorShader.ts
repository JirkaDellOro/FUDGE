namespace FudgeCore {
  //gives WebGL Buffer the data from the {@link Shader}
  export class RenderInjectorShader {
    public static uboLightsInfo: { [key: string]: UboLightStrucure } = {};
    private static uboInfos: string[] = new Array();

    public static decorate(_constructor: Function): void {
      Object.defineProperty(_constructor, "useProgram", {
        value: RenderInjectorShader.useProgram
      });
      Object.defineProperty(_constructor, "deleteProgram", {
        value: RenderInjectorShader.deleteProgram
      });
      Object.defineProperty(_constructor, "createProgram", {
        value: RenderInjectorShader.createProgram
      });
    }

    public static useProgram(this: typeof Shader): void {
      if (!this.program)
        this.createProgram();

      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      crc3.useProgram(this.program);
    }

    public static deleteProgram(this: typeof Shader): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      if (this.program) {
        crc3.deleteProgram(this.program);
        delete this.attributes;
        delete this.uniforms;
        delete this.program;
      }
    }

    protected static createProgram(this: typeof Shader): void {
      Debug.fudge("Create shader program", this.name);
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      let program: WebGLProgram = crc3.createProgram();

      try {
        let shdVertex: WebGLShader = compileShader(this.getVertexShaderSource(), WebGL2RenderingContext.VERTEX_SHADER);
        let shdFragment: WebGLShader = compileShader(this.getFragmentShaderSource(), WebGL2RenderingContext.FRAGMENT_SHADER);

        crc3.attachShader(program, RenderWebGL.assert<WebGLShader>(shdVertex));
        crc3.attachShader(program, RenderWebGL.assert<WebGLShader>(shdFragment));
        crc3.linkProgram(program);

        let error: string = RenderWebGL.assert<string>(crc3.getProgramInfoLog(program));
        if (error !== "") {
          throw new Error("Error linking Shader: " + error);
        }

        this.program = program;

        this.attributes = detectAttributes();

        this.uniforms = detectUniforms();
      } catch (_error) {
        Debug.error(_error);
        debugger;
      }

      function compileShader(_shaderCode: string, _shaderType: GLenum): WebGLShader | null {
        let webGLShader: WebGLShader = crc3.createShader(_shaderType);
        crc3.shaderSource(webGLShader, _shaderCode);
        crc3.compileShader(webGLShader);
        let error: string = RenderWebGL.assert<string>(crc3.getShaderInfoLog(webGLShader));
        if (error !== "") {
          console.log(_shaderCode);

          throw new Error("Error compiling shader: " + error);
        }
        // Check for any compilation errors.
        if (!crc3.getShaderParameter(webGLShader, WebGL2RenderingContext.COMPILE_STATUS)) {
          alert(crc3.getShaderInfoLog(webGLShader));
          return null;
        }
        return webGLShader;
      }

      function detectAttributes(): { [name: string]: number } {
        let detectedAttributes: { [name: string]: number } = {};
        let attributeCount: number = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_ATTRIBUTES);
        for (let i: number = 0; i < attributeCount; i++) {
          let attributeInfo: WebGLActiveInfo = RenderWebGL.assert<WebGLActiveInfo>(crc3.getActiveAttrib(program, i));
          if (!attributeInfo) {
            break;
          }

          detectedAttributes[attributeInfo.name] = crc3.getAttribLocation(program, attributeInfo.name);

        }
        return detectedAttributes;
      }

      function detectUniforms(): { [name: string]: WebGLUniformLocation } {
        let detectedUniforms: { [name: string]: WebGLUniformLocation } = {};
        let uniformCount: number = crc3.getProgramParameter(program, WebGL2RenderingContext.ACTIVE_UNIFORMS);
        let oldLength: number = RenderInjectorShader.uboInfos.length;
        for (let i: number = 0; i < uniformCount; i++) {
          let info: WebGLActiveInfo = RenderWebGL.assert<WebGLActiveInfo>(crc3.getActiveUniform(program, i));
          if (!info) {
            break;
          }
          if (crc3.getUniformLocation(program, info.name) != null)
            detectedUniforms[info.name] = RenderWebGL.assert<WebGLRenderbuffer>(crc3.getUniformLocation(program, info.name));
          else if (!RenderInjectorShader.uboInfos.includes(info.name))
            RenderInjectorShader.uboInfos.push(info.name);
        }
        if (oldLength < RenderInjectorShader.uboInfos.length)
          setUniformInfosInUBO();
        return detectedUniforms;
      }

      function setUniformInfosInUBO(): void {
        initializeUBO();
        // Get the respective index of the member variables inside our Uniform Block
        let uboVariableIndices: General = crc3.getUniformIndices(
          program,
          RenderInjectorShader.uboInfos
        );
        // Get the offset of the member variables inside our Uniform Block in bytes
        let uboVariableOffsets: General = crc3.getActiveUniforms(
          program,
          uboVariableIndices,
          crc3.UNIFORM_OFFSET
        );

        // Create an object to map each variable name to its respective index and offset
        RenderInjectorShader.uboInfos.forEach((_name, _index) => {
          RenderInjectorShader.uboLightsInfo[_name] = new UboLightStrucure(uboVariableIndices[_index], uboVariableOffsets[_index]);
        });
      }

      function initializeUBO(): void {
        let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
        const blockIndex: number = crc3.getUniformBlockIndex(program, UNIFORM_BLOCKS.LIGHTS.NAME);
        const blockSize: number = crc3.getActiveUniformBlockParameter(
          program,
          blockIndex,
          crc3.UNIFORM_BLOCK_DATA_SIZE
        );
        const uboBuffer: WebGLBuffer = crc3.createBuffer();
        crc3.bindBuffer(crc3.UNIFORM_BUFFER, uboBuffer);
        crc3.bufferData(crc3.UNIFORM_BUFFER, blockSize, crc3.DYNAMIC_DRAW);
        crc3.bindBuffer(crc3.UNIFORM_BUFFER, null);
        crc3.uniformBlockBinding(program, blockIndex, UNIFORM_BLOCKS.LIGHTS.BINDING);
        crc3.bindBufferBase(crc3.UNIFORM_BUFFER, UNIFORM_BLOCKS.LIGHTS.BINDING, uboBuffer);
      }
    }
  }

  class UboLightStrucure {
    public index: { [key: string]: number } = {};
    public offset: { [key: string]: number } = {};
    constructor(_index: { [key: string]: number }, _offset: { [key: string]: number }) {
      this.index = _index;
      this.offset = _offset;
    }
  }
}