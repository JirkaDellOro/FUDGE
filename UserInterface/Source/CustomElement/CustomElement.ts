namespace FudgeUserInterface {
  import ƒ = FudgeCore;

  /**
   * Structure for the attributes to set in a CustomElement.
   * key (maybe rename to `name`) is mandatory and must match the key of a mutator if used in conjunction
   * label is recommended for labelled elements, key is used if not given.
   */
  export interface CustomElementAttributes {
    key: string;
    label?: string;
    [name: string]: string;
  }

  /**
   * Handles the mapping of CustomElements to their HTML-Tags via customElement.define
   * and to the data types and [[FudgeCore.Mutable]]s they render an interface for. 
   */
  export abstract class CustomElement extends HTMLElement {
    public static tag: string;
    private static mapObjectToCustomElement: Map<string, typeof CustomElement> = new Map();
    private static idCounter: number = 0;
    protected initialized: boolean = false;

    public constructor(_attributes?: CustomElementAttributes) {
      super();
      if (_attributes)
        for (let name in _attributes) {
          this.setAttribute(name, _attributes[name]);
        }
    }

    /**
     * Retrieve an id to use for children of this element, needed e.g. for standard interaction with the label
     */
    protected static get nextId(): string {
      return "ƒ" + CustomElement.idCounter++;
    }

    /**
     * Register map the given element type to the given tag and the given type of data
     */
    public static register(_tag: string, _typeCustomElement: typeof CustomElement, _typeObject?: typeof Object): void {
      // console.log(_tag, _class);
      _typeCustomElement.tag = _tag;
      // @ts-ignore
      customElements.define(_tag, _typeCustomElement);

      if (_typeObject)
        CustomElement.map(_typeObject.name, _typeCustomElement);
    }

    /**
     * Retrieve the element representing the given data type (if registered)
     */
    public static get(_type: string): typeof CustomElement {
      let element: string | typeof CustomElement | CustomElementConstructor = CustomElement.mapObjectToCustomElement.get(_type);
      if (typeof (element) == "string")
        element = customElements.get(element);
      return <typeof CustomElement>element;
    }

    private static map(_type: string, _typeCustomElement: typeof CustomElement): void {
      ƒ.Debug.fudge("Map", _type, _typeCustomElement.name);
      CustomElement.mapObjectToCustomElement.set(_type, _typeCustomElement);
    }

    /**
     * Return the key (name) of the attribute this element represents
     */
    public get key(): string {
      return this.getAttribute("key");
    }

    /**
     * Add a label-element as child to this element
     */
    public appendLabel(): HTMLLabelElement {
      let text: string = this.getAttribute("label");
      if (!text)
        return null;
      let label: HTMLLabelElement = document.createElement("label");
      label.textContent = text;
      this.appendChild(label);
      return label;
    }

    public setLabel(_label: string): void {
      let label: HTMLLabelElement = this.querySelector("label");
      if (label)
        label.textContent = _label;
    }

    /**
     * Get the value of this element in a format compatible with [[FudgeCore.Mutator]]
     */
    public abstract getMutatorValue(): Object;

    /**
     * Set the value of this element using a format compatible with [[FudgeCore.Mutator]]
     */
    public setMutatorValue(_value: Object): void {
      Reflect.set(this, "value", _value);
    }

    /** Workaround reconnection of clone */
    public cloneNode(_deep: boolean): Node {
      let label: string = this.getAttribute("label");
      //@ts-ignore
      let clone: CustomElement = new this.constructor(label ? { label: label } : null);
      document.body.appendChild(clone);
      clone.setMutatorValue(this.getMutatorValue());
      for (let attribute of this.attributes)
        clone.setAttribute(attribute.name, attribute.value);
      return clone;
    }
  }
}