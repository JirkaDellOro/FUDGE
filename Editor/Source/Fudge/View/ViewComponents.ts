namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  /**
   * View displaying all information of any selected entity and offering simple controls for manipulation
   */
  enum Menu {
    COMPONENTMENU = "Add Components"
  }

  export class ViewComponents extends View {
    private data: ƒ.Node | ƒ.Mutable;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      // this.parentPanel.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.setNode);
      this.fillContent();
    }

    public cleanup(): void {
      //TODO: Deconstruct;
    }

    fillContent(): void {
      if (this.data) {
        if (this.data instanceof ƒ.Node) {
          // let txtNodeName: HTMLInputElement = document.createElement("input");
          // txtNodeName.addEventListener("input", this.changeNodeName);
          // cntHeader.append(txtNodeName);
          let cntHeader: HTMLElement = document.createElement("span");
          cntHeader.textContent = this.data.name;
          this.dom.appendChild(cntHeader);

          let nodeComponents: ƒ.Component[] = this.data.getAllComponents();
          for (let nodeComponent of nodeComponents) {
            let fieldset: ƒui.FoldableFieldSet = ƒui.Generator.createFieldSetFromMutable(nodeComponent);
            let uiComponent: ComponentController = new ComponentController(nodeComponent, fieldset);
            this.dom.append(uiComponent.domElement);
          }
        }
      }
      else {
        let cntEmpty: HTMLDivElement = document.createElement("div");
        this.dom.append(cntEmpty);
      }
    }

    /**
     * Changes the name of the displayed node
     */
    private changeNodeName = (_event: Event) => {
      if (this.data instanceof ƒ.Node) {
        let target: HTMLInputElement = <HTMLInputElement>_event.target;
        this.data.name = target.value;
      }
    }

    /**
     * Change displayed node
     */
    private setNode = (_event: CustomEvent): void => {
      this.data = _event.detail;
      while (this.dom.firstChild != null) {
        this.dom.removeChild(this.dom.lastChild);
      }
      this.fillContent();
    }

    /**
     * Add Component to displayed node
     */
    private addComponent = (_event: CustomEvent): void => {
      switch (_event.detail) {
      }
    }
    
  }
}