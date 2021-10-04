// / <reference types="../../../Core/Build/FudgeCore"/>
namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  /**
   * Connects a [[Mutable]] to a DOM-Element and synchronizes that mutable with the mutator stored within.
   * Updates the mutable on interaction with the element and the element in time intervals.
   */
  export class Controller {
    // TODO: examine the use of the attribute key vs name. Key signals the use by FUDGE while name is standard and supported by forms
    public domElement: HTMLElement;
    protected timeUpdate: number = 190;
    /** Refererence to the [[FudgeCore.Mutable]] this ui refers to */
    protected mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>;
    /** [[FudgeCore.Mutator]] used to convey data to and from the mutable*/
    protected mutator: ƒ.Mutator;
    /** [[FudgeCore.Mutator]] used to store the data types of the mutator attributes*/
    protected mutatorTypes: ƒ.Mutator = null;

    private idInterval: number;

    constructor(_mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>, _domElement: HTMLElement) {
      this.domElement = _domElement;
      this.setMutable(_mutable);
      // TODO: examine, if this should register to one common interval, instead of each installing its own.
      this.startRefresh();
      this.domElement.addEventListener(EVENT.INPUT, this.mutateOnInput);
      this.domElement.addEventListener(EVENT.REARRANGE_ARRAY, this.rearrangeArray);
    }

    /**
     * Recursive method taking an existing [[ƒ.Mutator]] as a template 
     * and updating its values with those found in the given UI-domElement. 
     */
    public static updateMutator(_domElement: HTMLElement, _mutator: ƒ.Mutator): ƒ.Mutator {
      for (let key in _mutator) {
        let element: HTMLInputElement = <HTMLInputElement>Controller.findChildElementByKey(_domElement, key);
        if (element == null)
          continue;

        if (element instanceof CustomElement)
          _mutator[key] = element.getMutatorValue();
        else if (_mutator[key] instanceof Object)
          _mutator[key] = Controller.updateMutator(element, _mutator[key]);
        else
          _mutator[key] = element.value;
      }

      return _mutator;
    }

    /**
     * Recursive method taking the a [[ƒ.Mutable]] as a template to create a [[ƒ.Mutator]] or update the given [[ƒ.Mutator]] 
     * with the values in the given UI-domElement
     */
    public static getMutator(_mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>, _domElement: HTMLElement, _mutator?: ƒ.Mutator, _types?: ƒ.Mutator): ƒ.Mutator {
      // TODO: examine if this.mutator should also be addressed in some way...
      let mutator: ƒ.Mutator = _mutator || _mutable.getMutatorForUserInterface();
      // TODO: Mutator type now only used for enums. Examine if there is another way
      let mutatorTypes: ƒ.MutatorAttributeTypes = _types || _mutable.getMutatorAttributeTypes(mutator);

      for (let key in mutator) {
        let element: HTMLElement = Controller.findChildElementByKey(_domElement, key);
        if (element == null)
          return mutator;

        if (element instanceof CustomElement)
          mutator[key] = (<CustomElement>element).getMutatorValue();
        else if (element instanceof HTMLInputElement)
          mutator[key] = element.value;
        else if (mutatorTypes[key] instanceof Object)
          // TODO: setting a value of the dom element doesn't make sense... examine what this line was supposed to do. Assumably enums
          mutator[key] = (<HTMLSelectElement>element).value;
        else {
          let subMutator: ƒ.Mutator = Reflect.get(mutator, key);
          let subMutable: ƒ.Mutable;
          subMutable = Reflect.get(_mutable, key);
          if (subMutable instanceof ƒ.MutableArray || subMutable instanceof ƒ.Mutable)
            mutator[key] = this.getMutator(subMutable, element, subMutator); //, subTypes);
        }
      }
      return mutator;
    }

    /**
     * Recursive method taking the [[ƒ.Mutator]] of a [[ƒ.Mutable]] and updating the UI-domElement accordingly.
     * If an additional [[ƒ.Mutator]] is passed, its values are used instead of those of the [[ƒ.Mutable]].
     */
    public static updateUserInterface(_mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>, _domElement: HTMLElement, _mutator?: ƒ.Mutator): void {
      let mutator: ƒ.Mutator = _mutator || _mutable.getMutatorForUserInterface();
      let mutatorTypes: ƒ.MutatorAttributeTypes = {};
      if (_mutable instanceof ƒ.Mutable)
        mutatorTypes = _mutable.getMutatorAttributeTypes(mutator);
      for (let key in mutator) {
        let element: CustomElement = <CustomElement>Controller.findChildElementByKey(_domElement, key);
        if (!element)
          continue;

        let value: ƒ.General = mutator[key];

        if (element instanceof CustomElement && element != document.activeElement)
          element.setMutatorValue(value);
        else if (mutatorTypes[key] instanceof Object)
          element.setMutatorValue(value);
        else {
          let subMutable: ƒ.Mutable = Reflect.get(_mutable, key);
          if (subMutable instanceof ƒ.MutableArray || subMutable instanceof ƒ.Mutable)
            this.updateUserInterface(subMutable, element, mutator[key]);
          else
            //element.setMutatorValue(value);
            Reflect.set(element, "value", value);
        }
      }
    }

    public static findChildElementByKey(_domElement: HTMLElement, key: string): HTMLElement {
      let result: HTMLElement;
      try {
        result = _domElement.querySelector(`[key = ${key}]`);
      } catch (_error) {
        result = _domElement.querySelector(`[key = ${"ƒ" + key}]`);
      }
      return result;
    }

    public getMutator(_mutator?: ƒ.Mutator, _types?: ƒ.Mutator): ƒ.Mutator {
      // TODO: should get Mutator for UI or work with this.mutator (examine)
      this.mutable.updateMutator(this.mutator);
      return Controller.getMutator(this.mutable, this.domElement, _mutator, _types);
    }

    public updateUserInterface(): void {
      Controller.updateUserInterface(this.mutable, this.domElement);
    }

    public setMutable(_mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>): void {
      this.mutable = _mutable;
      this.mutator = _mutable.getMutatorForUserInterface();
      if (_mutable instanceof ƒ.Mutable)
        this.mutatorTypes = _mutable.getMutatorAttributeTypes(this.mutator);
    }

    public getMutable(): ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable> {
      return this.mutable;
    }

    public startRefresh(): void {
      window.clearInterval(this.idInterval);
      this.idInterval = window.setInterval(this.refresh, this.timeUpdate);
    }

    protected mutateOnInput = async (_event: Event) => {
      this.mutator = this.getMutator();
      await this.mutable.mutate(this.mutator);
      _event.stopPropagation();

      this.domElement.dispatchEvent(new Event(EVENT.MUTATE, { bubbles: true }));
    }

    protected rearrangeArray = async (_event: Event) => {
      let sequence: number[] = (<CustomEvent>_event).detail.sequence;
      let path: string[] = [];
      let details: DetailsArray = <DetailsArray>_event.target;
      let mutable: ƒ.Mutable | ƒ.MutableArray<ƒ.Mutable>;

      { // find the MutableArray connected to this DetailsArray
        let element: HTMLElement = details;
        while (element != this.domElement) {
          if (element.getAttribute("key"))
            path.push(element.getAttribute("key"));
          element = element.parentElement;
        }
        // console.log(path);
        mutable = this.mutable;
        for (let key of path)
          mutable = Reflect.get(mutable, key);
      }

      // rearrange that mutable
      (<ƒ.MutableArray<ƒ.Mutable>><unknown>mutable).rearrange(sequence);
    }

    protected refresh = (_event: Event) => {
      if (document.body.contains(this.domElement)) {
        this.updateUserInterface();
        return;
      }

      window.clearInterval(this.idInterval);
    }
  }
}
