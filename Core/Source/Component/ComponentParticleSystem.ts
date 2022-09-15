namespace FudgeCore {
  /**
   * Attaches a {@link ParticleEffect} to the node.
   * @author Jonas Plotzky, HFU, 2020
   */
  @RenderInjectorComponentParticleSystem.decorate
  export class ComponentParticleSystem extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentParticleSystem);
    public randomNumbersRenderData: unknown;
    public particleEffect: ParticleEffect;
    public readonly time: Time;
    
    #numberOfParticles: number;

    constructor(_particleEffect: ParticleEffect = null, _numberOfParticles: number = 10) {
      super();     
      this.particleEffect = _particleEffect;
      this.numberOfParticles = _numberOfParticles;
      this.time = new Time();
    }

    public get numberOfParticles(): number {
      return this.#numberOfParticles;
    }

    /**
     * Sets the number of particles of the particle effect. Caution: Setting this will reinitialize the random numbers array(texture) used in the shader.
     */
    public set numberOfParticles(_numberOfParticles: number) {
      this.#numberOfParticles = _numberOfParticles;
      this.deleteRenderData();
    }

    public useRenderData(): void {/* injected by RenderInjector*/ }
    public deleteRenderData(): void {/* injected by RenderInjector*/ }

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

    public getMutator(_extendable?: boolean): Mutator {
      let mutator: Mutator = super.getMutator(true);
      mutator.numberOfParticles = this.numberOfParticles;
      return mutator;
    }

    public getMutatorForUserInterface(): MutatorForUserInterface {
      let mutator: MutatorForUserInterface = <MutatorForUserInterface>this.getMutator(true);
      delete mutator.particleEffect;
      mutator.particleEffect = this.particleEffect?.getMutatorForUserInterface();
      return mutator;
    }

    public getMutatorForAnimation(): MutatorForAnimation {
      let mutator: MutatorForAnimation = <MutatorForAnimation>this.getMutator();
      delete mutator.particleEffect;
      delete mutator.numberOfParticles;
      return mutator;
    }

    protected reduceMutator(_mutator: Mutator): void {
      super.reduceMutator(_mutator);
      delete _mutator.randomNumbersRenderData;
      delete _mutator.time;
    }
    //#endregion
  }
}