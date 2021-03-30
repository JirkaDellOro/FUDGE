"use strict";
///<reference types="../../../../Core/Build/FudgeCore.js"/>
///<reference types="../../../../Aid/Build/FudgeAid.js"/>
var Importer_Tests;
///<reference types="../../../../Core/Build/FudgeCore.js"/>
///<reference types="../../../../Aid/Build/FudgeAid.js"/>
(function (Importer_Tests) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", load);
    // async function load(_event: Event): Promise<void> {
    //   const canvas: HTMLCanvasElement = document.querySelector("canvas");
    //   let graph: ƒ.Node = new ƒ.Node("Graph");
    //   let mesh: ƒ.MeshCustom = new ƒ.MeshCustom();
    //   await mesh.load("mesh.json");
    //   let cube: ƒ.MeshCube = new ƒ.MeshCube();
    //   //await new Promise(r => setTimeout(r, 2000));
    //   let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
    //   cmpCamera.mtxPivot.translate(new ƒ.Vector3(10, 6, 3));
    //   cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO());
    //   cmpCamera.projectCentral(1, 45);
    //   let mtr: ƒ.Material = new ƒ.Material("Material", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("green")));
    //   let mtrCmp: ƒ.ComponentMaterial = new ƒ.ComponentMaterial(mtr);
    //   let compMesh: ƒ.ComponentMesh = new ƒ.ComponentMesh(mesh);
    //   //let cmpRigidbody: ƒ.ComponentRigidbody = new ƒ.ComponentRigidbody(1, ƒ.PHYSICS_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.CUBE, ƒ.PHYSICS_GROUP.DEFAULT);
    //   graph.addComponent(mtrCmp);
    //   graph.addComponent(compMesh);
    //   graph.addComponent(new ƒ.ComponentTransform());
    //   viewport = new ƒ.Viewport();
    //   viewport.initialize("Viewport", graph, cmpCamera, canvas);
    //   // ƒ.Physics.start(graph);
    //   // ƒ.Physics.world.simulate();
    //   viewport.draw();
    // }
    function load() {
        const canvas = document.querySelector("canvas");
        let graph = new ƒ.Node("Graph");
        let cylinder = new ƒ.MeshCylinder("MeshCylinder", 10);
        let cmpCamera = new ƒ.ComponentCamera();
        cmpCamera.mtxPivot.translate(new ƒ.Vector3(10, 0, -5));
        cmpCamera.mtxPivot.lookAt(ƒ.Vector3.ZERO());
        cmpCamera.projectCentral(1, 45);
        ƒAid.addStandardLightComponents(graph, new ƒ.Color(0.5, 0.5, 0.5));
        let mtr = new ƒ.Material("Material", ƒ.ShaderFlat, new ƒ.CoatColored(ƒ.Color.CSS("green")));
        let mtrCmp = new ƒ.ComponentMaterial(mtr);
        let compMesh = new ƒ.ComponentMesh(cylinder);
        graph.addComponent(mtrCmp);
        graph.addComponent(compMesh);
        graph.addComponent(new ƒ.ComponentTransform());
        graph.mtxLocal.rotateZ(360);
        Importer_Tests.viewport = new ƒ.Viewport();
        Importer_Tests.viewport.initialize("Viewport", graph, cmpCamera, canvas);
        Importer_Tests.viewport.draw();
    }
})(Importer_Tests || (Importer_Tests = {}));
//# sourceMappingURL=Main.js.map