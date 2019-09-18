///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../UserInterface/Build/FudgeUI"/>
///<reference types="../../Build/Fudge"/>
namespace Fudge {
  export class ViewAnimation extends Fudge.View {
    node: FudgeCore.Node;
    animation: FudgeCore.Animation;
    playbackTime: number;
    private canvas: HTMLCanvasElement;
    private crc: CanvasRenderingContext2D;
    private sheet: ViewAnimationSheet;
    private toolbar: HTMLDivElement;

    constructor(_parent: Panel) {
      super(_parent);
      this.openAnimation();
      this.fillContent();
      this.installListeners();
    }

    openAnimation(): void {
      //TODO replace with file opening dialoge
      let seq1: FudgeCore.AnimationSequence = new FudgeCore.AnimationSequence();
      seq1.addKey(new FudgeCore.AnimationKey(0, 0));
      seq1.addKey(new FudgeCore.AnimationKey(500, 45));
      seq1.addKey(new FudgeCore.AnimationKey(1500, -45));
      seq1.addKey(new FudgeCore.AnimationKey(2000, 0));
      let seq2: FudgeCore.AnimationSequence = new FudgeCore.AnimationSequence();
      // seq2.addKey(new FudgeCore.AnimationKey(0, 0));
      seq2.addKey(new FudgeCore.AnimationKey(500, 0, 0, 2));
      seq2.addKey(new FudgeCore.AnimationKey(1000, 5));
      seq2.addKey(new FudgeCore.AnimationKey(1500, 0, -2));
      this.animation = new FudgeCore.Animation("TestAnimation", {
        components: {
          ComponentTransform: [
            {
              "ƒ.ComponentTransform": {
                position: {
                  x: new FudgeCore.AnimationSequence(),
                  y: seq2,
                  z: new FudgeCore.AnimationSequence()
                },
                rotation: {
                  x: new FudgeCore.AnimationSequence(),
                  y: seq1,
                  z: new FudgeCore.AnimationSequence()
                }
              }
            }
          ]
        }
      }, 60);
      this.animation.labels["One"] = 200;
      this.animation.labels["Two"] = 750;
      this.animation.setEvent("EventOne", 500);
      this.animation.setEvent("EventTwo", 1000);
    }

    fillContent(): void {
      // this.content = document.createElement("span");
      // this.content.id = "TESTID";
      this.toolbar = document.createElement("div");
      this.toolbar.id = "toolbar";
      this.toolbar.style.width = "300px";
      this.toolbar.style.height = "80px";
      this.toolbar.style.borderBottom = "1px solid black";
      this.fillToolbar(this.toolbar);


      let attributeList: HTMLDivElement = document.createElement("div");
      attributeList.id = "attributeList";
      attributeList.style.width = "300px";
      //TODO: Add Moni's custom Element here

      this.canvas = document.createElement("canvas");
      this.canvas.width = 1500;
      this.canvas.height = 500;
      this.canvas.style.position = "absolute";
      this.canvas.style.left = "300px";
      this.canvas.style.top = "0px";
      this.canvas.style.borderLeft = "1px solid black";
      this.crc = this.canvas.getContext("2d");
      // let toolbar: HTMLDivElement = document.createElement("div");

      this.content.appendChild(this.toolbar);
      this.content.appendChild(attributeList);
      // this.content.appendChild(this.canvasSheet);
      this.content.appendChild(this.canvas);

      this.sheet = new ViewAnimationSheetDope(this, this.crc, null, new FudgeCore.Vector2(.5, 0.5), new FudgeCore.Vector2(0, 0));
      this.sheet.redraw();
      this.playbackTime = 1000;
      this.sheet.drawCursor(3);
      // sheet.translate();
    }

    installListeners(): void {
      this.canvas.addEventListener("click", this.mouseClick.bind(this));
      this.canvas.addEventListener("mousedown", this.mouseDown.bind(this));
      this.canvas.addEventListener("mousemove", this.mouseMove.bind(this));
      this.canvas.addEventListener("mouseup", this.mouseUp.bind(this));
      this.toolbar.addEventListener("click", this.toolbarClick.bind(this));
      this.toolbar.addEventListener("change", this.toolbarChange.bind(this));
    }

