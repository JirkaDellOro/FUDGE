namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;


  export class ViewObjectProperties extends View {
    private currentNode: ƒ.Node;

    constructor(_container: GoldenLayout.Container, _state: Object) {
      super(_container, _state);
      // this.contextMenu = this.getContextMenu(this.contextMenuCallback);

      this.setObject((<ƒ.Node>(<ƒ.General>_state).node).getChildrenByName("Default")[0]);
      this.setTitle("Vertices");

      this.fillContent(((<ModifiableMesh> this.currentNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices));
      ƒ.EventTargetStatic.addEventListener(MODELLER_EVENTS.SELECTION_UPDATE, this.hndEvent);
      _container.on("destroy", this.cleanup);
    }


    protected setObject(_object: ƒ.Node): void {
      if (!_object) 
        return;
      
      this.currentNode = _object;
    }

    private fillContent(_vertices: UniqueVertex[], selection: number[] = Array.from(Array(_vertices.length).keys())): void {
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));

      // TODO see if we can make this work without a new fieldset for every vertex
      for (let selectedVertex of selection) {
        // TODO check if this really works
        let fieldset: ƒui.Details = ƒui.Generator.createDetailsFromMutable(_vertices[selectedVertex], selectedVertex.toString());
//        let fieldset: ƒui.ExpandableFieldSet = ƒui.Generator.createFieldSetFromMutable(_vertices[selectedVertex], selectedVertex.toString());
        let uiComponent: ControllerVertices = new ControllerVertices(_vertices[selectedVertex], fieldset);
        uiComponent.node = this.currentNode;
  
        this.dom.append(uiComponent.domElement);
      }
    }
    
    protected cleanup = (): void => {
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));
        this.dom.remove();
    }

    private hndEvent = (_event: CustomEvent): void => {
      this.fillContent(_event.detail.vertices, _event.detail.selection);
    }
    
  }
}