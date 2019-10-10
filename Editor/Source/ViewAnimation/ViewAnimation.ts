///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../UserInterface/Build/FudgeUI"/>
///<reference types="../../Build/Fudge"/>

namespace Fudge {
  /**
   * Combines the key, its sequence and the visual representation of that key.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export interface ViewAnimationKey {
    key: FudgeCore.AnimationKey;
    path2D: Path2D;
    sequence: ViewAnimationSequence;
  }
  /**
   * Combines the Sequence, corresponding HTMLElement and color to display.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export interface ViewAnimationSequence {
    color: string;
    element: HTMLElement;
    sequence: FudgeCore.AnimationSequence;
  }
  /**
   * Combines the visual representation of an event and the event itself.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export interface ViewAnimationEvent {
    event: string;
    path2D: Path2D;
  }
  /**
   * Combines the visual representation of a label and the label itself.
   * @author Lukas Scheuerle, HFU, 2019
   */
  export interface ViewAnimationLabel {
    label: string;
    path2D: Path2D;
  }

  /**
   * Creates, manipulates and administers an Animation View
   * @author Lukas Scheuerle, HFU, 2019
   */
  export class ViewAnimation extends Fudge.View {
    node: FudgeCore.Node;
    animation: FudgeCore.Animation;
    cmpAnimator: FudgeCore.ComponentAnimator;
    playbackTime: number;
    controller: FudgeUserInterface.UIAnimationList;
    private canvas: HTMLCanvasElement;
    private attributeList: HTMLDivElement;
    private crc: CanvasRenderingContext2D;
    private sheet: ViewAnimationSheet;
    private sheets: ViewAnimationSheet[] = [];
    private sheetIndex: number = 0;
    private toolbar: HTMLDivElement;
    private hover: HTMLSpanElement;
    private time: FudgeCore.Time = new FudgeCore.Time();
    private playing: boolean = false;

    constructor(_parent: Panel) {
      super(_parent);
      this.playbackTime = 0;

      // this.openAnimation();
    }

    /**
     * Opens the Animation attached to a given Node. Creates a new Node if no Node given.
     * @param _node The node that should be animated/has an animation that should be changed
     */
    openAnimation(_node: FudgeCore.Node = null): void {
      //TODO: Remove dummy animation, replace with empty animation.
      let seq1: FudgeCore.AnimationSequence = new FudgeCore.AnimationSequence();
      seq1.addKey(new FudgeCore.AnimationKey(0, 0));
      seq1.addKey(new FudgeCore.AnimationKey(500, 45));
      seq1.addKey(new FudgeCore.AnimationKey(1500, -45));
      seq1.addKey(new FudgeCore.AnimationKey(2000, 0));
      let seq2: FudgeCore.AnimationSequence = new FudgeCore.AnimationSequence();
      // seq2.addKey(new FudgeCore.AnimationKey(0, 0));
      seq2.addKey(new FudgeCore.AnimationKey(500, 0, 0, 0.02));
      seq2.addKey(new FudgeCore.AnimationKey(1000, 5));
      seq2.addKey(new FudgeCore.AnimationKey(1500, 0, -0.02));
      this.animation = new FudgeCore.Animation("TestAnimation"/*, {
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
      }*/);
      this.animation.labels["One"] = 200;
      this.animation.labels["Two"] = 750;
      this.animation.setEvent("EventOne", 500);
      this.animation.setEvent("EventTwo", 1000);
      //End of dummy animation

      this.node = _node || new FudgeCore.Node("Testnode");
      this.cmpAnimator = this.node.getComponent(FudgeCore.ComponentAnimator);
      if (!this.cmpAnimator) {
        this.cmpAnimator = new FudgeCore.ComponentAnimator(this.animation);
        this.node.addComponent(this.cmpAnimator);
      }
      this.animation = this.cmpAnimator.animation;

      console.log("node", this.node);


      this.fillContent();
      this.installListeners();
    }

