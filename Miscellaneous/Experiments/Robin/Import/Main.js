"use strict";
///<reference types="../../../../Core/Build/FudgeCore.js"/>
var Importer_Tests;
///<reference types="../../../../Core/Build/FudgeCore.js"/>
(function (Importer_Tests) {
    var ƒ = FudgeCore;
    window.addEventListener("load", load);
    async function load(_event) {
        const canvas = document.querySelector("canvas");
        let graph = new ƒ.Node("Graph");
        let mesh = new ƒ.MeshCustom();
        await mesh.asyncLoad("mesh.json");
        let cube = new ƒ.MeshCube();
        //await new Promise(r => setTimeout(r, 2000));
        let cmpCamera = new ƒ.ComponentCamera();
        // cmpCamera.pivot.translate(new ƒ.Vector3(-3, -2, -1));
        // cmpCamera.pivot.lookAt(ƒ.Vector3.ZERO());
        // cmpCamera.projectCentral(1, 45);
        cmpCamera.pivot.translateZ(20);
        cmpCamera.pivot.rotateY(180);
        let mtr = new ƒ.Material("Material", ƒ.ShaderUniColor, new ƒ.CoatColored());
        let mtrCmp = new ƒ.ComponentMaterial(mtr);
        let compMesh = new ƒ.ComponentMesh(mesh);
        //let cmpRigidbody: ƒ.ComponentRigidbody = new ƒ.ComponentRigidbody(1, ƒ.PHYSICS_TYPE.DYNAMIC, ƒ.COLLIDER_TYPE.CUBE, ƒ.PHYSICS_GROUP.DEFAULT);
        graph.addComponent(mtrCmp);
        graph.addComponent(compMesh);
        graph.addComponent(new ƒ.ComponentTransform());
        Importer_Tests.viewport = new ƒ.Viewport();
        Importer_Tests.viewport.initialize("Viewport", graph, cmpCamera, canvas);
        // ƒ.Physics.start(graph);
        // ƒ.Physics.world.simulate();
        Importer_Tests.viewport.draw();
    }
})(Importer_Tests || (Importer_Tests = {}));
//# sourceMappingURL=Main.js.map