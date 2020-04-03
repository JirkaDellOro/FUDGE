namespace Minimal {
  import ƒ = FudgeCore;
  

  window.addEventListener("load", hndLoad);

  function hndLoad(_event: Event): void {
    const canvas: HTMLCanvasElement = document.querySelector("canvas");

    let viewport: ƒ.Viewport = new ƒ.Viewport();

    let mesh: ƒ.MeshQuad = new ƒ.MeshQuad();
    let mtrSolidWhite: ƒ.Material = new ƒ.Material("SolidWhite", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("WHITE")));

    let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
    let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mtrSolidWhite);
    let node: ƒ.Node = new ƒ.Node("Quad");
    node.addComponent(cmpMesh);
    node.addComponent(cmpMaterial);


    let camera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    camera.pivot.translate(new ƒ.Vector3(0, 0, 2));

    viewport.initialize("Viewport", node, camera, canvas);

    viewport.draw();
  }
}