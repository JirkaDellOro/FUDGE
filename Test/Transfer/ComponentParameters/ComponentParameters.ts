namespace ComponentParameters {
  import ƒ = FudgeCore;
  window.addEventListener("DOMContentLoaded", init);

  function init(): void {
    let img: HTMLImageElement = document.querySelector("img");
    let txtImage: ƒ.TextureImage = new ƒ.TextureImage();
    txtImage.image = img;
    let coatTextured: ƒ.CoatTextured = new ƒ.CoatTextured();
    coatTextured.texture = txtImage;
    let cmpMaterial: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(
      new ƒ.Material("Material", ƒ.ShaderTexture, coatTextured)
    );

    let quad: ƒ.Node = new ƒ.Node("Quad");
    quad.addComponent(new ƒ.ComponentMesh(new ƒ.MeshQuad()));
    quad.addComponent(cmpMaterial);

    ƒ.RenderManager.initialize();
    ƒ.RenderManager.update();

    let viewport: ƒ.Viewport = new ƒ.Viewport();
    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    cmpCamera.pivot.translateZ(2);
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    viewport.initialize("Viewport", quad, cmpCamera, document.querySelector("canvas"));
    viewport.draw();

    let mutator: ƒ.Mutator = cmpMaterial.getMutatorForUserInterface();
    ƒ.Debug.log(mutator);
    mutator = cmpMaterial.mutatorCoat;
    ƒ.Debug.log(mutator);

    ƒ.Loop.start();
    ƒ.Loop.addEventListener(ƒ.EVENT.LOOP_FRAME, (_event: ƒ.Eventƒ) => {
      mutator.rotation = (<number>mutator.rotation) + 0.1;
      mutator.translation["x"] += 0.01;
      let s: number = 1.5 + Math.sin(mutator.translation["x"]);
      mutator.scaling = {x: s, y: s};
      coatTextured.mutate(<ƒ.MutatorForComponent>mutator);
      viewport.draw();
    });
  }
}