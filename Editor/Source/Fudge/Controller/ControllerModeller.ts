namespace Fudge {
  import ƒ = FudgeCore;

  export class ControllerModeller {
    viewport: ƒ.Viewport;

    constructor (viewport: ƒ.Viewport) {
      this.viewport = viewport;

      this.viewport.adjustingFrames = true;

      this.viewport.addEventListener(ƒ.EVENT_POINTER.DOWN, this.onclick);
      this.viewport.activatePointerEvent(ƒ.EVENT_POINTER.DOWN, true);
      console.log("controller called");
    }

    private onclick = (_event: ƒ.EventPointer) => {
      this.viewport.createPickBuffers();
      let mousePos: ƒ.Vector2 = new ƒ.Vector2(_event.canvasX, _event.canvasY);
      // console.log(_event);
      let posRender: ƒ.Vector2 = this.viewport.pointClientToRender(new ƒ.Vector2(mousePos.x, this.viewport.getClientRectangle().height - mousePos.y));
  
      //this.viewport.getRayFromClient(mousePos);
      let hits: ƒ.RayHit[] = this.viewport.pickNodeAt(posRender);
      for (let hit of hits) {
        if (hit.zBuffer != 0) 
          console.log(hit);
      }
      this.viewport.draw();
    }
  }
}