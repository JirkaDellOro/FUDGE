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

      this.fillContent();
      ƒ.EventTargetStatic.addEventListener(MODELLER_EVENTS.SELECTION_UPDATE, this.hndEvent);
      _container.on("destroy", this.cleanup);
      // this.dom.addEventListener(ƒui.EVENT.SELECT, this.hndEvent);
      // this.parentPanel.addEventListener(ƒui.EVENT_USERINTERFACE.SELECT, this.setSelectedNode);
      // this.dom.addEventListener(EVENT_EDITOR.SET_GRAPH, this.hndEvent);
    }


    protected setObject(_object: ƒ.Node): void {
      if (!_object) 
        return;
      
      this.currentNode = _object;
    }

    private fillContent(selection: number[] = Array.from(Array((<ModifiableMesh> this.currentNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices.length).keys())): void {
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));

      // let fieldset: ƒui.ExpandableFieldSet = ƒui.Generator.createFieldSetFromMutable((<ModifiableMesh> this.currentNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices[0], "0");
      // let uiComponent: ControllerComponent = new ControllerComponent((<ModifiableMesh> this.currentNode.getComponent(ƒ.ComponentMesh).mesh).uniqueVertices[0], fieldset);

      // TODO see if we can make this work without a new fieldset for every vertex
      let mesh: ModifiableMesh = (<ModifiableMesh> this.currentNode.getComponent(ƒ.ComponentMesh).mesh);
      for (let selectedVertex of selection) {
        let fieldset: ƒui.ExpandableFieldSet = ƒui.Generator.createFieldSetFromMutable(mesh.uniqueVertices[selectedVertex], selectedVertex.toString());
        let uiComponent: ControllerVertices = new ControllerVertices(mesh.uniqueVertices[selectedVertex], fieldset);
        uiComponent.node = this.currentNode;
  
        this.dom.append(uiComponent.domElement);
      }
    }

    // protected update = () => {

    // }


    protected cleanup = (): void => {
      while (this.dom.lastChild && this.dom.removeChild(this.dom.lastChild));
        this.dom.remove();
    }

    private hndEvent = (_event: CustomEvent): void => {
      this.fillContent(_event.detail);
    }
    
  }
}