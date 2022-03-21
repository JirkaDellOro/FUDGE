///<reference path="../../../Core/Build/FudgeCore.d.ts"/>
namespace TextureAnimate {
  import ƒ = FudgeCore;
  ƒ.Render.initialize(true, true);

  window.addEventListener("DOMContentLoaded", init);

  function init(): void {
    let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
    let material: ƒ.Material = new ƒ.Material("Material", ƒ.ShaderTexture, coatTextured);

    let root: ƒ.Node = new ƒ.Node("Root");

    for (let i: number = 0; i < 3; i++) {
      let mesh: ƒ.MeshQuad = new ƒ.MeshQuad();
      let quad: ƒ.Node = new ƒ.Node("Quad" + i);
      let cmpMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
      let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(material);
      cmpMesh.pivot.translateX(0.2 * (i - 1));
      cmpMesh.pivot.translateZ(-i / 10);
      cmpMesh.pivot.rotateZ(i * 10);
      quad.addComponent(cmpMesh);
      quad.addComponent(cmpMaterial);

      root.addChild(quad);
    }

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translateZ(3);
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    viewport.initialize("Viewport", root, cmpCamera, document.querySelector("canvas"));
    viewport.draw();


    ƒ.Loop.start();
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, (_event: ƒ.Eventƒ) => {
      for (let node of root.getChildren()) {
        let cmpMaterial: ƒ.ComponentMaterial = node.getComponent(ƒ.ComponentMaterial);
        cmpMaterial.pivot.rotate(0.1);
        cmpMaterial.pivot.translateX(0.01);
        let s: number = 1.5 + Math.sin(cmpMaterial.pivot.translation.x);
        cmpMaterial.pivot.scaling = ƒ.Vector2.ONE(s);
        viewport.draw();
      }
    });
  }
}