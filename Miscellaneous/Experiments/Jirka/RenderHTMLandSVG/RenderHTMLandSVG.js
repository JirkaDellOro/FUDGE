window.addEventListener("load", initImages);
function initImages() {
    Setup.size(600, 400);
    Setup.title("RenderHTMLandSVG");
    var bmp = document.getElementById("bmp");
    var svg = document.getElementById("svg");
    crc2.rotate(0.1);
    crc2.drawImage(bmp, 0, 0);
    crc2.drawImage(svg, 300, 0);
    drawHtmlDom(document.getElementById("svghtml"), 100, 100, 300, 100);
    drawHtmlDom(document.getElementById("html"), 100, 200, 200, 100);
}
function drawSvgDom(_svg, _x, _y) {
    var d = "data:image/svg+xml," + _svg.outerHTML;
    var i = new Image();
    i.onload = function () {
        crc2.drawImage(i, _x, _y);
    };
    i.src = d;
}
function drawHtmlDom(_html, _x, _y, _width, _height) {
    var d = "data:image/svg+xml,";
    d += "<svg xmlns='http://www.w3.org/2000/svg' width='" + _width + "' height='" + _height + "' >";
    d += "<foreignObject width='100%' height ='100%'>";
    d += "<div xmlns='http://www.w3.org/1999/xhtml'>";
    d += _html.outerHTML;
    d += "</div></foreignObject></svg>";
    var i = new Image();
    i.onload = function () {
        crc2.drawImage(i, _x, _y);
    };
    i.src = d;
}
//# sourceMappingURL=RenderHTMLandSVG.js.map