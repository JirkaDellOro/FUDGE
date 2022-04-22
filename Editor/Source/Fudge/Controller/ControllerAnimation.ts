namespace Fudge {
    import ƒ = FudgeCore;
    import ƒUi = FudgeUserInterface;
  
    export class ControllerAnimation  {
      private animation: ƒ.Animation;
      private domElement: HTMLElement;
      private mutatorForNode: ƒ.Mutator;

      public constructor(_animation: ƒ.Animation, _domElement: HTMLElement, _mutatorForNode: ƒ.Mutator) {
        this.animation = _animation;
        this.domElement = _domElement;
        this.mutatorForNode = _mutatorForNode;
      }

      public static updateAnimationStructure(_domElement: HTMLElement, _animationStructure: ƒ.Serialization | ƒ.AnimationSequence, _time: number, _mutatorForNode: ƒ.Mutator): ƒ.Mutator {
        for (let key in _animationStructure) {
          let element: HTMLInputElement = <HTMLInputElement>ƒUi.Controller.findChildElementByKey(_domElement, key.replaceAll(".", ""));
          if (element == null)
            continue;

          if (element instanceof ƒUi.CustomElement) {
            let value: Object = element.getMutatorValue();
            let previousValue: ƒ.General = _mutatorForNode[key];
            if (typeof value == "number" && value !== previousValue) {
              (<ƒ.AnimationSequence>_animationStructure[key]).addKey(new ƒ.AnimationKey(_time, <number>element.getMutatorValue()));
            }
          }
          else
            _animationStructure[key] = this.updateAnimationStructure(element, _animationStructure[key], _time, _mutatorForNode[key]);
        }
  
        return _animationStructure;
      }

      public static updateUserInterfaceWithMutator(_domElement: HTMLElement, _mutator: ƒ.Mutator): void {
        for (let key in _mutator) {
          let element: ƒUi.CustomElement = <ƒUi.CustomElement>ƒUi.Controller.findChildElementByKey(_domElement, key.replaceAll(".", ""));
          if (!element)
            continue;

          let value: ƒ.General = _mutator[key];
          
          if (element instanceof ƒUi.CustomElement && element != document.activeElement)
            element.setMutatorValue(value);
          else {
            this.updateUserInterfaceWithMutator(element, _mutator[key]);
          }
        }
      }

      public updateAnimationStructure(_time: number): void {
        ControllerAnimation.updateAnimationStructure(this.domElement, this.animation.animationStructure, _time, this.mutatorForNode);
      }

      public updateAnimationUserInterface(_mutator: ƒ.Mutator): void {
        this.mutatorForNode = _mutator;
        ControllerAnimation.updateUserInterfaceWithMutator(this.domElement, _mutator);
      }

      public removeAnimationKey(_key: ViewAnimationKey): void {
        let animationSequence: ƒ.AnimationSequence = _key.sequence.sequence;
        animationSequence.removeKey(_key.key);
      }
    }
  }