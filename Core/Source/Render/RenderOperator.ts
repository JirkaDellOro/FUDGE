///<reference path="RenderInjector.ts"/>
///<reference path="RenderInjectorShader.ts"/>
///<reference path="RenderInjectorCoat.ts"/>
///<reference path="RenderInjectorMesh.ts"/>
///<reference path="../Math/Rectangle.ts"/>

namespace FudgeCore {
  export declare let fudgeConfig: General;

  export interface BufferSpecification {
    size: number;   // The size of the datasample.
    dataType: number; // The datatype of the sample (e.g. gl.FLOAT, gl.BYTE, etc.)
    normalize: boolean; // Flag to normalize the data.
    stride: number; // Number of indices that will be skipped each iteration.
    offset: number; // Index of the element to begin with.
  }

  /**
   * Base class for RenderManager, handling the connection to the rendering system, in this case WebGL.
   * Methods and attributes of this class should not be called directly, only through [[RenderManager]]
   */
  export abstract class RenderOperator {
    protected static crc3: WebGL2RenderingContext = RenderOperator.initialize();
    private static rectViewport: Rectangle = RenderOperator.getCanvasRect();


    /** 
     * Wrapper function to utilize the bufferSpecification interface when passing data to the shader via a buffer.
     * @param _attributeLocation  The location of the attribute on the shader, to which they data will be passed.
     * @param _bufferSpecification  Interface passing datapullspecifications to the buffer.
     */
    public static setAttributeStructure(_attributeLocation: number, _bufferSpecification: BufferSpecification): void {
      RenderOperator.crc3.vertexAttribPointer(_attributeLocation, _bufferSpecification.size, _bufferSpecification.dataType, _bufferSpecification.normalize, _bufferSpecification.stride, _bufferSpecification.offset);
    }

    /**
    * Checks the first parameter and throws an exception with the WebGL-errorcode if the value is null
    * @param _value  value to check against null
    * @param _message  optional, additional message for the exception
    */
    public static assert<T>(_value: T | null, _message: string = ""): T {
      if (_value === null)
        throw new Error(`Assertion failed. ${_message}, WebGL-Error: ${RenderOperator.crc3 ? RenderOperator.crc3.getError() : ""}`);
      return _value;
    }

    /**
     * Initializes offscreen-canvas, renderingcontext and hardware viewport. Call once before creating any resources like meshes or shaders
     */
    public static initialize(_antialias?: boolean, _alpha?: boolean): WebGL2RenderingContext {
      fudgeConfig = fudgeConfig || {};
      let contextAttributes: WebGLContextAttributes = {
        alpha: (_alpha != undefined) ? _alpha : fudgeConfig.alpha || false,
        antialias: (_antialias != undefined) ? _antialias : fudgeConfig.antialias || false,
        premultipliedAlpha: false
      };
      Debug.fudge("Initialize RenderManager", contextAttributes);
      let canvas: HTMLCanvasElement = document.createElement("canvas");
      let crc3: WebGL2RenderingContext;
      crc3 = RenderOperator.assert<WebGL2RenderingContext>(
        canvas.getContext("webgl2", contextAttributes),
        "WebGL-context couldn't be created"
      );
      // Enable backface- and zBuffer-culling.
      crc3.enable(WebGL2RenderingContext.CULL_FACE);
      crc3.enable(WebGL2RenderingContext.DEPTH_TEST);
      crc3.enable(WebGL2RenderingContext.BLEND);
      crc3.blendEquation(WebGL2RenderingContext.FUNC_ADD);
      crc3.blendFunc(WebGL2RenderingContext.DST_ALPHA, WebGL2RenderingContext.ONE_MINUS_DST_ALPHA);
      // RenderOperator.crc3.enable(WebGL2RenderingContext.);
      // RenderOperator.crc3.pixelStorei(WebGL2RenderingContext.UNPACK_FLIP_Y_WEBGL, true);
      RenderOperator.crc3 = crc3;
      RenderOperator.rectViewport = RenderOperator.getCanvasRect();
      return crc3;
    }

    /**
     * Return a reference to the offscreen-canvas
     */
    public static getCanvas(): HTMLCanvasElement {
      return <HTMLCanvasElement>RenderOperator.crc3.canvas; // TODO: enable OffscreenCanvas
    }

    /**
     * Return a reference to the rendering context
     */
    public static getRenderingContext(): WebGL2RenderingContext {
      return RenderOperator.crc3;
    }

    /**
     * Return a rectangle describing the size of the offscreen-canvas. x,y are 0 at all times.
     */
    public static getCanvasRect(): Rectangle {
      let canvas: HTMLCanvasElement = <HTMLCanvasElement>RenderOperator.crc3.canvas;
      return Rectangle.GET(0, 0, canvas.width, canvas.height);
    }

    /**
     * Set the size of the offscreen-canvas.
     */
    public static setCanvasSize(_width: number, _height: number): void {
      RenderOperator.crc3.canvas.width = _width;
      RenderOperator.crc3.canvas.height = _height;
    }

    /**
     * Set the area on the offscreen-canvas to render the camera image to.
     * @param _rect
     */
    public static setViewportRectangle(_rect: Rectangle): void {
      Object.assign(RenderOperator.rectViewport, _rect);
      RenderOperator.crc3.viewport(_rect.x, _rect.y, _rect.width, _rect.height);
    }

    /**
     * Retrieve the area on the offscreen-canvas the camera image gets rendered to.
     */
    public static getViewportRectangle(): Rectangle {
      return RenderOperator.rectViewport;
    }

    /**
     * Draw a mesh buffer using the given infos and the complete projection matrix
     */
    protected static draw(_shader: typeof Shader, _mesh: Mesh, _coat: Coat, _final: Matrix4x4, _projection: Matrix4x4): void {
      _shader.useProgram();
      _mesh.useRenderBuffers(_shader, _final, _projection);
      _coat.useRenderData(_shader);
      RenderOperator.crc3.drawElements(WebGL2RenderingContext.TRIANGLES, _mesh.renderBuffers.nIndices, WebGL2RenderingContext.UNSIGNED_SHORT, 0);
    }
  }
}