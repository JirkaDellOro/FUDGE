namespace FudgeCore {

  /**
   * Buffers the data from the {@link MeshSkin} into a WebGL Buffer
   * @internal
   */
  export class RenderInjectorSkeletonInstance {

    public static decorate(_constructor: Function): void {
      Object.defineProperty(_constructor.prototype, "useRenderBuffer", {
        value: RenderInjectorSkeletonInstance.useRenderBuffer
      });
      Object.defineProperty(_constructor.prototype, "updateRenderBuffer", {
        value: RenderInjectorSkeletonInstance.updateRenderBuffer
      });
      Object.defineProperty(_constructor.prototype, "deleteRenderBuffer", {
        value: RenderInjectorSkeletonInstance.deleteRenderBuffer
      });
    }

    protected static useRenderBuffer(this: SkeletonInstance, _shader: typeof Shader): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      if (this.renderBuffer)
        crc3.bindBufferBase(WebGL2RenderingContext.UNIFORM_BUFFER, UNIFORM_BLOCKS.SKIN.BINDING, this.renderBuffer);
    }

    protected static updateRenderBuffer(this: SkeletonInstance): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      if (!this.renderBuffer) {
        const bonesByteSize: number = 256 * 16 * 4; // CAUTION: this is dependent on the shader source code where 256 is the maximum number of bones

        this.renderBuffer = RenderWebGL.assert(crc3.createBuffer());
        crc3.bindBuffer(WebGL2RenderingContext.UNIFORM_BUFFER, this.renderBuffer);
        crc3.bufferData(WebGL2RenderingContext.UNIFORM_BUFFER, bonesByteSize, WebGL2RenderingContext.DYNAMIC_DRAW);
      }

      const data: Float32Array = new Float32Array(this.mtxBones.length * 16);
      for (let i: number = 0; i < this.mtxBones.length; i++)
        data.set(this.mtxBones[i].get(), i * 16);

      crc3.bindBuffer(WebGL2RenderingContext.UNIFORM_BUFFER, this.renderBuffer);
      crc3.bufferSubData(WebGL2RenderingContext.UNIFORM_BUFFER, 0, data);
    }

    protected static deleteRenderBuffer(this: SkeletonInstance): void {
      const crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();

      if (this.renderBuffer)
        crc3.deleteBuffer(this.renderBuffer);
    }
  }
}