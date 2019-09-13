namespace stackedCanvas{
  window.addEventListener("load", init);

  function init(){
    let canvas: HTMLCanvasElement[] = Array.from(document.getElementsByTagName("canvas"));
    canvas[0].addEventListener("mousedown",mousedown);
    canvas[1].addEventListener("mousedown",mousedown);
    let crc0: CanvasRenderingContext2D = canvas[0].getContext("2d");
    let crc1: CanvasRenderingContext2D = canvas[1].getContext("2d");

    crc0.rect(0,0,10,10);
    crc0.fill();
    crc1.rect(10,10,10,10);
    crc1.fill();
  }

  function mousedown(_e: MouseEvent){
    console.log(_e.target);
  }
}