window.addEventListener("load", init);
function init(_event) {
    var canvas;
    var crc2;
    canvas = document.getElementsByTagName("canvas")[0];
    crc2 = canvas.getContext("2d");
    console.log(crc2.canvas == canvas);
    console.log(crc2.canvas.width, crc2.canvas.height);
    console.log(window.innerWidth, window.innerHeight);
    crc2.canvas.width = window.innerWidth;
    crc2.canvas.height = window.innerHeight;
    crc2.fillStyle = "#ff0000";
    crc2.fillRect(0, 0, crc2.canvas.width, crc2.canvas.height);
    crc2.strokeRect(2, 2, crc2.canvas.width - 4, crc2.canvas.height - 4);
}
//# sourceMappingURL=CanvasTest.js.map