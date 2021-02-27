///<reference types="../../../../Core/Build/FudgeCore.js"/>
import ƒ = FudgeCore;

namespace Importer_Tests {
  export let viewport: ƒ.Viewport;
  window.addEventListener("load", load);

  async function load(_event: Event): Promise<void> {
    const canvas: HTMLCanvasElement = document.querySelector("canvas");
    let graph: ƒ.Node = new ƒ.Node("Graph");
  
    let mesh: ƒ.MeshCustom = new ƒ.MeshCustom();
    await mesh.load("mesh.json");
    let cube: ƒ.MeshCube = new ƒ.MeshCube();

    //await new Promise(r => setTimeout(r, 2000));

    let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();

    cmpCamera.pivot.translate(new ƒ.Vector3(10, 6, 3));
    cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
    cmpCamera.projectCentral(1, 45);
    let mtr: ƒ.Material = new ƒ.Material("Material", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("green")));
    let mtrCmp: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mtr);

    let compMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
    //let cmpRigidbody: ƒ.ComponentRigidbody = new ƒ.ComponentRigidbody(1, ƒ.PHYSICS_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.CUBE, ƒ.PHYSICS_GROUP.DEFAULT);
    graph.addComponent(mtrCmp);
    graph.addComponent(compMesh);
    graph.addComponent(new ƒ.ComponentTransform());
    viewport = new ƒ.Viewport();
    viewport.initialize("Viewport", graph, cmpCamera, canvas);
    // ƒ.Physics.start(graph);
    // ƒ.Physics.world.simulate();
    viewport.draw();
  }
}
