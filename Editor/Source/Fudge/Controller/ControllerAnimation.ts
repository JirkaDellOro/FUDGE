namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export class ControllerAnimation {
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
    private dom: HTMLElement;
    private view: ViewAnimation;
    private sequences: ViewAnimationSequence[];

    constructor(_animation: ƒ.Animation, _dom: HTMLElement, _view: ViewAnimation) {
      this.animation = _animation;
      this.dom = _dom;
      this.dom.addEventListener(ƒui.EVENT.CLICK, this.hndEvent);
      this.dom.addEventListener(EVENT_EDITOR.MODIFY, this.hndEvent);
      this.view = _view;
    }

    public update(_mutator: ƒ.Mutator, _time?: number): void {
      let colorIndex: number = 0;
      let keySelected = this.view.keySelected;

      updateRecursive(this.dom, _mutator, this.animation.animationStructure, _time);

      function updateRecursive(_dom: HTMLElement, _mutator: ƒ.Mutator, _animationStructure: ƒ.AnimationStructure, _time: number): void {
        for (const key in _mutator) {
          let element: ƒui.CustomElement = <ƒui.CustomElement>ƒui.Controller.findChildElementByKey(_dom, key);
          if (!element)
            continue;

          let value: ƒ.General = _mutator[key];
          let structureOrSequence: Object = _animationStructure[key];

          if (element instanceof ƒui.CustomElement && structureOrSequence instanceof ƒ.AnimationSequence) {
            element.classList.remove("selected");
            let key: ƒ.AnimationKey = structureOrSequence.findKey(_time);
            if (key) {// key found at exactly the given time, take its value
              value = key.value;
              if (key == keySelected)
                element.classList.add("selected");
            }
            element.style.setProperty("--color-animation-property", getNextColor());
            element.setMutatorValue(value);
            Reflect.set(element, "animationSequence", structureOrSequence);
          }
          else {
            updateRecursive(element, value, <ƒ.AnimationStructure>structureOrSequence, _time);
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
    public updateSequence(_time: number, _element: ƒui.CustomElement, _add: boolean = false): void {
      let sequence: ƒ.AnimationSequence = Reflect.get(_element, "animationSequence");
      if (!sequence) return;

      let key: ƒ.AnimationKey = sequence.findKey(_time);
      if (!key) {
        if (_add) {
          key = new ƒ.AnimationKey(_time, <number>_element.getMutatorValue())
          sequence.addKey(key);
        }
      }
      else
        sequence.modifyKey(key, null, <number>_element.getMutatorValue());
      this.view.dispatch(EVENT_EDITOR.SELECT, { bubbles: true, detail: { data: key } });
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

    public addProperty(_path: string[], _node: ƒ.Node, _time: number): void {
      let structure: ƒ.AnimationSequence | ƒ.AnimationStructure = this.animation.animationStructure;
      for (let i: number = 0; i < _path.length - 1; i++) {
        let key: string = _path[i];
        if (!(key in structure))
          structure[key] = {};
        structure = structure[key];
      }
      let sequence: ƒ.AnimationSequence = new ƒ.AnimationSequence();
      sequence.addKey(new ƒ.AnimationKey(_time, 0));
      structure[_path[_path.length - 1]] = sequence;
    }

    public deleteProperty(_element: HTMLElement): void {
      if (!this.dom.contains(_element)) return;

      let path: string[] = [];
      let element: HTMLElement = _element;
      while (element !== this.dom) {
        if (element instanceof ƒui.CustomElement || element instanceof ƒui.Details)
          path.unshift(element.getAttribute("key"));

        element = element.parentElement;
      }
      this.deletePath(path);
    }

    private getSelectedSequences(_selectedProperty?: HTMLElement): ViewAnimationSequence[] {
      let sequences: ViewAnimationSequence[] = [];
      collectSelectedSequencesRecursive(this.dom, this.animation.animationStructure, sequences, _selectedProperty == null);
      return sequences;

      function collectSelectedSequencesRecursive(_dom: HTMLElement, _animationStructure: ƒ.AnimationStructure, _sequences: ViewAnimationSequence[], _isSelectedDescendant: boolean): void {
        for (const key in _animationStructure) {
          let element: HTMLElement = ƒui.Controller.findChildElementByKey(_dom, key);
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
        case EVENT_EDITOR.MODIFY:
          if (!(_event.target instanceof HTMLElement) || !this.animation || _event.target instanceof HTMLButtonElement) break;

          let target: HTMLElement = _event.target;
          if (target.parentElement instanceof ƒui.Details)
            target = target.parentElement;
          if (target instanceof ƒui.CustomElement || target instanceof ƒui.Details)
            this.sequences = this.getSelectedSequences(target);
          else if (target == this.dom)
            this.sequences = this.getSelectedSequences();

          this.view.dispatch(EVENT_EDITOR.SELECT, { bubbles: true, detail: { data: this.sequences } });
          break;
      }
    }
  }
}