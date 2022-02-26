"use strict";
var PointInFace;
(function (PointInFace) {
    var ƒ = FudgeCore;
    window.addEventListener("load", start);
    let crc2;
    let vertices;
    let face;
    function start(_event) {
        vertices = new ƒ.Vertices(new ƒ.Vertex(new ƒ.Vector3(100, 100, 0)), new ƒ.Vertex(new ƒ.Vector3(400, 500, 0)), new ƒ.Vertex(new ƒ.Vector3(700, 100, 0)));
        face = new ƒ.Face(vertices, 0, 1, 2);
        let canvas = document.querySelector("canvas");
        crc2 = canvas.getContext("2d");
        canvas.addEventListener("mousemove", hndMouse);
    }
    function hndMouse(_event) {
        let mouse = new ƒ.Vector3(_event.offsetX, _event.offsetY, 0);
        let diffs = [];
        crc2.clearRect(0, 0, crc2.canvas.width, crc2.canvas.height);
        crc2.beginPath();
        crc2.moveTo(vertices[2].position.x, vertices[2].position.y);
        for (let vertex of vertices) {
            crc2.lineTo(vertex.position.x, vertex.position.y);
            crc2.lineTo(mouse.x, mouse.y);
            crc2.lineTo(vertex.position.x, vertex.position.y);
            let diff = ƒ.Vector3.DIFFERENCE(vertex.position, mouse);
            diffs.push(diff);
        }
        crc2.moveTo(mouse.x, mouse.y);
        crc2.arc(mouse.x, mouse.y, 2, 0, 2 * Math.PI);
        crc2.stroke();
        let n0 = ƒ.Vector3.CROSS(diffs[1], diffs[0]);
        let n1 = ƒ.Vector3.CROSS(diffs[2], diffs[1]);
        let n2 = ƒ.Vector3.CROSS(diffs[0], diffs[2]);
        let dot1 = ƒ.Vector3.DOT(n0, n1);
        let dot2 = ƒ.Vector3.DOT(n0, n2);
        // console.log(n0.toString(), n1.toString(), n2.toString());
        console.log(dot1 < 0 || dot2 < 0 ? "Out" : "In");
    }
})(PointInFace || (PointInFace = {}));
//# sourceMappingURL=Test.js.map