    fillContent(): void {
      this.toolbar = document.createElement("div");
      this.toolbar.id = "toolbar";
      this.toolbar.style.width = "300px";
      this.toolbar.style.height = "80px";
      this.toolbar.style.borderBottom = "1px solid black";
      this.fillToolbar(this.toolbar);

      this.attributeList = document.createElement("div");
      this.attributeList.id = "attributeList";
      this.attributeList.style.width = "300px";
      this.attributeList.addEventListener(FudgeUserInterface.UIEVENT.UPDATE, this.changeAttribute.bind(this));
      this.controller = new FudgeUserInterface.UIAnimationList(this.animation.getMutated(this.playbackTime, 0, FudgeCore.ANIMATION_PLAYBACK.TIMEBASED_CONTINOUS), this.attributeList);

      this.canvas = document.createElement("canvas");
      this.canvas.width = 1500;
      this.canvas.height = 500;
      this.canvas.style.position = "absolute";
      this.canvas.style.left = "300px";
      this.canvas.style.top = "0px";
      this.canvas.style.borderLeft = "1px solid black";
      this.crc = this.canvas.getContext("2d");
      this.hover = document.createElement("span");
      this.hover.style.background = "black";
      this.hover.style.color = "white";
      this.hover.style.position = "absolute";
      this.hover.style.display = "none";

      this.content.appendChild(this.toolbar);
      this.content.appendChild(this.attributeList);
      this.content.appendChild(this.canvas);
      this.content.appendChild(this.hover);

      let sheetButton: HTMLButtonElement = document.createElement("button");
      sheetButton.innerText = "next Sheet";
      sheetButton.style.position = "absolute";
      sheetButton.style.bottom = "0";
      sheetButton.style.right = "0";
      sheetButton.addEventListener("click", this.nextSheet.bind(this));
      this.content.appendChild(sheetButton);

      this.sheets.push(new ViewAnimationSheetDope(this, this.crc, new FudgeCore.Vector2(0.5, 1), new FudgeCore.Vector2(0, 0)));
      this.sheets.push(new ViewAnimationSheetCurve(this, this.crc, new FudgeCore.Vector2(0.5, 2), new FudgeCore.Vector2(0, 200)));
      this.sheet = this.sheets[this.sheetIndex];
      this.sheet.redraw(this.playbackTime);
      this.addKeyButtons(this.controller.getElementIndex());
    }

    /**
     * adds all Listeners needed for the ViewAnimation to work.
     */
    installListeners(): void {
      this.canvas.addEventListener("click", this.mouseClickOnCanvas.bind(this));
      this.canvas.addEventListener("mousedown", this.mouseDownOnCanvas.bind(this));
      this.canvas.addEventListener("mousemove", this.mouseMoveOnCanvas.bind(this));
      this.canvas.addEventListener("mouseup", this.mouseUpOnCanvas.bind(this));
      this.toolbar.addEventListener("click", this.mouseClickOnToolbar.bind(this));
      this.toolbar.addEventListener("change", this.changeOnToolbar.bind(this));
      this.attributeList.addEventListener("click", this.mouseClickOnAttributeList.bind(this));
      requestAnimationFrame(this.playAnimation.bind(this));
    }

    deconstruct(): void {
      this.canvas.removeEventListener("click", this.mouseClickOnCanvas.bind(this));
      this.canvas.removeEventListener("mousedown", this.mouseDownOnCanvas.bind(this));
      this.canvas.removeEventListener("mousemove", this.mouseMoveOnCanvas.bind(this));
      this.canvas.removeEventListener("mouseup", this.mouseUpOnCanvas.bind(this));
      this.toolbar.removeEventListener("click", this.mouseClickOnToolbar.bind(this));
      this.toolbar.removeEventListener("change", this.changeOnToolbar.bind(this));
      this.attributeList.removeEventListener("click", this.mouseClickOnAttributeList.bind(this));
    }

    addPropertyToAnimate(_m: FudgeCore.Mutator): void {
      //TODO: go through animation structure and merge with _m
    }

