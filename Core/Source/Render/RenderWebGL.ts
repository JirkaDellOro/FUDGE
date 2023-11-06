///<reference path="RenderInjector.ts"/>
///<reference path="RenderInjectorShader.ts"/>
///<reference path="RenderInjectorCoat.ts"/>
///<reference path="RenderInjectorMesh.ts"/>
///<reference path="RenderInjectorShaderParticleSystem.ts"/>
///<reference path="RenderInjectorComponentParticleSystem.ts"/>
///<reference path="../Math/Rectangle.ts"/>

namespace FudgeCore {
  // export declare let fudgeConfig: General;

  export type RenderTexture = WebGLTexture;

  export enum BLEND {
    OPAQUE, TRANSPARENT, ADDITIVE, SUBTRACTIVE, MODULATE
  }

  export interface BufferSpecification {
    size: number;   // The size of the datasample.
    dataType: number; // The datatype of the sample (e.g. gl.FLOAT, gl.BYTE, etc.)
    normalize: boolean; // Flag to normalize the data.
    stride: number; // Number of indices that will be skipped each iteration.
    offset: number; // Index of the element to begin with.
  }

  export const UNIFORM_BLOCKS: { [block: string]: { NAME: string; BINDING: number } } = {
    LIGHTS: {
      NAME: "Lights",
      BINDING: 0
    },
    SKIN: {
      NAME: "Skin",
      BINDING: 1
    }
  };

  export const TEXTURE_LOCATION: { [name: string]: { UNIFORM: string; UNIT: number; INDEX: number } } = {
    ALBEDO: {
      UNIFORM: "u_texture", // TODO: mabye rename to u_albedo? or u_baseColorTexture? 
      UNIT: WebGL2RenderingContext.TEXTURE0,
      INDEX: 0 // could compute these by WebGL2RenderingContext.TEXTURE0 - UNIT
    },
    NORMAL: {
      UNIFORM: "u_normalMap", // TODO: mabye rename to u_normal? or u_normalTexture? baseColorTexture and normalTexture are used in gltf
      UNIT: WebGL2RenderingContext.TEXTURE1,
      INDEX: 1
    },
    PARTICLE: {
      UNIFORM: "u_particleSystemRandomNumbers",
      UNIT: WebGL2RenderingContext.TEXTURE2,
      INDEX: 2
    }
  };

  /**
   * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
   * Methods and attributes of this class should not be called directly, only through {@link Render}
   */
  export abstract class RenderWebGL extends EventTargetStatic {
    public static uboLights: WebGLBuffer;
    public static uboLightsVariableOffsets: { [_name: string]: number }; // Maps the names of the variables inside the Lights uniform block to their respective byte offset

    // main
    protected static mainFramebuffer: WebGLFramebuffer;
    protected static mainTexture: WebGLTexture;

    // mist
    protected static mistFramebuffer: WebGLFramebuffer;
    protected static mistTexture: WebGLTexture;

    // ambient Occlusion
    protected static aoNormalFramebuffer: WebGLFramebuffer;
    protected static aoNormalTexture: WebGLTexture;
    protected static aoDepthTexture: WebGLTexture;
    protected static aoFramebuffer: WebGLFramebuffer;
    protected static aoTexture: WebGLTexture;
    protected static aoSamplePoints: Vector3[] = [];

    // bloom
    protected static bloomDownsamplingFramebuffers: WebGLFramebuffer[] = [];
    protected static bloomDownsamplingTextures: WebGLTexture[] = [];
    protected static bloomUpsamplingFramebuffers: WebGLFramebuffer[] = [];
    protected static bloomUpsamplingTextures: WebGLTexture[] = [];
    protected static bloomDownsamplingDepth: number = 7;

    protected static crc3: WebGL2RenderingContext = RenderWebGL.initialize();
    protected static ƒpicked: Pick[];

    private static rectRender: Rectangle = RenderWebGL.getCanvasRect();
    private static sizePick: number;

    /**
     * Initializes offscreen-canvas, renderingcontext and hardware viewport. Call once before creating any resources like meshes or shaders
     */
    public static initialize(_antialias?: boolean, _alpha?: boolean): WebGL2RenderingContext {
      let fudgeConfig: General = Reflect.get(globalThis, "fudgeConfig") || {};
      let contextAttributes: WebGLContextAttributes = {
        alpha: (_alpha != undefined) ? _alpha : fudgeConfig.alpha || false,
        antialias: (_antialias != undefined) ? _antialias : fudgeConfig.antialias || false,
        premultipliedAlpha: false
      };
      Debug.fudge("Initialize RenderWebGL", contextAttributes);
      let canvas: HTMLCanvasElement = document.createElement("canvas");
      let crc3: WebGL2RenderingContext;
      crc3 = RenderWebGL.assert<WebGL2RenderingContext>(
        canvas.getContext("webgl2", contextAttributes),
        "WebGL-context couldn't be created"
      );
      RenderWebGL.crc3 = crc3;
      // Enable backface- and zBuffer-culling.
      crc3.enable(WebGL2RenderingContext.CULL_FACE);
      crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
      crc3.enable(WebGL2RenderingContext.BLEND);
      crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
      RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
      // RenderOperator.crc3.pixelStorei(WebGL2RenderingContext.UNPACK_FLIP_Y_WEBGL, true);
      RenderWebGL.rectRender = RenderWebGL.getCanvasRect();

      return crc3;
    }

