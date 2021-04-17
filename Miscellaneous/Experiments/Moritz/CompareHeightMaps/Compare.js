"use strict";
var HeightMap;
(function (HeightMap) {
    var f = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", init);
    let graph = new f.Node("Graph");
    let oldGridMeshFlat;
    let gridMeshFlat;
    let oldGridFlat = new f.Node("OldMap");
    let gridFlat = new f.Node("Map");
    function init(_event) {
        let matFlat = new f.Material("White", f.ShaderFlat, new f.CoatColored(f.Color.CSS("WHITE")));
        let matRed = new f.Material("Red", f.ShaderFlat, new f.CoatColored(f.Color.CSS("RED")));
        let txtImage = new f.TextureImage();
        let coatTextured = new f.CoatTextured();
        coatTextured.texture = txtImage;
        let matTex = new f.Material("Textured", f.ShaderTexture, coatTextured);
        const myHeightMapFunction = function (x, y) {
            return Math.sin(x * y * Math.PI * 2) * 0.2;
        };
        gridMeshFlat = new f.MeshHeightMap("HeightMap", 4, 4, myHeightMapFunction);
        oldGridMeshFlat = new f.OldMeshHeightMap("HeightMap", 4, 4, myHeightMapFunction);
        gridFlat = Scenes.createCompleteMeshNode("Grid", matFlat, gridMeshFlat);
        oldGridFlat = Scenes.createCompleteMeshNode("oldGrid", matFlat, oldGridMeshFlat);
        gridFlat.mtxLocal.translate(new f.Vector3(-0.75, 0, 0));
        oldGridFlat.mtxLocal.translate(new f.Vector3(0.75, 0, 0));
        gridFlat.mtxLocal.rotateY(90);
        oldGridFlat.mtxLocal.rotateY(90);
        graph.addChild(gridFlat);
        graph.addChild(oldGridFlat);
        ƒAid.addStandardLightComponents(graph);
        // pivotMarker(graph);
        let viewport = new f.Viewport();
        let cmpCamera = Scenes.createCamera(new f.Vector3(0, 6, 1), new f.Vector3(0, 0, 0));
        viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
        viewport.addEventListener("\u0192keydown" /* DOWN */, moreVertices);
        Scenes.dollyViewportCamera(viewport);
        viewport.setFocus(true);
        viewport.draw();
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 120);
        window.setInterval(function () {
            gridFlat.mtxLocal.rotateY(0);
            oldGridFlat.mtxLocal.rotateY(0);
            viewport.draw();
        }, 20);
    }
    function moreVertices(_event) {
        if (_event.code == f.KEYBOARD_CODE.M) {
            gridMeshFlat.resolutionX = gridMeshFlat.resolutionX + 1;
            gridMeshFlat.resolutionZ = gridMeshFlat.resolutionZ + 1;
            oldGridMeshFlat.resolutionX = oldGridMeshFlat.resolutionX + 1;
            oldGridMeshFlat.resolutionZ = oldGridMeshFlat.resolutionZ + 1;
            gridMeshFlat.create();
            oldGridMeshFlat.create();
            gridMeshFlat.createRenderBuffers();
            oldGridMeshFlat.createRenderBuffers();
            console.log(oldGridMeshFlat.resolutionX);
        }
        if (_event.code == f.KEYBOARD_CODE.N) {
            gridMeshFlat.resolutionX = gridMeshFlat.resolutionX - 1;
            gridMeshFlat.resolutionZ = gridMeshFlat.resolutionZ - 1;
            oldGridMeshFlat.resolutionX = oldGridMeshFlat.resolutionX - 1;
            oldGridMeshFlat.resolutionZ = oldGridMeshFlat.resolutionZ - 1;
            gridMeshFlat.create();
            oldGridMeshFlat.create();
            gridMeshFlat.createRenderBuffers();
            oldGridMeshFlat.createRenderBuffers();
            console.log(oldGridMeshFlat.resolutionX);
        }
    }
})(HeightMap || (HeightMap = {}));
