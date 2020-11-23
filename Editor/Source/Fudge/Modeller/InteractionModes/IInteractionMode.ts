namespace Fudge {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  export abstract class IInteractionMode {
    type: InteractionMode;
    selection: Object;
    viewport: ƒ.Viewport;
    editableNode: ƒ.Node;

    constructor (viewport: ƒ.Viewport, editableNode: ƒ.Node) {
      this.viewport = viewport;
      this.editableNode = editableNode;
      this.initialize();
    }

    abstract onmousedown(_event: ƒ.EventPointer): void;
    abstract onmouseup(_event: ƒ.EventPointer): void;
    // onclick(_event: ƒ.EventPointer): void;
    abstract onmove(_event: ƒ.EventPointer): void;
    abstract initialize(): void;
    abstract cleanup(): void;

    protected getPosRenderFrom(_event: ƒ.EventPointer): ƒ.Vector2 {
      let mousePos: ƒ.Vector2 = new ƒ.Vector2(_event.canvasX, _event.canvasY);
      return this.viewport.pointClientToRender(new ƒ.Vector2(mousePos.x, this.viewport.getClientRectangle().height - mousePos.y));
    }


    protected createNormalArrows(): void {
      for (let node of this.viewport.getGraph().getChildrenByName("normal")) {
        this.viewport.getGraph().removeChild(node);
      }
      let mesh: ƒ.Mesh = this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      for (let i: number = 0; i < mesh.vertices.length; i += 3) {
        let vertex: ƒ.Vector3 = new ƒ.Vector3(mesh.vertices[i], mesh.vertices[i + 1], mesh.vertices[i + 2]);
        let normal: ƒ.Vector3 = new ƒ.Vector3(mesh.normalsFace[i], mesh.normalsFace[i + 1], mesh.normalsFace[i + 2]);
        let normalArrow: ƒ.Node = new ƒAid.Node("normal", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("NormalMtr", ƒ.ShaderFlat));
        let shaft: ƒ.Node = new ƒAid.Node("Shaft", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("NormalMtr", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("yellow"))), new ƒ.MeshCube());
        let head: ƒ.Node = new ƒAid.Node("Head", ƒ.Matrix4x4.IDENTITY(), new ƒ.Material("NormalMtr", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("yellow"))), new ƒ.MeshPyramid());
        shaft.mtxLocal.scale(new ƒ.Vector3(0.01, 0.01, 1));
        head.mtxLocal.translateZ(0.5);
        head.mtxLocal.rotateX(90);
        head.mtxLocal.scale(new ƒ.Vector3(0.05, 0.05, 0.1));
  
        shaft.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("yellow");
        head.getComponent(ƒ.ComponentMaterial).clrPrimary = ƒ.Color.CSS("yellow");
  
        normalArrow.addChild(shaft);
        normalArrow.addChild(head);
        normalArrow.mtxLocal.translation = vertex;
        let vector: ƒ.Vector3 = ƒ.Vector3.SUM(vertex, normal);
        try {
          normalArrow.mtxLocal.lookAt(vector);
        } catch {
          if (normal.y > 0) {
            normalArrow.mtxLocal.rotateX(-90);
          } else {
            normalArrow.mtxLocal.rotateX(90);
          }
        }
        this.viewport.getGraph().addChild(normalArrow);
      }
    }

    protected translateVertices(_event: ƒ.EventPointer, distance: number): ƒ.Vector3 {
      let ray: ƒ.Ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));
      let newPos: ƒ.Vector3 = ƒ.Vector3.SUM(ray.origin, ƒ.Vector3.SCALE(ray.direction, distance));
      let diff: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(newPos, this.editableNode.mtxLocal.translation);
      return diff;
    }

  }
}