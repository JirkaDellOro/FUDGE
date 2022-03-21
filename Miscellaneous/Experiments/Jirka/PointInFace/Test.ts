namespace PointInFace {
  import ƒ = FudgeCore;

  window.addEventListener("load", start);
  let crc2: CanvasRenderingContext2D;
  let vertices: ƒ.Vertices;
  let face: ƒ.Face;
  let terrain: ƒ.MeshTerrain;

  function start(_event: Event): void {
    vertices = new ƒ.Vertices(
      new ƒ.Vertex(new ƒ.Vector3(0, 100, 0)),
      new ƒ.Vertex(new ƒ.Vector3(-100, -100, 0)),
      new ƒ.Vertex(new ƒ.Vector3(100, -100, 0))
    );

    face = new ƒ.Face(vertices, 0, 1, 2);

    terrain = new ƒ.MeshTerrain("Test", new ƒ.Vector2(3, 3)); //, new ƒ.Vector2(1, 1), (_x: number, _y: number) => 0); //
    console.log(terrain);


    let canvas: HTMLCanvasElement = document.querySelector("canvas")!;
    crc2 = canvas.getContext("2d")!;

    // canvas.addEventListener("mousemove", hndMouseFace);
    canvas.addEventListener("mousemove", hndMouseTerrain);
  }
  function hndMouseTerrain(_event: MouseEvent): void {
    let scale: number = 300;
    let mouse: ƒ.Vector3 = new ƒ.Vector3(_event.offsetX, 0, _event.offsetY);
    let dim: ƒ.Vector3 = new ƒ.Vector3(crc2.canvas.width, 0, crc2.canvas.height);

    crc2.resetTransform();
    crc2.clearRect(0, 0, dim.x, dim.z);
    dim.scale(0.5);
    crc2.translate(dim.x, dim.z);
    mouse.subtract(dim);

    crc2.beginPath();

    for (let face of <ƒ.Face[]>Reflect.get(terrain, "faces")) {
      crc2.moveTo(face.getPosition(2).x * scale, face.getPosition(2).z * scale);
      for (let i: number = 0; i < 3; i++) {
        let position: ƒ.Vector3 = face.getPosition(i);
        let height: string = position.y.toFixed(2);
        position = ƒ.Vector3.SCALE(position, scale);
        crc2.lineTo(position.x, position.z);
        crc2.strokeText(height, position.x, position.z);
      }
    }

    crc2.moveTo(mouse.x, mouse.z);
    crc2.arc(mouse.x, mouse.z, 2, 0, 2 * Math.PI);
    crc2.stroke();
    mouse.scale(1 / scale);
    let info: ƒ.TerrainInfo = terrain.getTerrainInfo(mouse);
    console.log(info.positionFace.toString(), info.index);

    // let ray: ƒ.Ray = new ƒ.Ray(ƒ.Vector3.Z(), mouse);
    // let point: ƒ.Vector3 = ray.intersectFacePlane(face);
    // let inside: boolean = face.isInside(point);
    // console.log(inside ? "In" : "Out");
  }

  function hndMouseFace(_event: MouseEvent): void {
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