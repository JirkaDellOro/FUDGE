namespace FudgeCore {

  export interface StoredValues {
    [key: string]: number;
  }

  export class ComponentParticleSystem extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentParticleSystem);
    public storedValues: StoredValues = {}; // TODO: make private
    public effectData: ParticleEffectData;
    private randomNumbers: number[] = [];
    // color

    constructor(_filename: string = null, _numberOfParticles: number = null) {
      super();

      for (let i: number = 0; i < 2000 /* TODO: don't hardcode this number, number should be bigger than number of particles */; i++) {
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

    public updateParticleEffect(_time: number): void {
      this.storedValues["time"] = _time;
    }

    public evaluateClosureStorage(_storageData: ParticleEffectData): void {
      for (const key in _storageData) {
        this.storedValues[key] = (<Function>_storageData[key])();
      }
    }
  }
}