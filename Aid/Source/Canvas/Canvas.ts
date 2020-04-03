namespace FudgeAid {
  export enum IMAGE_RENDERING {
    AUTO = "auto",
    SMOOTH = "smooth",
    HIGH_QUALITY = "high-quality",
    CRISP_EDGES = "crisp-edges",
    PIXELATED = "pixelated"
  }
  /**
   * Adds comfort methods to create a render canvas
   */
  export class Canvas {
    public static create(_fillParent: boolean = true, _imageRendering: IMAGE_RENDERING = IMAGE_RENDERING.AUTO, _width: number = 800, _height: number = 600): HTMLCanvasElement {
      let canvas: HTMLCanvasElement = <HTMLCanvasElement>document.createElement("canvas");
      canvas.id = "FUDGE";
      let style: CSSStyleDeclaration = canvas.style;
      style.imageRendering = _imageRendering;
      style.width = _width + "px";
      style.height = _height + "px";
      style.marginBottom = "-0.25em";
      
      if (_fillParent) {
        style.width = "100%";
        style.height = "100%";
      }
      return canvas;
    }
  }
}