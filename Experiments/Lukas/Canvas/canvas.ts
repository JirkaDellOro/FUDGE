// import { drawTypes } from "./canvastypes";

namespace drawTypes {

    window.addEventListener("load", init);

    let crc: CanvasRenderingContext2D;
    let l1: DrawLine = new DrawLine(new Vector2(0,0),new Vector2(100,100));
    let l2: DrawLine = new DrawLine(new Vector2(100,100),new Vector2(200,100),2,"red",new Vector2(100,200),new Vector2(200,200));
    let l3: DrawLine = new DrawLine(new Vector2(200,100),new Vector2(0,0),5,"blue",new Vector2(100,0),new Vector2(200,0));
    let exPath: DrawPath = new DrawPath([l1, l2, l3],"yellow");

    function init() {
        let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.getElementById("myCanvas");
        crc = canvas.getContext("2d");

        // crc.beginPath();
        // crc.moveTo(0, 0);
        // crc.lineTo(100, 100);
        // crc.stroke();

        exPath.draw(crc);
    }
}