    /** 
     * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
     * @param _attributeLocation  The location of the attribute on the shader, to which they data will be passed.
     * @param _bufferSpecification  Interface passing datapullspecifications to the buffer.
     */
    public static setAttributeStructure(_attributeLocation: number, _bufferSpecification: BufferSpecification): void {
      RenderWebGL.crc3.vertexAttribPointer(_attributeLocation, _bufferSpecification.size, _bufferSpecification.dataType, _bufferSpecification.normalize, _bufferSpecification.stride, _bufferSpecification.offset);
    }

    /**
     * Creates a {@link WebGLBuffer}.
     */
    public static createBuffer(_type: GLenum, _array: Float32Array | Uint16Array): WebGLBuffer {
      let buffer: WebGLBuffer = RenderWebGL.assert<WebGLBuffer>(RenderWebGL.crc3.createBuffer());
      RenderWebGL.crc3.bindBuffer(_type, buffer);
      RenderWebGL.crc3.bufferData(_type, _array, WebGL2RenderingContext.STATIC_DRAW);
      return buffer;
    }

    /**
    * Checks the first parameter and throws an exception with the WebGL-errorcode if the value is null
    * @param _value  value to check against null
    * @param _message  optional, additional message for the exception
    */
    public static assert<T>(_value: T | null, _message: string = ""): T {
      if (_value === null)
        throw new Error(`Assertion failed. ${_message}, WebGL-Error: ${RenderWebGL.crc3 ? RenderWebGL.crc3.getError() : ""}`);
      return _value;
    }

    /**
     * Return a reference to the offscreen-canvas
     */
    public static getCanvas(): HTMLCanvasElement {
      return <HTMLCanvasElement>RenderWebGL.crc3.canvas; // TODO: enable OffscreenCanvas
    }

    /**
     * Return a reference to the rendering context
     */
    public static getRenderingContext(): WebGL2RenderingContext {
      return RenderWebGL.crc3;
    }

    /**
     * Return a rectangle describing the size of the offscreen-canvas. x,y are 0 at all times.
     */
    public static getCanvasRect(): Rectangle {
      let canvas: HTMLCanvasElement = <HTMLCanvasElement>RenderWebGL.crc3.canvas;
      return Rectangle.GET(0, 0, canvas.width, canvas.height);
    }

    /**
     * Set the size of the offscreen-canvas.
     */
    public static setCanvasSize(_width: number, _height: number): void {
      RenderWebGL.crc3.canvas.width = _width;
      RenderWebGL.crc3.canvas.height = _height;
    }

    /**
     * Set the area on the offscreen-canvas to render the camera image to.
     * @param _rect
     */
    public static setRenderRectangle(_rect: Rectangle): void {
      RenderWebGL.rectRender.setPositionAndSize(_rect.x, _rect.y, _rect.width, _rect.height);
      RenderWebGL.crc3.viewport(_rect.x, _rect.y, _rect.width, _rect.height);
    }

    /**
     * Clear the offscreen renderbuffer with the given {@link Color}
     */
    public static clear(_color: Color = null): void {
      RenderWebGL.crc3.clearColor(_color.r, _color.g, _color.b, _color.a);
      RenderWebGL.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);
    }

