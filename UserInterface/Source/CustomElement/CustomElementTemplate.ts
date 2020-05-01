///<reference path="CustomElement.ts"/>
namespace FudgeUserInterface {
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
          console.log("Register", template);
          CustomElementTemplate.fragment.set(_tagName, template.content);
        }
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
    }
  }
}