    /**
     * Handles mouseclicks onto the canvas.
     * @param _e The MouseEvent resulting in this call.
     */
    private mouseClickOnCanvas(_e: MouseEvent): void {
      // TODO: check if it'd be better to use this instead of mousedown in some occasions.
    }
    /**
     * handles mousedown events onto the canvas. Currently causes a key/label/event to be selected.
     * @param _e The MouseEvenet resulting in this call.
     */
    private mouseDownOnCanvas(_e: MouseEvent): void {
      if (_e.offsetY < 50) {
        //TODO adjust time to fit into the sps
        this.setTime(_e.offsetX / this.sheet.scale.x);
        return;
      }
      let obj: ViewAnimationLabel | ViewAnimationKey | ViewAnimationEvent = this.sheet.getObjectAtPoint(_e.offsetX, _e.offsetY);
      if (!obj) return;
      if (obj["label"]) {
        console.log(obj["label"]);
        this.parentPanel.dispatchEvent(new CustomEvent(FudgeUserInterface.UIEVENT.SELECTION, { detail: { name: obj["label"], time: this.animation.labels[obj["label"]] } }));
      }
      else if (obj["event"]) {
        console.log(obj["event"]);
        this.parentPanel.dispatchEvent(new CustomEvent(FudgeUserInterface.UIEVENT.SELECTION, { detail: { name: obj["event"], time: this.animation.events[obj["event"]] } }));
      }
      else if (obj["key"]) {
        console.log(obj["key"]);
        this.parentPanel.dispatchEvent(new CustomEvent(FudgeUserInterface.UIEVENT.SELECTION, { detail: obj["key"] }));
      }
      console.log(obj);
    }
    /**
     * handles mousemove on the canvas. currently only checks for a change of the replaytime but could be expanded to handle/propagate key manipulation/dragging.
     * @param _e The MouseEvent resulting in this call
     */
    private mouseMoveOnCanvas(_e: MouseEvent): void {
      _e.preventDefault();
      if (_e.buttons != 1) return;
      if (_e.offsetY < 50) {
        //TODO: adjust time to fit into the sps
        this.setTime(_e.offsetX / this.sheet.scale.x);
        return;
      }
      //TODO: handle key/label/event dragging
    }
    /**
     * handles mouseup events on the canvas. currently does nothing but may be needed in the future.
     * @param _e The MouseEvent resulting in this call
     */
    private mouseUpOnCanvas(_e: MouseEvent): void {
      // probably needed to handle key/label/event dragging
    }

    /**
     * Fills the toolbar with all its input elements / buttons / etc.
     * @param _tb the HtmlElement to add the toolbarelements to
     */
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
      //TODO: change this to the actual icons and stop using these placeholder icons
      buttons[0].classList.add("fa", "fa-fast-backward", "start");
      buttons[1].classList.add("fa", "fa-backward", "back");
      buttons[2].classList.add("fa", "fa-play", "play");
      buttons[3].classList.add("fa", "fa-pause", "pause");
      buttons[4].classList.add("fa", "fa-forward", "forward");
      buttons[5].classList.add("fa", "fa-fast-forward", "end");
      buttons[6].classList.add("fa", "fa-file", "add-label");
      buttons[7].classList.add("fa", "fa-bookmark", "add-event");
      buttons[0].id = "start";
      buttons[1].id = "back";
      buttons[2].id = "play";
      buttons[3].id = "pause";
      buttons[4].id = "forward";
      buttons[5].id = "end";
      buttons[6].id = "add-label";
      buttons[7].id = "add-event";

      for (let b of buttons) {
        _tb.appendChild(b);
      }
    }