    /**
     * Reset the offscreen framebuffer to the original RenderingContext
     */
    public static resetFramebuffer(_buffer: WebGLFramebuffer = null): void {
      RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, _buffer);
    }

    /**
     * Retrieve the area on the offscreen-canvas the camera image gets rendered to.
     */
    public static getRenderRectangle(): Rectangle {
      return RenderWebGL.rectRender;
    }

    /**
     * Enable / Disable WebGLs depth test
     */
    public static setDepthTest(_test: boolean): void {
      if (_test)
        RenderWebGL.crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
      else
        RenderWebGL.crc3.disable(WebGL2RenderingContext.DEPTH_TEST);
    }

    /**
     * Set the blend mode to render with
     */
    public static setBlendMode(_mode: BLEND): void {
      switch (_mode) {
        case BLEND.OPAQUE:
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ZERO);
          break;
        case BLEND.TRANSPARENT:
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
          // RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.DST_ALPHA, WebGL2RenderingContext.ONE_MINUS_DST_ALPHA);
          break;
        case BLEND.ADDITIVE:
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.DST_ALPHA);
          break;
        case BLEND.SUBTRACTIVE:
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_REVERSE_SUBTRACT);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.DST_ALPHA);
          break;
        case BLEND.MODULATE: // color gets multiplied, tried to copy unitys "Particle Shader: Blending Option: Rendering Mode: Modulate"
          RenderWebGL.crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
          RenderWebGL.crc3.blendFunc(WebGL2RenderingContext.DST_COLOR, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
        default:
          break;
      }
    }

    /**
     * Creates and stores texture buffers to be used for Post-FX
     */
    public static initializeFramebuffers(_mist: boolean = true, _ao: boolean = true, _bloom: boolean = true): void {
      [RenderWebGL.mainFramebuffer, RenderWebGL.mainTexture, RenderWebGL.aoDepthTexture] = RenderWebGL.createFramebuffer(WebGLTexture); //TODO: Since the normalcalculations for the AO pass as of for now do not support transparent materials the depthTexture is taken from the main render for transparency support in the depth pass

      // Render.initScreenQuad();

      if (_mist)
        [RenderWebGL.mistFramebuffer, RenderWebGL.mistTexture] = RenderWebGL.createFramebuffer(WebGLRenderbuffer);


      if (_ao) {
        [RenderWebGL.aoFramebuffer, RenderWebGL.aoTexture] = RenderWebGL.createFramebuffer(WebGLRenderbuffer);
        [RenderWebGL.aoNormalFramebuffer, RenderWebGL.aoNormalTexture] = RenderWebGL.createFramebuffer(WebGLRenderbuffer);
        RenderWebGL.generateNewSamplePoints();
      }

      if (_bloom) {
        RenderWebGL.bloomDownsamplingFramebuffers.length = 0;
        RenderWebGL.bloomDownsamplingTextures.length = 0;
        RenderWebGL.bloomUpsamplingFramebuffers.length = 0;
        RenderWebGL.bloomUpsamplingTextures.length = 0;

        let div: number = 2;
        for (let i: number = 0; i < RenderWebGL.bloomDownsamplingDepth; i++) {
          [RenderWebGL.bloomDownsamplingFramebuffers[i], RenderWebGL.bloomDownsamplingTextures[i]] = RenderWebGL.createFramebuffer(WebGLRenderbuffer, div);
          div *= 2;
        }

        div = 2;
        for (let i: number = 0; i < RenderWebGL.bloomDownsamplingDepth - 1; i++) {
          [RenderWebGL.bloomUpsamplingFramebuffers[i], RenderWebGL.bloomUpsamplingTextures[i]] = RenderWebGL.createFramebuffer(WebGLRenderbuffer, div);
          div *= 2;
        }
      }
    }

    /**
     * Adjusts the size of the set framebuffers corresponding textures
     */
    public static adjustFramebuffers(_main: boolean = true, _ao: boolean = false, _mist: boolean = false, _bloom: boolean = false): void {
      if (_main)
        RenderWebGL.updateFramebuffer(RenderWebGL.mainFramebuffer);

      if (_ao) {
        RenderWebGL.updateFramebuffer(RenderWebGL.aoNormalFramebuffer);
        RenderWebGL.updateFramebuffer(RenderWebGL.aoFramebuffer);
      }

      if (_mist)
        RenderWebGL.updateFramebuffer(RenderWebGL.mistFramebuffer);

      if (_bloom) {
        let div: number = 2;
        for (let i: number = 0; i < RenderWebGL.bloomDownsamplingFramebuffers.length; i++) {
          RenderWebGL.updateFramebuffer(RenderWebGL.bloomDownsamplingFramebuffers[i], undefined, undefined, div);
          div *= 2;
        }
        div = 2;
        for (let i: number = 0; i < RenderWebGL.bloomUpsamplingFramebuffers.length; i++) {
          RenderWebGL.updateFramebuffer(RenderWebGL.bloomUpsamplingFramebuffers[i], undefined, undefined, div);
          div *= 2;
        }
      }

      // function adjustFramebuffer(_buffer: WebGLFramebuffer, _texture: WebGLTexture, _depth: WebGLTexture = undefined, _divider: number = 1): void {
      // let bufferData: PostBufferdata = RenderWebGL.updateFramebuffer(_buffer, _texture, _depth, _divider);
      // _texture = bufferData.texture; // does this achieve anything?
      // }
    }

    /**
     * Composites all effects that are used in the scene to a final render.
     */
    public static compositeEffects(_cmpCamera: ComponentCamera, _cmpMist: ComponentMist, _cmpAmbientOcclusion: ComponentAmbientOcclusion, _cmpBloom: ComponentBloom): void {
      RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);              //Reset to main color buffer
      RenderWebGL.setDepthTest(false);

      //feed texture and uniform matrix
      function bindTexture(_texture: WebGLTexture, _texSlot: number, _texSlotNumber: number, _texVarName: string): void {
        RenderWebGL.crc3.activeTexture(_texSlot);
        RenderWebGL.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, _texture);
        RenderWebGL.crc3.uniform1i(shader.uniforms[_texVarName], _texSlotNumber);
      }

      let shader: typeof Shader = ShaderScreen;
      shader.useProgram();

      //set main-render
      bindTexture(RenderWebGL.mainTexture, WebGL2RenderingContext.TEXTURE0, 0, "u_mainTexture");
      RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_width"], Render.crc3.canvas.width);
      RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_height"], Render.crc3.canvas.height);

      //set ao-texture and color if available
      if (_cmpAmbientOcclusion != null) if (_cmpAmbientOcclusion.isActive) {
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_ao"], 1);
        bindTexture(RenderWebGL.aoTexture, WebGL2RenderingContext.TEXTURE1, 1, "u_aoTexture");
        RenderWebGL.getRenderingContext().uniform4fv(shader.uniforms["u_vctAOColor"], _cmpAmbientOcclusion.clrAO.getArray());
      } else {
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_ao"], 0);
      }

      //set mist-texture and color if available
      if (_cmpMist != null) if (_cmpMist.isActive) {
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_mist"], 1);
        bindTexture(RenderWebGL.mistTexture, WebGL2RenderingContext.TEXTURE2, 2, "u_mistTexture");
        RenderWebGL.getRenderingContext().uniform4fv(shader.uniforms["u_vctMistColor"], _cmpMist.clrMist.getArray());
      } else {
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_mist"], 0);
      }

      //set bloom-texture, intensity and highlight desaturation if available
      if (_cmpBloom != null) if (_cmpBloom.isActive) {
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_bloom"], 1);
        bindTexture(RenderWebGL.bloomUpsamplingTextures[0], WebGL2RenderingContext.TEXTURE3, 3, "u_bloomTexture");
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_bloomIntensity"], _cmpBloom.intensity);
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_highlightDesaturation"], _cmpBloom.desaturateHighlights);
      } else {
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_bloom"], 0);
      }

      RenderWebGL.crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);
      RenderWebGL.setDepthTest(true);
    }

    /**
     * Draws the bloom-effect into the bloom texture, using the given camera-component and the given bloom-component
     */
    public static drawBloom(_cmpBloom: ComponentBloom): void {
      let tempTexture: WebGLTexture = RenderWebGL.mainTexture;    // Temporary texture that gets progressively smaller while downsampling.
      let divisor: number = 2;                                        // Divisor is increased by x2 every downsampling-stage

      let shader: typeof Shader = ShaderDownsample;
      shader.useProgram();

      //Downsampling
      for (let i: number = 0; i < RenderWebGL.bloomDownsamplingFramebuffers.length; i++) {
        let width: number = Math.max(Render.crc3.canvas.width / divisor, 1);
        let height: number = Math.max(Render.crc3.canvas.height / divisor, 1);

        Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.bloomDownsamplingFramebuffers[i]);
        Render.crc3.viewport(0, 0, Math.round(width), Math.round(height));
        Render.clear(new Color(0, 0, 0, 1));

        bindTextureSlot0(tempTexture);
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_width"], width * 2);
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_height"], height * 2);
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_threshold"], _cmpBloom.threshold);
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_lvl"], i);
        RenderWebGL.crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);

        tempTexture = RenderWebGL.bloomDownsamplingTextures[i];      //set the new destinationTexture to be rendered on in the next pass
        divisor *= 2;
      }

      shader = ShaderUpsample;                    //switch the shader to the upsampling shader
      shader.useProgram();
      divisor /= 4;

      //Upsampling and combining Downsamplingpasses
      for (let i: number = RenderWebGL.bloomUpsamplingFramebuffers.length - 1; i >= 0; i--) {
        let width: number = Math.max(Render.crc3.canvas.width / divisor, 1);
        let height: number = Math.max(Render.crc3.canvas.height / divisor, 1);

        Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.bloomUpsamplingFramebuffers[i]);
        Render.crc3.viewport(0, 0, Math.round(width), Math.round(height));
        Render.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);

        bindTextureSlot0(tempTexture);
        bindTextureSlot1(this.bloomDownsamplingTextures[i]);
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_width"], Math.min(width / 2));
        RenderWebGL.getRenderingContext().uniform1f(shader.uniforms["u_height"], Math.min(height / 2));

        RenderWebGL.crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);

        tempTexture = RenderWebGL.bloomUpsamplingTextures[i];
        divisor /= 2;
      }

      Render.crc3.viewport(0, 0, Render.crc3.canvas.width, Render.crc3.canvas.height);

      //feed texture and uniform matrix in textureslot 0
      function bindTextureSlot0(_texture: WebGLTexture): void {
        RenderWebGL.crc3.activeTexture(WebGL2RenderingContext.TEXTURE0);
        RenderWebGL.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, _texture);
        RenderWebGL.crc3.uniform1i(shader.uniforms["u_texture"], 0);
      }

      //feed texture and uniform matrix in textureslot 1
      function bindTextureSlot1(_texture: WebGLTexture): void {
        RenderWebGL.crc3.activeTexture(WebGL2RenderingContext.TEXTURE1);
        RenderWebGL.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, _texture);
        RenderWebGL.crc3.uniform1i(shader.uniforms["u_texture2"], 1);
      }
    }

    /**
     * Sets up the "ScreenQuad" that is used to render a texture over the whole screen area
     */
    // public static initScreenQuad(): void {
    //   Render.screenQuad = new Float32Array([
    //     //Vertex coordinates (no third dimension needed);
    //     -1.0, 1.0,
    //     -1.0, -1.0,
    //     1.0, 1.0,
    //     1.0, -1.0
    //   ]);
    //   Render.screenQuadUV = new Float32Array([
    //     //Texture coordinates 
    //     0.0, 1.0,
    //     0.0, 0.0,
    //     1.0, 1.0,
    //     1.0, 0.0
    //   ]);
    // }

    //#region Picking
    /**
     * Creates a texture buffer to be used as pick-buffer
     */
    protected static createPickTexture(_size: number): RenderTexture {
      // create to render to
      const targetTexture: RenderTexture = Render.crc3.createTexture();
      Render.crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, targetTexture); // TODO: check if superclass (RenderWebGL) should refer downwards to subclass (Render) like this

      {
        const internalFormat: number = WebGL2RenderingContext.RGBA32I;
        const format: number = WebGL2RenderingContext.RGBA_INTEGER;
        const type: number = WebGL2RenderingContext.INT;
        Render.pickBuffer = new Int32Array(_size * _size * 4);
        Render.crc3.texImage2D(
          WebGL2RenderingContext.TEXTURE_2D, 0, internalFormat, _size, _size, 0, format, type, Render.pickBuffer
        );

        // set the filtering so we don't need mips
        Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
        Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
        Render.crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
      }

      const framebuffer: WebGLFramebuffer = Render.crc3.createFramebuffer();
      Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, framebuffer);
      const attachmentPoint: number = WebGL2RenderingContext.COLOR_ATTACHMENT0;
      Render.crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, attachmentPoint, WebGL2RenderingContext.TEXTURE_2D, targetTexture, 0);

      RenderWebGL.sizePick = _size;
      return targetTexture;
    }

    protected static getPicks(_size: number, _cmpCamera: ComponentCamera): Pick[] {
      // evaluate texture by reading pixels and extract, convert and store the information about each mesh hit
      let data: Int32Array = new Int32Array(_size * _size * 4);
      Render.crc3.readPixels(0, 0, _size, _size, WebGL2RenderingContext.RGBA_INTEGER, WebGL2RenderingContext.INT, data);

      let mtxViewToWorld: Matrix4x4 = Matrix4x4.INVERSION(_cmpCamera.mtxWorldToView);
      let picked: Pick[] = [];
      for (let i: number = 0; i < Render.ƒpicked.length; i++) {
        let zBuffer: number = data[4 * i + 0] + data[4 * i + 1] / 256;
        if (zBuffer == 0) // discard misses 
          continue;
        let pick: Pick = Render.ƒpicked[i];
        pick.zBuffer = convertInt32toFloat32(data, 4 * i + 0) * 2 - 1;
        pick.color = convertInt32toColor(data, 4 * i + 1);
        pick.textureUV = Recycler.get(Vector2);
        pick.textureUV.set(convertInt32toFloat32(data, 4 * i + 2), convertInt32toFloat32(data, 4 * i + 3));
        pick.mtxViewToWorld = mtxViewToWorld;

        picked.push(pick);
      }

      return picked;

      function convertInt32toFloat32(_int32Array: Int32Array, _index: number): number {
        let buffer: ArrayBuffer = new ArrayBuffer(4);
        let view: DataView = new DataView(buffer);
        view.setInt32(0, _int32Array[_index]);
        return view.getFloat32(0);
      }

      function convertInt32toColor(_int32Array: Int32Array, _index: number): Color {
        let buffer: ArrayBuffer = new ArrayBuffer(4);
        let view: DataView = new DataView(buffer);
        view.setInt32(0, _int32Array[_index]);
        let color: Color = Color.CSS(`rgb(${view.getUint8(0)}, ${view.getUint8(1)}, ${view.getUint8(2)})`, view.getUint8(3) / 255);
        return color;
      }
    }

    /**
    * The render function for picking a single node. 
    * A cameraprojection with extremely narrow focus is used, so each pixel of the buffer would hold the same information from the node,  
    * but the fragment shader renders only 1 pixel for each node into the render buffer, 1st node to 1st pixel, 2nd node to second pixel etc.
    */
    protected static pick(_node: Node, _mtxMeshToWorld: Matrix4x4, _cmpCamera: ComponentCamera): void { // create Texture to render to, int-rgba
      try {
        let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
        let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
        let coat: Coat = cmpMaterial.material.coat;
        let shader: ShaderInterface = coat instanceof CoatTextured ? ShaderPickTextured : ShaderPick;

        shader.useProgram();
        coat.useRenderData(shader, cmpMaterial);
        let mtxMeshToView: Matrix4x4 = this.calcMeshToView(_node, cmpMesh, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);

        let sizeUniformLocation: WebGLUniformLocation = shader.uniforms["u_vctSize"];
        RenderWebGL.getRenderingContext().uniform2fv(sizeUniformLocation, [RenderWebGL.sizePick, RenderWebGL.sizePick]);

        let mesh: Mesh = cmpMesh.mesh;
        let renderBuffers: RenderBuffers = mesh.useRenderBuffers(shader, _mtxMeshToWorld, mtxMeshToView, Render.ƒpicked.length);
        RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);

        let pick: Pick = new Pick(_node);
        Render.ƒpicked.push(pick);
      } catch (_error) {
        //
      }
    }
    //#endregion

    /**
     * Buffer the data from the lights in the scenegraph into the lights ubo
     */
    protected static bufferLights(_lights: MapLightTypeToLightList): void {
      if (!RenderWebGL.uboLights)
        return;

      RenderWebGL.crc3.bindBuffer(WebGL2RenderingContext.UNIFORM_BUFFER, RenderWebGL.uboLights);

      // fill the buffer with the ambient light color
      let cmpLights: RecycableArray<ComponentLight> = _lights.get(LightAmbient);
      if (cmpLights) {
        let result: Color = new Color(0, 0, 0, 0);
        for (let cmpLight of cmpLights)
          result.add(cmpLight.light.color);

        RenderWebGL.crc3.bufferSubData(
          RenderWebGL.crc3.UNIFORM_BUFFER,
          RenderWebGL.uboLightsVariableOffsets["u_ambient.vctColor"], // byte offset of the struct Light "u_ambient" inside the ubo
          new Float32Array(result.getArray())
        );
      }

      // fill the buffer with the light data for each light type
      // we are currently doing a maximum of 4 crc3.bufferSubData() calls, but we could do this in one call
      bufferLightsOfType(LightDirectional, "u_nLightsDirectional", "u_directional");
      bufferLightsOfType(LightPoint, "u_nLightsPoint", "u_point");
      bufferLightsOfType(LightSpot, "u_nLightsSpot", "u_spot");

      function bufferLightsOfType(_type: TypeOfLight, _uniName: string, _uniStruct: string): void {
        const cmpLights: RecycableArray<ComponentLight> = _lights.get(_type);

        RenderWebGL.crc3.bufferSubData(
          RenderWebGL.crc3.UNIFORM_BUFFER,
          RenderWebGL.uboLightsVariableOffsets[_uniName], // byte offset of the uint "u_nLightsDirectional" inside the ubo
          new Uint8Array([cmpLights?.length ?? 0])
        );

        if (!cmpLights)
          return;

        const lightDataSize: number = 4 + 16 + 16; // vctColor + mtxShape + mtxShapeInverse, as float32s
        const lightsData: Float32Array = new Float32Array(cmpLights.length * lightDataSize);

        let iLight: number = 0;
        for (let cmpLight of cmpLights) {
          const lightDataOffset: number = iLight * lightDataSize;

          // set vctColor
          lightsData.set(cmpLight.light.color.getArray(), lightDataOffset + 0);

          // set mtxShape
          let mtxTotal: Matrix4x4 = Matrix4x4.MULTIPLICATION(cmpLight.node.mtxWorld, cmpLight.mtxPivot);
          lightsData.set(mtxTotal.get(), lightDataOffset + 4); // offset + vctColor

          // set mtxShapeInverse
          if (_type != LightDirectional) {
            let mtxInverse: Matrix4x4 = mtxTotal.inverse();
            lightsData.set(mtxInverse.get(), lightDataOffset + 4 + 16); // offset + vctColor + mtxShape
            Recycler.store(mtxInverse);
          }

          Recycler.store(mtxTotal);
          iLight++;
        }

        RenderWebGL.crc3.bufferSubData(
          RenderWebGL.crc3.UNIFORM_BUFFER,
          RenderWebGL.uboLightsVariableOffsets[`${_uniStruct}[0].vctColor`], // byte offset of the struct Light array inside the ubo
          lightsData
        );
      }
    }

    //#region Post-FX


    /**
    * Calculates sample points to be used in AO-calculations, based on the specified samplecount
     */
    protected static generateNewSamplePoints(_nSamples: number = 64): void {
      RenderWebGL.aoSamplePoints.splice(0, RenderWebGL.aoSamplePoints.length);
      for (let i: number = 0; i < _nSamples; i++) {
        let sample: Vector3 = new Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random());
        sample.normalize();
        sample.scale(Math.random());
        let scale: number = i / _nSamples;
        sample.scale(((scale * scale) * 0.9) + 0.1); //Moves the samplepoints closer to the origin
        RenderWebGL.aoSamplePoints.push(sample);
      }
    }

    protected static createFramebuffer(_depthType: typeof WebGLTexture | typeof WebGLRenderbuffer, _divider: number = 1): [WebGLFramebuffer, WebGLTexture, WebGLTexture | WebGLRenderbuffer] {
      const crc3: WebGL2RenderingContext = RenderWebGL.crc3;
      const framebuffer: WebGLFramebuffer = RenderWebGL.assert<WebGLFramebuffer>(crc3.createFramebuffer());
      const texture: WebGLTexture = RenderWebGL.assert<WebGLTexture>(crc3.createTexture());
      const depth: WebGLTexture | WebGLRenderbuffer = _depthType === WebGLTexture ? RenderWebGL.assert<WebGLTexture>(crc3.createTexture()) : RenderWebGL.assert<WebGLRenderbuffer>(crc3.createRenderbuffer());

      RenderWebGL.updateFramebuffer(framebuffer, texture, depth, _divider);

      return [framebuffer, texture, depth];
    }

    protected static updateFramebuffer(_framebuffer: WebGLFramebuffer, _texture?: WebGLTexture, _depth?: WebGLTexture | WebGLRenderbuffer, _divider: number = 1): void {
      _texture = _texture ?? getFramebufferAttachment(_framebuffer, WebGL2RenderingContext.COLOR_ATTACHMENT0);
      _depth = _depth ?? getFramebufferAttachment(_framebuffer, WebGL2RenderingContext.DEPTH_ATTACHMENT);

      const crc3: WebGL2RenderingContext = RenderWebGL.crc3;
      const width: number = Math.max(Math.round(crc3.canvas.width / _divider), 1);         //the _divider variable is used for Downsampling (for bloom shader)
      const height: number = Math.max(Math.round(crc3.canvas.height / _divider), 1);

      crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, _framebuffer);

      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, _texture);
      crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.LINEAR);
      crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.LINEAR);
      crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
      crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
      crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, null);
      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, _texture, 0);

      if (_depth instanceof WebGLTexture) {
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, _depth);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, WebGL2RenderingContext.NEAREST);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, WebGL2RenderingContext.NEAREST);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, WebGL2RenderingContext.CLAMP_TO_EDGE);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, WebGL2RenderingContext.CLAMP_TO_EDGE);
        crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.DEPTH_COMPONENT32F, width, height, 0, WebGL2RenderingContext.DEPTH_COMPONENT, WebGL2RenderingContext.FLOAT, null);
        crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.DEPTH_ATTACHMENT, WebGL2RenderingContext.TEXTURE_2D, _depth, 0);
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
      } else {
        crc3.bindRenderbuffer(WebGL2RenderingContext.RENDERBUFFER, _depth);
        crc3.renderbufferStorage(WebGL2RenderingContext.RENDERBUFFER, WebGL2RenderingContext.DEPTH_COMPONENT16, width, height);
        crc3.framebufferRenderbuffer(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.DEPTH_ATTACHMENT, WebGL2RenderingContext.RENDERBUFFER, _depth);
        crc3.bindRenderbuffer(WebGL2RenderingContext.RENDERBUFFER, null);
      }

      crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);

      function getFramebufferAttachment(_framebuffer: WebGLFramebuffer, _attachment: WebGL2RenderingContext["COLOR_ATTACHMENT0"] | WebGL2RenderingContext["DEPTH_ATTACHMENT"]): WebGLTexture {
        RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, _framebuffer);
        const attachment: WebGLRenderbuffer | WebGLTexture = RenderWebGL.crc3.getFramebufferAttachmentParameter(WebGL2RenderingContext.FRAMEBUFFER, _attachment, WebGL2RenderingContext.FRAMEBUFFER_ATTACHMENT_OBJECT_NAME);
        RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, null);
        return attachment;
      }
    }

    //#endregion



    /**
     * Draw a mesh buffer using the given infos and the complete projection matrix
    */
    protected static drawNode(_node: Node, _cmpCamera: ComponentCamera): void {
      let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
      let cmpMaterial: ComponentMaterial = _node.getComponent(ComponentMaterial);
      let coat: Coat = cmpMaterial.material.coat;
      let cmpParticleSystem: ComponentParticleSystem = _node.getComponent(ComponentParticleSystem);
      let drawParticles: boolean = cmpParticleSystem && cmpParticleSystem.isActive;
      let shader: ShaderInterface = cmpMaterial.material.getShader();
      if (drawParticles)
        shader = cmpParticleSystem.particleSystem.getShaderFrom(shader);

      shader.useProgram();
      coat.useRenderData(shader, cmpMaterial);

      let mtxMeshToView: Matrix4x4 = RenderWebGL.calcMeshToView(_node, cmpMesh, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);
      let renderBuffers: RenderBuffers = cmpMesh.mesh.useRenderBuffers(shader, cmpMesh.mtxWorld, mtxMeshToView);

      if (cmpMesh.skeleton)
        if (cmpMesh.skeleton instanceof SkeletonInstance)
          cmpMesh.skeleton.useRenderBuffer(shader);
        else
          Debug.warn(`${RenderWebGL.name}: ${ComponentMesh.name} references ${Skeleton.name}Id ${cmpMesh.skeleton} and not an instance of it. This can happen if this node is not a descendant of the referenced skeleton inside the graph. FUDGE currently only supports skinned meshes with a skeleton that is a direct ancestor of the mesh.`);

      let uniform: WebGLUniformLocation = shader.uniforms["u_vctCamera"];
      if (uniform)
        RenderWebGL.crc3.uniform3fv(uniform, _cmpCamera.mtxWorld.translation.get());

      uniform = shader.uniforms["u_mtxWorldToView"];
      if (uniform)
        RenderWebGL.crc3.uniformMatrix4fv(uniform, false, _cmpCamera.mtxWorldToView.get());

      uniform = shader.uniforms["u_mtxWorldToCamera"];
      if (uniform) {
        // let mtxWorldToCamera: Matrix4x4 = Matrix4x4.INVERSION(_cmpCamera.mtxWorld); // todo: optimize/store in camera
        RenderWebGL.crc3.uniformMatrix4fv(uniform, false, _cmpCamera.mtxCameraInverse.get());
      }

      if (drawParticles) {
        RenderWebGL.drawParticles(cmpParticleSystem, shader, renderBuffers, _node.getComponent(ComponentFaceCamera), cmpMaterial.sortForAlpha);
      } else {
        RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
      }
    }

    /**
     * Draw all of the given nodes using the normal shader to be used in AO-calculations
    */
    protected static drawNodesNormal(_cmpCamera: ComponentCamera, _list: RecycableArray<Node> | Array<Node>, _cmpAO: ComponentAmbientOcclusion): void {
      for (let node of _list) {
        let shader: ShaderInterface = node.getComponent(ComponentMaterial).material.getShader().define.includes("FLAT") ?
          ShaderAONormalFlat :// TODO: remove flat shading stuff     //since Shaders handle Flat materials differently we use the different defines of these two materials
          ShaderAONormal;

        shader.useProgram();

        let uniform = shader.uniforms["u_mtxWorldToCamera"];
        RenderWebGL.crc3.uniformMatrix4fv(uniform, false, _cmpCamera.mtxCameraInverse.get());

        let cmpMesh: ComponentMesh = node.getComponent(ComponentMesh);
        let mtxMeshToView: Matrix4x4 = RenderWebGL.calcMeshToView(node, cmpMesh, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);
        let renderBuffers: RenderBuffers = cmpMesh.mesh.useRenderBuffers(shader, cmpMesh.mtxWorld, mtxMeshToView);
        RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
      }
    }

    /**
     * Draw all of the given nodes using the mist shader.
    */
    // protected static drawNodesMist(_list: RecycableArray<Node> | Array<Node>, _cmpCamera: ComponentCamera, _cmpMist: ComponentMist): void {
    //   Render.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.mistFramebuffer);
    //   Render.clear(new Color(1));

    //   let shader: ShaderInterface = ShaderMist;
    //   shader.useProgram();

    //   let uniform: WebGLUniformLocation = shader.uniforms["u_vctCamera"];
    //   RenderWebGL.crc3.uniform3fv(uniform, _cmpCamera.mtxWorld.translation.get());
    //   uniform = shader.uniforms["u_nearPlane"];
    //   RenderWebGL.getRenderingContext().uniform1f(uniform, _cmpMist.nearPlane);
    //   uniform = shader.uniforms["u_farPlane"];
    //   RenderWebGL.getRenderingContext().uniform1f(uniform, _cmpMist.farPlane);

    //   for (let node of _list) {
    //     let cmpMesh: ComponentMesh = node.getComponent(ComponentMesh);
    //     let mtxMeshToView: Matrix4x4 = RenderWebGL.calcMeshToView(node, cmpMesh, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);
    //     let renderBuffers: RenderBuffers = cmpMesh.mesh.useRenderBuffers(shader, cmpMesh.mtxWorld, mtxMeshToView);
    //     RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
    //   }
    // }

    protected static useMist(_cmpCamera: ComponentCamera, _cmpMist: ComponentMist): void {
      RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, RenderWebGL.mistFramebuffer);
      Render.clear(new Color(1));

      let shader: ShaderInterface = ShaderMist;
      shader.useProgram();

      let uniform: WebGLUniformLocation = shader.uniforms["u_vctCamera"];
      RenderWebGL.crc3.uniform3fv(uniform, _cmpCamera.mtxWorld.translation.get());
      uniform = shader.uniforms["u_nearPlane"];
      RenderWebGL.getRenderingContext().uniform1f(uniform, _cmpMist.nearPlane);
      uniform = shader.uniforms["u_farPlane"];
      RenderWebGL.getRenderingContext().uniform1f(uniform, _cmpMist.farPlane);
    }

    protected static drawNodeMist(_node: Node, _cmpCamera: ComponentCamera, _cmpMist: ComponentMist): void {
      let cmpMesh: ComponentMesh = _node.getComponent(ComponentMesh);
      let mtxMeshToView: Matrix4x4 = RenderWebGL.calcMeshToView(_node, cmpMesh, _cmpCamera.mtxWorldToView, _cmpCamera.mtxWorld.translation);
      let renderBuffers: RenderBuffers = cmpMesh.mesh.useRenderBuffers(ShaderMist, cmpMesh.mtxWorld, mtxMeshToView);
      RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
    }

    protected static drawParticles(_cmpParticleSystem: ComponentParticleSystem, _shader: ShaderInterface, _renderBuffers: RenderBuffers, _cmpFaceCamera: ComponentFaceCamera, _sortForAlpha: boolean): void {
      RenderWebGL.crc3.depthMask(_cmpParticleSystem.depthMask);
      RenderWebGL.setBlendMode(_cmpParticleSystem.blendMode);
      _cmpParticleSystem.useRenderData();

      RenderWebGL.crc3.uniform1f(_shader.uniforms["u_fParticleSystemDuration"], _cmpParticleSystem.duration);
      RenderWebGL.crc3.uniform1f(_shader.uniforms["u_fParticleSystemSize"], _cmpParticleSystem.size);
      RenderWebGL.crc3.uniform1f(_shader.uniforms["u_fParticleSystemTime"], _cmpParticleSystem.time);
      RenderWebGL.crc3.uniform1i(_shader.uniforms[TEXTURE_LOCATION.PARTICLE.UNIFORM], TEXTURE_LOCATION.PARTICLE.INDEX);

      let faceCamera: boolean = _cmpFaceCamera && _cmpFaceCamera.isActive;
      RenderWebGL.crc3.uniform1i(_shader.uniforms["u_bParticleSystemFaceCamera"], faceCamera ? 1 : 0);
      RenderWebGL.crc3.uniform1i(_shader.uniforms["u_bParticleSystemRestrict"], faceCamera && _cmpFaceCamera.restrict ? 1 : 0);

      RenderWebGL.crc3.drawElementsInstanced(WebGL2RenderingContext.TRIANGLES, _renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0, _cmpParticleSystem.size);

      RenderWebGL.setBlendMode(BLEND.TRANSPARENT);
      RenderWebGL.crc3.depthMask(true);
    }

    private static calcMeshToView(_node: Node, _cmpMesh: ComponentMesh, _mtxWorldToView: Matrix4x4, _target?: Vector3): Matrix4x4 {
      // TODO: meshToView should be calculated only once per frame per node. But now that we have postprocessing effects e.g. mist, it is recalculated for each effect for each node...
      // also this should not be a RenderWebGL method
      let cmpFaceCamera: ComponentFaceCamera = _node.getComponent(ComponentFaceCamera);
      if (cmpFaceCamera && cmpFaceCamera.isActive) {
        let mtxMeshToView: Matrix4x4;
        mtxMeshToView = _cmpMesh.mtxWorld.clone;
        mtxMeshToView.lookAt(_target, cmpFaceCamera.upLocal ? null : cmpFaceCamera.up, cmpFaceCamera.restrict);
        return Matrix4x4.MULTIPLICATION(_mtxWorldToView, mtxMeshToView);
      }

      return Matrix4x4.MULTIPLICATION(_mtxWorldToView, _cmpMesh.mtxWorld);
    }
  }
}