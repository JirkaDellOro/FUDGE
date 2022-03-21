///<reference path="CustomElement.ts"/>
namespace FudgeUserInterface {
  import ƒ = FudgeCore;
  /**
   * Creates a CustomElement from an HTML-Template-Tag
   */
  export abstract class CustomElementTemplate extends CustomElement {
    private static fragment: Map<string, DocumentFragment> = new Map();

    constructor(_attributes?: CustomElementAttributes) {
      super(_attributes);
    }

    /**
     * Browses through the templates in the current document and registers the one defining the given tagname.
     * To be called from a script tag implemented with the template in HTML.
     */
    public static register(_tagName: string): void {
      for (let template of document.querySelectorAll("template")) {
        if (template.content.firstElementChild.localName == _tagName) {
          ƒ.Debug.fudge("Register", template.content.children[0]);
          CustomElementTemplate.fragment.set(_tagName, template.content);
        }
      }
    }

    /**
     * Get the value of this element in a format compatible with [[FudgeCore.Mutator]]
     */
    public getMutatorValue(): ƒ.Mutator {
      let mutator: ƒ.Mutator = {};
      let elements: NodeListOf<HTMLInputElement> = this.querySelectorAll("[key");
      for (let element of elements) {
        let key: string = element.getAttribute("key");
        if (element instanceof CustomElement)
          mutator[key] = element.getMutatorValue();
        else
          mutator[key] = element.value;
      }
      return mutator;
    }

    public setMutatorValue(_mutator: ƒ.Mutator): void {
      for (let key in _mutator) {
        let element: HTMLInputElement = this.querySelector(`[key=${key}]`);
        if (!element)
          console.log(`Couldn't find ${key} in`, this);
        if (element instanceof CustomElement)
          element.setMutatorValue(_mutator[key]);
        else
          element.value = _mutator[key];
      }
    }

    /**
     * When connected the first time, the element gets constructed as a deep clone of the template.
     */
    protected connectedCallback(): void {
      if (this.initialized)
        return;
      this.initialized = true;

      let fragment: DocumentFragment = CustomElementTemplate.fragment.get(Reflect.get(this.constructor, "tag"));
      let content: HTMLElement = <HTMLElement>fragment.firstElementChild;

      let style: CSSStyleDeclaration = this.style;
      for (let entry of content.style) {
        style.setProperty(entry, Reflect.get(content.style, entry));
      }
      for (let child of content.childNodes) {
        this.appendChild(child.cloneNode(true));
      }

      let label: HTMLLabelElement = this.querySelector("label");
      if (label)
        label.textContent = this.getAttribute("label");
    }
  }
}