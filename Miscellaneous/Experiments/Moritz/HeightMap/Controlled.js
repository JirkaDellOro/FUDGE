"use strict";
var HeightMap;
(function (HeightMap) {
    var f = FudgeCore;
    var ƒAid = FudgeAid;
    class Controlled extends ƒAid.NodeCoordinateSystem {
        constructor() {
            super(...arguments);
            this.axisSpeed = new f.Axis("Speed", 1, 0 /* PROPORTIONAL */);
            this.axisRotation = new f.Axis("Rotation", 1, 0 /* PROPORTIONAL */);
            this.maxSpeed = 1; // units per second
            this.maxRotSpeed = 90; // degrees per second
            this.height = 0;
            this.lookAt = f.Vector3.X(1);
        }
        setUpAxis() {
            this.axisSpeed.setDelay(0.0001);
            this.axisRotation.setDelay(1);
        }
        update(_timeFrame) {
            let oldUp = this.mtxLocal.getY();
            let oldNormal = this.mtxLocal.getZ();
            oldNormal.normalize();
            let newUp = oldUp;
            let ray = this.meshTerrain.getPositionOnTerrain(this);
            this.mtxLocal.translation = ray.origin;
            let gradient = f.Vector3.SCALE(getGradient(ray.direction), 0.002);
            HeightMap.arrowRed.mtxLocal.translation = ray.origin;
            HeightMap.arrowRed.mtxLocal.lookAt(f.Vector3.SUM(gradient, this.mtxLocal.translation));
            let distance = this.axisSpeed.getOutput() * this.maxSpeed * _timeFrame;
            let angle = this.axisRotation.getOutput() * this.maxRotSpeed * _timeFrame;
            ray.direction.normalize();
            if (!oldNormal.equals(ray.direction, 0.001)) {
                console.log(oldNormal.toString() + ray.direction.toString());
                newUp = calculateNewUp(oldNormal, ray.direction, oldUp);
            }
            this.mtxLocal.translateX(distance /*+ 0.005*/);
            this.mtxLocal.lookAt(f.Vector3.SUM(this.mtxLocal.translation, ray.direction), newUp);
            this.mtxLocal.rotateZ(angle /*+ 0.2*/);
            // this.mtxLocal.translateZ(distance /*+ 0.005*/);
            // this.mtxLocal.lookAt(f.Vector3.SUM(this.mtxLocal.translation, this.mtxLocal.getZ()), ray.direction, true);
            // this.mtxLocal.rotateY(angle /*+ 0.2*/);
        }
    }
    HeightMap.Controlled = Controlled;
    function getGradient(faceNormal) {
        if (faceNormal.x == 0 && faceNormal.z == 0)
            return f.Vector3.Y(1);
        let yCuttingPlane = f.Vector3.CROSS(faceNormal, f.Vector3.Y(1));
        let gradient = f.Vector3.CROSS(faceNormal, yCuttingPlane);
        return f.Vector3.NORMALIZATION(gradient);
    }
    function calculateNewUp(oldNormal, newNormal, oldUp) {
        let oldDirection = f.Vector3.CROSS(oldNormal, oldUp);
        let newUp = f.Vector3.CROSS(oldDirection, newNormal);
        return newUp;
    }
})(HeightMap || (HeightMap = {}));
