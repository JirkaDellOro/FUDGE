namespace RectangleCollision {
  import ƒ = FudgeCore;

  window.addEventListener("load", handleLoad);

  function handleLoad(_event: Event): void {
    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    let crc2: CanvasRenderingContext2D = canvas.getContext("2d");

    // crc2.translate(canvas.width / 2, canvas.height / 2);
    let rect0: ƒ.Rectangle = new ƒ.Rectangle(0, 0, 150, 100, ƒ.ORIGIN2D.CENTER);
    let rect1: ƒ.Rectangle = new ƒ.Rectangle(0, 0, 100, 150, ƒ.ORIGIN2D.CENTER);
    rect0.position.x = canvas.width / 2 - rect0.size.x / 2;
    rect0.position.y = canvas.height / 2 - rect0.size.y / 2;

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", null, null, canvas);
    viewport.addEventListener(ƒ.EVENT_POINTER.MOVE, update);
    viewport.activatePointerEvent(ƒ.EVENT_POINTER.MOVE, true);

    function update(_event: ƒ.EventPointer): void {
      crc2.clearRect(0, 0, canvas.width, canvas.height);
      let pointer: ƒ.Vector2 = new ƒ.Vector2(_event.pointerX, _event.pointerY);
      rect1.position = pointer;
      rect1.position.subtract(ƒ.Vector2.SCALE(rect1.size, 0.5));

      let intersection: ƒ.Rectangle = rect1.getIntersection(rect0);
      crc2.fillStyle = intersection ? "blue" : "white";
      crc2.strokeRect(rect0.position.x, rect0.position.y, rect0.size.x, rect0.size.y);
      crc2.fillRect(rect0.position.x, rect0.position.y, rect0.size.x, rect0.size.y);
      crc2.strokeRect(rect1.position.x, rect1.position.y, rect1.size.x, rect1.size.y);

      if (intersection) {
        crc2.fillStyle = "red";
        crc2.fillRect(intersection.position.x, intersection.position.y, intersection.size.x, intersection.size.y);
      }
    }
  }
}