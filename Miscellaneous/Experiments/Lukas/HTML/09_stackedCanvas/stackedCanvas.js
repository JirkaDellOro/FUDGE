var stackedCanvas;
(function (stackedCanvas) {
    window.addEventListener("load", init);
    function init() {
        var canvas = Array.from(document.getElementsByTagName("canvas"));
        canvas[0].addEventListener("mousedown", mousedown);
        canvas[1].addEventListener("mousedown", mousedown);
        var crc0 = canvas[0].getContext("2d");
        var crc1 = canvas[1].getContext("2d");
        crc0.rect(0, 0, 10, 10);
        crc0.fill();
        crc1.rect(10, 10, 10, 10);
        crc1.fill();
    }
    function mousedown(_e) {
        console.log(_e.target);
    }
})(stackedCanvas || (stackedCanvas = {}));
