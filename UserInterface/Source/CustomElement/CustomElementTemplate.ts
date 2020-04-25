///<reference path="CustomElement.ts"/>
namespace FudgeUserInterface {
  export abstract class CustomElementTemplate extends CustomElement {
    private static fragment: Map<string, DocumentFragment> = new Map();

    constructor() {
      super(undefined);
    }

    public static register(_tagName: string): void {
      for (let template of document.querySelectorAll("template")) {
        if (template.content.firstElementChild.localName == _tagName) {
          console.log("Register", template);
          CustomElementTemplate.fragment.set(_tagName, template.content);
        }
      }
    }

    connectedCallback(): void {
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
    }
  }
}