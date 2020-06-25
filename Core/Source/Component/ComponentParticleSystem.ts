namespace FudgeCore {

  // TODO: try symbols
  export interface StoredValues {
    [key: string]: number;
  }

  // export type StoredValues = Record<symbol, number>;

  export class ComponentParticleSystem extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentParticleSystem);
    public readonly storedValues: StoredValues = {};
    public readonly effectData: ParticleEffectData;
    private randomNumbers: number[] = [];
    // color

    // TODO: aufräumen: import von außen, effect statt filename übergeben
    constructor(_filename: string = null, _numberOfParticles: number = null) {
      super();

      for (let i: number = 0; i < _numberOfParticles; i++) {
        this.randomNumbers.push(Math.random());
      }

      this.storedValues = {
        "time": 0,
        "index": 0,
        "size": _numberOfParticles
      };

      let effectImporter: ParticleEffectImporter = new ParticleEffectImporter(this.storedValues, this.randomNumbers);
      this.effectData = effectImporter.importFile(_filename);

      // evaluate system storage
      if (<ParticleEffectData>this.effectData["storage"])
        this.evaluateClosureStorage(<ParticleEffectData>(<ParticleEffectData>this.effectData["storage"])["system"]);
    }

    public evaluateClosureStorage(_storageData: ParticleEffectData): void {
      for (const key in _storageData) {
        this.storedValues[key] = (<Function>_storageData[key])();
      }
    }
  }
}