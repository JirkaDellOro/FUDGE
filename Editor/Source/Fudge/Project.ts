namespace Fudge {
  enum PROJECT {
    OPT1 = "option1",
    OPT2 = "option2",
    OPT3 = "option3"
  }

  export class Project extends ƒ.Mutable {
    private title: string = "Fudge Project";
    private internalResourceFile: RequestInfo;
    private htmlProjectFile: RequestInfo;
    private scriptFile: RequestInfo;
    private graph: ƒ.Graph;
    private includePhysics: boolean = false;
    private option: PROJECT = PROJECT.OPT3;

    public constructor() {
      super();
    }

    public getProjectHTML(): string {
      let html: Document = document.implementation.createHTMLDocument("TestDoc");
      let child: HTMLElement;

      html.head.appendChild(createTag("meta", { charset: "utf-8" }));
      html.head.appendChild(createTag("script", { type: "text/javascript", src: "../../../Core/Build/FudgeCore.js" }));
      html.head.appendChild(createTag("script", { type: "text/javascript", src: "../../../Aid/Build/FudgeAid.js" }));

      html.head.appendChild(createTag("script", { type: "text/javascript", src: "Code/Build/Compiled.js", editor: "true" }));
      html.head.appendChild(createTag("link", { type: "resources", src: "InternalResources.json" }));


      function createTag(_tag: string, _attributes: { [key: string]: string }, _content?: string): HTMLElement {
        let element: HTMLElement = document.createElement(_tag);
        for (let attribute in _attributes)
          element.setAttribute(attribute, _attributes[attribute]);
        if (_content)
          element.innerHTML = _content;
        return element;
      }
      
      return (new XMLSerializer()).serializeToString(html);
    }

    public getMutatorAttributeTypes(_mutator: ƒ.Mutator): ƒ.MutatorAttributeTypes {
      let types: ƒ.MutatorAttributeTypes = super.getMutatorAttributeTypes(_mutator);
      if (types.option)
        types.option = PROJECT;
      return types;
    }

    protected reduceMutator(_mutator: ƒ.Mutator): void {/* */ }
  }
}