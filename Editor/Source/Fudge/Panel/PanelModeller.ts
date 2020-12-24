namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export class PanelModeller extends Panel {

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);

      this.goldenLayout.registerComponent(VIEW.MODELLER, ViewModellerScene);
      this.goldenLayout.registerComponent(VIEW.HIERARCHY, ViewHierarchy);
      this.goldenLayout.registerComponent(VIEW.PROPERTIES, ViewObjectProperties);
      let stack;
      // this.goldenLayout.on("stackCreated", this.addHeaderControl);
      this.goldenLayout.on("stackCreated", (_stack) => {      
        for (let component of _stack.contentItems) {
          if (component.componentName === VIEW.MODELLER) {
            stack = _stack;
          }
      }});

      let inner: GoldenLayout.ContentItem = this.goldenLayout.root.contentItems[0];
      inner.addChild({
        type: "column", content: [{
          type: "component", componentName: VIEW.MODELLER, componentState: _state, title: "Scene"
        }]
      });
      inner.addChild({
        type: "column", content: [
          // { type: "component", componentName: VIEW.HIERARCHY, componentState: _state, title: "Hierarchy" },
          { type: "component", componentName: VIEW.PROPERTIES, componentState: _state, title: "Properties" }
      ]
      });

      let event: CustomEvent = new CustomEvent("headerchange", { bubbles: false, detail: stack });
      this.broadcastEvent(event);
    }

    protected cleanup(): void {
      throw new Error("Method not implemented.");
    }

    private addHeaderControl = (_stack): void => {
      for (let component of _stack.contentItems) {
        if (component.componentName === VIEW.MODELLER) {
          let event: CustomEvent = new CustomEvent("headerchange", { bubbles: false, detail: _stack });
          this.broadcastEvent(event);
          // document.dispatchEvent(event);
          // console.log(_stack);

          // let template: HTMLTemplateElement = document.querySelector("#dropdown-template");
          // let dropdownControl: HTMLDivElement = <HTMLDivElement> template.content.cloneNode(true);
          // dropdownControl.querySelector(".dropdown-content").id = "control-dropdown";
          
          // _stack.header.controlsContainer.prepend(dropdownControl);
        }
      }
    }
  }
}