    /**
     * Handles a click on the toolbar, checks which button it was and executed the corresponding code.
     * @param _e the MouseEvent reuslting in this call
     */
    private mouseClickOnToolbar(_e: MouseEvent): void {
      let target: HTMLInputElement = <HTMLInputElement>_e.target;
      switch (target.id) {
        case "add-label":
          this.animation.labels[this.randomNameGenerator()] = this.playbackTime;
          this.sheet.redraw(this.playbackTime);
          break;
        case "add-event":
          this.animation.setEvent(this.randomNameGenerator(), this.playbackTime);
          this.sheet.redraw(this.playbackTime);
          break;
        case "add-key":
            //TODO: add this back in once/if the button is moved back up from the individual lines.
          break;
        case "start":
          this.playbackTime = 0;
          this.updateDisplay();
          break;
        case "back":
          this.playbackTime = this.playbackTime -= 1000 / this.animation.stepsPerSecond;
          this.playbackTime = Math.max(this.playbackTime, 0);
          this.updateDisplay();
          break;
        case "play":
          this.time.set(this.playbackTime);
          this.playing = true;
          break;
        case "pause":
          this.playing = false;
          break;
        case "forward":
          this.playbackTime = this.playbackTime += 1000 / this.animation.stepsPerSecond;
          this.playbackTime = Math.min(this.playbackTime, this.animation.totalTime);
          this.updateDisplay();
          break;
        case "end":
          this.playbackTime = this.animation.totalTime;
          this.sheet.redraw(this.playbackTime);
          this.updateDisplay();
          break;
        default:

          break;
      }
    }

    /**
     * Handles changes of the input elements on the toolbar and reacts accordingly.
     * @param _e The ChangeEvent on one of the input elements of the Toolbar
     */
    private changeOnToolbar(_e: Event): void {
      let target: HTMLInputElement = <HTMLInputElement>_e.target;

      switch (target.id) {
        case "playmode":
          this.cmpAnimator.playmode = FudgeCore.ANIMATION_PLAYMODE[target.value];
          break;
        case "fps":
          if (!isNaN(+target.value))
            this.animation.fps = +target.value;
          break;
        case "sps":
          if (!isNaN(+target.value)) {
            this.animation.stepsPerSecond = +target.value;
            this.sheet.redraw(this.playbackTime);
          }
          break;
        default:
          console.log("no clue what you changed...");
          break;
      }
    }

    /**
     * Handles mouseClicks onto the attribute list. Currently only checks for the "add key" button to be clicked and adds a key.
     * @param _e the MouseEvent that resulted in this call
     */
    private mouseClickOnAttributeList(_e: MouseEvent): void {
      if (_e.target instanceof HTMLButtonElement && _e.target.classList.contains("add-key")) {
        let inputElement: HTMLInputElement = _e.target.parentElement.querySelector("input");
        let sequence: FudgeCore.AnimationSequence = this.findSequenceToAddKeyTo(this.controller.getElementIndex(), this.animation.animationStructure, inputElement);
        sequence.addKey(new FudgeCore.AnimationKey(this.playbackTime, sequence.evaluate(this.playbackTime)));
        this.sheet.redraw(this.playbackTime);
      }
    }

    /**
     * Runs recursively through the given structures looking for the clicked input Element to return the corresponding AnimationSequence.
     * @param _elementIndex The Mutator structure that holds the HTML Input Elements. Needs have the same structure as _squenceIndex
     * @param _sequenceIndex The AnimationStructure of the current animation
     * @param _input the InputElement to search for
     * @returns the corresponding AnimationSequence to the given input element
     */
    private findSequenceToAddKeyTo(_elementIndex: FudgeCore.Mutator, _sequenceIndex: FudgeCore.AnimationStructure, _input: HTMLElement): FudgeCore.AnimationSequence {
      let result: FudgeCore.AnimationSequence = null;
      for (let key in _elementIndex) {
        if (_elementIndex[key] instanceof HTMLInputElement) {
          if (_elementIndex[key] == _input) {
            result = result || <FudgeCore.AnimationSequence>_sequenceIndex[key];
          }
        } else {
          result = result || this.findSequenceToAddKeyTo(<FudgeCore.Mutator>_elementIndex[key], <FudgeCore.AnimationStructure>_sequenceIndex[key], _input);
        }
      }
      return result;
    }

