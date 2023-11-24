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

  /* eslint-disable */ // we want type inference here so we can use vs code to search for references
  export const UNIFORM_BLOCKS = {
    LIGHTS: {
      NAME: "Lights",
      BINDING: 0
    },
    SKIN: {
      NAME: "Skin",
      BINDING: 1
    }
  };
  /* eslint-enable */

  /* eslint-disable */
  export const TEXTURE_LOCATION = {
    COLOR: {
      UNIFORM: "u_texColor",
      UNIT: WebGL2RenderingContext.TEXTURE0,
      INDEX: 0 // could compute these by UNIT - WebGL2RenderingContext.TEXTURE0 
    },
    NORMAL: {
      UNIFORM: "u_texNormal",
      UNIT: WebGL2RenderingContext.TEXTURE1,
      INDEX: 1
    },
    PARTICLE: {
      UNIFORM: "u_particleSystemRandomNumbers",
      UNIT: WebGL2RenderingContext.TEXTURE2,
      INDEX: 2
    }
  };
  /* eslint-enable */

  /**
   * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
   * Methods and attributes of this class should not be called directly, only through {@link Render}
   */
  export abstract class RenderWebGL extends EventTargetStatic {
    public static uboLights: WebGLBuffer;
    public static uboLightsVariableOffsets: { [_name: string]: number }; // Maps the names of the variables inside the Lights uniform block to their respective byte offset

    protected static mainRect: Rectangle = new Rectangle(0, 0, 0, 0); // TODO: rename or find something else

    protected static crc3: WebGL2RenderingContext = RenderWebGL.initialize();
    protected static ƒpicked: Pick[];

    private static rectRender: Rectangle = RenderWebGL.getCanvasRect();
    private static sizePick: number;

    private static framebuffer: WebGLFramebuffer;

    private static texOpaque: WebGLTexture; // stores the color of each opaque pixel rendered
    private static texTransparent: WebGLTexture; // stores the color of each transparent pixel rendered
    private static texPosition: WebGLTexture; // stores the position of each pixel in world space
    private static texNormal: WebGLTexture; // stores the normal of each pixel in world space
    private static texNoise: WebGLTexture; // stores random values for each pixel, used for ambient occlusion
    private static texDepth: WebGLTexture; // stores the depth of each pixel
    private static texOcclusion: WebGLTexture; // stores the ambient occlusion of each pixel
    private static texBloomSamples: WebGLTexture[] = new Array(6); // stores down and upsampled versions of the opaque texture, used for bloom
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
    public static clear(_color?: Color): void {
      RenderWebGL.crc3.clearColor(_color?.r ?? 0, _color?.g ?? 0, _color?.b ?? 0, _color?.a ?? 1);
      RenderWebGL.crc3.clear(WebGL2RenderingContext.COLOR_BUFFER_BIT | WebGL2RenderingContext.DEPTH_BUFFER_BIT);
    }

    /**
     * Reset the offscreen framebuffer to the original RenderingContext
     */
    public static resetFramebuffer(_framebuffer: WebGLFramebuffer = RenderWebGL.framebuffer): void {
      RenderWebGL.crc3.bindFramebuffer(WebGL2RenderingContext.FRAMEBUFFER, _framebuffer);
    }

    /**
     * Retrieve the area on the offscreen-canvas the camera image gets rendered to.
     */
    public static getRenderRectangle(): Rectangle {
      return RenderWebGL.rectRender;
    }

    /**
     * Enable / Disable WebGLs depth test.
     */
    public static setDepthTest(_test: boolean): void {
      if (_test)
        RenderWebGL.crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
      else
        RenderWebGL.crc3.disable(WebGL2RenderingContext.DEPTH_TEST);
    }

    /**
     * Enable / Disable WebGLs scissor test.
     */
    public static setScissorTest(_test: boolean, _x: number, _y: number, _width: number, _height: number): void {
      if (_test)
        RenderWebGL.crc3.enable(WebGL2RenderingContext.SCISSOR_TEST);
      else
        RenderWebGL.crc3.disable(WebGL2RenderingContext.SCISSOR_TEST);
      RenderWebGL.crc3.scissor(_x, _y, _width, _height);
    }

    /**
     * Set WebGLs viewport.
     */
    public static setViewport(_x: number, _y: number, _width: number, _height: number): void {
      RenderWebGL.crc3.viewport(_x, _y, _width, _height);
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
    public static initializeAttachments(): void {
      RenderWebGL.crc3.getExtension("EXT_color_buffer_float"); // TODO: disable ssao if not supported

      RenderWebGL.framebuffer = RenderWebGL.assert<WebGLFramebuffer>(RenderWebGL.crc3.createFramebuffer());

      RenderWebGL.texOpaque = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.texTransparent = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.texPosition = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.texNormal = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.texDepth = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.texOcclusion = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);
      RenderWebGL.texNoise = createTexture(WebGL2RenderingContext.NEAREST, WebGL2RenderingContext.CLAMP_TO_EDGE);

      for (let i: number = 0; i < RenderWebGL.texBloomSamples.length; i++)
        RenderWebGL.texBloomSamples[i] = createTexture(WebGL2RenderingContext.LINEAR, WebGL2RenderingContext.CLAMP_TO_EDGE);

      function createTexture(_filter: number, _wrap: number): WebGLTexture {
        const crc3: WebGL2RenderingContext = RenderWebGL.crc3;
        const texture: WebGLTexture = RenderWebGL.assert<WebGLTexture>(crc3.createTexture());
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MIN_FILTER, _filter);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_MAG_FILTER, _filter);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_S, _wrap);
        crc3.texParameteri(WebGL2RenderingContext.TEXTURE_2D, WebGL2RenderingContext.TEXTURE_WRAP_T, _wrap);
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
        return texture;
      }
    }

    /**
     * Adjusts the size of the set framebuffers corresponding textures
     */
    public static adjustAttachments(): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.crc3;
      const width: number = crc3.canvas.width;
      const height: number = crc3.canvas.height;

      if (RenderWebGL.mainRect.width == width && RenderWebGL.mainRect.height == height) // TODO: find another way
        return;

      RenderWebGL.mainRect.width = width;
      RenderWebGL.mainRect.height = height;

      crc3.activeTexture(crc3.TEXTURE0);

      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texOpaque);
      crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, null);

      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texTransparent);
      crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, null);

      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texPosition);
      // TODO: after changing light shaders to view space use RGBA16F instead of RGBA32F, as in view space 16F is precise enough
      crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA32F, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.FLOAT, null);

      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texNormal);
      crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA16F, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.FLOAT, null);

      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texDepth);
      crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.DEPTH_COMPONENT32F, width, height, 0, WebGL2RenderingContext.DEPTH_COMPONENT, WebGL2RenderingContext.FLOAT, null);

      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texOcclusion);
      crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, null);

      for (let i: number = 0, divisor: number = 1; i < RenderWebGL.texBloomSamples.length; i++, divisor *= 2) {
        let width: number = Math.max(Math.round(crc3.canvas.width / divisor), 1);
        let height: number = Math.max(Math.round(crc3.canvas.height / divisor), 1);
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texBloomSamples[i]);
        crc3.texImage2D(WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.RGBA, width, height, 0, WebGL2RenderingContext.RGBA, WebGL2RenderingContext.UNSIGNED_BYTE, null);
      }

      const nValues: number = width * height * 4;
      const noiseData: Uint8Array = new Uint8Array(nValues);

      // TODO: maybe use Noise class instead, also maybe us tiling to avoid large memory usage
      for (let i: number = 0; i < nValues; i += 4) {
        noiseData[i] = Math.floor(Math.random() * 256);
        noiseData[i + 1] = Math.floor(Math.random() * 256);
        noiseData[i + 2] = Math.floor(Math.random() * 256);
        noiseData[i + 3] = Math.floor(Math.random() * 256);
      }

      crc3.bindTexture(crc3.TEXTURE_2D, RenderWebGL.texNoise);
      crc3.texImage2D(crc3.TEXTURE_2D, 0, crc3.RG8, width, height, 0, crc3.RG, crc3.UNSIGNED_BYTE, noiseData);
      crc3.bindTexture(crc3.TEXTURE_2D, null);
    }

    protected static drawNodes(_nodesOpaque: Iterable<Node>, _nodesAlpha: Iterable<Node>, _cmpCamera: ComponentCamera): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texOpaque, 0);
      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT1, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texPosition, 0); // TODO: only set when needed
      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT2, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texNormal, 0); // TODO: only set when needed
      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.DEPTH_ATTACHMENT, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texDepth, 0);

      crc3.drawBuffers([WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.COLOR_ATTACHMENT1, WebGL2RenderingContext.COLOR_ATTACHMENT2, WebGL2RenderingContext.COLOR_ATTACHMENT3]);

      RenderWebGL.clear(_cmpCamera.clrBackground);
      for (let node of _nodesOpaque)
        RenderWebGL.drawNode(node, _cmpCamera);

      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texTransparent, 0);
      crc3.drawBuffers([WebGL2RenderingContext.COLOR_ATTACHMENT0]);

      crc3.clearColor(0, 0, 0, 0);
      crc3.clear(crc3.COLOR_BUFFER_BIT);

      crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);
      for (let node of _nodesAlpha)
        RenderWebGL.drawNode(node, _cmpCamera);
      crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);

      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT1, WebGL2RenderingContext.TEXTURE_2D, null, 0);
      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT2, WebGL2RenderingContext.TEXTURE_2D, null, 0);
      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.DEPTH_ATTACHMENT, WebGL2RenderingContext.TEXTURE_2D, null, 0);
    }

    /**
     * Draws the necessary Buffers for AO-calculation and calculates the AO-Effect
     */
    protected static drawAmbientOcclusion(_cmpCamera: ComponentCamera, _cmpAmbientOcclusion: ComponentAmbientOcclusion): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      ShaderAmbientOcclusion.useProgram();

      RenderWebGL.bindTexture(ShaderAmbientOcclusion, RenderWebGL.texPosition, WebGL2RenderingContext.TEXTURE0, "u_texPosition");
      RenderWebGL.bindTexture(ShaderAmbientOcclusion, RenderWebGL.texNormal, WebGL2RenderingContext.TEXTURE1, "u_texNormal");
      RenderWebGL.bindTexture(ShaderAmbientOcclusion, RenderWebGL.texNoise, WebGL2RenderingContext.TEXTURE2, "u_texNoise");

      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fNear"], _cmpCamera.getNear());
      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fFar"], _cmpCamera.getFar());
      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fBias"], _cmpAmbientOcclusion.bias);
      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fSampleRadius"], _cmpAmbientOcclusion.sampleRadius);
      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fAttenuationConstant"], _cmpAmbientOcclusion.attenuationConstant);
      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fAttenuationLinear"], _cmpAmbientOcclusion.attenuationLinear);
      crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fAttenuationQuadratic"], _cmpAmbientOcclusion.attenuationQuadratic);
      crc3.uniform2f(ShaderAmbientOcclusion.uniforms["u_vctResolution"], RenderWebGL.getCanvas().width, RenderWebGL.getCanvas().height);
      crc3.uniform3fv(ShaderAmbientOcclusion.uniforms["u_vctCamera"], _cmpCamera.mtxWorld.translation.get());

      let cmpFog: ComponentFog = _cmpCamera.node?.getComponent(ComponentFog);
      crc3.uniform1i(ShaderAmbientOcclusion.uniforms["u_bFog"], cmpFog?.isActive ? 1 : 0);
      if (cmpFog?.isActive) {
        crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fFogNear"], cmpFog.near);
        crc3.uniform1f(ShaderAmbientOcclusion.uniforms["u_fFogFar"], cmpFog.far);
        crc3.uniform4fv(ShaderAmbientOcclusion.uniforms["u_vctFogColor"], cmpFog.color.getArray());
      }

      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texOcclusion, 0);
      RenderWebGL.clear();
      crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);
    }

    /**
     * Draws the bloom-effect into the bloom texture, using the given camera-component and the given bloom-component
     */
    protected static drawBloom(_cmpBloom: ComponentBloom): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      ShaderBloom.useProgram();

      // extract bright colors, could move this to main render pass so that individual objects can be exempt from bloom
      crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texBloomSamples[0], 0);
      crc3.drawBuffers([WebGL2RenderingContext.COLOR_ATTACHMENT0]);
      RenderWebGL.clear();

      RenderWebGL.bindTexture(ShaderBloom, RenderWebGL.texOpaque, WebGL2RenderingContext.TEXTURE0, "u_texSource");
      crc3.uniform1f(ShaderBloom.uniforms["u_fThreshold"], _cmpBloom.threshold);
      crc3.uniform1i(ShaderBloom.uniforms["u_iMode"], 0);
      crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);

      // downsample

      const iterations: number = RenderWebGL.texBloomSamples.length;
      for (let i: number = 1, divisor: number = 2; i < iterations; i++, divisor *= 2) {
        let width: number = Math.max(Math.round(crc3.canvas.width / divisor), 1);
        let height: number = Math.max(Math.round(crc3.canvas.height / divisor), 1);

        crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texBloomSamples[i], 0);
        crc3.drawBuffers([WebGL2RenderingContext.COLOR_ATTACHMENT0]);
        crc3.viewport(0, 0, width, height);

        RenderWebGL.clear();

        RenderWebGL.bindTexture(ShaderBloom, RenderWebGL.texBloomSamples[i - 1], WebGL2RenderingContext.TEXTURE0, "u_texSource");
        crc3.uniform1i(ShaderBloom.uniforms["u_iMode"], 1);
        crc3.uniform2f(ShaderBloom.uniforms["u_vctTexel"], 0.5 / width, 0.5 / height); // half texel size
        // crc3.uniform2f(ShaderBloom.uniforms["u_vctResolution"], width, height);

        crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);

      }

      // upsample
      crc3.blendFunc(WebGL2RenderingContext.ONE, WebGL2RenderingContext.ONE);
      for (let i: number = iterations - 1, divisor: number = 2 ** (iterations - 2); i > 0; i--, divisor /= 2) {
        let width: number = Math.max(Math.round(crc3.canvas.width / divisor), 1);
        let height: number = Math.max(Math.round(crc3.canvas.height / divisor), 1);

        crc3.framebufferTexture2D(WebGL2RenderingContext.FRAMEBUFFER, WebGL2RenderingContext.COLOR_ATTACHMENT0, WebGL2RenderingContext.TEXTURE_2D, RenderWebGL.texBloomSamples[i - 1], 0);
        crc3.drawBuffers([WebGL2RenderingContext.COLOR_ATTACHMENT0]);
        crc3.viewport(0, 0, Math.round(width), Math.round(height));

        RenderWebGL.bindTexture(ShaderBloom, RenderWebGL.texBloomSamples[i], WebGL2RenderingContext.TEXTURE0, "u_texSource");
        crc3.uniform1i(ShaderBloom.uniforms["u_iMode"], 2);
        crc3.uniform2f(ShaderBloom.uniforms["u_vctTexel"], 0.5 / width, 0.5 / height); // half texel size
        // crc3.uniform2f(ShaderBloom.uniforms["u_vctResolution"], width, height);

        crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);

      }
      crc3.blendFunc(WebGL2RenderingContext.SRC_ALPHA, WebGL2RenderingContext.ONE_MINUS_SRC_ALPHA);

      Render.crc3.viewport(0, 0, Render.crc3.canvas.width, Render.crc3.canvas.height);
    }

    /**
     * Composites all effects that are used in the scene to a final render.
     */
    protected static composite(_cmpAmbientOcclusion: ComponentAmbientOcclusion, _cmpBloom: ComponentBloom): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      ShaderScreen.useProgram();
      RenderWebGL.bindTexture(ShaderScreen, RenderWebGL.texOpaque, WebGL2RenderingContext.TEXTURE0, "u_texColor");
      RenderWebGL.bindTexture(ShaderScreen, RenderWebGL.texTransparent, WebGL2RenderingContext.TEXTURE1, "u_texTransparent");

      crc3.uniform1i(ShaderScreen.uniforms["u_bOcclusion"], _cmpAmbientOcclusion?.isActive ? 1 : 0);
      if (_cmpAmbientOcclusion?.isActive)
        RenderWebGL.bindTexture(ShaderScreen, RenderWebGL.texOcclusion, WebGL2RenderingContext.TEXTURE2, "u_texOcclusion");

      crc3.uniform1i(ShaderScreen.uniforms["u_bBloom"], _cmpBloom?.isActive ? 1 : 0);
      if (_cmpBloom?.isActive) {
        RenderWebGL.bindTexture(ShaderScreen, RenderWebGL.texBloomSamples[0], WebGL2RenderingContext.TEXTURE3, "u_texBloom");
        crc3.uniform1f(ShaderScreen.uniforms["u_fBloomIntensity"], _cmpBloom.intensity);
        crc3.uniform1f(ShaderScreen.uniforms["u_fHighlightDesaturation"], _cmpBloom.highlightDesaturation);
      }

      RenderWebGL.clear();
      crc3.drawArrays(WebGL2RenderingContext.TRIANGLES, 0, 3);
    }

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

      let cmpFog: ComponentFog = _cmpCamera.node?.getComponent(ComponentFog);
      RenderWebGL.crc3.uniform1i(shader.uniforms["u_bFog"], cmpFog?.isActive ? 1 : 0);
      if (cmpFog?.isActive) {
        RenderWebGL.crc3.uniform1f(shader.uniforms["u_fFogNear"], cmpFog.near);
        RenderWebGL.crc3.uniform1f(shader.uniforms["u_fFogFar"], cmpFog.far);
        RenderWebGL.crc3.uniform4fv(shader.uniforms["u_vctFogColor"], cmpFog.color.getArray());
      }

      if (drawParticles) {
        RenderWebGL.drawParticles(cmpParticleSystem, shader, renderBuffers, _node.getComponent(ComponentFaceCamera), cmpMaterial.sortForAlpha);
      } else {
        RenderWebGL.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
      }
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
      // TODO: This could be a Render function as it does not do anything with WebGL
      let cmpFaceCamera: ComponentFaceCamera = _node.getComponent(ComponentFaceCamera);
      if (cmpFaceCamera && cmpFaceCamera.isActive) {
        let mtxMeshToView: Matrix4x4;
        mtxMeshToView = _cmpMesh.mtxWorld.clone;
        mtxMeshToView.lookAt(_target, cmpFaceCamera.upLocal ? null : cmpFaceCamera.up, cmpFaceCamera.restrict);
        return Matrix4x4.MULTIPLICATION(_mtxWorldToView, mtxMeshToView);
      }

      return Matrix4x4.MULTIPLICATION(_mtxWorldToView, _cmpMesh.mtxWorld);
    }

    private static bindTexture(_shader: ShaderInterface, _texture: WebGLTexture, _unit: number, _uniform: string): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      crc3.activeTexture(_unit);
      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, _texture);
      crc3.uniform1i(_shader.uniforms[_uniform], _unit - WebGL2RenderingContext.TEXTURE0);
    }
  }
}