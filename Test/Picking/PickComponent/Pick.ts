namespace PickRadius {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  document.addEventListener("interactiveViewportStarted", start);

  function start(_event: CustomEvent): void {
    let viewport: ƒ.Viewport = _event.detail;
    let root: ƒ.Node = viewport.getBranch();
    let zoo: ƒ.Node = root.getChildrenByName("Zoo")[0];
    let radii: ƒ.Node = new ƒ.Node("Radii");
    root.replaceChild(zoo, radii);
    root.appendChild(zoo);

    root.addEventListener("mousemove", hit);

    let meshShpere: ƒ.MeshSphere = new ƒ.MeshSphere("BoundingSphere", 40, 40);
    let material: ƒ.Material = new ƒ.Material("Transparent", ƒ.ShaderLit, new ƒ.CoatColored(ƒ.Color.CSS("white", 0.5)));

    for (let child of zoo.getChildren()) {
      let sphere: ƒ.Node = new ƒAid.Node(
        "BoundingSphere", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2)), material, meshShpere
      );
      sphere.mtxLocal.scale(ƒ.Vector3.ONE(child.radius));

      let cmpMesh: ƒ.ComponentMesh = child.getComponent(ƒ.ComponentMesh);
      sphere.mtxLocal.translation = cmpMesh.mtxWorld.translation;
      sphere.getComponent(ƒ.ComponentMaterial).sortForAlpha = true;
      radii.appendChild(sphere);

    }

    let sphere: ƒ.Node = new ƒAid.Node(
      "BoundingSphere", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2)), material, meshShpere
    );
    sphere.mtxLocal.scale(ƒ.Vector3.ONE(zoo.radius));
    sphere.getComponent(ƒ.ComponentMaterial).sortForAlpha = true;
    // radii.appendChild(sphere);

    ƒ.Debug.branch(root);

    viewport.canvas.addEventListener("mousemove", pick);

    function pick(_event: PointerEvent): void {
      document.querySelector("div").innerHTML = "";
      viewport.draw();
      viewport.dispatchPointerEvent(_event);
    }

    function hit(_event: PointerEvent): void {
      let node: ƒ.Node = (<ƒ.Node>_event.target);
      let cmpPick: ƒ.ComponentPick = node.getComponent(ƒ.ComponentPick);

      document.querySelector("div").innerHTML += cmpPick.pick + ":" + node.name + "<br/>";
    }
  }
}