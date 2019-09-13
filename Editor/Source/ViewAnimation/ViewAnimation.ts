///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../UserInterface/Build/FudgeUI"/>
///<reference types="../../Build/Fudge"/>
namespace FudgeViewAnimation {
  export class ViewAnimation extends Fudge.View {
    node: FudgeCore.Node;
    animation: FudgeCore.Animation;
    playbackTime: number;
    private canvas: HTMLCanvasElement;
    private crc: CanvasRenderingContext2D;

    fillContent(): void {
      this.content = document.createElement("div");
      let toolbar: HTMLDivElement = document.createElement("div");
      toolbar.id = "toolbar";

      let attributeList: HTMLDivElement = document.createElement("div");
      this.canvas = document.createElement("canvas");
      this.canvas.width = 1500;
      this.canvas.height = 500;
      this.crc = this.canvas.getContext("2d");
      // let toolbar: HTMLDivElement = document.createElement("div");

      this.content.appendChild(toolbar);
      this.content.appendChild(attributeList);
      // this.content.appendChild(this.canvasSheet);
      this.content.appendChild(this.canvas);

      let sheet: ViewAnimationSheetDope = new ViewAnimationSheetDope(this, this.crc, null, new FudgeCore.Vector2(.5, 0.5), new FudgeCore.Vector2(0, 0));
      sheet.redraw();
      this.playbackTime = 1000;
      sheet.drawCursor(3);
      // sheet.translate();
    }

    installListeners(): void {
      //
    }

    deconstruct(): void {
      //
    }


    
    // redrawCanvas
  }

}