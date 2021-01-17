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
            this.maxSpeed = 5; // units per second
            this.maxRotSpeed = 180; // degrees per second
        }
        setUpAxis() {
            this.axisSpeed.setDelay(500);
            this.axisRotation.setDelay(200);
        }
        update(_timeFrame) {
            let distance = this.axisSpeed.getOutput() * this.maxSpeed * _timeFrame;
            let angle = this.axisRotation.getOutput() * this.maxRotSpeed * _timeFrame;
            this.mtxLocal.translateX(distance);
            this.mtxLocal.translation = new f.Vector3(this.mtxLocal.translation.x, this.height + 0.025, this.mtxLocal.translation.z);
            let test = f.Vector3.SUM(this.lookAt, this.mtxLocal.translation);
            let matrix = this.mtxLocal;
            let vecX = f.Vector3.TRANSFORMATION(new f.Vector3(0, 1, 0), matrix);
            vecX = f.Vector3.SUM(vecX, this.mtxLocal.translation);
            this.mtxLocal.lookAt(test);
            this.mtxLocal.rotateZ(angle);
        }
    }
    HeightMap.Controlled = Controlled;
})(HeightMap || (HeightMap = {}));
