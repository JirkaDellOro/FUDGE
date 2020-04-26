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
    // TODO: adept view to selected object, update when selection changes etc.
    constructor(_parent: Panel) {
      super(_parent);
      this.parentPanel.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.setNode);
      this.fillContent();
    }

    deconstruct(): void {
      //TODO: Deconstruct;
    }

    fillContent(): void {
      if (this.data) {
        let cntHeader: HTMLElement = document.createElement("span");
        let lblNodeName: HTMLElement = document.createElement("label");
        lblNodeName.textContent = "Name";
        cntHeader.append(lblNodeName);
        this.content.append(cntHeader);
        
        if (this.data instanceof ƒ.Node) {
          let txtNodeName: HTMLInputElement = document.createElement("input");
          txtNodeName.addEventListener("input", this.changeNodeName);
          txtNodeName.value = this.data.name;
          cntHeader.append(txtNodeName);
          let nodeComponents: ƒ.Component[] = this.data.getAllComponents();
          for (let nodeComponent of nodeComponents) {
            let fieldset: ƒui.FoldableFieldSet = ƒui.Generator.createFieldSetFromMutable(nodeComponent);
            let uiComponent: ComponentUI = new ComponentUI(nodeComponent, fieldset);
            this.content.append(uiComponent.domElement);
          }
        }

      }
      else {  
        let cntEmpty: HTMLDivElement = document.createElement("div");
        this.content.append(cntEmpty);
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
      while (this.content.firstChild != null) {
        this.content.removeChild(this.content.lastChild);
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