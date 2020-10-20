namespace Fudge {
  export class ObjectTranslation extends AbstractTranslation {
    onmouseup(_event: ƒ.EventPointer): void {
      this.dragging = false;
    }

    onmousedown(_event: ƒ.EventPointer): void {
      this.viewport.createPickBuffers();
      let mousePos: ƒ.Vector2 = new ƒ.Vector2(_event.canvasX, _event.canvasY);
      let posRender: ƒ.Vector2 = this.viewport.pointClientToRender(new ƒ.Vector2(mousePos.x, this.viewport.getClientRectangle().height - mousePos.y));
      let hits: ƒ.RayHit[] = this.viewport.pickNodeAt(posRender);
      for (let hit of hits) {
        if (hit.zBuffer != 0 && hit.node == this.editableNode) 
          this.dragging = true;
      } 

      this.distance = ƒ.Vector3.DIFFERENCE(this.editableNode.mtxLocal.translation, this.viewport.camera.pivot.translation).magnitude;  //
    }

    onmove(_event: ƒ.EventPointer): void {
      if (this.dragging) {
        let ray: ƒ.Ray = this.viewport.getRayFromClient(new ƒ.Vector2(_event.canvasX, _event.canvasY));
        this.editableNode.mtxLocal.translation = ƒ.Vector3.SUM(ray.origin, ƒ.Vector3.SCALE(ray.direction, this.distance));
      }
    }
  }
}