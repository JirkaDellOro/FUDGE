namespace FudgeCore {

  // TODO: try symbols
  /**
   * Contains all the information which will be used to evaluate the closures of the particle effect. Current time and index, size and all the defined values of the storage partition of the effect will cached here while evaluating the effect. 
   */
  export interface ParticleInputFactors {
    [key: string]: number;
  }

  /**
   * Attaches a [[PaticleEffect]] to the node.
   * @author Jonas Plotzky, HFU, 2020
   */
  export class ComponentParticleSystem extends Component {
    public static readonly iSubclass: number = Component.registerSubclass(ComponentParticleSystem);
    public randomNumbers: number[];
    public inputFactors: ParticleInputFactors;

    private _particleEffect: ParticleEffect;
    // TODO: add color for the whole system


    // TODO: instances of this class should how their own StoredValues and random number arrays
    constructor(_particleEffect: ParticleEffect = null, _size: number = null) {
      super();
      this._particleEffect = _particleEffect;
      this.inputFactors = {
          "time": 0,
          "index": 0,
          "size": _size
        };
      this.initRandomNumbers(_size);

      // evaluate system storage
      this.evaluateStorage(this._particleEffect.storageSystem);
    }

    public get particleEffect(): ParticleEffect {
      return this._particleEffect;
    }

    public set particleEffect(_newParticleEffect: ParticleEffect) {
      this._particleEffect = _newParticleEffect;
      this.evaluateStorage(this._particleEffect.storageSystem);
    }

    public get size(): number {
      return this.inputFactors["size"];
    }

    public set size(_newSize: number) {
      this.inputFactors["size"] = _newSize;
      this.initRandomNumbers(_newSize);
      this.evaluateStorage(this._particleEffect.storageSystem);
    }

    public evaluateStorage(_storageData: ParticleEffectData): void {
      for (const key in _storageData) {
        this.inputFactors[key] = (<ParticleClosure>_storageData[key])(this.inputFactors);
      }
    }

    private initRandomNumbers(_size: number): void {
      this.randomNumbers = [];
      for (let i: number = 0; i < _size + 10 /* so that its possible to have 10 different random numbers per index i.e. randomNumber(index + x) */; i++) {
        this.randomNumbers.push(Math.random());
      }
    }
  }
}