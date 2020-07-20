namespace FudgeCore {

  // TODO: try symbols
  /**
   * Contains all the information which will be used to evaluate the closures of the particle effect. Current time and index, size and all the defined values of the storage partition of the effect will cached here while evaluating the effect. 
   */
  export interface StoredValues {
    [key: string]: number;
  }

  /**
   * Attaches a [[PaticleEffect]] to the node.
   * @author Jonas Plotzky, HFU, 2020
   */
  export class ComponentParticleSystem extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentParticleSystem);
    public particleEffect: ParticleEffect;
    // TODO: add color for the whole system
    public randomNumbers: number[] = [];

    // TODO: instances of this class should how their own StoredValues and random number arrays
    constructor(_particleEffect: ParticleEffect = null) {
      super();
      this.particleEffect = _particleEffect;
      for (let i: number = 0; i < _particleEffect.storedValues["size"] + 10 /* so that its possible to have 10 different random numbers per index i.e. randomNumber(index + x) */; i++) {
        this.randomNumbers.push(Math.random());
      }

      // evaluate system storage
      this.evaluateClosureStorage(this.particleEffect.storageSystem);
    }

    // TODO: put this in ParticleEffect
    public evaluateClosureStorage(_storageData: ParticleEffectData): void {
      for (const key in _storageData) {
        this.particleEffect.storedValues[key] = (<Function>_storageData[key])();
      }
    }
  }
}