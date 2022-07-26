namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export class ControllerAnimation  {
    private static propertyColors: string[] = [
      "red",
      "green",
      "blue",
      "cyan",
      "yellow",
      "magenta"
    ];
    private animation: ƒ.Animation;
    private domElement: HTMLElement;
    private mutatorForNode: ƒ.Mutator;

    private colorIndex: number = 0;

    public constructor(_animation: ƒ.Animation, _domElement: HTMLElement, _mutatorForNode: ƒ.Mutator) {
      this.animation = _animation;
      this.domElement = _domElement;
      this.mutatorForNode = _mutatorForNode;
      // this.domElement.addEventListener(ƒui.EVENT.KEY_DOWN, this.hndKey);
      // console.log(this.domElement);
    }

    private static addKeyToAnimationStructure(_domElement: HTMLElement, _animationStructure: ƒ.AnimationStructure, _time: number, _mutatorForNode: ƒ.Mutator): ƒ.Mutator {
      for (const property in _animationStructure) {
        let element: HTMLInputElement = <HTMLInputElement>ƒui.Controller.findChildElementByKey(_domElement, property);
        if (element == null)
          continue;

        if (element instanceof ƒui.CustomElement) {
          let value: Object = element.getMutatorValue();
          let previousValue: ƒ.General = _mutatorForNode[property];
          if (typeof value == "number" && value !== previousValue) {
            (<ƒ.AnimationSequence>_animationStructure[property]).addKey(new ƒ.AnimationKey(_time, <number>element.getMutatorValue()));
          }
        }
        else
          _animationStructure[property] = this.addKeyToAnimationStructure(element, <ƒ.AnimationStructure>_animationStructure[property], _time, _mutatorForNode[property]);
      }
      return _animationStructure;
    }

    private static updateUserInterfaceWithMutator(_domElement: HTMLElement, _mutator: ƒ.Mutator): void {
      for (const property in _mutator) {
        let element: ƒui.CustomElement = <ƒui.CustomElement>ƒui.Controller.findChildElementByKey(_domElement, property);
        if (!element)
          continue;

        let value: ƒ.General = _mutator[property];
        
        if (element instanceof ƒui.CustomElement && element != document.activeElement) {
          element.setMutatorValue(value);
          // // @ts-ignore
          // element.overrideProperty("animationSequence", path);
        }
        else {
          this.updateUserInterfaceWithMutator(element, _mutator[property]);
        }
      }
    }

    private static addPathToAnimationStructure(_animationStructure: ƒ.AnimationStructure, _path: string[]): ƒ.AnimationStructure {
      let property: string = _path[0];
      if (_animationStructure[property] instanceof ƒ.AnimationSequence) return _animationStructure;
      if (_path.length > 1) {
        if (_animationStructure[property] == undefined) _animationStructure[property] = {};
        _animationStructure[property] = this.addPathToAnimationStructure(<ƒ.AnimationStructure>_animationStructure[property], _path.slice(1));
      } else {
        _animationStructure[property] = new ƒ.AnimationSequence();
      }

      return _animationStructure;
    }

    private static deletePathFromAnimationStructure(_animationStructure: ƒ.AnimationStructure, _path: string[]): ƒ.AnimationStructure {
      let property: string = _path[0];
      if (_path.length > 1) {
        _animationStructure[property] = this.deletePathFromAnimationStructure(<ƒ.AnimationStructure>_animationStructure[property], _path.slice(1));
      } else {
        delete _animationStructure[property];
      }

      return _animationStructure;
    }

    private static deleteEmptyPathsFromAnimationStructure(_structure: ƒ.AnimationStructure): ƒ.AnimationStructure {
      for (const property in _structure) {
        if (_structure[property] instanceof ƒ.AnimationSequence) continue;

        let subStructure: ƒ.AnimationStructure = this.deleteEmptyPathsFromAnimationStructure(<ƒ.AnimationStructure>_structure[property]);
        if (Object.keys(subStructure).length == 0) {
          delete _structure[property];
        } else {
          _structure[property] = subStructure;
        }
      }

      return _structure;
    }

    private static getOpenSequences(_domElement: HTMLElement, _animationStructure: ƒ.AnimationStructure, _sequences: ViewAnimationSequence[]): void {
      for (const property in _animationStructure) {
        let element: HTMLElement = ƒui.Controller.findChildElementByKey(_domElement, property);
        if (element == null || (element instanceof ƒui.Details && !element.open))
          continue;

        let sequence: ƒ.AnimationStructure | ƒ.AnimationSequence = _animationStructure[property];
        if (sequence instanceof ƒ.AnimationSequence) {
          _sequences.push({
            color: element.style.getPropertyValue("--color-animation-property"),
            sequence: sequence
          });

        } else {
          ControllerAnimation.getOpenSequences(element, <ƒ.AnimationStructure>_animationStructure[property], _sequences);
        }
      }
    }

    public updateAnimationUserInterface(_mutator: ƒ.Mutator): void {
      this.mutatorForNode = _mutator;
      ControllerAnimation.updateUserInterfaceWithMutator(this.domElement, _mutator);
      this.colorIndex = 0;
      this.updatePropertyColors(this.domElement, this.animation.animationStructure);
    }

    public addKeyToAnimationStructure(_time: number): void {
      ControllerAnimation.addKeyToAnimationStructure(this.domElement, this.animation.animationStructure, _time, this.mutatorForNode);
      if (_time > this.animation.totalTime)
        this.animation.calculateTotalTime();
    }

    public deleteKeyFromAnimationStructure(_key: ViewAnimationKey): void {
      let animationSequence: ƒ.AnimationSequence = _key.sequence.sequence;
      animationSequence.removeKey(_key.key);
    }

    public addPathToAnimationStructure(_path: string[]): void {
      ControllerAnimation.addPathToAnimationStructure(this.animation.animationStructure, _path);
    }

    public deletePathFromAnimationStructure(_path: string[]): void {
      ControllerAnimation.deletePathFromAnimationStructure(this.animation.animationStructure, _path);
      ControllerAnimation.deleteEmptyPathsFromAnimationStructure(this.animation.animationStructure);
    }

    public getOpenSequences(): ViewAnimationSequence[] {
      let sequences: ViewAnimationSequence[] = [];
      ControllerAnimation.getOpenSequences(this.domElement, this.animation.animationStructure, sequences);
      return sequences;
    }

    private updatePropertyColors(_domElement: HTMLElement, _animationStructure: ƒ.AnimationStructure): void {
      for (const property in _animationStructure) {
        let element: ƒui.CustomElement = <ƒui.CustomElement>ƒui.Controller.findChildElementByKey(_domElement, property);
        if (!element || (element instanceof ƒui.Details && !element.isExpanded))
          continue;
        
        if (element instanceof ƒui.CustomElement && element != document.activeElement) {
          element.style.setProperty("--color-animation-property", this.getNextColor());
        } else {
          this.updatePropertyColors(element, <ƒ.AnimationStructure>_animationStructure[property]);
        }
      }
    }

    private getNextColor(): string {
      let color: string = ControllerAnimation.propertyColors[this.colorIndex];
      this.colorIndex = (this.colorIndex + 1) % ControllerAnimation.propertyColors.length;
      return color;
    }

    private hndKey = (_event: KeyboardEvent): void => {
      _event.stopPropagation();
      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.DELETE:
          this.domElement.dispatchEvent(new CustomEvent(ƒui.EVENT.DELETE, { bubbles: true, detail: this }));
          break;
      }
    }
  }
}