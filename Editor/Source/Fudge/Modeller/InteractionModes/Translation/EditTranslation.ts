namespace Fudge {
  import ƒAid = FudgeAid;
  export class EditTranslation extends AbstractTranslation {
    selection: Array<number>;
    private copyOfSelectedVertices: Record<number, ƒ.Vector3> = {};

    initialize(): void {
      this.createNormalArrows();
    }

    createNormalArrows(): void {
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
        let vector = ƒ.Vector3.SUM(vertex, normal);
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
        // normalArrow.addComponent(new ƒ.ComponentTransform())
        //this.viewport.draw();
      }
    }

    onmousedown(_event: ƒ.EventPointer): void {
      if (!this.selection) 
        return;
      this.dragging = true;
      this.distance = ƒ.Vector3.DIFFERENCE(this.editableNode.mtxLocal.translation, this.viewport.camera.pivot.translation).magnitude;
      this.copyOfSelectedVertices = {};
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      let vertices: UniqueVertex[] = mesh.uniqueVertices;
      for (let vertexIndex of this.selection) {
        this.copyOfSelectedVertices[vertexIndex] = new ƒ.Vector3(vertices[vertexIndex].position.x, vertices[vertexIndex].position.y, vertices[vertexIndex].position.z);
      }
    }

    onmouseup(_event: ƒ.EventPointer): void {
      this.dragging = false;
      this.createNormalArrows();
    }

    onmove(_event: ƒ.EventPointer): void {
      console.log("vertices: " + this.selection);
      if (!this.dragging) 
        return;
      
      let ray: ƒ.Ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));
      let newPos: ƒ.Vector3 = ƒ.Vector3.SUM(ray.origin, ƒ.Vector3.SCALE(ray.direction, this.distance));
      let mesh: ModifiableMesh = <ModifiableMesh> this.editableNode.getComponent(ƒ.ComponentMesh).mesh;
      let diff: ƒ.Vector3 = ƒ.Vector3.DIFFERENCE(newPos, this.editableNode.mtxLocal.translation);
      // console.log("newPos: " + newPos + " | trans: " + this.editableNode.mtxLocal.translation);
      mesh.updatePositionOfVertices(this.selection, diff, this.copyOfSelectedVertices);
      //this.createNormalArrows();
      // for (let selection of this.selection) {
      //   let currentVertex: ƒ.Vector3 = this.copyOfSelectedVertices[selection];
      //   mesh.updatePositionOfVertex(selection, new ƒ.Vector3(currentVertex.x + diff.x, currentVertex.y + diff.y, currentVertex.z + diff.z));
      //   // verts[selection] = currentVertex.x + diff.x;
      //   // verts[selection + 1] = currentVertex.y + diff.y;
      //   // verts[selection + 2] = currentVertex.z + diff.z; 
      // }
      // mesh.vertices = verts;
    }
  }
}