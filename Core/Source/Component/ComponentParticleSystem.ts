namespace FudgeCore {

  // TODO: try symbols
  export interface StoredValues {
    [key: string]: number;
  }

  // export type StoredValues = Record<symbol, number>;

  export class ComponentParticleSystem extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentParticleSystem);
    public readonly particleEffect: ParticleEffect;
    // color

    // TODO: aufräumen: import von außen, effect statt filename übergeben
    constructor(_particleEffect: ParticleEffect = null) {
      super();
      this.particleEffect = _particleEffect;

      // evaluate system storage
      if (this.particleEffect.storageSystem)
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