///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../UserInterface/Build/FudgeUI"/>
///<reference types="../../Build/Fudge"/>
var Fudge;
///<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../UserInterface/Build/FudgeUI"/>
///<reference types="../../Build/Fudge"/>
(function (Fudge) {
    /**
     * Creates, manipulates and administers an Animation View
     * @author Lukas Scheuerle, HFU, 2019
     */
    class ViewAnimation extends Fudge.View {
        constructor(_parent) {
            super(_parent);
            this.sheets = [];
            this.sheetIndex = 0;
            this.time = new FudgeCore.Time();
            this.playing = false;
            this.playbackTime = 0;
            // this.openAnimation();
        }
        /**
         * Opens the Animation attached to a given Node. Creates a new Node if no Node given.
         * @param _node The node that should be animated/has an animation that should be changed
         */
        openAnimation(_node = null) {
            //TODO: Remove dummy animation, replace with empty animation.
            let seq1 = new FudgeCore.AnimationSequence();
            seq1.addKey(new FudgeCore.AnimationKey(0, 0));
            seq1.addKey(new FudgeCore.AnimationKey(500, 45));
            seq1.addKey(new FudgeCore.AnimationKey(1500, -45));
            seq1.addKey(new FudgeCore.AnimationKey(2000, 0));
            let seq2 = new FudgeCore.AnimationSequence();
            // seq2.addKey(new FudgeCore.AnimationKey(0, 0));
            seq2.addKey(new FudgeCore.AnimationKey(500, 0, 0, 0.02));
            seq2.addKey(new FudgeCore.AnimationKey(1000, 5));
            seq2.addKey(new FudgeCore.AnimationKey(1500, 0, -0.02));
            this.animation = new FudgeCore.Animation("TestAnimation" /*, {
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
        fillContent() {
            this.toolbar = document.createElement("div");
            this.toolbar.id = "toolbar";
            this.toolbar.style.width = "300px";
            this.toolbar.style.height = "80px";
            this.toolbar.style.borderBottom = "1px solid black";
            this.fillToolbar(this.toolbar);
            this.attributeList = document.createElement("div");
            this.attributeList.id = "attributeList";
            this.attributeList.style.width = "300px";
            this.attributeList.addEventListener("mutatorUpdateEvent" /* UPDATE */, this.changeAttribute.bind(this));
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
            let sheetButton = document.createElement("button");
            sheetButton.innerText = "next Sheet";
            sheetButton.style.position = "absolute";
            sheetButton.style.bottom = "0";
            sheetButton.style.right = "0";
            sheetButton.addEventListener("click", this.nextSheet.bind(this));
            this.content.appendChild(sheetButton);
            this.sheets.push(new Fudge.ViewAnimationSheetDope(this, this.crc, new FudgeCore.Vector2(0.5, 1), new FudgeCore.Vector2(0, 0)));
            this.sheets.push(new Fudge.ViewAnimationSheetCurve(this, this.crc, new FudgeCore.Vector2(0.5, 2), new FudgeCore.Vector2(0, 200)));
            this.sheet = this.sheets[this.sheetIndex];
            this.sheet.redraw(this.playbackTime);
            this.addKeyButtons(this.controller.getElementIndex());
        }
        /**
         * adds all Listeners needed for the ViewAnimation to work.
         */
        installListeners() {
            this.canvas.addEventListener("click", this.mouseClickOnCanvas.bind(this));
            this.canvas.addEventListener("mousedown", this.mouseDownOnCanvas.bind(this));
            this.canvas.addEventListener("mousemove", this.mouseMoveOnCanvas.bind(this));
            this.canvas.addEventListener("mouseup", this.mouseUpOnCanvas.bind(this));
            this.toolbar.addEventListener("click", this.mouseClickOnToolbar.bind(this));
            this.toolbar.addEventListener("change", this.changeOnToolbar.bind(this));
            this.attributeList.addEventListener("click", this.mouseClickOnAttributeList.bind(this));
            requestAnimationFrame(this.playAnimation.bind(this));
        }
        deconstruct() {
            this.canvas.removeEventListener("click", this.mouseClickOnCanvas.bind(this));
            this.canvas.removeEventListener("mousedown", this.mouseDownOnCanvas.bind(this));
            this.canvas.removeEventListener("mousemove", this.mouseMoveOnCanvas.bind(this));
            this.canvas.removeEventListener("mouseup", this.mouseUpOnCanvas.bind(this));
            this.toolbar.removeEventListener("click", this.mouseClickOnToolbar.bind(this));
            this.toolbar.removeEventListener("change", this.changeOnToolbar.bind(this));
            this.attributeList.removeEventListener("click", this.mouseClickOnAttributeList.bind(this));
        }
        /**
         * Handles mouseclicks onto the canvas.
         * @param _e The MouseEvent resulting in this call.
         */
        mouseClickOnCanvas(_e) {
            // TODO: check if it'd be better to use this instead of mousedown in some occasions.
        }
        /**
         * handles mousedown events onto the canvas. Currently causes a key/label/event to be selected.
         * @param _e The MouseEvenet resulting in this call.
         */
        mouseDownOnCanvas(_e) {
            if (_e.offsetY < 50) {
                //TODO adjust time to fit into the sps
                this.setTime(_e.offsetX / this.sheet.scale.x);
                return;
            }
            let obj = this.sheet.getObjectAtPoint(_e.offsetX, _e.offsetY);
            if (!obj)
                return;
            if (obj["label"]) {
                console.log(obj["label"]);
                this.parentPanel.dispatchEvent(new CustomEvent("nodeSelectionEvent" /* SELECTION */, { detail: { name: obj["label"], time: this.animation.labels[obj["label"]] } }));
            }
            else if (obj["event"]) {
                console.log(obj["event"]);
                this.parentPanel.dispatchEvent(new CustomEvent("nodeSelectionEvent" /* SELECTION */, { detail: { name: obj["event"], time: this.animation.events[obj["event"]] } }));
            }
            else if (obj["key"]) {
                console.log(obj["key"]);
                this.parentPanel.dispatchEvent(new CustomEvent("nodeSelectionEvent" /* SELECTION */, { detail: obj["key"] }));
            }
            console.log(obj);
        }
        /**
         * handles mousemove on the canvas. currently only checks for a change of the replaytime but could be expanded to handle/propagate key manipulation/dragging.
         * @param _e The MouseEvent resulting in this call
         */
        mouseMoveOnCanvas(_e) {
            _e.preventDefault();
            if (_e.buttons != 1)
                return;
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
        mouseUpOnCanvas(_e) {
            // probably needed to handle key/label/event dragging
        }
        /**
         * Fills the toolbar with all its input elements / buttons / etc.
         * @param _tb the HtmlElement to add the toolbarelements to
         */
        fillToolbar(_tb) {
            let playmode = document.createElement("select");
            playmode.id = "playmode";
            for (let m in FudgeCore.ANIMATION_PLAYMODE) {
                if (isNaN(+m)) {
                    let op = document.createElement("option");
                    op.value = m;
                    op.innerText = m;
                    playmode.appendChild(op);
                }
            }
            _tb.appendChild(playmode);
            _tb.appendChild(document.createElement("br"));
            let fpsL = document.createElement("label");
            fpsL.setAttribute("for", "fps");
            fpsL.innerText = "FPS";
            let fpsI = document.createElement("input");
            fpsI.type = "number";
            fpsI.min = "0";
            fpsI.max = "999";
            fpsI.step = "1";
            fpsI.id = "fps";
            fpsI.value = this.animation.fps.toString();
            fpsI.style.width = "40px";
            _tb.appendChild(fpsL);
            _tb.appendChild(fpsI);
            let spsL = document.createElement("label");
            spsL.setAttribute("for", "sps");
            spsL.innerText = "SPS";
            let spsI = document.createElement("input");
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
            let buttons = [];
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
        mouseClickOnToolbar(_e) {
            let target = _e.target;
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
        changeOnToolbar(_e) {
            let target = _e.target;
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
        mouseClickOnAttributeList(_e) {
            if (_e.target instanceof HTMLButtonElement && _e.target.classList.contains("add-key")) {
                let inputElement = _e.target.parentElement.querySelector("input");
                let sequence = this.findSequenceToAddKeyTo(this.controller.getElementIndex(), this.animation.animationStructure, inputElement);
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
        findSequenceToAddKeyTo(_elementIndex, _sequenceIndex, _input) {
            let result = null;
            for (let key in _elementIndex) {
                if (_elementIndex[key] instanceof HTMLInputElement) {
                    if (_elementIndex[key] == _input) {
                        result = result || _sequenceIndex[key];
                    }
                }
                else {
                    result = result || this.findSequenceToAddKeyTo(_elementIndex[key], _sequenceIndex[key], _input);
                }
            }
            return result;
        }
        /**
         * Handle the change Event from the attributeList and apply it to the sequence in question.
         * Needed to allow for manipulation of the value of the keys inside the editor without going through ViewData.
         * @param _e ChangeEvent from the Attribute List that carries information on what was changed
         */
        changeAttribute(_e) {
            //TODO
        }
        /**
         * Updates everything to have a consistent display of the animation view
         * @param _m Mutator from the Animation to update the display with.
         */
        updateDisplay(_m = null) {
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
        setTime(_time, updateDisplay = true) {
            //TODO: check if it makes sense to not clamp the time to the max of animation.totalTime.
            this.playbackTime = Math.min(this.animation.totalTime, Math.max(0, _time));
            if (updateDisplay)
                this.updateDisplay();
        }
        /**
         * Gets called every animation frame. If the animation is currently supposed to be playing, play it.
         */
        playAnimation() {
            requestAnimationFrame(this.playAnimation.bind(this));
            if (!this.playing)
                return;
            let t = this.time.get();
            let m = {};
            [m, t] = this.cmpAnimator.updateAnimation(t);
            this.playbackTime = t;
            this.updateDisplay(m);
        }
        /**
         * Adds the "add key" buttons to the list.
         * @param _m the Mutator containing the htmlInputElements from the attribute List.
         */
        addKeyButtons(_m) {
            for (let key in _m) {
                if (_m[key] instanceof HTMLInputElement) {
                    let input = _m[key];
                    let button = document.createElement("button");
                    //TODO: change this to the actual icons
                    button.classList.add("fa", "fa-plus-square", "add-key");
                    input.parentElement.appendChild(button);
                }
                else {
                    this.addKeyButtons(_m[key]);
                }
            }
        }
        /**
         * Swaps the sheets to the next one in the list. currently there are only 2 sheets. Might be obsolete once there is a specific sheet selector.
         */
        nextSheet() {
            this.sheetIndex++;
            if (this.sheetIndex + 1 > this.sheets.length)
                this.sheetIndex = 0;
            this.sheet = this.sheets[this.sheetIndex];
            this.sheet.redraw(this.playbackTime);
        }
        /**
         * A small generator that creates "attribute-animal" strings to initialize new Events and Labels with.
         */
        randomNameGenerator() {
            let attr = ["red", "blue", "green", "pink", "yellow", "purple", "orange", "fast", "slow", "quick", "boring", "questionable", "king", "queen", "smart", "gold", "brown", "sluggish", "lazy", "hardworking", "amazing", "father", "mother", "baby"];
            let anim = ["cow", "fish", "elephant", "cat", "dog", "bat", "chameleon", "caterpillar", "crocodile", "hamster", "horse", "panda", "giraffe", "lukas", "koala", "jellyfish", "lion", "lizard", "platypus", "scorpion", "penguin", "pterodactyl"];
            return attr[Math.floor(Math.random() * attr.length)] + "-" + anim[Math.floor(Math.random() * anim.length)];
        }
    }
    Fudge.ViewAnimation = ViewAnimation;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * baseclass for different ways of visualising animations inside the ViewAnimation.
     * @author Lukas Scheuerle, HFU, 2019
     */
    class ViewAnimationSheet {
        //TODO rotate the y axis so positive values are up and negative are down. Might be easily doable by just changing scale.y to a negative number instead of a positive one.
        /**
         *
         * @param _view View this sheet is attached to
         * @param _crc The Canvas Rendering Context the sheet should draw onto
         * @param _scale The scale at which the sheet should render. Defaults to (1, 1)
         * @param _pos The position from which to start drawing. Defaults to (0, 0)
         * @author Lukas Scheuerle, HFU, 2019
         */
        constructor(_view, _crc, _scale = new FudgeCore.Vector2(1, 1), _pos = new FudgeCore.Vector2()) {
            this.keys = [];
            this.sequences = [];
            this.labels = [];
            this.events = [];
            this.view = _view;
            this.crc2 = _crc;
            this.scale = _scale;
            this.position = _pos;
        }
        /**
         * Sets the position of the sheet
         * @param _time the time to move to
         * @param _value the value to move to. Default: unchanged
         */
        moveTo(_time, _value = this.position.y) {
            this.position.x = _time;
            this.position.y = _value;
        }
        /**
         * Redraws the entire display of the animation.
         * @param _time the time at which to draw the cursor.
         */
        redraw(_time) {
            this.clear();
            this.transform();
            this.drawKeys();
            this.drawTimeline();
            this.drawEventsAndLabels();
            this.drawCursor(_time);
        }
        /**
         * Draws the timeline at the top of the canvas
         */
        drawTimeline() {
            this.crc2.strokeStyle = "black";
            this.crc2.resetTransform();
            //TODO stop using hardcoded values
            let timelineHeight = 50;
            let maxDistance = 10000;
            let timeline = new Path2D();
            this.crc2.fillStyle = "#7a7a7a";
            this.crc2.fillRect(0, 0, maxDistance, timelineHeight + 30);
            timeline.moveTo(0, timelineHeight);
            //TODO make this use some actually sensible numbers, maybe 2x the animation length
            timeline.lineTo(maxDistance, timelineHeight);
            //TODO: make this scale nicely/use the animations SPS
            let baseWidth = 1000;
            let pixelPerSecond = Math.floor(baseWidth * this.scale.x);
            let stepsPerSecond = this.view.animation.stepsPerSecond;
            let stepsPerDisplayText = 1;
            // [stepsPerSecond, stepsPerDisplayText] = this.calculateDisplay(pixelPerSecond);
            let pixelPerStep = pixelPerSecond / stepsPerSecond;
            let steps = 0;
            this.crc2.strokeStyle = "black";
            this.crc2.fillStyle = "black";
            for (let i = 0; i < maxDistance; i += pixelPerStep) {
                timeline.moveTo(i, timelineHeight);
                if (steps % stepsPerDisplayText == 0) {
                    //TODO: stop using hardcoded heights
                    timeline.lineTo(i, timelineHeight - 25);
                    this.crc2.fillText(steps.toString(), i - 3, timelineHeight - 28);
                    if (Math.round(i) % Math.round(1000 * this.scale.x) == 0)
                        //TODO: make the time display independent of the SPS display. Trying to tie the two together was a stupid idea.
                        this.crc2.fillText((Math.round(100 * (i / 1000 / this.scale.x)) / 100).toString() + "s", i - 3, 10);
                }
                else {
                    timeline.lineTo(i, timelineHeight - 20);
                }
                steps++;
            }
            this.crc2.stroke(timeline);
        }
        /**
         * Get the Object that is below a certain position
         * @param _x x position
         * @param _y y position
         * @returns The object at the given position. null if there is nothing of interest.
         */
        getObjectAtPoint(_x, _y) {
            //Timeline
            for (let l of this.labels) {
                if (this.crc2.isPointInPath(l.path2D, _x, _y)) {
                    return l;
                }
            }
            for (let e of this.events) {
                if (this.crc2.isPointInPath(e.path2D, _x, _y)) {
                    return e;
                }
            }
            //Keys
            _x = _x / this.scale.x - this.position.x;
            _y = _y / this.scale.y - this.position.y / this.scale.y;
            for (let k of this.keys) {
                if (this.crc2.isPointInPath(k.path2D, _x, _y)) {
                    return k;
                }
            }
            return null;
        }
        /**
         * Translates and scales the canvas to the saved position and scale
         */
        transform() {
            this.crc2.translate(this.position.x, this.position.y);
            this.crc2.scale(this.scale.x, this.scale.y);
        }
        /**
         * Traverses the animation structure to call for [drawSequence()] on the sequences inside the animation structure.
         * @param _animation the animation structure to traverse
         * @param _inputs the input strucutre to traverse. should have the same structure as _animation.
         */
        traverseStructures(_animation, _inputs) {
            for (let i in _animation) {
                if (_animation[i] instanceof FudgeCore.AnimationSequence) {
                    this.drawSequence(_animation[i], _inputs[i]);
                }
                else {
                    this.traverseStructures(_animation[i], _inputs[i]);
                }
            }
        }
        /**
         * Draws a key as a diamond shape.
         * ```
         *   /\
         *  /  \
         *  \  /
         *   \/
         * ```
         * @param _x x position to draw the key at (center)
         * @param _y y position to draw the key at (center)
         * @param _h height to draw the key with
         * @param _w width to draw the key with
         * @param _c the color to draw the key with
         */
        drawKey(_x, _y, _h, _w, _c) {
            let key = new Path2D();
            key.moveTo(_x - _w, _y);
            key.lineTo(_x, _y + _h);
            key.lineTo(_x + _w, _y);
            key.lineTo(_x, _y - _h);
            key.closePath();
            this.crc2.fillStyle = _c;
            this.crc2.strokeStyle = "black";
            this.crc2.lineWidth = 1;
            this.crc2.fill(key);
            this.crc2.stroke(key);
            return key;
        }
        /**
         * Starts the traversation of the structures to redraw all sequences and subsequently all keys
         */
        drawKeys() {
            //TODO: Fix that for some reason the first time this is called the rects of the input elements return all 0s and thus the sheet isn't properly drawn.
            //TODO: possible optimisation: only regenerate if necessary, otherwise load a saved image. (might lead to problems with the keys not being clickable anymore though)
            let inputMutator = this.view.controller.getElementIndex();
            //TODO: stop recreating the sequence elements all the time
            this.sequences = [];
            this.keys = [];
            this.traverseStructures(this.view.animation.animationStructure, inputMutator);
        }
        /**
         * (re)-draws all events and labels on top of the timeline
         */
        drawEventsAndLabels() {
            //TODO stop using hardcoded values
            let maxDistance = 10000;
            let labelDisplayHeight = 30 + 50;
            let line = new Path2D();
            line.moveTo(0, labelDisplayHeight);
            line.lineTo(maxDistance, labelDisplayHeight);
            this.crc2.strokeStyle = "black";
            this.crc2.fillStyle = "black";
            this.crc2.stroke(line);
            this.labels = [];
            this.events = [];
            if (!this.view.animation)
                return;
            for (let l in this.view.animation.labels) {
                //TODO stop using hardcoded values
                let p = new Path2D;
                this.labels.push({ label: l, path2D: p });
                let position = this.view.animation.labels[l] * this.scale.x;
                p.moveTo(position - 3, labelDisplayHeight - 28);
                p.lineTo(position - 3, labelDisplayHeight - 2);
                p.lineTo(position + 3, labelDisplayHeight - 2);
                p.lineTo(position + 3, labelDisplayHeight - 25);
                p.lineTo(position, labelDisplayHeight - 28);
                p.lineTo(position - 3, labelDisplayHeight - 28);
                this.crc2.fill(p);
                this.crc2.stroke(p);
                let p2 = new Path2D();
                p2.moveTo(position, labelDisplayHeight - 28);
                p2.lineTo(position, labelDisplayHeight - 25);
                p2.lineTo(position + 3, labelDisplayHeight - 25);
                this.crc2.strokeStyle = "white";
                this.crc2.stroke(p2);
                this.crc2.strokeStyle = "black";
            }
            for (let e in this.view.animation.events) {
                let p = new Path2D;
                this.events.push({ event: e, path2D: p });
                let position = this.view.animation.events[e] * this.scale.x;
                p.moveTo(position - 3, labelDisplayHeight - 28);
                p.lineTo(position - 3, labelDisplayHeight - 5);
                p.lineTo(position, labelDisplayHeight - 2);
                p.lineTo(position + 3, labelDisplayHeight - 5);
                p.lineTo(position + 3, labelDisplayHeight - 28);
                p.lineTo(position - 3, labelDisplayHeight - 28);
                // this.crc2.fill(p);
                this.crc2.stroke(p);
            }
        }
        /**
         * resets the transform and clears the canvas.
         */
        clear() {
            this.crc2.resetTransform();
            let maxDistance = 10000;
            this.crc2.clearRect(0, 0, maxDistance, this.crc2.canvas.height);
        }
        /**
         * draws the cursor on top of the canvas at the given time
         * @param _time the time to draw the cursor at
         */
        drawCursor(_time) {
            _time *= this.scale.x;
            let cursor = new Path2D();
            cursor.rect(_time - 3, 0, 6, 50);
            cursor.moveTo(_time, 50);
            cursor.lineTo(_time, this.crc2.canvas.height);
            this.crc2.strokeStyle = "red";
            this.crc2.fillStyle = "red";
            this.crc2.stroke(cursor);
            this.crc2.fill(cursor);
        }
        calculateDisplay(_ppS) {
            // let minPixelPerStep: number = 10;
            // let maxPixelPerStep: number = 50;
            // //TODO: use animation SPS
            // let currentPPS: number = _ppS;
            // while (currentPPS < minPixelPerStep || maxPixelPerStep < currentPPS) {
            //   if(currentPPS < minPixelPerStep) {
            //     currentPPS /= 1.5;
            //   }
            // }
            return [60, 10];
        }
    }
    Fudge.ViewAnimationSheet = ViewAnimationSheet;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Curve View visualisation of an Animation for the Animation View.
     * @author Lukas Scheuerle, HFU, 2019
     */
    class ViewAnimationSheetCurve extends Fudge.ViewAnimationSheet {
        drawKeys() {
            this.drawYScale();
            super.drawKeys();
        }
        drawSequence(_sequence, _input) {
            if (_sequence.length <= 0)
                return;
            if (_input.getBoundingClientRect().height <= 0)
                return;
            let rect = _input.getBoundingClientRect();
            let height = rect.height / this.scale.y;
            let width = rect.height / this.scale.x;
            let line = new Path2D();
            line.moveTo(0, _sequence.getKey(0).Value);
            //TODO: stop recreating the sequence element all the time
            //TODO: get color from input element or former sequence element.
            let seq = { color: this.randomPastellColor(), element: _input, sequence: _sequence };
            this.sequences.push(seq);
            for (let i = 0; i < _sequence.length; i++) {
                let k = _sequence.getKey(i);
                this.keys.push({ key: k, path2D: this.drawKey(k.Time, k.Value, height / 2, width / 2, seq.color), sequence: seq });
                if (i == 0) {
                    line.lineTo(k.Time, k.Value);
                }
                else {
                    let prevK = _sequence.getKey(i - 1);
                    let factor = (k.Time - prevK.Time) / 3;
                    let startTangentBezier = new FudgeCore.Vector2(1, prevK.SlopeOut);
                    startTangentBezier = FudgeCore.Vector2.SUM(FudgeCore.Vector2.SCALE(FudgeCore.Vector2.NORMALIZATION(startTangentBezier), factor * Math.max(1, Math.abs(prevK.SlopeOut))), new FudgeCore.Vector2(prevK.Time, prevK.Value));
                    let endTangentBezier = new FudgeCore.Vector2(-1, -k.SlopeIn);
                    endTangentBezier = FudgeCore.Vector2.SUM(FudgeCore.Vector2.SCALE(FudgeCore.Vector2.NORMALIZATION(endTangentBezier), factor * Math.max(1, Math.abs(k.SlopeIn))), new FudgeCore.Vector2(k.Time, k.Value));
                    line.bezierCurveTo(startTangentBezier.x, startTangentBezier.y, endTangentBezier.x, endTangentBezier.y, k.Time, k.Value);
                }
            }
            line.lineTo(this.view.animation.totalTime, _sequence.getKey(_sequence.length - 1).Value);
            this.crc2.strokeStyle = seq.color;
            this.crc2.stroke(line);
        }
        /**
         * draws a scale for the y axis.
         */
        drawYScale() {
            //TODO: make this actually look reasonable
            let pixelPerValue = this.calcScaleSize();
            let valuePerPixel = 1 / pixelPerValue;
            // console.log(pixelPerValue);
            this.crc2.strokeStyle = "black";
            this.crc2.lineWidth = 1 / this.scale.y;
            let line = new Path2D;
            line.moveTo(0, 0);
            line.lineTo(10000, 0);
            for (let i = 0; i < 2000; i = i + pixelPerValue) {
                line.moveTo(0, i);
                line.lineTo(10000, i);
            }
            this.crc2.stroke(line);
        }
        /**
         * attempts to calculate the optimal spacing and scale of the y scale visualisation
         */
        calcScaleSize() {
            let min = 10;
            let max = 25;
            let pixelPerValue = this.scale.y;
            while (pixelPerValue < min) {
                pixelPerValue *= 10;
            }
            while (pixelPerValue > max) {
                pixelPerValue /= 2;
            }
            return pixelPerValue;
        }
        /**
         * generates a random pastell-like color using hsl ([0, 360), 80%, 80%)
         */
        randomPastellColor() {
            return "hsl(" + Math.random() * 360 + ", 80%, 80%)";
        }
    }
    Fudge.ViewAnimationSheetCurve = ViewAnimationSheetCurve;
})(Fudge || (Fudge = {}));
var Fudge;
(function (Fudge) {
    /**
     * Dopesheet Visualisation of an Animation for the Animation Editor.
     * @author Lukas Scheuerle, HFU, 2019
     */
    class ViewAnimationSheetDope extends Fudge.ViewAnimationSheet {
        drawSequence(_sequence, _input) {
            let rect = _input.getBoundingClientRect();
            let y = rect.top - this.view.content.getBoundingClientRect().top + rect.height / 2;
            let height = rect.height;
            let width = rect.height / this.scale.x;
            let line = new Path2D();
            line.moveTo(0, y);
            line.lineTo(10000, y);
            this.crc2.strokeStyle = "black";
            this.crc2.stroke(line);
            let seq = { color: "red", element: _input, sequence: _sequence };
            this.sequences.push(seq);
            for (let i = 0; i < _sequence.length; i++) {
                let k = _sequence.getKey(i);
                this.keys.push({ key: k, path2D: this.drawKey(k.Time, y, height / 2, width / 2, seq.color), sequence: seq });
            }
        }
    }
    Fudge.ViewAnimationSheetDope = ViewAnimationSheetDope;
})(Fudge || (Fudge = {}));
///<reference types="../../Build/Fudge"/>
var Fudge;
///<reference types="../../Build/Fudge"/>
(function (Fudge) {
    /**
     * A Template to create an Animation Editor with.
     * @author Lukas Scheuerle, HFU, 2019
     */
    class ViewAnimationTemplate extends Fudge.PanelTemplate {
        constructor() {
            super();
            this.config = {
                type: "column",
                content: [
                    {
                        type: "row",
                        content: [
                            {
                                type: "component",
                                componentName: Fudge.VIEW.PORT,
                                title: "Viewport"
                            },
                            {
                                type: "component",
                                componentName: Fudge.VIEW.DATA,
                                title: "Inspector"
                            }
                        ]
                    },
                    {
                        type: "component",
                        componentName: Fudge.VIEW.ANIMATION,
                        title: "Animator"
                    }
                ]
            };
        }
    }
    Fudge.ViewAnimationTemplate = ViewAnimationTemplate;
})(Fudge || (Fudge = {}));
//# sourceMappingURL=ViewAnimation.js.map