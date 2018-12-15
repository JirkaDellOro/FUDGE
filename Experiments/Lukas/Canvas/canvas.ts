// import { drawTypes } from "./canvastypes";

namespace drawTypes {

    window.addEventListener("load", init);

    let crc: CanvasRenderingContext2D;
    let l1: DrawLine = new DrawLine({x:0,y:0},{x:100,y:100});
    let exPath: DrawPath = new DrawPath([l1], "yellow");

    function init() {
        console.info("test");
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("myCanvas");
        crc = canvas.getContext("2d");

        crc.beginPath();
        crc.moveTo(0, 0);
        crc.lineTo(100, 100);
        crc.stroke();

        exPath.draw(crc);
    }
}
