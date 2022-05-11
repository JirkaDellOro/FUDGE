namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export class ControllerParticleSystem  {
    private particleEffectData: ƒ.ParticleEffectData;
    private domElement: HTMLElement;

    public constructor(_particleEffectData: ƒ.ParticleEffectData, _domElement: HTMLElement) {
      this.particleEffectData = _particleEffectData;
      this.domElement = _domElement;
    }

    private static updateParticleEffectData(_domElement: HTMLElement, _particleEffectData: ƒ.ParticleEffectData): ƒ.Mutator {
      for (const property in _particleEffectData) {
        let element: HTMLInputElement = <HTMLInputElement>ƒui.Controller.findChildElementByKey(_domElement, property);
        if (element == null)
          continue;

        if (element instanceof ƒui.CustomElement) {
          _particleEffectData[property] = <ƒ.ParticleEffectClosureData>element.getMutatorValue();
        }
        else
        _particleEffectData[property] = this.updateParticleEffectData(element, <ƒ.ParticleEffectData>_particleEffectData[property]);
      }
      return _particleEffectData;
    }

    public updateParticleEffectData(): void {
      ControllerParticleSystem.updateParticleEffectData(this.domElement, this.particleEffectData);
    }

  }
}