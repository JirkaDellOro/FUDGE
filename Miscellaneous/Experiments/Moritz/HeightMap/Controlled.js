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
            this.maxSpeed = 1; // units per second
            this.maxRotSpeed = 90; // degrees per second
            this.height = 0;
            this.lookAt = f.Vector3.X(1);
        }
        setUpAxis() {
            this.axisSpeed.setDelay(500);
            this.axisRotation.setDelay(200);
        }
        update(_timeFrame) {
            let ray = this.meshTerrain.getPositionOnTerrain(this);
            this.height = ray.origin.y;
            this.lookAt = ray.direction;
            let distance = this.axisSpeed.getOutput() * this.maxSpeed * _timeFrame;
            let angle = this.axisRotation.getOutput() * this.maxRotSpeed * _timeFrame;
            this.mtxLocal.translateX(distance /*+ 0.005*/);
            this.mtxLocal.translation = new f.Vector3(this.mtxLocal.translation.x, this.height + 0.025, this.mtxLocal.translation.z);
            let direction = f.Vector3.SUM(this.lookAt, this.mtxLocal.translation);
            this.mtxLocal.lookAt(direction, this.mtxLocal.getY());
            // console.log(this.mtxLocal.getX().toString());
            this.mtxLocal.rotateZ(angle /*+ 0.2*/);
        }
        setLookAt(lookAt) {
        }
    }
    HeightMap.Controlled = Controlled;
})(HeightMap || (HeightMap = {}));
