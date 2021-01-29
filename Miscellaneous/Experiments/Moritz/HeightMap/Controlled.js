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
            this.axisSpeed.setDelay(500);
            this.axisRotation.setDelay(200);
        }
        update(_timeFrame) {
            let ray = this.meshTerrain.getPositionOnTerrain(this);
            this.mtxLocal.translation = ray.origin;
            let distance = this.axisSpeed.getOutput() * this.maxSpeed * _timeFrame;
            let angle = this.axisRotation.getOutput() * this.maxRotSpeed * _timeFrame;
            this.mtxLocal.translateX(distance /*+ 0.005*/);
            // this.height = ray.origin.y;
            // this.lookAt = ray.direction;
            // this.mtxLocal.translation = new f.Vector3(this.mtxLocal.translation.x, this.height, this.mtxLocal.translation.z);
            // let direction = f.Vector3.SUM(this.lookAt, this.mtxLocal.translation);
            // let test = f.Vector3.SUM(ray.origin, f.Vector3.X());
            // // this.mtxLocal.lookAt( direction);
            // this.mtxLocal.showTo(  test, direction)
            // // console.log(this.mtxLocal.getX().toString());
            // this.mtxLocal.rotateZ(angle /*+ 0.2*/);
        }
        setLookAt(lookAt) {
        }
    }
    HeightMap.Controlled = Controlled;
})(HeightMap || (HeightMap = {}));
