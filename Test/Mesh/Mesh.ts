namespace Mesh {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;

  window.addEventListener("load", init);

  async function init(): Promise<void> {
    let graph: ƒ.Node = new ƒ.Node("Graph");

    // setup the viewport
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.clrBackground = ƒ.Color.CSS("HSL(240, 20%, 50%)");

    let canvas: HTMLCanvasElement = document.querySelector("canvas");
    let viewport: ƒ.Viewport = new ƒ.Viewport();
    viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
    let camera: ƒAid.CameraOrbit = ƒAid.Viewport.expandCameraToInteractiveOrbit(viewport);
    camera.distance = 20;
    ƒ.Render.prepare(camera);

    const nodes: ƒAid.Node = new ƒAid.Node("nodes", ƒ.Matrix4x4.IDENTITY());
    let material: ƒ.Material = new ƒ.Material("texture", ƒ.ShaderLitTextured, new ƒ.CoatTextured());

    let subclass: typeof ƒ.Mesh[] = ƒ.Mesh.subclasses;
    for (let i: number = 0; i < subclass.length; i++) {
      console.log(subclass[i].name);
      let node: ƒ.Node = new ƒ.Node(subclass[i].name.replace("Mesh", ""));

      let mesh: ƒ.Mesh;
      switch (subclass[i].name) {
        case ƒ.MeshOBJ.name:
          mesh = await new ƒ.MeshOBJ("Icosphere").load("Icosphere.obj");
          break;
        default:
          //@ts-ignore
          mesh = new subclass[i]();
          break;
      }

      let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
      let math: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(material);
      node.addComponent(new ƒ.ComponentTransform());
      node.mtxLocal.translateX(i * 2.5 - 10);
      node.addComponent(cmpMesh);
      node.addComponent(math);

      nodes.addChild(node);
    }
    graph.addChild(nodes);

    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, update);
    ƒ.Loop.start();

    function update(_event: Event): void {
      viewport.draw();
    }
  }
}