namespace Fudge {
  import ƒAid = FudgeAid;
  export abstract class AbstractTranslation extends IInteractionMode {
    public readonly type: InteractionMode = InteractionMode.TRANSLATE;
    viewport: ƒ.Viewport;
    selection: Array<number>;
    editableNode: ƒ.Node;
    protected pickedArrow: string;
    protected dragging: boolean = false;
    protected distance: number;
    protected widget: ƒ.Node;
    protected offset: ƒ.Vector3;
    protected copyOfSelectedVertices: Map<number, ƒ.Vector3>;


    // constructor(viewport: ƒ.Viewport, editableNode: ƒ.Node) {
    //   super(viewport, editableNode);
    // }

    initialize(): void {
      let widget: ƒ.Node = new ƒAid.NodeCoordinateSystem("TranslateWidget");
      let mtx: ƒ.Matrix4x4 = new ƒ.Matrix4x4();
      mtx.translation = this.editableNode.mtxLocal.translation;
      mtx.rotation = this.editableNode.mtxLocal.rotation;
      widget.addComponent(new ƒ.ComponentTransform(mtx));
      this.viewport.getGraph().addChild(widget);
      this.widget = widget;
    }

    abstract onmousedown(_event: ƒ.EventPointer): string;

    onmouseup(_event: ƒ.EventPointer): void {
      this.dragging = false;
      this.pickedArrow = null;
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      mesh.updateNormals();
      this.widget.mtxLocal.translation = (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).getCentroid(this.selection);
      // this.createNormalArrows();
      //console.log(mesh.getCentroid());
    }
    // abstract onclick(_event: ƒ.EventPointer): void;
    abstract onmove(_event: ƒ.EventPointer): void;

    protected copyVerticesAndCalculateDistance(_event: ƒ.EventPointer): void {
      this.dragging = true;
      this.distance = ƒ.Vector3.DIFFERENCE(this.editableNode.mtxLocal.translation, this.viewport.camera.pivot.translation).magnitude;
      this.offset = this.getDistanceFromRayToCenterOfNode(_event, this.distance);
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      let vertices: UniqueVertex[] = mesh.uniqueVertices;
      this.copyOfSelectedVertices = new Map();
      for (let vertexIndex of Array.from(Array(mesh.uniqueVertices.length).keys())) {
        this.copyOfSelectedVertices.set(vertexIndex, new ƒ.Vector3(vertices[vertexIndex].position.x, vertices[vertexIndex].position.y, vertices[vertexIndex].position.z));
      }
    }

    protected updateVertices(_event: ƒ.EventPointer): void {
      (<ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh).updatePositionOfVertices(this.selection, this.copyOfSelectedVertices, this.getDistanceFromRayToCenterOfNode(_event, this.distance), this.offset);
    }


    cleanup(): void {
      this.viewport.getGraph().removeChild(this.widget);
    }

  }
}