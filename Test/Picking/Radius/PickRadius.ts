namespace PickRadius {
  import ƒ = FudgeCore;
  import ƒAid = FudgeAid;
  document.addEventListener("interactiveViewportStarted", start);

  function start(_event: CustomEvent): void {
    let viewport: ƒ.Viewport = _event.detail;
    let root: ƒ.Node = viewport.getBranch();
    let zoo: ƒ.Node = root.getChildrenByName("Zoo")[0];

    let meshShpere: ƒ.MeshSphere = new ƒ.MeshSphere("BoundingSphere", 40, 40);
    let material: ƒ.Material = new ƒ.Material("Transparent", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white", 0.5)));

    for (let child of zoo.getChildren()) {
      if (child.nChildren)
        continue;

      ƒ.Debug.fudge(child.radius);
      let sphere: ƒ.Node = new ƒAid.Node(
        "BoundingSphere", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2)), material, meshShpere
      );
      sphere.mtxLocal.scale(ƒ.Vector3.ONE(child.radius));

      let cmpMesh: ƒ.ComponentMesh = child.getComponent(ƒ.ComponentMesh);
      sphere.mtxLocal.translation = cmpMesh.mtxWorld.translation;
      root.appendChild(sphere);
    }

    let sphere: ƒ.Node = new ƒAid.Node(
      "BoundingSphere", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2)), material, meshShpere
    );
    sphere.mtxLocal.scale(ƒ.Vector3.ONE(zoo.radius));
    root.appendChild(sphere);


    ƒ.Debug.branch(root);
  }
}