    deconstruct(): void {
      //
    }

    mouseClick(_e: MouseEvent): void {
      // console.log(_e);
    }
    mouseDown(_e: MouseEvent): void {
      //console.log(_e);
      let obj: ViewAnimationLabel | ViewAnimationKey | ViewAnimationEvent = this.sheet.getObjectAtPoint(_e.offsetX, _e.offsetY);
      if (!obj) return;
      if (obj["label"]) {
        console.log(obj["label"]);
      }
      else if (obj["event"]) {
        console.log(obj["event"]);
      }
    }
    mouseMove(_e: MouseEvent): void {
      // console.log(_e);
    }
    mouseUp(_e: MouseEvent): void {
      // console.log(_e);
      //
    }

    private fillToolbar(_tb: HTMLElement): void {

      let playmode: HTMLSelectElement = document.createElement("select");
      playmode.id = "playmode";
      for (let m in FudgeCore.ANIMATION_PLAYMODE) {
        if (isNaN(+m)) {
          let op: HTMLOptionElement = document.createElement("option");
          op.value = m;
          op.innerText = m;
          playmode.appendChild(op);
        }
      }
      _tb.appendChild(playmode);
      _tb.appendChild(document.createElement("br"));

      let fpsL: HTMLLabelElement = document.createElement("label");
      fpsL.setAttribute("for", "fps");
      fpsL.innerText = "FPS";
      let fpsI: HTMLInputElement = document.createElement("input");
      fpsI.type = "number";
      fpsI.min = "0";
      fpsI.max = "999";
      fpsI.step = "1";
      fpsI.id = "fps";
      fpsI.value = this.animation.fps.toString();
      fpsI.style.width = "40px";

      _tb.appendChild(fpsL);
      _tb.appendChild(fpsI);

      let spsL: HTMLLabelElement = document.createElement("label");
      spsL.setAttribute("for", "sps");
      spsL.innerText = "SPS";
      let spsI: HTMLInputElement = document.createElement("input");
      spsI.type = "number";
      spsI.min = "0";
      spsI.max = "999";
      spsI.step = "1";
      spsI.id = "sps";
      spsI.value = this.animation.stepsPerSecond.toString();
      spsI.style.width = "40px";

      _tb.appendChild(spsL);
      _tb.appendChild(spsI);
      _tb.appendChild(document.createElement("br"));


      let buttons: HTMLButtonElement[] = [];
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons.push(document.createElement("button"));
      buttons[0].classList.add("fa", "fa-fast-backward", "start");
      buttons[1].classList.add("fa", "fa-backward", "back");
      buttons[2].classList.add("fa", "fa-play", "play");
      buttons[3].classList.add("fa", "fa-pause", "pause");
      buttons[4].classList.add("fa", "fa-forward", "forward");
      buttons[5].classList.add("fa", "fa-fast-forward", "end");
      buttons[6].classList.add("fa", "fa-file", "add-label");
      buttons[7].classList.add("fa", "fa-bookmark", "add-event");
      buttons[8].classList.add("fa", "fa-plus-square", "add-key");

      for (let b of buttons) {
        _tb.appendChild(b);
      }

    }

    private toolbarClick(_e: MouseEvent): void {
      // console.log("click", _e.target);

    }

    private toolbarChange(_e: MouseEvent): void {
      let target: HTMLInputElement = <HTMLInputElement>_e.target;

      switch (target.id) {
        case "playmode":
          console.log("playmode changed to", target.value);
          // console.log(FudgeCore.ANIMATION_PLAYMODE[target.value]);
          break;
        case "fps":
          console.log("fps changed to", target.value);
          if (!isNaN(+target.value))
            this.animation.fps = +target.value;
          break;
        case "sps":
          console.log("sps changed to", target.value);
          if (!isNaN(+target.value)) {
            this.animation.stepsPerSecond = +target.value;
            this.sheet.redraw();
          }
          // console.log(FudgeCore.ANIMATION_PLAYMODE[target.value]);
          break;
        default:
          console.log("no clue what you changed...");
          break;
      }
    }
  }

}