"use strict";
var HeightMap;
(function (HeightMap) {
    var f = FudgeCore;
    var ƒAid = FudgeAid;
    window.addEventListener("load", init);
    let graph = new f.Node("Graph");
    let m1 = new f.Node("M1");
    let m2 = new f.Node("M1");
    let m3 = new f.Node("M1");
    let gridMeshFlat;
    let gridFlat = new f.Node("Map");
    let viewport;
    let controlled;
    let cntKeyHorizontal = new f.Control("Keyboard", 1, 0 /* PROPORTIONAL */, true);
    let cntKeyVertical = new f.Control("Keyboard", 4, 0 /* PROPORTIONAL */, true);
    cntKeyHorizontal.setDelay(500);
    cntKeyVertical.setDelay(500);
    function init(_event) {
        setupScene();
        setupControls();
        // controlled.height = getHeightOnTerrain(gridMeshFlat, controlled);
        console.log(gridMeshFlat.indices);
        console.log(gridMeshFlat.vertices);
        ƒ.Loop.addEventListener("loopFrame" /* LOOP_FRAME */, hndLoop);
        ƒ.Loop.start(ƒ.LOOP_MODE.TIME_GAME, 120);
        console.log("mtxWorld controlled translation: " + controlled.mtxWorld.translation);
        console.log("mtxLocal controlled translation: " + controlled.mtxLocal.translation);
        console.log("mtxWorld controlled scaling: " + controlled.mtxWorld.scaling);
        // f.RenderManager.setupTransformAndLights(graph);
        ƒAid.addStandardLightComponents(graph);
        // console.log(heightMarker.mtxLocal.translation.x);
        // console.log(heightMarker.mtxLocal.translation.z);
    }
    function hndLoop(_event) {
        hndKeyboardControls();
        // controlled.mtxLocal.translation = new f.Vector3(controlled.mtxLocal.translation.x, height, controlled.mtxLocal.translation.z);
        let timeFrame = f.Loop.timeFrameGame / 1000;
        controlled.update(timeFrame);
        viewport.draw();
    }
    function setupScene() {
        let matFlat = new f.Material("White", f.ShaderFlat, new f.CoatColored(f.Color.CSS("WHITE")));
        let matRed = new f.Material("Red", f.ShaderFlat, new f.CoatColored(f.Color.CSS("RED")));
        let meshCube = new f.MeshCube("CubeMesh");
        controlled = new HeightMap.Controlled("Cube", f.Matrix4x4.IDENTITY(), matRed, new f.MeshCube());
        controlled.mtxLocal.translation = new f.Vector3(0.4, 0.1, 0.43);
        controlled.mtxLocal.scale(new f.Vector3(0.05, 0.05, 0.05));
        m1 = Scenes.createCompleteMeshNode("M1", matRed, meshCube);
        m2 = Scenes.createCompleteMeshNode("M2", matRed, meshCube);
        m3 = Scenes.createCompleteMeshNode("M3", matRed, meshCube);
        const myHeightMapFunction = function (x, y) {
            return Math.sin(x * y * Math.PI * 2) * 0.2;
        };
        viewport = new f.Viewport();
        viewport.addEventListener("\u0192keydown" /* DOWN */, moreVertices);
        let cmpCamera = Scenes.createCamera(new f.Vector3(0, 2, 1), new f.Vector3(0, 0, 0));
        gridMeshFlat = new f.MeshHeightMap("HeightMap", 4, 4, myHeightMapFunction);
        gridFlat = Scenes.createCompleteMeshNode("Grid", matFlat, gridMeshFlat);
        let s = 0.01;
        m1.mtxLocal.scale(new f.Vector3(s, s, s));
        m2.mtxLocal.scale(new f.Vector3(s, s, s));
        m3.mtxLocal.scale(new f.Vector3(s, s, s));
        graph.addChild(gridFlat);
        graph.addChild(controlled);
        graph.addChild(m1);
        graph.addChild(m2);
        graph.addChild(m3);
        viewport.initialize("Viewport", graph, cmpCamera, document.querySelector("canvas"));
        viewport.setFocus(true);
        Scenes.dollyViewportCamera(viewport);
        viewport.draw();
        console.log(controlled);
    }
    function moreVertices(_event) {
        if (_event.code == f.KEYBOARD_CODE.M) {
            gridMeshFlat.resolutionX = gridMeshFlat.resolutionX + 1;
            gridMeshFlat.resolutionZ = gridMeshFlat.resolutionZ + 1;
            gridMeshFlat.create();
            gridMeshFlat.createRenderBuffers();
            console.log(gridMeshFlat.resolutionX);
        }
        if (_event.code == f.KEYBOARD_CODE.N) {
            gridMeshFlat.resolutionX = gridMeshFlat.resolutionX - 1;
            gridMeshFlat.resolutionZ = gridMeshFlat.resolutionZ - 1;
            gridMeshFlat.create();
            gridMeshFlat.createRenderBuffers();
            console.log(gridMeshFlat.resolutionX);
        }
    }
    function getHeightOnTerrain(terrain, object) {
        let indices = terrain.indices;
        let vertices = terrain.vertices;
        let nearestFaces = new Array;
        for (let i = 0; i < indices.length; i = i + 3) {
            let vertexONE = new f.Vector3(vertices[indices[i] * 3], vertices[indices[i] * 3 + 1], vertices[indices[i] * 3 + 2]);
            let vertexTWO = new f.Vector3(vertices[indices[i + 1] * 3], vertices[indices[i + 1] * 3 + 1], vertices[indices[i + 1] * 3 + 2]);
            let vertexTHREE = new f.Vector3(vertices[indices[i + 2] * 3], vertices[indices[i + 2] * 3 + 1], vertices[indices[i + 2] * 3 + 2]);
            let face = new distanceToFaceVertices(vertexONE, vertexTWO, vertexTHREE, object);
            nearestFaces.push(face);
        }
        nearestFaces.sort((n1, n2) => {
            return n1.distance - n2.distance;
        });
        return calculateHeight(nearestFaces[0], object);
    }
    function calculateHeight(face, object) {
        m1.mtxLocal.translation = face.vertexONE;
        m2.mtxLocal.translation = face.vertexTWO;
        m3.mtxLocal.translation = face.vertexTHREE;
        let ray = new f.Ray(new f.Vector3(0, 1, 0), object.mtxWorld.translation);
        let v1 = f.Vector3.DIFFERENCE(face.vertexTWO, face.vertexONE);
        let v2 = f.Vector3.DIFFERENCE(face.vertexTHREE, face.vertexONE);
        let intersection = ray.intersectPlane(face.vertexONE, f.Vector3.CROSS(v1, v2));
        if (face.distanceONE == 0)
            return face.vertexONE.y;
        if (face.distanceTWO == 0)
            return face.vertexTWO.y;
        if (face.distanceTHREE == 0)
            return face.vertexTHREE.y;
        console.log("Ray: " + ray);
        console.log("Vektoren: v1 " + v1 + " v2 " + v2);
        console.log("Intersection: " + intersection);
        return intersection.y;
        // console.log(face);
        //   return ( (1/face.distanceONE) * face.vertexONE.y + (1/face.distanceTWO) * face.vertexTWO.y + (1/face.distanceTHREE) * face.vertexTHREE.y ) /
        //       (1/face.distanceONE + 1/face.distanceTWO + 1/face.distanceTHREE);
    }
    function setupControls() {
        controlled.axisSpeed.addControl(cntKeyVertical);
        controlled.axisRotation.addControl(cntKeyHorizontal);
    }
    function hndKeyboardControls() {
        controlled.height = getHeightOnTerrain(gridMeshFlat, controlled);
        cntKeyVertical.setInput(f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.I])
            + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.K]));
        cntKeyHorizontal.setInput(f.Keyboard.mapToValue(1, 0, [f.KEYBOARD_CODE.J])
            + f.Keyboard.mapToValue(-1, 0, [f.KEYBOARD_CODE.L]));
    }
    class distanceToFaceVertices {
        constructor(vertexONE, vertexTWO, vertexTHREE, object) {
            this.vertexONE = vertexONE;
            this.vertexTWO = vertexTWO;
            this.vertexTHREE = vertexTHREE;
            this.distanceONE = new f.Vector2(vertexONE.x - object.mtxLocal.translation.x, vertexONE.z - object.mtxWorld.translation.z).magnitude;
            this.distanceTWO = new f.Vector2(vertexTWO.x - object.mtxLocal.translation.x, vertexTWO.z - object.mtxWorld.translation.z).magnitude;
            this.distanceTHREE = new f.Vector2(vertexTHREE.x - object.mtxLocal.translation.x, vertexTHREE.z - object.mtxWorld.translation.z).magnitude;
            this.distance = this.distanceONE + this.distanceTWO + this.distanceTHREE;
        }
    }
})(HeightMap || (HeightMap = {}));
