namespace FudgeCore {

  /**
   * Contains all the information which will be used to evaluate the closures of the particle effect. Current time and index, numberOfParticles and all the defined values of the storage partition of the effect will be cached here while evaluating the effect. 
   */
  export interface ParticleVariables {
    [key: string]: number | number[];
  }

  /**
   * Attaches a {@link ParticleEffect} to the node.
   * @author Jonas Plotzky, HFU, 2020
   */
  export class ComponentParticleSystem extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentParticleSystem);
    public variables: ParticleVariables = {};
    public randomNumbersData: WebGLTexture;

    #particleEffect: ParticleEffect;
    // TODO: add color for the whole system

    constructor(_particleEffect: ParticleEffect = null, _numberOfParticles: number = 10) {
      super();
      this.variables[PARTICLE_VARIBALE_NAMES.TIME] = 0;
      this.variables[PARTICLE_VARIBALE_NAMES.INDEX] = 0;
      this.variables[PARTICLE_VARIBALE_NAMES.NUMBER_OF_PARTICLES] = _numberOfParticles;
      this.initRandomNumbers(_numberOfParticles);
      
      this.particleEffect = _particleEffect;
    }

    public get particleEffect(): ParticleEffect {
      return this.#particleEffect;
    }

    public set particleEffect(_newParticleEffect: ParticleEffect) {
      this.#particleEffect = _newParticleEffect;
      this.evaluateStorage(this.#particleEffect?.storageSystem);
    }

    public get numberOfParticles(): number {
      return <number>this.variables[PARTICLE_VARIBALE_NAMES.NUMBER_OF_PARTICLES];
    }

    /**
     * Sets the numberOfParticles of the particle effect. Caution: Setting this will result in the reevaluation of the system storage of the effect and the reinitialization of the randomNumbers array.
     */
    public set numberOfParticles(_numberOfParticles: number) {
      if (this.numberOfParticles !== _numberOfParticles) this.initRandomNumbers(_numberOfParticles);
      this.variables[PARTICLE_VARIBALE_NAMES.NUMBER_OF_PARTICLES] = _numberOfParticles;
      this.evaluateStorage(this.#particleEffect?.storageSystem);
      this.randomNumbersData = undefined;
    }

    public evaluateStorage(_storageData: ParticleEffectStructure): void {
      for (const key in _storageData) {
        this.variables[key] = (<ParticleClosure>_storageData[key])(this.variables);
      }
    }

    //#region transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        [super.constructor.name]: super.serialize(),
        idParticleEffect: this.particleEffect?.idResource,
        numberOfParticles: this.numberOfParticles
      };

      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization[super.constructor.name]);
      if (_serialization.idParticleEffect) this.particleEffect = <ParticleEffect>await Project.getResource(_serialization.idParticleEffect);
      this.numberOfParticles = _serialization.numberOfParticles;

      return this;
    }

    public getMutatorForUserInterface(): MutatorForUserInterface {
      let mutator: MutatorForUserInterface = <MutatorForUserInterface>this.getMutator(true);
      mutator.numberOfParticles = this.numberOfParticles;
      mutator.particleEffect = this.particleEffect?.getMutatorForUserInterface();

      return mutator;
    }

    public useRenderData(): void {
      let crc3: WebGL2RenderingContext = RenderWebGL.getRenderingContext();
      if (this.randomNumbersData) {
        // buffers exist
        crc3.activeTexture(WebGL2RenderingContext.TEXTURE1); // TODO: which id to use?
        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, this.randomNumbersData);
        crc3.uniform1i(this.particleEffect.uniforms["u_fRandomNumbers"], 1);
      }
      else {
        this.randomNumbersData = {};
        // TODO: check if all WebGL-Creations are asserted
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
        // crc3.texParameteri(crc3.TEXTURE_2D, crc3.TEXTURE_WRAP_S, crc3.CLAMP_TO_EDGE);
        // crc3.texParameteri(crc3.TEXTURE_2D, crc3.TEXTURE_WRAP_T, crc3.CLAMP_TO_EDGE);

        this.randomNumbersData = texture;

        crc3.bindTexture(WebGL2RenderingContext.TEXTURE_2D, null);

        this.useRenderData();
      }
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
      delete _mutator.variables;
    }
    //#endregion

    private initRandomNumbers(_numberOfParticles: number): void {
      let randomNumbers: number[] = [];
      for (let i: number = 0; i < _numberOfParticles + 10 /* so that its possible to have 10 different random numbers per index i.e. randomNumber(index + x) */; i++) {
        randomNumbers.push(Math.random());
      }
      this.variables[PARTICLE_VARIBALE_NAMES.RANDOM_NUMBERS] = randomNumbers;
    }
  }
}