    /**
     * Handle the change Event from the attributeList and apply it to the sequence in question. 
     * Needed to allow for manipulation of the value of the keys inside the editor without going through ViewData. 
     * @param _e ChangeEvent from the Attribute List that carries information on what was changed
     */
    private changeAttribute(_e: Event): void {
      //TODO
    }

    /**
     * Updates everything to have a consistent display of the animation view
     * @param _m Mutator from the Animation to update the display with.
     */
    private updateDisplay(_m: FudgeCore.Mutator = null): void {
      this.sheet.redraw(this.playbackTime);
      if (!_m)
        _m = this.animation.getMutated(this.playbackTime, 0, this.cmpAnimator.playback);
      // this.attributeList.innerHTML = "";
      // this.attributeList.appendChild(
      // this.controller.BuildFromMutator(_m);
      // this.controller = new FudgeUserInterface.UIAnimationList(_m, this.attributeList); //TODO: remove this hack, because it's horrible!
      this.controller.updateMutator(_m);
    }

    /**
     * Allows you to set the playback time. Will clamp the time between 0 and animation.totalTime. 
     * @param _time the time to set the playback time to.
     * @param updateDisplay should the display also be updated? Default: true
     */
    private setTime(_time: number, updateDisplay: boolean = true): void {
      //TODO: check if it makes sense to not clamp the time to the max of animation.totalTime.
      this.playbackTime = Math.min(this.animation.totalTime, Math.max(0, _time));
      if (updateDisplay) this.updateDisplay();
    }

    /**
     * Gets called every animation frame. If the animation is currently supposed to be playing, play it.
     */
    private playAnimation(): void {
      requestAnimationFrame(this.playAnimation.bind(this));
      if (!this.playing) return;
      let t: number = this.time.get();
      let m: FudgeCore.Mutator = {};
      [m, t] = this.cmpAnimator.updateAnimation(t);
      this.playbackTime = t;
      this.updateDisplay(m);
    }

    /**
     * Adds the "add key" buttons to the list.
     * @param _m the Mutator containing the htmlInputElements from the attribute List.
     */
    private addKeyButtons(_m: FudgeCore.Mutator): void {
      for (let key in _m) {
        if (_m[key] instanceof HTMLInputElement) {
          let input: HTMLInputElement = <HTMLInputElement>_m[key];
          let button: HTMLButtonElement = document.createElement("button");
          //TODO: change this to the actual icons
          button.classList.add("fa", "fa-plus-square", "add-key");
          input.parentElement.appendChild(button);
        } else {
          this.addKeyButtons(<FudgeCore.Mutator>_m[key]);
        }
      }
    }

    /**
     * Swaps the sheets to the next one in the list. currently there are only 2 sheets. Might be obsolete once there is a specific sheet selector.
     */
    private nextSheet(): void {
      this.sheetIndex++;
      if (this.sheetIndex + 1 > this.sheets.length) this.sheetIndex = 0;
      this.sheet = this.sheets[this.sheetIndex];
      this.sheet.redraw(this.playbackTime);
    }

    /**
     * A small generator that creates "attribute-animal" strings to initialize new Events and Labels with.
     */
    private randomNameGenerator(): string {
      let attr: string[] = ["red", "blue", "green", "pink", "yellow", "purple", "orange", "fast", "slow", "quick", "boring", "questionable", "king", "queen", "smart", "gold", "brown", "sluggish", "lazy", "hardworking", "amazing", "father", "mother", "baby"];
      let anim: string[] = ["cow", "fish", "elephant", "cat", "dog", "bat", "chameleon", "caterpillar", "crocodile", "hamster", "horse", "panda", "giraffe", "lukas", "koala", "jellyfish", "lion", "lizard", "platypus", "scorpion", "penguin", "pterodactyl"];

      return attr[Math.floor(Math.random() * attr.length)] + "-" + anim[Math.floor(Math.random() * anim.length)];
    }
  }


}