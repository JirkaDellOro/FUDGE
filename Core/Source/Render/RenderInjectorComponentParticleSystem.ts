namespace FudgeCore {

  /**
   * buffers the random number data for the particle system into WebGL
   * @authors Jonas Plotzky, HFU, 2022
   */
  export class RenderInjectorComponentParticleSystem {
    public static decorate(_constructor: Function): void {
      Object.defineProperty(_constructor.prototype, "useRenderData", {
        value: RenderInjectorComponentParticleSystem.useRenderData
      });
      Object.defineProperty(_constructor.prototype, "deleteRenderData", {
        value: RenderInjectorComponentParticleSystem.deleteRenderData
      });
    }

    protected static useRenderData(this: ComponentParticleSystem): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      if (this.renderData) {
        // buffers exist
        crc3.activeTexture(WebGL2RenderingContext.TEXTURE1); // ATTENTION!: changing this id requires changing of corresponding id in particle render method, use ctrl + shift + f search!
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.renderData);
      } else {
        this.renderData = {};
        const texture: WebGLTexture = Render.assert<WebGLTexture>(crc3.createTexture());
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);

        let textureSize: number = Math.ceil(Math.sqrt(this.size));
        textureSize = Math.min(textureSize, crc3.getParameter(crc3.MAX_TEXTURE_SIZE));

        let randomNumbers: number[] = [];
        for (let i: number = 0; i < textureSize * textureSize; i++) {
          randomNumbers.push(Math.random());
        }
        try {
          crc3.texImage2D(
            WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.R32F, textureSize, textureSize, 0, WebGL2RenderingContext.RED, WebGL2RenderingContext.FLOAT,
            Float32Array.from(randomNumbers)
          );
        } catch (_error) {
          Debug.error(_error);
        }

        crc3.texParameteri(crc3.TEXTURE_2D, crc3.TEXTURE_MIN_FILTER, crc3.NEAREST);
        crc3.texParameteri(crc3.TEXTURE_2D, crc3.TEXTURE_MAG_FILTER, crc3.NEAREST);

        this.renderData = texture;

        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);

        this.useRenderData();
      }
    }

    protected static deleteRenderData(this: ComponentParticleSystem): void {
      if (!this.renderData) return;
      
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);
      crc3.deleteTexture(this.renderData);
      delete this.renderData;
    }
  }
}