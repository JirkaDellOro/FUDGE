window.addEventListener("load", initImages);

function initImages(): void {
    Setup.size(600, 400);
    Setup.title("RenderHTMLandSVG");

    var bmp: HTMLImageElement = <HTMLImageElement>document.getElementById("bmp");
    var svg: HTMLImageElement = <HTMLImageElement>document.getElementById("svg");

    crc2.rotate(0.1);

    crc2.drawImage(bmp, 0, 0);
    crc2.drawImage(svg, 300, 0);
    drawHtmlDom(document.getElementById("svghtml"), 100, 100, 300, 100);
    drawHtmlDom(document.getElementById("html"), 100, 200, 200, 100);
}

function drawSvgDom(_svg: HTMLElement, _x: number, _y: number): void {
    var d: string = "data:image/svg+xml," + _svg.outerHTML;
    var i: HTMLImageElement = new Image();
    i.onload = function(): void {
        crc2.drawImage(i, _x, _y);
    };
    i.src = d;
}

function drawHtmlDom(_html: HTMLElement, _x: number, _y: number, _width: number, _height: number): void {
    var d: string = "data:image/svg+xml,";
    d += "<svg xmlns='http://www.w3.org/2000/svg' width='" + _width + "' height='" + _height + "' >";
    d += "<foreignObject width='100%' height ='100%'>";
    d += "<div xmlns='http://www.w3.org/1999/xhtml'>";
    d += _html.outerHTML;
    d += "</div></foreignObject></svg>";
    var i: HTMLImageElement = new Image();
    i.onload = function(): void {
        crc2.drawImage(i, _x, _y);
    };
    i.src = d;
}