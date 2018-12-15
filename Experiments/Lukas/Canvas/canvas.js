// import { drawTypes } from "./canvastypes";
var drawTypes;
(function (drawTypes) {
    window.addEventListener("load", init);
    var crc;
    var l1 = new drawTypes.DrawLine(new drawTypes.Vector2(0, 0), new drawTypes.Vector2(100, 100));
    var l2 = new drawTypes.DrawLine(new drawTypes.Vector2(100, 100), new drawTypes.Vector2(200, 100), 2, "red", new drawTypes.Vector2(100, 200), new drawTypes.Vector2(200, 200));
    var l3 = new drawTypes.DrawLine(new drawTypes.Vector2(200, 100), new drawTypes.Vector2(0, 0), 5, "blue", new drawTypes.Vector2(100, 0), new drawTypes.Vector2(200, 0));
    var exPath = new drawTypes.DrawPath([l1, l2, l3]);
    function init() {
        var canvas = document.getElementById("myCanvas");
        crc = canvas.getContext("2d");
        crc.beginPath();
        crc.moveTo(0, 0);
        crc.lineTo(200, 100);
        crc.stroke();
        exPath.draw(crc);
    }
})(drawTypes || (drawTypes = {}));
//# sourceMappingURL=canvas.js.map