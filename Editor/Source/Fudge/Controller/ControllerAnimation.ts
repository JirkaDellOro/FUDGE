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
    private view: ViewAnimation;
    private sequences: ViewAnimationSequence[];

    constructor(_animation: ƒ.Animation, _propertyList: HTMLElement, _view: ViewAnimation) {
      this.animation = _animation;
      this.propertyList = _propertyList;
      this.propertyList.addEventListener(ƒui.EVENT.CLICK, this.hndEvent);
      this.view = _view;
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
          
          if (element instanceof ƒui.CustomElement && structureOrSequence instanceof ƒ.AnimationSequence) {
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
      
      let time: number = ƒ.AnimationKey.toKeyTime(_time);
      let key: ƒ.AnimationKey = sequence.getKeys().find(_key => _key.time == time);
      if (!key)
        sequence.addKey(new ƒ.AnimationKey(time, <number>_element.getMutatorValue()));
      else
        sequence.modifyKey(key, null, <number>_element.getMutatorValue());
      this.animation.calculateTotalTime();
    }

    public nextKey(_time: number, _direction: "forward" | "backward"): number {
      let nextKey: ƒ.AnimationKey = this.sequences
        .flatMap(_sequence => _sequence.data.getKeys())
        .sort(_direction == "forward" && ((_a, _b) => _a.time - _b.time) || _direction == "backward" && ((_a, _b) => _b.time - _a.time))
        .find(_key => _direction == "forward" && _key.time > _time || _direction == "backward" && _key.time < _time);
      if (nextKey)
        return nextKey.time;
      else
        return _time;
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

    private getSelectedSequences(_selectedProperty?: HTMLElement): ViewAnimationSequence[] {
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
              data: sequence
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

    private hndEvent = (_event: CustomEvent): void => {
      switch (_event.type) {
        case ƒui.EVENT.CLICK:
          if (!(_event.target instanceof HTMLElement) || !this.animation || _event.target instanceof HTMLButtonElement) break;
        
          let target: HTMLElement = _event.target;
          if (target.parentElement instanceof ƒui.Details) 
            target = target.parentElement;
          if (target instanceof ƒui.CustomElement || target instanceof ƒui.Details) 
            this.sequences = this.getSelectedSequences(target);
          else if (target == this.propertyList)
            this.sequences = this.getSelectedSequences();
          
          this.view.dispatch(EVENT_EDITOR.SELECT, { bubbles: true, detail: { data: this.sequences } });
          break;
      }
    }
  }
}