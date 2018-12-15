// import { drawTypes } from "./canvastypes";
var drawTypes;
(function (drawTypes) {
    window.addEventListener("load", init);
    var crc;
    var l1 = new drawTypes.DrawLine({ x: 0, y: 0 }, { x: 100, y: 100 });
    var exPath = new drawTypes.DrawPath([l1], "yellow");
    function init() {
        console.info("test");
        var canvas = document.getElementById("myCanvas");
        crc = canvas.getContext("2d");
        crc.beginPath();
        crc.moveTo(0, 0);
        crc.lineTo(100, 100);
        crc.stroke();
        exPath.draw(crc);
    }
})(drawTypes || (drawTypes = {}));
//# sourceMappingURL=canvas.js.map