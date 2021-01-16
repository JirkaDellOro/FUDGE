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
            this.mtxLocal.translateZ(distance);
            this.mtxLocal.translation = new f.Vector3(this.mtxLocal.translation.x, this.height + 0.025, this.mtxLocal.translation.z);
            this.mtxLocal.rotateY(angle);
            this.getComponent(f.ComponentMesh).pivot.rotation = new f.Vector3(this.rotationX, 0, this.rotationZ);
        }
    }
    HeightMap.Controlled = Controlled;
})(HeightMap || (HeightMap = {}));
