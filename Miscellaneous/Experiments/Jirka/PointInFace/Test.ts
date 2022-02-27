namespace PointInFace {
  import ƒ = FudgeCore;

  window.addEventListener("load", start);
  let crc2: CanvasRenderingContext2D;
  let vertices: ƒ.Vertices;
  let face: ƒ.Face;

  function start(_event: Event): void {
    vertices = new ƒ.Vertices(
      new ƒ.Vertex(new ƒ.Vector3(0, 100, 1000)),
      new ƒ.Vertex(new ƒ.Vector3(-100, -100, -1000)),
      new ƒ.Vertex(new ƒ.Vector3(100, -100, 0))
    );

    face = new ƒ.Face(vertices, 0, 1, 2);
    console.log(face.normal.toString());
    let canvas: HTMLCanvasElement = document.querySelector("canvas")!;
    crc2 = canvas.getContext("2d")!;

    canvas.addEventListener("mousemove", hndMouse);
  }
  function hndMouse(_event: MouseEvent): void {
    let mouse: ƒ.Vector3 = new ƒ.Vector3(_event.offsetX, _event.offsetY, 0);
    let dim: ƒ.Vector2 = new ƒ.Vector2(crc2.canvas.width, crc2.canvas.height);

    crc2.resetTransform();
    crc2.clearRect(0, 0, dim.x, dim.y);
    dim.scale(0.5);
    crc2.translate(dim.x, dim.y);
    crc2.scale(1, -1);
    mouse.subtract(dim.toVector3());
    mouse.y *= -1;

    crc2.beginPath();
    crc2.moveTo(vertices[2].position.x, vertices[2].position.y);
    for (let vertex of vertices) {
      crc2.lineTo(vertex.position.x, vertex.position.y);
      crc2.lineTo(mouse.x, mouse.y);
      crc2.lineTo(vertex.position.x, vertex.position.y);
    }

    crc2.moveTo(mouse.x, mouse.y);
    crc2.arc(mouse.x, mouse.y, 2, 0, 2 * Math.PI);
    crc2.stroke();

    let ray: ƒ.Ray = new ƒ.Ray(ƒ.Vector3.Z(), mouse);
    let point: ƒ.Vector3 = ray.intersectFacePlane(face);
    let inside: boolean = face.isInside(point);
    console.log(inside ? "In" : "Out");
  }
}