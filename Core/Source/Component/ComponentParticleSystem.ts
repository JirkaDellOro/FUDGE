namespace FudgeCore {
  /**
   * Attaches a {@link ParticleSystem} to the node.
   * @author Jonas Plotzky, HFU, 2020
   */
  @RenderInjectorComponentParticleSystem.decorate
  export class ComponentParticleSystem extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentParticleSystem);
    /** a texture filed with random numbers. Used by particle shader */
    public renderData: unknown;
    public particleSystem: ParticleSystem;
    public readonly time: Time;
    
    /** the number of particles */
    #size: number;

    constructor(_particleSystem: ParticleSystem = null, _size: number = 10) {
      super();     
      this.particleSystem = _particleSystem;
      this.size = _size;
      this.time = new Time();
    }

    /**
     * Get the number of particles
     */
    public get size(): number {
      return this.#size;
    }

    /**
     * Set the number of particles. Caution: Setting this will reinitialize the random numbers array(texture) used in the shader.
     */
    public set size(_size: number) {
      this.#size = _size;
      this.deleteRenderData();
    }

    public useRenderData(): void {/* injected by RenderInjector*/ }
    public deleteRenderData(): void {/* injected by RenderInjector*/ }

    //#region transfer
    public serialize(): Serialization {
      let serialization: Serialization = {
        [super.constructor.name]: super.serialize(),
        idParticleSystem: this.particleSystem?.idResource,
        size: this.size
      };

      return serialization;
    }

    public async deserialize(_serialization: Serialization): Promise<Serializable> {
      await super.deserialize(_serialization[super.constructor.name]);
      if (_serialization.idParticleSystem) this.particleSystem = <ParticleSystem>await Project.getResource(_serialization.idParticleSystem);
      this.size = _serialization.size;

      return this;
    }

    public getMutator(_extendable?: boolean): Mutator {
      let mutator: Mutator = super.getMutator(true);
      mutator.size = this.size;
      return mutator;
    }

    public getMutatorForUserInterface(): MutatorForUserInterface {
      let mutator: MutatorForUserInterface = <MutatorForUserInterface>this.getMutator(true);
      delete mutator.particleSystem;
      mutator.particleSystem = this.particleSystem?.getMutatorForUserInterface();
      return mutator;
    }

    public getMutatorForAnimation(): MutatorForAnimation {
      let mutator: MutatorForAnimation = <MutatorForAnimation>this.getMutator();
      delete mutator.particleSystem;
      delete mutator.size;
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