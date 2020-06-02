namespace FudgeCore {

  export interface StoredValues {
    [key: string]: number;
  }
  
  export class ComponentParticleSystem extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentParticleSystem);
    public storedValues: StoredValues = {};
    public effectDefinition: ParticleEffectDefinition;
    private randomNumbers: number[] = [];

    constructor(_filename: string = null, _numberOfParticles: number = null) {
      super();

      for (let i: number = 0; i < 1000; i++) {
        this.randomNumbers.push(Math.random());
      }

      this.storedValues = {
        "time": 0,
        "index": 0,
        "size": _numberOfParticles
      };

      let effectImporter: ParticleEffectImporter = new ParticleEffectImporter(this.storedValues, this.randomNumbers);
      this.effectDefinition = effectImporter.importFile(_filename);

      // evaluate system storage
      this.evaluateClosureStorage(this.effectDefinition.system);
    }

    public updateParticleEffect(_time: number): void {
      this.storedValues["time"] = _time;
    }

    public evaluateClosureStorage(_closureStorage: ClosureStorage): void {
      for (const key in _closureStorage) {
        this.storedValues[key] = _closureStorage[key]();
      }
    }

    public evaluateClosureVector(_closureVector: ClosureVector): Vector3 {
      return new Vector3(
        _closureVector.x(), _closureVector.y(), _closureVector.z());
    }
  }
}