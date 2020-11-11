namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;
  import ƒaid = FudgeAid;


  export class ViewObjectProperties extends View {
    private currentNode: ƒ.Node;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      // this.contextMenu = this.getContextMenu(this.contextMenuCallback);

      this.setObject((<ƒ.Node>(<ƒ.General>_state).node).getChildrenByName("Default")[0]);
      this.fillContent();
      // this.parentPanel.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.setSelectedNode);
      // this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
    }


    protected setObject(_object: ƒ.Node): void {
      if (!_object) 
        return;
      
      this.currentNode = _object;
    }

    private fillContent(): void {
      this.setTitle(this.currentNode.name);

      let fieldset: ƒui.FoldableFieldSet = ƒui.Generator.createFieldSetFromMutable(this.currentNode.cmpTransform);
      let uiComponent: ControllerComponent = new ControllerComponent(this.currentNode.cmpTransform, fieldset);
      this.dom.append(uiComponent.domElement);
    }

    // protected update = () => {

    // }


    protected cleanup(): void {
      throw new Error("Method not implemented.");
    }
    
  }
}