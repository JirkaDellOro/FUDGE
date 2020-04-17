///<reference path="CustomElement.ts"/>
namespace FudgeUserInterface {
  export class CustomElementTemplate extends CustomElement {
    public static tag: string;
    private static fragment: Map<string, DocumentFragment> = new Map();

    constructor() {
      super();
    }

    connectedCallback(): void {
      if (this.initialized)
        return;

      let fragment: DocumentFragment = CustomElementTemplate.fragment.get(Reflect.get(this.constructor, "tag"));
      let content: HTMLElement = <HTMLElement>fragment.firstElementChild;

      let style: CSSStyleDeclaration = this.style;
      for (let entry of content.style) {
        style.setProperty(entry, Reflect.get(content.style, entry));
      }
      for (let child of content.childNodes) {
        this.appendChild(child.cloneNode(true));
      }
      this.initialized = true;
    }
  }
}