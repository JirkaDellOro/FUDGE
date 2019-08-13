"use strict";
var Canvas3D;
(function (Canvas3D) {
    window.addEventListener("load", init);
    class WebGL {
        constructor( /* size ? */) {
            this.content = [0, 0, 0, 1];
            this.crc3 = null;
            this.canvas = null;
            this.rect = null;
            this.canvas = document.createElement("canvas");
            console.log(this.canvas.width, this.canvas.height);
            this.getContextFromCanvas(this.canvas);
            this.rect = { x: 0, y: 0, width: this.canvas.width, height: this.canvas.height };
            console.log(this.crc3.canvas.width, this.crc3.canvas.height);
        }
        getContextFromCanvas(canvas /*| OffscreenCanvas*/) {
            this.crc3 = canvas.getContext("webgl2");
            return this.crc3;
        }
        getRect() {
            return this.rect;
        }
        render( /* size */) {
            this.crc3.clearColor(this.content[0], this.content[1], this.content[2], this.content[3]);
            this.crc3.clear(this.crc3.COLOR_BUFFER_BIT);
        }
        copyToCanvas(_crc2, _rectSource, _rectDestination) {
            _crc2.drawImage(this.canvas, _rectSource.x, _rectSource.y, _rectSource.width, _rectSource.height, _rectDestination.x, _rectDestination.y, _rectDestination.width, _rectDestination.height);
        }
        defineContent(_r, _g, _b, _a) {
            this.content = [_r, _g, _b, _a];
        }
    }
    function init(_event) {
        let webGL = new WebGL();
        let crc3 = [];
        for (let i = 0; i < 4; i++) {
            let canvas = document.createElement("canvas");
            canvas.width = 400;
            canvas.height = 200;
            let c = canvas.getContext("2d");
            document.body.appendChild(canvas);
            crc3.push(c);
        }
        for (let i = 0; i < 4; i++) {
            let c = crc3[i];
            let rect = { x: 0, y: 0, width: c.canvas.width, height: c.canvas.height };
            rect.x = i * 10;
            rect.height = c.canvas.height - i * 10;
            webGL.defineContent(1, 0.3 * i, 0, 1);
            webGL.render();
            webGL.copyToCanvas(c, webGL.getRect(), rect);
        }
    }
})(Canvas3D || (Canvas3D = {}));
//# sourceMappingURL=Test.js.map