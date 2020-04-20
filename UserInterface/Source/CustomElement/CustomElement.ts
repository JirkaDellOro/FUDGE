namespace FudgeUserInterface {
  // import ƒ = FudgeCore;
  export interface CustomElementAttributes {
    key: string;
    label?: string;
    [name: string]: string;
  }

  export class CustomElement extends HTMLElement {
    public static tag: string;
    private static mapObjectToCustomElement: Map<typeof Object, typeof CustomElement> = new Map();
    private static idCounter: number = 0;
    protected initialized: boolean = false;

    public constructor(_attributes?: CustomElementAttributes) {
      super();
      if (_attributes)
        for (let name in _attributes)
          this.setAttribute(name, _attributes[name]);
    }

    public get key(): string {
      return this.getAttribute("key");
    }

    public static get nextId(): string {
      return "ƒ" + CustomElement.idCounter++;
    }

    public static register(_tag: string, _typeCustomElement: typeof CustomElement, _typeObject?: typeof Object): void {
      // console.log(_tag, _class);
      _typeCustomElement.tag = _tag;
      customElements.define(_tag, _typeCustomElement);
      
      if (_typeObject)
        CustomElement.map(_typeObject, _typeCustomElement);
    }

    public static map(_type: typeof Object, _typeCustomElement: typeof CustomElement): void {
      CustomElement.mapObjectToCustomElement.set(_type, _typeCustomElement);
    }

    public appendLabel(): HTMLLabelElement {
      let label: HTMLLabelElement = document.createElement("label");
      label.textContent = this.getAttribute("label");
      this.appendChild(label);
      return label;
    }
  }
}