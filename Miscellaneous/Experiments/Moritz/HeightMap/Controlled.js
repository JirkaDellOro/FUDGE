"use strict";
var HeightMap;
(function (HeightMap) {
    var f = FudgeCore;
    var ƒAid = FudgeAid;
    class Controlled extends ƒAid.Node {
        constructor() {
            super(...arguments);
            this.axisSpeed = new f.Axis("Speed", 1, 0 /* PROPORTIONAL */);
            this.axisRotation = new f.Axis("Rotation", 1, 0 /* PROPORTIONAL */);
            this.maxSpeed = 0.2; // units per second
            this.maxRotSpeed = 180; // degrees per second
            this.height = 0;
            this.lookAt = f.Vector3.X(1);
            this.groundClearance = 0.0225;
        }
        setUpAxis() {
            this.axisSpeed.setDelay(1000);
            this.axisRotation.setDelay(1000);
        }
        update(_timeFrame) {
            let distance = this.axisSpeed.getOutput() * this.maxSpeed * _timeFrame;
            let angle = this.axisRotation.getOutput() * this.maxRotSpeed * _timeFrame;
            let ray = this.meshTerrain.getPositionOnTerrain(this.mtxWorld.translation, this.terrain.mtxWorld);
            let tyreFL = this.getChildrenByName("Tyre FL")[0];
            let posFL = this.meshTerrain.getPositionOnTerrain(tyreFL.mtxWorld.translation, this.terrain.mtxWorld);
            // console.log("mtxWorld: " + tyreFL.mtxWorld.translation.toString())
            // console.log("posTerrain: " + posFL.origin.toString())
            let posFLLocal = f.Vector3.TRANSFORMATION(posFL.origin, this.mtxWorldInverse);
            console.log("mtxLocal: " + tyreFL.mtxLocal.translation.toString());
            console.log("posTerrain: " + posFLLocal.toString());
            tyreFL.mtxLocal.translation = new f.Vector3(tyreFL.mtxLocal.translation.x, tyreFL.mtxLocal.translation.y, posFLLocal.z);
            // console.log("pos: " + posFL.origin.toString() + " Tyre world: " + tyreFL.mtxWorld.translation.toString());
            // console.log("Tyre Local: " + tyreFL.mtxLocal.translation + " pos Local: " + posFLLocal.toString());
            this.mtxLocal.translation = new f.Vector3(ray.origin.x, ray.origin.y + this.groundClearance, ray.origin.z);
            this.mtxLocal.translateX(distance);
            this.mtxLocal.lookAt(f.Vector3.SUM(this.mtxLocal.translation, ray.direction));
            this.getChildrenByName("Tyre FL")[0].mtxLocal.rotation = new f.Vector3(90, 0, this.axisRotation.getOutput() * 15);
            this.getChildrenByName("Tyre FR")[0].mtxLocal.rotation = new f.Vector3(90, 0, this.axisRotation.getOutput() * 15);
            this.mtxLocal.rotateZ(angle * distance * 200);
            // showGradient(ray);
        }
    }
    HeightMap.Controlled = Controlled;
    function showGradient(ray) {
        let gradient = getGradient(ray.direction);
        HeightMap.arrowRed.mtxLocal.translation = ray.origin;
        HeightMap.arrowRed.mtxLocal.lookAt(f.Vector3.SUM(gradient, ray.origin));
    }
    function getGradient(faceNormal) {
        if (faceNormal.x == 0 && faceNormal.z == 0)
            return f.Vector3.Y(1);
        let yCuttingPlane = f.Vector3.CROSS(faceNormal, f.Vector3.Y(1));
        let gradient = f.Vector3.CROSS(faceNormal, yCuttingPlane);
        return f.Vector3.NORMALIZATION(gradient);
    }
})(HeightMap || (HeightMap = {}));
