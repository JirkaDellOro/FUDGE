namespace FudgeCore {

  export class RenderInjectorComponentParticleSystem extends RenderInjector {
    public static decorate(_constructor: Function): void {
      RenderInjector.inject(_constructor, RenderInjectorComponentParticleSystem);
    }

    protected static injectComponentParticleSystem(this: ComponentParticleSystem): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      if (this.randomNumbersData) {
        // buffers exist
        crc3.activeTexture(WebGL2RenderingContext.TEXTURE1); // TODO: which id to use?
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.randomNumbersData);
        crc3.uniform1i(this.particleEffect.uniforms["u_fRandomNumbers"], 1);
      }
      else {
        this.randomNumbersData = {};
        const texture: WebGLTexture = Render.assert<WebGLTexture>(crc3.createTexture());
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, texture);
        let randomNumbers: number[] = this.variables[PARTICLE_VARIBALE_NAMES.RANDOM_NUMBERS] as number[];
        const maxWidth: number = RenderInjectorParticleEffect.RANDOM_NUMBERS_TEXTURE_MAX_WIDTH;
        let width: number = Math.min(randomNumbers.length, maxWidth);
        let height: number = Math.ceil(randomNumbers.length / maxWidth);
        if (randomNumbers.length < width * height) {
          // pad random numbers with zeros to fit width * height
          // TODO: find a better way to fit and retrieve random numbers effectively
          randomNumbers = randomNumbers.concat(new Array(width * height - randomNumbers.length).fill(0));
        }
        try {
          crc3.texImage2D(
            WebGL2RenderingContext.TEXTURE_2D, 0, WebGL2RenderingContext.R32F, width, height, 0, WebGL2RenderingContext.RED, WebGL2RenderingContext.FLOAT,
            Float32Array.from(randomNumbers)
          );
        } catch (_error) {
          Debug.error(_error);
        }

        crc3.texParameteri(crc3.TEXTURE_2D, crc3.TEXTURE_MIN_FILTER, crc3.NEAREST);
        crc3.texParameteri(crc3.TEXTURE_2D, crc3.TEXTURE_MAG_FILTER, crc3.NEAREST);

        this.randomNumbersData = texture;

        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);

        this.useRenderData();
      }
    }
  }
}