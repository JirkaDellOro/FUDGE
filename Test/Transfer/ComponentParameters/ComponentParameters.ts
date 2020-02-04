namespace ComponentParameters {
  import ƒ = FudgeCore;
  window.addEventListener("DOMContentLoaded", init);

  function init(): void {
    let img: HTMLImageElement = document.querySelector("img");
    let txtImage: ƒ.TextureImage = new ƒ.TextureImage();
    txtImage.image = img;
    let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
    coatTextured.texture = txtImage;
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

      root.appendChild(quad);
    }

    ƒ.RenderManager.initialize(true, true);
    ƒ.RenderManager.update();

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translateZ(3);
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    viewport.initialize("Viewport", root, cmpCamera, document.querySelector("canvas"));
    viewport.draw();


    ƒ.Loop.start();
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, (_event: ƒ.Eventƒ) => {
      coatTextured.pivot.rotate(0.1);
      coatTextured.pivot.translateX(0.01);
      let s: number = 1.5 + Math.sin(coatTextured.pivot.translation.x);
      coatTextured.pivot.scaling = ƒ.Vector2.ONE(s);
      viewport.draw();
      // let mutator: ƒ.Mutator = cmpMaterial.mutatorCoat;
      // mutator.rotation = (<number>mutator.rotation) + 0.1;
      // mutator.translation["x"] += 0.01;
      // let s: number = 1.5 + Math.sin(mutator.translation["x"]);
      // mutator.scaling = { x: s, y: s };
      // coatTextured.mutate(<ƒ.MutatorForComponent>mutator);
      // viewport.draw();
    });
  }
}