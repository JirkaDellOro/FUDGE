namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export class ControllerAnimation  {
    private static readonly PROPERTY_COLORS: string[] = [
      "Red",
      "Lime",
      "Blue",
      "Cyan",
      "Magenta",
      "Yellow",
      "Salmon",
      "LightGreen",
      "CornflowerBlue"
    ];
    private animation: ƒ.Animation;
    private propertyList: HTMLElement;

    public constructor(_animation: ƒ.Animation, _propertyList: HTMLElement) {
      this.animation = _animation;
      this.propertyList = _propertyList;
    }

    public updatePropertyList(_mutator: ƒ.Mutator): void {
      let colorIndex: number = 0;
      updatePropertyListRecursive(this.propertyList, _mutator, this.animation.animationStructure);

      function updatePropertyListRecursive(_propertyList: HTMLElement, _mutator: ƒ.Mutator, _animationStructure: ƒ.AnimationStructure): void {
        for (const key in _mutator) {
          let element: ƒui.CustomElement = <ƒui.CustomElement>ƒui.Controller.findChildElementByKey(_propertyList, key);
          if (!element)
            continue;
            
          let value: ƒ.General = _mutator[key];
          let structureOrSequence: Object = _animationStructure[key];
          
          if (element instanceof ƒui.CustomElement && element != document.activeElement) {
            element.style.setProperty("--color-animation-property", getNextColor());
            element.setMutatorValue(value);
            Reflect.set(element, "animationSequence", structureOrSequence);
          }
          else {
            updatePropertyListRecursive(element, value, <ƒ.AnimationStructure>structureOrSequence);
          }
        }
      }

      function getNextColor(): string {
        let color: string = ControllerAnimation.PROPERTY_COLORS[colorIndex];
        colorIndex = (colorIndex + 1) % ControllerAnimation.PROPERTY_COLORS.length;
        return color;
      }
    }

    // modify or add key
    public updateSequence(_time: number, _element: ƒui.CustomElement): void {
      let sequence: ƒ.AnimationSequence = Reflect.get(_element, "animationSequence");
      if (!sequence) return;

      let key: ƒ.AnimationKey = sequence.getKeys().find( _key => _key.Time == _time );
      if (!key)
        sequence.addKey(new ƒ.AnimationKey(_time, <number>_element.getMutatorValue()));
      else
        sequence.modifyKey(key, null, <number>_element.getMutatorValue());
    }

    public deleteKey(_key: ViewAnimationKey): void {
      if (!_key) return;
      let animationSequence: ƒ.AnimationSequence = _key.sequence.sequence;
      animationSequence.removeKey(_key.key);
    }
    
    public addProperty(_path: string[]): void {
      let value: Object = this.animation.animationStructure;
      for (let i: number = 0; i < _path.length - 1; i++) {
        let key: string = _path[i];
        if (!(key in value)) 
          value[key] = {};
        value = value[key];
      }
      value[_path[_path.length - 1]] = new ƒ.AnimationSequence();
    }

    public deleteProperty(_element: HTMLElement): void {
      if (!this.propertyList.contains(_element)) return;

      let path: string[] = [];
      let element: HTMLElement = _element;
      while (element !== this.propertyList) {
        if (element instanceof ƒui.CustomElement || element instanceof ƒui.Details) 
          path.unshift(element.getAttribute("key"));

        element = element.parentElement;
      }
      this.deletePath(path);
    }

    public getSelectedSequences(_selectedProperty: HTMLElement): ViewAnimationSequence[] {
      let sequences: ViewAnimationSequence[] = [];
      collectSelectedSequencesRecursive(this.propertyList, this.animation.animationStructure, sequences, _selectedProperty == null);
      return sequences;

      function collectSelectedSequencesRecursive(_propertyList: HTMLElement, _animationStructure: ƒ.AnimationStructure, _sequences: ViewAnimationSequence[], _isSelectedDescendant: boolean): void {
        for (const key in _animationStructure) {
          let element: HTMLElement = ƒui.Controller.findChildElementByKey(_propertyList, key);
          let isSelectedDescendant: boolean = _isSelectedDescendant || element == _selectedProperty;
          if (element == null)
            continue;

          let sequence: Object = _animationStructure[key];
          if (sequence instanceof ƒ.AnimationSequence && isSelectedDescendant) {
            _sequences.push({
              color: element.style.getPropertyValue("--color-animation-property"),
              sequence: sequence
            });
          } else {
            collectSelectedSequencesRecursive(element, <ƒ.AnimationStructure>_animationStructure[key], _sequences, isSelectedDescendant);
          }
        }
      }
    }

    private deletePath(_path: string[]): void {
      let value: Object = this.animation.animationStructure;
      for (let i: number = 0; i < _path.length - 1; i++) 
        value = value[_path[i]];
      delete value[_path[_path.length - 1]];

      deleteEmptyPathsRecursive(this.animation.animationStructure);

      function deleteEmptyPathsRecursive(_object: Object): Object {
        for (const key in _object) {
          if (_object[key] instanceof ƒ.AnimationSequence) continue;
  
          let value: Object = deleteEmptyPathsRecursive(_object[key]);
          if (Object.keys(value).length == 0) {
            delete _object[key];
          } else {
            _object[key] = value;
          }
        }
  
        return _object;
      }
    }

    private hndKey = (_event: KeyboardEvent): void => {
      _event.stopPropagation();
      switch (_event.code) {
        case ƒ.KEYBOARD_CODE.DELETE:
          this.propertyList.dispatchEvent(new CustomEvent(ƒui.EVENT.DELETE, { bubbles: true, detail: this }));
          break;
      }
    }
  }
}