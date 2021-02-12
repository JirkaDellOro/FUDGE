"use strict";
// /<reference types="../../Core/Build/FudgeCore"/>
var ƒ = FudgeCore;
var ƒAid = FudgeAid;
var FudgeAid;
(function (FudgeAid) {
    ƒ.Serializer.registerNamespace(FudgeAid);
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    /**
     * Abstract class supporting versious arithmetical helper functions
     */
    class Arith {
        /**
         * Returns one of the values passed in, either _value if within _min and _max or the boundary being exceeded by _value
         */
        static clamp(_value, _min, _max, _isSmaller = (_value1, _value2) => { return _value1 < _value2; }) {
            if (_isSmaller(_value, _min))
                return _min;
            if (_isSmaller(_max, _value))
                return _max;
            return _value;
        }
    }
    FudgeAid.Arith = Arith;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    /**
     * Within a given precision, an object of this class finds the parameter value at which a given function
     * switches its boolean return value using interval splitting (bisection).
     * Pass the type of the parameter and the type the precision is measured in.
     */
    class ArithBisection {
        /**
         * Creates a new Solver
         * @param _function A function that takes an argument of the generic type <Parameter> and returns a boolean value.
         * @param _divide A function splitting the interval to find a parameter for the next iteration, may simply be the arithmetic mean
         * @param _isSmaller A function that determines a difference between the borders of the current interval and compares this to the given precision
         */
        constructor(_function, _divide, _isSmaller) {
            this.function = _function;
            this.divide = _divide;
            this.isSmaller = _isSmaller;
        }
        /**
         * Finds a solution with the given precision in the given interval using the functions this Solver was constructed with.
         * After the method returns, find the data in this objects properties.
         * @param _left The parameter on one side of the interval.
         * @param _right The parameter on the other side, may be "smaller" than [[_left]].
         * @param _epsilon The desired precision of the solution.
         * @param _leftValue The value on the left side of the interval, omit if yet unknown or pass in if known for better performance.
         * @param _rightValue The value on the right side of the interval, omit if yet unknown or pass in if known for better performance.
         * @throws Error if both sides of the interval return the same value.
         */
        solve(_left, _right, _epsilon, _leftValue = undefined, _rightValue = undefined) {
            this.left = _left;
            this.leftValue = _leftValue || this.function(_left);
            this.right = _right;
            this.rightValue = _rightValue || this.function(_right);
            if (this.isSmaller(_left, _right, _epsilon))
                return;
            if (this.leftValue == this.rightValue)
                throw (new Error("Interval solver can't operate with identical function values on both sides of the interval"));
            let between = this.divide(_left, _right);
            let betweenValue = this.function(between);
            if (betweenValue == this.leftValue)
                this.solve(between, this.right, _epsilon, betweenValue, this.rightValue);
            else
                this.solve(this.left, between, _epsilon, this.leftValue, betweenValue);
        }
        toString() {
            let out = "";
            out += `left: ${this.left.toString()} -> ${this.leftValue}`;
            out += "\n";
            out += `right: ${this.right.toString()} -> ${this.rightValue}`;
            return out;
        }
    }
    FudgeAid.ArithBisection = ArithBisection;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class CameraOrbit extends ƒ.Node {
        constructor(_cmpCamera, _distanceStart = 2, _maxRotX = 75, _minDistance = 1, _maxDistance = 10) {
            super("CameraOrbit");
            this.axisRotateX = new ƒ.Axis("RotateX", 1, 0 /* PROPORTIONAL */, true);
            this.axisRotateY = new ƒ.Axis("RotateY", 1, 0 /* PROPORTIONAL */, true);
            this.axisDistance = new ƒ.Axis("Distance", 1, 0 /* PROPORTIONAL */, true);
            this.hndAxisOutput = (_event) => {
                let output = _event.detail.output;
                switch (_event.target.name) {
                    case "RotateX":
                        this.rotateX(output);
                        break;
                    case "RotateY":
                        this.rotateY(output);
                        break;
                    case "Distance":
                        this.distance += output;
                }
            };
            this.maxRotX = Math.min(_maxRotX, 89);
            this.minDistance = _minDistance;
            this.maxDistance = _maxDistance;
            let cmpTransform = new ƒ.ComponentTransform();
            this.addComponent(cmpTransform);
            this.rotatorX = new ƒ.Node("CameraRotationX");
            this.rotatorX.addComponent(new ƒ.ComponentTransform());
            this.addChild(this.rotatorX);
            this.translator = new ƒ.Node("CameraTranslate");
            this.translator.addComponent(new ƒ.ComponentTransform());
            this.translator.mtxLocal.rotateY(180);
            this.rotatorX.addChild(this.translator);
            this.translator.addComponent(_cmpCamera);
            this.distance = _distanceStart;
            this.axisRotateX.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
            this.axisRotateY.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
            this.axisDistance.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
        }
        get component() {
            return this.translator.getComponent(ƒ.ComponentCamera);
        }
        get node() {
            return this.translator;
        }
        set distance(_distance) {
            let newDistance = Math.min(this.maxDistance, Math.max(this.minDistance, _distance));
            this.translator.mtxLocal.translation = ƒ.Vector3.Z(newDistance);
        }
        get distance() {
            return this.translator.mtxLocal.translation.z;
        }
        set rotationY(_angle) {
            this.mtxLocal.rotation = ƒ.Vector3.Y(_angle);
        }
        get rotationY() {
            return this.mtxLocal.rotation.y;
        }
        set rotationX(_angle) {
            _angle = Math.min(Math.max(-this.maxRotX, _angle), this.maxRotX);
            this.rotatorX.mtxLocal.rotation = ƒ.Vector3.X(_angle);
        }
        get rotationX() {
            return this.rotatorX.mtxLocal.rotation.x;
        }
        rotateY(_delta) {
            this.mtxLocal.rotateY(_delta);
        }
        rotateX(_delta) {
            this.rotationX = this.rotatorX.mtxLocal.rotation.x + _delta;
        }
    }
    FudgeAid.CameraOrbit = CameraOrbit;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class CameraOrbitMovingFocus extends FudgeAid.CameraOrbit {
        constructor(_cmpCamera, _distanceStart = 2, _maxRotX = 75, _minDistance = 1, _maxDistance = 10) {
            super(_cmpCamera, _distanceStart, _maxRotX, _minDistance, _maxDistance);
            this.axisTranslateX = new ƒ.Axis("TranslateX", 1, 0 /* PROPORTIONAL */, true);
            this.axisTranslateY = new ƒ.Axis("TranslateY", 1, 0 /* PROPORTIONAL */, true);
            this.axisTranslateZ = new ƒ.Axis("TranslateZ", 1, 0 /* PROPORTIONAL */, true);
            this.hndAxisOutput = (_event) => {
                let output = _event.detail.output;
                switch (_event.target.name) {
                    case "TranslateX":
                        this.translateX(output);
                        break;
                    case "TranslateY":
                        this.translateY(output);
                        break;
                    case "TranslateZ":
                        this.translateZ(output);
                }
            };
            this.name = "CameraOrbitMovingFocus";
            this.axisTranslateX.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
            this.axisTranslateY.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
            this.axisTranslateZ.addEventListener("output" /* OUTPUT */, this.hndAxisOutput);
        }
        translateX(_delta) {
            this.mtxLocal.translateX(_delta);
        }
        translateY(_delta) {
            let translation = this.rotatorX.mtxWorld.getY();
            translation.normalize(_delta);
            this.mtxLocal.translate(translation, false);
        }
        translateZ(_delta) {
            // this.mtxLocal.translateZ(_delta);
            let translation = this.rotatorX.mtxWorld.getZ();
            translation.normalize(_delta);
            this.mtxLocal.translate(translation, false);
        }
    }
    FudgeAid.CameraOrbitMovingFocus = CameraOrbitMovingFocus;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    let IMAGE_RENDERING;
    (function (IMAGE_RENDERING) {
        IMAGE_RENDERING["AUTO"] = "auto";
        IMAGE_RENDERING["SMOOTH"] = "smooth";
        IMAGE_RENDERING["HIGH_QUALITY"] = "high-quality";
        IMAGE_RENDERING["CRISP_EDGES"] = "crisp-edges";
        IMAGE_RENDERING["PIXELATED"] = "pixelated";
    })(IMAGE_RENDERING = FudgeAid.IMAGE_RENDERING || (FudgeAid.IMAGE_RENDERING = {}));
    /**
     * Adds comfort methods to create a render canvas
     */
    class Canvas {
        static create(_fillParent = true, _imageRendering = IMAGE_RENDERING.AUTO, _width = 800, _height = 600) {
            let canvas = document.createElement("canvas");
            canvas.id = "FUDGE";
            let style = canvas.style;
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
    FudgeAid.Canvas = Canvas;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class Node extends ƒ.Node {
        constructor(_name = Node.getNextName(), _transform, _material, _mesh) {
            super(_name);
            if (_transform)
                this.addComponent(new ƒ.ComponentTransform(_transform));
            if (_material)
                this.addComponent(new ƒ.ComponentMaterial(_material));
            if (_mesh)
                this.addComponent(new ƒ.ComponentMesh(_mesh));
        }
        static getNextName() {
            return "ƒAidNode_" + Node.count++;
        }
        get pivot() {
            let cmpMesh = this.getComponent(ƒ.ComponentMesh);
            return cmpMesh ? cmpMesh.pivot : null;
        }
        async deserialize(_serialization) {
            // Quick and maybe hacky solution. Created node is completely dismissed and a recreation of the baseclass gets return. Otherwise, components will be doubled...
            let node = new ƒ.Node(_serialization.name);
            await node.deserialize(_serialization);
            // console.log(node);
            return node;
        }
    }
    Node.count = 0;
    FudgeAid.Node = Node;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class NodeArrow extends FudgeAid.Node {
        constructor(_name, _color) {
            super(_name, ƒ.Matrix4x4.IDENTITY());
            let shaft = new FudgeAid.Node(_name + "Shaft", ƒ.Matrix4x4.IDENTITY(), NodeArrow.internalResources.get("Material"), NodeArrow.internalResources.get("Shaft"));
            let head = new FudgeAid.Node(_name + "Head", ƒ.Matrix4x4.IDENTITY(), NodeArrow.internalResources.get("Material"), NodeArrow.internalResources.get("Head"));
            shaft.mtxLocal.scale(new ƒ.Vector3(0.01, 1, 0.01));
            head.mtxLocal.translateY(0.5);
            head.mtxLocal.scale(new ƒ.Vector3(0.05, 0.1, 0.05));
            shaft.getComponent(ƒ.ComponentMaterial).clrPrimary = _color;
            head.getComponent(ƒ.ComponentMaterial).clrPrimary = _color;
            this.addChild(shaft);
            this.addChild(head);
        }
        static createInternalResources() {
            let map = new Map();
            map.set("Shaft", new ƒ.MeshCube("ArrowShaft"));
            map.set("Head", new ƒ.MeshPyramid("ArrowHead"));
            let coat = new ƒ.CoatColored(ƒ.Color.CSS("white"));
            map.set("Material", new ƒ.Material("Arrow", ƒ.ShaderUniColor, coat));
            map.forEach((_resource) => ƒ.Project.deregister(_resource));
            return map;
        }
    }
    NodeArrow.internalResources = NodeArrow.createInternalResources();
    FudgeAid.NodeArrow = NodeArrow;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class NodeCoordinateSystem extends FudgeAid.Node {
        constructor(_name = "CoordinateSystem", _transform) {
            super(_name, _transform);
            let arrowRed = new FudgeAid.NodeArrow("ArrowRed", new ƒ.Color(1, 0, 0, 1));
            let arrowGreen = new FudgeAid.NodeArrow("ArrowGreen", new ƒ.Color(0, 1, 0, 1));
            let arrowBlue = new FudgeAid.NodeArrow("ArrowBlue", new ƒ.Color(0, 0, 1, 1));
            arrowRed.mtxLocal.rotateZ(-90);
            arrowBlue.mtxLocal.rotateX(90);
            this.addChild(arrowRed);
            this.addChild(arrowGreen);
            this.addChild(arrowBlue);
        }
    }
    FudgeAid.NodeCoordinateSystem = NodeCoordinateSystem;
})(FudgeAid || (FudgeAid = {}));
/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>
var FudgeAid;
/// <reference path="../../../Core/Build/FudgeCore.d.ts"/>
(function (FudgeAid) {
    var ƒ = FudgeCore;
    /**
     * Adds a light setup to the node given, consisting of an ambient light, a directional key light and a directional back light.
     * Exept of the node to become the container, all parameters are optional and provided default values for general purpose.
     */
    function addStandardLightComponents(_node, _clrAmbient = new ƒ.Color(0.2, 0.2, 0.2), _clrKey = new ƒ.Color(0.9, 0.9, 0.9), _clrBack = new ƒ.Color(0.6, 0.6, 0.6), _posKey = new ƒ.Vector3(4, 12, 8), _posBack = new ƒ.Vector3(-1, -0.5, -3)) {
        let key = new ƒ.ComponentLight(new ƒ.LightDirectional(_clrKey));
        key.pivot.translate(_posKey);
        key.pivot.lookAt(ƒ.Vector3.ZERO());
        let back = new ƒ.ComponentLight(new ƒ.LightDirectional(_clrBack));
        back.pivot.translate(_posBack);
        back.pivot.lookAt(ƒ.Vector3.ZERO());
        let ambient = new ƒ.ComponentLight(new ƒ.LightAmbient(_clrAmbient));
        _node.addComponent(key);
        _node.addComponent(back);
        _node.addComponent(ambient);
    }
    FudgeAid.addStandardLightComponents = addStandardLightComponents;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    /**
     * Handles the animation cycle of a sprite on a [[Node]]
     */
    class NodeSprite extends ƒ.Node {
        constructor(_name) {
            super(_name);
            this.framerate = 12; // animation frames per second, single frames can be shorter or longer based on their timescale
            this.frameCurrent = 0;
            this.direction = 1;
            /**
             * Show the next frame of the sequence or start anew when the end or the start was reached, according to the direction of playing
             */
            this.showFrameNext = (_event) => {
                this.frameCurrent = (this.frameCurrent + this.direction + this.animation.frames.length) % this.animation.frames.length;
                this.showFrame(this.frameCurrent);
            };
            this.cmpMesh = new ƒ.ComponentMesh(NodeSprite.mesh);
            // Define coat from the SpriteSheet to use when rendering
            this.cmpMaterial = new ƒ.ComponentMaterial(new ƒ.Material(_name, ƒ.ShaderTexture, null));
            this.addComponent(this.cmpMesh);
            this.addComponent(this.cmpMaterial);
        }
        static createInternalResource() {
            let mesh = new ƒ.MeshSprite("Sprite");
            ƒ.Project.deregister(mesh);
            return mesh;
        }
        setAnimation(_animation) {
            this.animation = _animation;
            if (this.timer)
                ƒ.Time.game.deleteTimer(this.timer);
            this.showFrame(0);
        }
        /**
         * Show a specific frame of the sequence
         */
        showFrame(_index) {
            let spriteFrame = this.animation.frames[_index];
            this.cmpMesh.pivot = spriteFrame.mtxPivot;
            this.cmpMaterial.pivot = spriteFrame.mtxTexture;
            this.cmpMaterial.material.setCoat(this.animation.spritesheet);
            this.frameCurrent = _index;
            this.timer = ƒ.Time.game.setTimer(spriteFrame.timeScale * 1000 / this.framerate, 1, this.showFrameNext);
        }
        /**
         * Sets the direction for animation playback, negativ numbers make it play backwards.
         */
        setFrameDirection(_direction) {
            this.direction = Math.floor(_direction);
        }
    }
    NodeSprite.mesh = NodeSprite.createInternalResource();
    FudgeAid.NodeSprite = NodeSprite;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    /**
     * Describes a single frame of a sprite animation
     */
    class SpriteFrame {
    }
    FudgeAid.SpriteFrame = SpriteFrame;
    /**
     * Convenience for creating a [[CoatTexture]] to use as spritesheet
     */
    function createSpriteSheet(_name, _image) {
        let coat = new ƒ.CoatTextured();
        coat.name = _name;
        let texture = new ƒ.TextureImage();
        texture.image = _image;
        coat.texture = texture;
        return coat;
    }
    FudgeAid.createSpriteSheet = createSpriteSheet;
    /**
     * Handles a series of [[SpriteFrame]]s to be mapped onto a [[MeshSprite]]
     * Contains the [[MeshSprite]], the [[Material]] and the spritesheet-texture
     */
    class SpriteSheetAnimation {
        constructor(_name, _spritesheet) {
            this.frames = [];
            this.name = _name;
            this.spritesheet = _spritesheet;
        }
        /**
         * Stores a series of frames in this [[Sprite]], calculating the matrices to use in the components of a [[NodeSprite]]
         */
        generate(_rects, _resolutionQuad, _origin) {
            let img = this.spritesheet.texture.texImageSource;
            this.frames = [];
            let framing = new ƒ.FramingScaled();
            framing.setScale(1 / img.width, 1 / img.height);
            let count = 0;
            for (let rect of _rects) {
                let frame = this.createFrame(this.name + `${count}`, framing, rect, _resolutionQuad, _origin);
                frame.timeScale = 1;
                this.frames.push(frame);
                count++;
            }
        }
        /**
         * Add sprite frames using a grid on the spritesheet defined by a rectangle to start with, the number of frames,
         * the resolution which determines the size of the sprites mesh based on the number of pixels of the texture frame,
         * the offset from one cell of the grid to the next in the sequence and, in case the sequence spans over more than one row or column,
         * the offset to move the start rectangle when the margin of the texture is reached and wrapping occurs.
         */
        generateByGrid(_startRect, _frames, _resolutionQuad, _origin, _offsetNext, _offsetWrap = ƒ.Vector2.ZERO()) {
            let img = this.spritesheet.texture.texImageSource;
            let rectImage = new ƒ.Rectangle(0, 0, img.width, img.height);
            let rect = _startRect.copy;
            let rects = [];
            while (_frames--) {
                rects.push(rect.copy);
                rect.position.add(_offsetNext);
                if (rectImage.covers(rect))
                    continue;
                _startRect.position.add(_offsetWrap);
                rect = _startRect.copy;
                if (!rectImage.covers(rect))
                    break;
            }
            rects.forEach((_rect) => ƒ.Debug.log(_rect.toString()));
            this.generate(rects, _resolutionQuad, _origin);
        }
        createFrame(_name, _framing, _rect, _resolutionQuad, _origin) {
            let img = this.spritesheet.texture.texImageSource;
            let rectTexture = new ƒ.Rectangle(0, 0, img.width, img.height);
            let frame = new SpriteFrame();
            frame.rectTexture = _framing.getRect(_rect);
            frame.rectTexture.position = _framing.getPoint(_rect.position, rectTexture);
            let rectQuad = new ƒ.Rectangle(0, 0, _rect.width / _resolutionQuad, _rect.height / _resolutionQuad, _origin);
            frame.mtxPivot = ƒ.Matrix4x4.IDENTITY();
            frame.mtxPivot.translate(new ƒ.Vector3(rectQuad.position.x + rectQuad.size.x / 2, -rectQuad.position.y - rectQuad.size.y / 2, 0));
            frame.mtxPivot.scaleX(rectQuad.size.x);
            frame.mtxPivot.scaleY(rectQuad.size.y);
            // ƒ.Debug.log(rectQuad.toString());
            frame.mtxTexture = ƒ.Matrix3x3.IDENTITY();
            frame.mtxTexture.translate(frame.rectTexture.position);
            frame.mtxTexture.scale(frame.rectTexture.size);
            return frame;
        }
    }
    FudgeAid.SpriteSheetAnimation = SpriteSheetAnimation;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class ComponentStateMachine extends ƒ.ComponentScript {
        transit(_next) {
            this.instructions.transit(this.stateCurrent, _next, this);
        }
        act() {
            this.instructions.act(this.stateCurrent, this);
        }
    }
    FudgeAid.ComponentStateMachine = ComponentStateMachine;
})(FudgeAid || (FudgeAid = {}));
/**
 * State machine offers a structure and fundamental functionality for state machines
 * <State> should be an enum defining the various states of the machine
 */
var FudgeAid;
/**
 * State machine offers a structure and fundamental functionality for state machines
 * <State> should be an enum defining the various states of the machine
 */
(function (FudgeAid) {
    /**
     * Core functionality of the state machine, holding solely the current state and, while in transition, the next state,
     * the instructions for the machine and comfort methods to transit and act.
     */
    class StateMachine {
        transit(_next) {
            this.instructions.transit(this.stateCurrent, _next, this);
        }
        act() {
            this.instructions.act(this.stateCurrent, this);
        }
    }
    FudgeAid.StateMachine = StateMachine;
    /**
     * Set of instructions for a state machine. The set keeps all methods for dedicated actions defined for the states
     * and all dedicated methods defined for transitions to other states, as well as default methods.
     * Instructions exist independently from StateMachines. A statemachine instance is passed as parameter to the instruction set.
     * Multiple statemachine-instances can thus use the same instruction set and different instruction sets could operate on the same statemachine.
     */
    class StateMachineInstructions extends Map {
        /** Define dedicated transition method to transit from one state to another*/
        setTransition(_current, _next, _transition) {
            let active = this.getStateMethods(_current);
            active.transitions.set(_next, _transition);
        }
        /** Define dedicated action method for a state */
        setAction(_current, _action) {
            let active = this.getStateMethods(_current);
            active.action = _action;
        }
        /** Default transition method to invoke if no dedicated transition exists, should be overriden in subclass */
        transitDefault(_machine) {
            //
        }
        /** Default action method to invoke if no dedicated action exists, should be overriden in subclass */
        actDefault(_machine) {
            //
        }
        /** Invoke a dedicated transition method if found for the current and the next state, or the default method */
        transit(_current, _next, _machine) {
            _machine.stateNext = _next;
            try {
                let active = this.get(_current);
                let transition = active.transitions.get(_next);
                transition(_machine);
            }
            catch (_error) {
                // console.info(_error.message);
                this.transitDefault(_machine);
            }
            finally {
                _machine.stateCurrent = _next;
                _machine.stateNext = undefined;
            }
        }
        /** Invoke the dedicated action method if found for the current state, or the default method */
        act(_current, _machine) {
            try {
                let active = this.get(_current);
                active.action(_machine);
            }
            catch (_error) {
                // console.info(_error.message);
                this.actDefault(_machine);
            }
        }
        /** Find the instructions dedicated for the current state or create an empty set for it */
        getStateMethods(_current) {
            let active = this.get(_current);
            if (!active) {
                active = { action: null, transitions: new Map() };
                this.set(_current, active);
            }
            return active;
        }
    }
    FudgeAid.StateMachineInstructions = StateMachineInstructions;
})(FudgeAid || (FudgeAid = {}));
var FudgeAid;
(function (FudgeAid) {
    class Viewport {
        static expandCameraToInteractiveOrbit(_viewport, _showFocus = true, _speedCameraRotation = 1, _speedCameraTranslation = 0.01, _speedCameraDistance = 0.001) {
            _viewport.setFocus(true);
            _viewport.activatePointerEvent("\u0192pointermove" /* MOVE */, true);
            _viewport.activateWheelEvent("\u0192wheel" /* WHEEL */, true);
            _viewport.addEventListener("\u0192pointermove" /* MOVE */, hndPointerMove);
            _viewport.addEventListener("\u0192wheel" /* WHEEL */, hndWheelMove);
            let cntMouseHorizontal = new ƒ.Control("MouseHorizontal");
            let cntMouseVertical = new ƒ.Control("MouseVertical");
            let cntMouseWheel = new ƒ.Control("MouseWheel");
            // camera setup
            let camera;
            camera = new FudgeAid.CameraOrbitMovingFocus(_viewport.camera, 3, 80, 0.1, 50);
            // set up axis to control
            camera.axisRotateX.addControl(cntMouseVertical);
            camera.axisRotateX.setFactor(_speedCameraRotation);
            camera.axisRotateY.addControl(cntMouseHorizontal);
            camera.axisRotateY.setFactor(_speedCameraRotation);
            camera.axisTranslateX.addControl(cntMouseHorizontal);
            camera.axisTranslateX.setFactor(_speedCameraTranslation);
            camera.axisTranslateY.addControl(cntMouseVertical);
            camera.axisTranslateY.setFactor(_speedCameraTranslation);
            camera.axisTranslateZ.addControl(cntMouseWheel);
            camera.axisTranslateZ.setFactor(_speedCameraDistance);
            _viewport.getGraph().addChild(camera);
            let focus;
            if (_showFocus) {
                focus = new FudgeAid.NodeCoordinateSystem("Focus");
                focus.addComponent(new ƒ.ComponentTransform());
                _viewport.getGraph().addChild(focus);
            }
            return camera;
            function hndPointerMove(_event) {
                if (!((_event.buttons & 4) === 4))
                    return;
                activateAxis(_event);
                let posCamera = camera.node.mtxWorld.translation.copy;
                cntMouseHorizontal.setInput(_event.movementX);
                cntMouseVertical.setInput((_event.shiftKey ? -1 : 1) * _event.movementY);
                if (_showFocus)
                    focus.mtxLocal.translation = camera.mtxLocal.translation;
                //_viewport.draw();
                if (_event.altKey && !_event.shiftKey) {
                    let offset = ƒ.Vector3.DIFFERENCE(posCamera, camera.node.mtxWorld.translation);
                    // console.log(posCamera.toString(), camera.node.mtxWorld.translation.toString());
                    camera.mtxLocal.translate(offset, false);
                    focus.mtxLocal.translation = camera.mtxLocal.translation;
                    //_viewport.draw();
                }
            }
            function hndWheelMove(_event) {
                activateAxis(_event);
                if (_event.shiftKey) {
                    cntMouseWheel.setInput(_event.deltaY);
                }
                else
                    camera.distance += _event.deltaY * _speedCameraDistance;
                if (_showFocus)
                    focus.mtxLocal.translation = camera.mtxLocal.translation;
                //_viewport.draw();
            }
            function activateAxis(_event) {
                camera.axisTranslateX.active = _event.shiftKey;
                camera.axisTranslateY.active = _event.shiftKey;
                camera.axisTranslateZ.active = _event.shiftKey;
                camera.axisRotateX.active = !_event.shiftKey;
                camera.axisRotateY.active = !_event.shiftKey;
            }
        }
    }
    FudgeAid.Viewport = Viewport;
})(FudgeAid || (FudgeAid = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVkZ2VBaWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9Tb3VyY2UvUmVmZXJlbmNlcy50cyIsIi4uL1NvdXJjZS9Bcml0aG1ldGljL0FyaXRoLnRzIiwiLi4vU291cmNlL0FyaXRobWV0aWMvQXJpdGhCaXNlY3Rpb24udHMiLCIuLi9Tb3VyY2UvQ2FtZXJhL0NhbWVyYU9yYml0LnRzIiwiLi4vU291cmNlL0NhbWVyYS9DYW1lcmFPcmJpdE1vdmluZ0ZvY3VzLnRzIiwiLi4vU291cmNlL0NhbnZhcy9DYW52YXMudHMiLCIuLi9Tb3VyY2UvR2VvbWV0cnkvTm9kZS50cyIsIi4uL1NvdXJjZS9HZW9tZXRyeS9Ob2RlQXJyb3cudHMiLCIuLi9Tb3VyY2UvR2VvbWV0cnkvTm9kZUNvb3JkaW5hdGVTeXN0ZW0udHMiLCIuLi9Tb3VyY2UvTGlnaHQvTm9kZUxpZ2h0U2V0dXAudHMiLCIuLi9Tb3VyY2UvU3ByaXRlL05vZGVTcHJpdGUudHMiLCIuLi9Tb3VyY2UvU3ByaXRlL1Nwcml0ZVNoZWV0QW5pbWF0aW9uLnRzIiwiLi4vU291cmNlL1N0YXRlTWFjaGluZS9Db21wb25lbnRTdGF0ZU1hY2hpbmUudHMiLCIuLi9Tb3VyY2UvU3RhdGVNYWNoaW5lL1N0YXRlTWFjaGluZS50cyIsIi4uL1NvdXJjZS9WaWV3cG9ydC9WaWV3cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsbURBQW1EO0FBQ25ELElBQU8sQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUNyQixJQUFPLElBQUksR0FBRyxRQUFRLENBQUM7QUFDdkIsSUFBVSxRQUFRLENBRWpCO0FBRkQsV0FBVSxRQUFRO0lBQ2hCLENBQUMsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDM0MsQ0FBQyxFQUZTLFFBQVEsS0FBUixRQUFRLFFBRWpCO0FDTEQsSUFBVSxRQUFRLENBZWpCO0FBZkQsV0FBVSxRQUFRO0lBQ2hCOztPQUVHO0lBQ0gsTUFBc0IsS0FB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LENBQUM7Z0JBQy9DLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBQy9DLE1BQU0sQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUM7Z0JBRS9DLE1BQU0sQ0FBQyxXQUFXLENBQUMsTUFBTSxHQUFHLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFDN0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO1lBQy9DLENBQUM7UUFDSCxDQUFDO0tBQ0Y7SUF6RlksaUJBQVEsV0F5RnBCLENBQUE7QUFDSCxDQUFDLEVBM0ZTLFFBQVEsS0FBUixRQUFRLFFBMkZqQiIsInNvdXJjZXNDb250ZW50IjpbIi8vIC88cmVmZXJlbmNlIHR5cGVzPVwiLi4vLi4vQ29yZS9CdWlsZC9GdWRnZUNvcmVcIi8+XHJcbmltcG9ydCDGkiA9IEZ1ZGdlQ29yZTtcclxuaW1wb3J0IMaSQWlkID0gRnVkZ2VBaWQ7XHJcbm5hbWVzcGFjZSBGdWRnZUFpZCB7XHJcbiAgxpIuU2VyaWFsaXplci5yZWdpc3Rlck5hbWVzcGFjZShGdWRnZUFpZCk7XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xuICAvKipcbiAgICogQWJzdHJhY3QgY2xhc3Mgc3VwcG9ydGluZyB2ZXJzaW91cyBhcml0aG1ldGljYWwgaGVscGVyIGZ1bmN0aW9uc1xuICAgKi9cbiAgZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFyaXRoIHtcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgb25lIG9mIHRoZSB2YWx1ZXMgcGFzc2VkIGluLCBlaXRoZXIgX3ZhbHVlIGlmIHdpdGhpbiBfbWluIGFuZCBfbWF4IG9yIHRoZSBib3VuZGFyeSBiZWluZyBleGNlZWRlZCBieSBfdmFsdWVcbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGNsYW1wPFQ+KF92YWx1ZTogVCwgX21pbjogVCwgX21heDogVCwgX2lzU21hbGxlcjogKF92YWx1ZTE6IFQsIF92YWx1ZTI6IFQpID0+IGJvb2xlYW4gPSAoX3ZhbHVlMTogVCwgX3ZhbHVlMjogVCkgPT4geyByZXR1cm4gX3ZhbHVlMSA8IF92YWx1ZTI7IH0pOiBUIHtcbiAgICAgIGlmIChfaXNTbWFsbGVyKF92YWx1ZSwgX21pbikpIHJldHVybiBfbWluO1xuICAgICAgaWYgKF9pc1NtYWxsZXIoX21heCwgX3ZhbHVlKSkgcmV0dXJuIF9tYXg7XG4gICAgICByZXR1cm4gX3ZhbHVlO1xuICAgIH1cbiAgfVxufSIsIm5hbWVzcGFjZSBGdWRnZUFpZCB7XG4gIC8qKlxuICAgKiBXaXRoaW4gYSBnaXZlbiBwcmVjaXNpb24sIGFuIG9iamVjdCBvZiB0aGlzIGNsYXNzIGZpbmRzIHRoZSBwYXJhbWV0ZXIgdmFsdWUgYXQgd2hpY2ggYSBnaXZlbiBmdW5jdGlvbiBcbiAgICogc3dpdGNoZXMgaXRzIGJvb2xlYW4gcmV0dXJuIHZhbHVlIHVzaW5nIGludGVydmFsIHNwbGl0dGluZyAoYmlzZWN0aW9uKS4gXG4gICAqIFBhc3MgdGhlIHR5cGUgb2YgdGhlIHBhcmFtZXRlciBhbmQgdGhlIHR5cGUgdGhlIHByZWNpc2lvbiBpcyBtZWFzdXJlZCBpbi5cbiAgICovXG4gIGV4cG9ydCBjbGFzcyBBcml0aEJpc2VjdGlvbjxQYXJhbWV0ZXIsIEVwc2lsb24+IHtcbiAgICAvKiogVGhlIGxlZnQgYm9yZGVyIG9mIHRoZSBpbnRlcnZhbCBmb3VuZCAqL1xuICAgIHB1YmxpYyBsZWZ0OiBQYXJhbWV0ZXI7XG4gICAgLyoqIFRoZSByaWdodCBib3JkZXIgb2YgdGhlIGludGVydmFsIGZvdW5kICovXG4gICAgcHVibGljIHJpZ2h0OiBQYXJhbWV0ZXI7XG4gICAgLyoqIFRoZSBmdW5jdGlvbiB2YWx1ZSBhdCB0aGUgbGVmdCBib3JkZXIgb2YgdGhlIGludGVydmFsIGZvdW5kICovXG4gICAgcHVibGljIGxlZnRWYWx1ZTogYm9vbGVhbjtcbiAgICAvKiogVGhlIGZ1bmN0aW9uIHZhbHVlIGF0IHRoZSByaWdodCBib3JkZXIgb2YgdGhlIGludGVydmFsIGZvdW5kICovXG4gICAgcHVibGljIHJpZ2h0VmFsdWU6IGJvb2xlYW47XG5cbiAgICBwcml2YXRlIGZ1bmN0aW9uOiAoX3Q6IFBhcmFtZXRlcikgPT4gYm9vbGVhbjtcbiAgICBwcml2YXRlIGRpdmlkZTogKF9sZWZ0OiBQYXJhbWV0ZXIsIF9yaWdodDogUGFyYW1ldGVyKSA9PiBQYXJhbWV0ZXI7XG4gICAgcHJpdmF0ZSBpc1NtYWxsZXI6IChfbGVmdDogUGFyYW1ldGVyLCBfcmlnaHQ6IFBhcmFtZXRlciwgX2Vwc2lsb246IEVwc2lsb24pID0+IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFNvbHZlclxuICAgICAqIEBwYXJhbSBfZnVuY3Rpb24gQSBmdW5jdGlvbiB0aGF0IHRha2VzIGFuIGFyZ3VtZW50IG9mIHRoZSBnZW5lcmljIHR5cGUgPFBhcmFtZXRlcj4gYW5kIHJldHVybnMgYSBib29sZWFuIHZhbHVlLlxuICAgICAqIEBwYXJhbSBfZGl2aWRlIEEgZnVuY3Rpb24gc3BsaXR0aW5nIHRoZSBpbnRlcnZhbCB0byBmaW5kIGEgcGFyYW1ldGVyIGZvciB0aGUgbmV4dCBpdGVyYXRpb24sIG1heSBzaW1wbHkgYmUgdGhlIGFyaXRobWV0aWMgbWVhblxuICAgICAqIEBwYXJhbSBfaXNTbWFsbGVyIEEgZnVuY3Rpb24gdGhhdCBkZXRlcm1pbmVzIGEgZGlmZmVyZW5jZSBiZXR3ZWVuIHRoZSBib3JkZXJzIG9mIHRoZSBjdXJyZW50IGludGVydmFsIGFuZCBjb21wYXJlcyB0aGlzIHRvIHRoZSBnaXZlbiBwcmVjaXNpb24gXG4gICAgICovXG4gICAgY29uc3RydWN0b3IoXG4gICAgICBfZnVuY3Rpb246IChfdDogUGFyYW1ldGVyKSA9PiBib29sZWFuLFxuICAgICAgX2RpdmlkZTogKF9sZWZ0OiBQYXJhbWV0ZXIsIF9yaWdodDogUGFyYW1ldGVyKSA9PiBQYXJhbWV0ZXIsXG4gICAgICBfaXNTbWFsbGVyOiAoX2xlZnQ6IFBhcmFtZXRlciwgX3JpZ2h0OiBQYXJhbWV0ZXIsIF9lcHNpbG9uOiBFcHNpbG9uKSA9PiBib29sZWFuKSB7XG4gICAgICB0aGlzLmZ1bmN0aW9uID0gX2Z1bmN0aW9uO1xuICAgICAgdGhpcy5kaXZpZGUgPSBfZGl2aWRlO1xuICAgICAgdGhpcy5pc1NtYWxsZXIgPSBfaXNTbWFsbGVyO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEZpbmRzIGEgc29sdXRpb24gd2l0aCB0aGUgZ2l2ZW4gcHJlY2lzaW9uIGluIHRoZSBnaXZlbiBpbnRlcnZhbCB1c2luZyB0aGUgZnVuY3Rpb25zIHRoaXMgU29sdmVyIHdhcyBjb25zdHJ1Y3RlZCB3aXRoLlxuICAgICAqIEFmdGVyIHRoZSBtZXRob2QgcmV0dXJucywgZmluZCB0aGUgZGF0YSBpbiB0aGlzIG9iamVjdHMgcHJvcGVydGllcy5cbiAgICAgKiBAcGFyYW0gX2xlZnQgVGhlIHBhcmFtZXRlciBvbiBvbmUgc2lkZSBvZiB0aGUgaW50ZXJ2YWwuXG4gICAgICogQHBhcmFtIF9yaWdodCBUaGUgcGFyYW1ldGVyIG9uIHRoZSBvdGhlciBzaWRlLCBtYXkgYmUgXCJzbWFsbGVyXCIgdGhhbiBbW19sZWZ0XV0uXG4gICAgICogQHBhcmFtIF9lcHNpbG9uIFRoZSBkZXNpcmVkIHByZWNpc2lvbiBvZiB0aGUgc29sdXRpb24uXG4gICAgICogQHBhcmFtIF9sZWZ0VmFsdWUgVGhlIHZhbHVlIG9uIHRoZSBsZWZ0IHNpZGUgb2YgdGhlIGludGVydmFsLCBvbWl0IGlmIHlldCB1bmtub3duIG9yIHBhc3MgaW4gaWYga25vd24gZm9yIGJldHRlciBwZXJmb3JtYW5jZS5cbiAgICAgKiBAcGFyYW0gX3JpZ2h0VmFsdWUgVGhlIHZhbHVlIG9uIHRoZSByaWdodCBzaWRlIG9mIHRoZSBpbnRlcnZhbCwgb21pdCBpZiB5ZXQgdW5rbm93biBvciBwYXNzIGluIGlmIGtub3duIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2UuXG4gICAgICogQHRocm93cyBFcnJvciBpZiBib3RoIHNpZGVzIG9mIHRoZSBpbnRlcnZhbCByZXR1cm4gdGhlIHNhbWUgdmFsdWUuXG4gICAgICovXG4gICAgcHVibGljIHNvbHZlKF9sZWZ0OiBQYXJhbWV0ZXIsIF9yaWdodDogUGFyYW1ldGVyLCBfZXBzaWxvbjogRXBzaWxvbiwgX2xlZnRWYWx1ZTogYm9vbGVhbiA9IHVuZGVmaW5lZCwgX3JpZ2h0VmFsdWU6IGJvb2xlYW4gPSB1bmRlZmluZWQpOiB2b2lkIHtcbiAgICAgIHRoaXMubGVmdCA9IF9sZWZ0O1xuICAgICAgdGhpcy5sZWZ0VmFsdWUgPSBfbGVmdFZhbHVlIHx8IHRoaXMuZnVuY3Rpb24oX2xlZnQpO1xuICAgICAgdGhpcy5yaWdodCA9IF9yaWdodDtcbiAgICAgIHRoaXMucmlnaHRWYWx1ZSA9IF9yaWdodFZhbHVlIHx8IHRoaXMuZnVuY3Rpb24oX3JpZ2h0KTtcblxuICAgICAgaWYgKHRoaXMuaXNTbWFsbGVyKF9sZWZ0LCBfcmlnaHQsIF9lcHNpbG9uKSlcbiAgICAgICAgcmV0dXJuO1xuXG4gICAgICBpZiAodGhpcy5sZWZ0VmFsdWUgPT0gdGhpcy5yaWdodFZhbHVlKVxuICAgICAgICB0aHJvdyhuZXcgRXJyb3IoXCJJbnRlcnZhbCBzb2x2ZXIgY2FuJ3Qgb3BlcmF0ZSB3aXRoIGlkZW50aWNhbCBmdW5jdGlvbiB2YWx1ZXMgb24gYm90aCBzaWRlcyBvZiB0aGUgaW50ZXJ2YWxcIikpO1xuXG4gICAgICBsZXQgYmV0d2VlbjogUGFyYW1ldGVyID0gdGhpcy5kaXZpZGUoX2xlZnQsIF9yaWdodCk7XG4gICAgICBsZXQgYmV0d2VlblZhbHVlOiBib29sZWFuID0gdGhpcy5mdW5jdGlvbihiZXR3ZWVuKTtcbiAgICAgIGlmIChiZXR3ZWVuVmFsdWUgPT0gdGhpcy5sZWZ0VmFsdWUpXG4gICAgICAgIHRoaXMuc29sdmUoYmV0d2VlbiwgdGhpcy5yaWdodCwgX2Vwc2lsb24sIGJldHdlZW5WYWx1ZSwgdGhpcy5yaWdodFZhbHVlKTtcbiAgICAgIGVsc2VcbiAgICAgICAgdGhpcy5zb2x2ZSh0aGlzLmxlZnQsIGJldHdlZW4sIF9lcHNpbG9uLCB0aGlzLmxlZnRWYWx1ZSwgYmV0d2VlblZhbHVlKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nIHtcbiAgICAgIGxldCBvdXQ6IHN0cmluZyA9IFwiXCI7XG4gICAgICBvdXQgKz0gYGxlZnQ6ICR7dGhpcy5sZWZ0LnRvU3RyaW5nKCl9IC0+ICR7dGhpcy5sZWZ0VmFsdWV9YDtcbiAgICAgIG91dCArPSBcIlxcblwiO1xuICAgICAgb3V0ICs9IGByaWdodDogJHt0aGlzLnJpZ2h0LnRvU3RyaW5nKCl9IC0+ICR7dGhpcy5yaWdodFZhbHVlfWA7XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH1cbiAgfVxufSIsIm5hbWVzcGFjZSBGdWRnZUFpZCB7XHJcbiAgaW1wb3J0IMaSID0gRnVkZ2VDb3JlO1xyXG5cclxuICBleHBvcnQgY2xhc3MgQ2FtZXJhT3JiaXQgZXh0ZW5kcyDGki5Ob2RlIHtcclxuICAgIHB1YmxpYyByZWFkb25seSBheGlzUm90YXRlWDogxpIuQXhpcyA9IG5ldyDGki5BeGlzKFwiUm90YXRlWFwiLCAxLCDGki5DT05UUk9MX1RZUEUuUFJPUE9SVElPTkFMLCB0cnVlKTtcclxuICAgIHB1YmxpYyByZWFkb25seSBheGlzUm90YXRlWTogxpIuQXhpcyA9IG5ldyDGki5BeGlzKFwiUm90YXRlWVwiLCAxLCDGki5DT05UUk9MX1RZUEUuUFJPUE9SVElPTkFMLCB0cnVlKTtcclxuICAgIHB1YmxpYyByZWFkb25seSBheGlzRGlzdGFuY2U6IMaSLkF4aXMgPSBuZXcgxpIuQXhpcyhcIkRpc3RhbmNlXCIsIDEsIMaSLkNPTlRST0xfVFlQRS5QUk9QT1JUSU9OQUwsIHRydWUpO1xyXG5cclxuICAgIHByb3RlY3RlZCB0cmFuc2xhdG9yOiDGki5Ob2RlO1xyXG4gICAgcHJvdGVjdGVkIHJvdGF0b3JYOiDGki5Ob2RlO1xyXG4gICAgcHJpdmF0ZSBtYXhSb3RYOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG1pbkRpc3RhbmNlOiBudW1iZXI7XHJcbiAgICBwcml2YXRlIG1heERpc3RhbmNlOiBudW1iZXI7XHJcblxyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKF9jbXBDYW1lcmE6IMaSLkNvbXBvbmVudENhbWVyYSwgX2Rpc3RhbmNlU3RhcnQ6IG51bWJlciA9IDIsIF9tYXhSb3RYOiBudW1iZXIgPSA3NSwgX21pbkRpc3RhbmNlOiBudW1iZXIgPSAxLCBfbWF4RGlzdGFuY2U6IG51bWJlciA9IDEwKSB7XHJcbiAgICAgIHN1cGVyKFwiQ2FtZXJhT3JiaXRcIik7XHJcblxyXG4gICAgICB0aGlzLm1heFJvdFggPSBNYXRoLm1pbihfbWF4Um90WCwgODkpO1xyXG4gICAgICB0aGlzLm1pbkRpc3RhbmNlID0gX21pbkRpc3RhbmNlO1xyXG4gICAgICB0aGlzLm1heERpc3RhbmNlID0gX21heERpc3RhbmNlO1xyXG5cclxuICAgICAgbGV0IGNtcFRyYW5zZm9ybTogxpIuQ29tcG9uZW50VHJhbnNmb3JtID0gbmV3IMaSLkNvbXBvbmVudFRyYW5zZm9ybSgpO1xyXG4gICAgICB0aGlzLmFkZENvbXBvbmVudChjbXBUcmFuc2Zvcm0pO1xyXG5cclxuICAgICAgdGhpcy5yb3RhdG9yWCA9IG5ldyDGki5Ob2RlKFwiQ2FtZXJhUm90YXRpb25YXCIpO1xyXG4gICAgICB0aGlzLnJvdGF0b3JYLmFkZENvbXBvbmVudChuZXcgxpIuQ29tcG9uZW50VHJhbnNmb3JtKCkpO1xyXG4gICAgICB0aGlzLmFkZENoaWxkKHRoaXMucm90YXRvclgpO1xyXG4gICAgICB0aGlzLnRyYW5zbGF0b3IgPSBuZXcgxpIuTm9kZShcIkNhbWVyYVRyYW5zbGF0ZVwiKTtcclxuICAgICAgdGhpcy50cmFuc2xhdG9yLmFkZENvbXBvbmVudChuZXcgxpIuQ29tcG9uZW50VHJhbnNmb3JtKCkpO1xyXG4gICAgICB0aGlzLnRyYW5zbGF0b3IubXR4TG9jYWwucm90YXRlWSgxODApO1xyXG4gICAgICB0aGlzLnJvdGF0b3JYLmFkZENoaWxkKHRoaXMudHJhbnNsYXRvcik7XHJcblxyXG4gICAgICB0aGlzLnRyYW5zbGF0b3IuYWRkQ29tcG9uZW50KF9jbXBDYW1lcmEpO1xyXG4gICAgICB0aGlzLmRpc3RhbmNlID0gX2Rpc3RhbmNlU3RhcnQ7XHJcblxyXG4gICAgICB0aGlzLmF4aXNSb3RhdGVYLmFkZEV2ZW50TGlzdGVuZXIoxpIuRVZFTlRfQ09OVFJPTC5PVVRQVVQsIHRoaXMuaG5kQXhpc091dHB1dCk7XHJcbiAgICAgIHRoaXMuYXhpc1JvdGF0ZVkuYWRkRXZlbnRMaXN0ZW5lcijGki5FVkVOVF9DT05UUk9MLk9VVFBVVCwgdGhpcy5obmRBeGlzT3V0cHV0KTtcclxuICAgICAgdGhpcy5heGlzRGlzdGFuY2UuYWRkRXZlbnRMaXN0ZW5lcijGki5FVkVOVF9DT05UUk9MLk9VVFBVVCwgdGhpcy5obmRBeGlzT3V0cHV0KTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNvbXBvbmVudCgpOiDGki5Db21wb25lbnRDYW1lcmEge1xyXG4gICAgICByZXR1cm4gdGhpcy50cmFuc2xhdG9yLmdldENvbXBvbmVudCjGki5Db21wb25lbnRDYW1lcmEpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbm9kZSgpOiDGki5Ob2RlIHtcclxuICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRvcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGRpc3RhbmNlKF9kaXN0YW5jZTogbnVtYmVyKSB7XHJcbiAgICAgIGxldCBuZXdEaXN0YW5jZTogbnVtYmVyID0gTWF0aC5taW4odGhpcy5tYXhEaXN0YW5jZSwgTWF0aC5tYXgodGhpcy5taW5EaXN0YW5jZSwgX2Rpc3RhbmNlKSk7XHJcbiAgICAgIHRoaXMudHJhbnNsYXRvci5tdHhMb2NhbC50cmFuc2xhdGlvbiA9IMaSLlZlY3RvcjMuWihuZXdEaXN0YW5jZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBkaXN0YW5jZSgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy50cmFuc2xhdG9yLm10eExvY2FsLnRyYW5zbGF0aW9uLno7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCByb3RhdGlvblkoX2FuZ2xlOiBudW1iZXIpIHtcclxuICAgICAgdGhpcy5tdHhMb2NhbC5yb3RhdGlvbiA9IMaSLlZlY3RvcjMuWShfYW5nbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgcm90YXRpb25ZKCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLm10eExvY2FsLnJvdGF0aW9uLnk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCByb3RhdGlvblgoX2FuZ2xlOiBudW1iZXIpIHtcclxuICAgICAgX2FuZ2xlID0gTWF0aC5taW4oTWF0aC5tYXgoLXRoaXMubWF4Um90WCwgX2FuZ2xlKSwgdGhpcy5tYXhSb3RYKTtcclxuICAgICAgdGhpcy5yb3RhdG9yWC5tdHhMb2NhbC5yb3RhdGlvbiA9IMaSLlZlY3RvcjMuWChfYW5nbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgcm90YXRpb25YKCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLnJvdGF0b3JYLm10eExvY2FsLnJvdGF0aW9uLng7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJvdGF0ZVkoX2RlbHRhOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5tdHhMb2NhbC5yb3RhdGVZKF9kZWx0YSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJvdGF0ZVgoX2RlbHRhOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5yb3RhdGlvblggPSB0aGlzLnJvdGF0b3JYLm10eExvY2FsLnJvdGF0aW9uLnggKyBfZGVsdGE7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGhuZEF4aXNPdXRwdXQ6IEV2ZW50TGlzdGVuZXIgPSAoX2V2ZW50OiBFdmVudCk6IHZvaWQgPT4ge1xyXG4gICAgICBsZXQgb3V0cHV0OiBudW1iZXIgPSAoPEN1c3RvbUV2ZW50Pl9ldmVudCkuZGV0YWlsLm91dHB1dDtcclxuICAgICAgc3dpdGNoICgoPMaSLkF4aXM+X2V2ZW50LnRhcmdldCkubmFtZSkge1xyXG4gICAgICAgIGNhc2UgXCJSb3RhdGVYXCI6XHJcbiAgICAgICAgICB0aGlzLnJvdGF0ZVgob3V0cHV0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJSb3RhdGVZXCI6XHJcbiAgICAgICAgICB0aGlzLnJvdGF0ZVkob3V0cHV0KTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIGNhc2UgXCJEaXN0YW5jZVwiOlxyXG4gICAgICAgICAgdGhpcy5kaXN0YW5jZSArPSBvdXRwdXQ7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xyXG4gIGltcG9ydCDGkiA9IEZ1ZGdlQ29yZTtcclxuXHJcbiAgZXhwb3J0IGNsYXNzIENhbWVyYU9yYml0TW92aW5nRm9jdXMgZXh0ZW5kcyBDYW1lcmFPcmJpdCB7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgYXhpc1RyYW5zbGF0ZVg6IMaSLkF4aXMgPSBuZXcgxpIuQXhpcyhcIlRyYW5zbGF0ZVhcIiwgMSwgxpIuQ09OVFJPTF9UWVBFLlBST1BPUlRJT05BTCwgdHJ1ZSk7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgYXhpc1RyYW5zbGF0ZVk6IMaSLkF4aXMgPSBuZXcgxpIuQXhpcyhcIlRyYW5zbGF0ZVlcIiwgMSwgxpIuQ09OVFJPTF9UWVBFLlBST1BPUlRJT05BTCwgdHJ1ZSk7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgYXhpc1RyYW5zbGF0ZVo6IMaSLkF4aXMgPSBuZXcgxpIuQXhpcyhcIlRyYW5zbGF0ZVpcIiwgMSwgxpIuQ09OVFJPTF9UWVBFLlBST1BPUlRJT05BTCwgdHJ1ZSk7XHJcblxyXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKF9jbXBDYW1lcmE6IMaSLkNvbXBvbmVudENhbWVyYSwgX2Rpc3RhbmNlU3RhcnQ6IG51bWJlciA9IDIsIF9tYXhSb3RYOiBudW1iZXIgPSA3NSwgX21pbkRpc3RhbmNlOiBudW1iZXIgPSAxLCBfbWF4RGlzdGFuY2U6IG51bWJlciA9IDEwKSB7XHJcbiAgICAgIHN1cGVyKF9jbXBDYW1lcmEsIF9kaXN0YW5jZVN0YXJ0LCBfbWF4Um90WCwgX21pbkRpc3RhbmNlLCBfbWF4RGlzdGFuY2UpO1xyXG4gICAgICB0aGlzLm5hbWUgPSBcIkNhbWVyYU9yYml0TW92aW5nRm9jdXNcIjtcclxuXHJcbiAgICAgIHRoaXMuYXhpc1RyYW5zbGF0ZVguYWRkRXZlbnRMaXN0ZW5lcijGki5FVkVOVF9DT05UUk9MLk9VVFBVVCwgdGhpcy5obmRBeGlzT3V0cHV0KTtcclxuICAgICAgdGhpcy5heGlzVHJhbnNsYXRlWS5hZGRFdmVudExpc3RlbmVyKMaSLkVWRU5UX0NPTlRST0wuT1VUUFVULCB0aGlzLmhuZEF4aXNPdXRwdXQpO1xyXG4gICAgICB0aGlzLmF4aXNUcmFuc2xhdGVaLmFkZEV2ZW50TGlzdGVuZXIoxpIuRVZFTlRfQ09OVFJPTC5PVVRQVVQsIHRoaXMuaG5kQXhpc091dHB1dCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRyYW5zbGF0ZVgoX2RlbHRhOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5tdHhMb2NhbC50cmFuc2xhdGVYKF9kZWx0YSk7XHJcbiAgICB9XHJcbiAgICBcclxuICAgIHB1YmxpYyB0cmFuc2xhdGVZKF9kZWx0YTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIGxldCB0cmFuc2xhdGlvbjogxpIuVmVjdG9yMyA9IHRoaXMucm90YXRvclgubXR4V29ybGQuZ2V0WSgpO1xyXG4gICAgICB0cmFuc2xhdGlvbi5ub3JtYWxpemUoX2RlbHRhKTtcclxuICAgICAgdGhpcy5tdHhMb2NhbC50cmFuc2xhdGUodHJhbnNsYXRpb24sIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlWihfZGVsdGE6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICAvLyB0aGlzLm10eExvY2FsLnRyYW5zbGF0ZVooX2RlbHRhKTtcclxuICAgICAgbGV0IHRyYW5zbGF0aW9uOiDGki5WZWN0b3IzID0gdGhpcy5yb3RhdG9yWC5tdHhXb3JsZC5nZXRaKCk7XHJcbiAgICAgIHRyYW5zbGF0aW9uLm5vcm1hbGl6ZShfZGVsdGEpO1xyXG4gICAgICB0aGlzLm10eExvY2FsLnRyYW5zbGF0ZSh0cmFuc2xhdGlvbiwgZmFsc2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBobmRBeGlzT3V0cHV0OiBFdmVudExpc3RlbmVyID0gKF9ldmVudDogRXZlbnQpOiB2b2lkID0+IHtcclxuICAgICAgbGV0IG91dHB1dDogbnVtYmVyID0gKDxDdXN0b21FdmVudD5fZXZlbnQpLmRldGFpbC5vdXRwdXQ7XHJcbiAgICAgIHN3aXRjaCAoKDzGki5BeGlzPl9ldmVudC50YXJnZXQpLm5hbWUpIHtcclxuICAgICAgICBjYXNlIFwiVHJhbnNsYXRlWFwiOlxyXG4gICAgICAgICAgdGhpcy50cmFuc2xhdGVYKG91dHB1dCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiVHJhbnNsYXRlWVwiOlxyXG4gICAgICAgICAgdGhpcy50cmFuc2xhdGVZKG91dHB1dCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiVHJhbnNsYXRlWlwiOlxyXG4gICAgICAgICAgdGhpcy50cmFuc2xhdGVaKG91dHB1dCk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xuICBleHBvcnQgZW51bSBJTUFHRV9SRU5ERVJJTkcge1xuICAgIEFVVE8gPSBcImF1dG9cIixcbiAgICBTTU9PVEggPSBcInNtb290aFwiLFxuICAgIEhJR0hfUVVBTElUWSA9IFwiaGlnaC1xdWFsaXR5XCIsXG4gICAgQ1JJU1BfRURHRVMgPSBcImNyaXNwLWVkZ2VzXCIsXG4gICAgUElYRUxBVEVEID0gXCJwaXhlbGF0ZWRcIlxuICB9XG4gIC8qKlxuICAgKiBBZGRzIGNvbWZvcnQgbWV0aG9kcyB0byBjcmVhdGUgYSByZW5kZXIgY2FudmFzXG4gICAqL1xuICBleHBvcnQgY2xhc3MgQ2FudmFzIHtcbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShfZmlsbFBhcmVudDogYm9vbGVhbiA9IHRydWUsIF9pbWFnZVJlbmRlcmluZzogSU1BR0VfUkVOREVSSU5HID0gSU1BR0VfUkVOREVSSU5HLkFVVE8sIF93aWR0aDogbnVtYmVyID0gODAwLCBfaGVpZ2h0OiBudW1iZXIgPSA2MDApOiBIVE1MQ2FudmFzRWxlbWVudCB7XG4gICAgICBsZXQgY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCA9IDxIVE1MQ2FudmFzRWxlbWVudD5kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgY2FudmFzLmlkID0gXCJGVURHRVwiO1xuICAgICAgbGV0IHN0eWxlOiBDU1NTdHlsZURlY2xhcmF0aW9uID0gY2FudmFzLnN0eWxlO1xuICAgICAgc3R5bGUuaW1hZ2VSZW5kZXJpbmcgPSBfaW1hZ2VSZW5kZXJpbmc7XG4gICAgICBzdHlsZS53aWR0aCA9IF93aWR0aCArIFwicHhcIjtcbiAgICAgIHN0eWxlLmhlaWdodCA9IF9oZWlnaHQgKyBcInB4XCI7XG4gICAgICBzdHlsZS5tYXJnaW5Cb3R0b20gPSBcIi0wLjI1ZW1cIjtcbiAgICAgIFxuICAgICAgaWYgKF9maWxsUGFyZW50KSB7XG4gICAgICAgIHN0eWxlLndpZHRoID0gXCIxMDAlXCI7XG4gICAgICAgIHN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGNhbnZhcztcbiAgICB9XG4gIH1cbn0iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xyXG4gIGltcG9ydCDGkiA9IEZ1ZGdlQ29yZTtcclxuXHJcbiAgZXhwb3J0IGNsYXNzIE5vZGUgZXh0ZW5kcyDGki5Ob2RlIHtcclxuICAgIHByaXZhdGUgc3RhdGljIGNvdW50OiBudW1iZXIgPSAwO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKF9uYW1lOiBzdHJpbmcgPSBOb2RlLmdldE5leHROYW1lKCksIF90cmFuc2Zvcm0/OiDGki5NYXRyaXg0eDQsIF9tYXRlcmlhbD86IMaSLk1hdGVyaWFsLCBfbWVzaD86IMaSLk1lc2gpIHtcclxuICAgICAgc3VwZXIoX25hbWUpO1xyXG4gICAgICBpZiAoX3RyYW5zZm9ybSlcclxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudChuZXcgxpIuQ29tcG9uZW50VHJhbnNmb3JtKF90cmFuc2Zvcm0pKTtcclxuICAgICAgaWYgKF9tYXRlcmlhbClcclxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudChuZXcgxpIuQ29tcG9uZW50TWF0ZXJpYWwoX21hdGVyaWFsKSk7XHJcbiAgICAgIGlmIChfbWVzaClcclxuICAgICAgICB0aGlzLmFkZENvbXBvbmVudChuZXcgxpIuQ29tcG9uZW50TWVzaChfbWVzaCkpO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgc3RhdGljIGdldE5leHROYW1lKCk6IHN0cmluZyB7XHJcbiAgICAgIHJldHVybiBcIsaSQWlkTm9kZV9cIiArIE5vZGUuY291bnQrKztcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHBpdm90KCk6IMaSLk1hdHJpeDR4NCB7XHJcbiAgICAgIGxldCBjbXBNZXNoOiDGki5Db21wb25lbnRNZXNoID0gdGhpcy5nZXRDb21wb25lbnQoxpIuQ29tcG9uZW50TWVzaCk7XHJcbiAgICAgIHJldHVybiBjbXBNZXNoID8gY21wTWVzaC5waXZvdCA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFzeW5jIGRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uOiDGki5TZXJpYWxpemF0aW9uKTogUHJvbWlzZTzGki5TZXJpYWxpemFibGU+IHtcclxuICAgICAgLy8gUXVpY2sgYW5kIG1heWJlIGhhY2t5IHNvbHV0aW9uLiBDcmVhdGVkIG5vZGUgaXMgY29tcGxldGVseSBkaXNtaXNzZWQgYW5kIGEgcmVjcmVhdGlvbiBvZiB0aGUgYmFzZWNsYXNzIGdldHMgcmV0dXJuLiBPdGhlcndpc2UsIGNvbXBvbmVudHMgd2lsbCBiZSBkb3VibGVkLi4uXHJcbiAgICAgIGxldCBub2RlOiDGki5Ob2RlID0gbmV3IMaSLk5vZGUoX3NlcmlhbGl6YXRpb24ubmFtZSk7XHJcbiAgICAgIGF3YWl0IG5vZGUuZGVzZXJpYWxpemUoX3NlcmlhbGl6YXRpb24pO1xyXG4gICAgICAvLyBjb25zb2xlLmxvZyhub2RlKTtcclxuICAgICAgcmV0dXJuIG5vZGU7XHJcbiAgICB9XHJcbiAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XHJcblxyXG5cclxuICBleHBvcnQgY2xhc3MgTm9kZUFycm93IGV4dGVuZHMgTm9kZSB7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBpbnRlcm5hbFJlc291cmNlczogTWFwPHN0cmluZywgxpIuU2VyaWFsaXphYmxlUmVzb3VyY2U+ID0gTm9kZUFycm93LmNyZWF0ZUludGVybmFsUmVzb3VyY2VzKCk7XHJcblxyXG4gICAgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZywgX2NvbG9yOiDGki5Db2xvcikge1xyXG4gICAgICBzdXBlcihfbmFtZSwgxpIuTWF0cml4NHg0LklERU5USVRZKCkpO1xyXG5cclxuICAgICAgbGV0IHNoYWZ0OiBOb2RlID0gbmV3IE5vZGUoX25hbWUgKyBcIlNoYWZ0XCIsIMaSLk1hdHJpeDR4NC5JREVOVElUWSgpLCA8xpIuTWF0ZXJpYWw+Tm9kZUFycm93LmludGVybmFsUmVzb3VyY2VzLmdldChcIk1hdGVyaWFsXCIpLCA8xpIuTWVzaD5Ob2RlQXJyb3cuaW50ZXJuYWxSZXNvdXJjZXMuZ2V0KFwiU2hhZnRcIikpO1xyXG4gICAgICBsZXQgaGVhZDogTm9kZSA9IG5ldyBOb2RlKF9uYW1lICsgXCJIZWFkXCIsIMaSLk1hdHJpeDR4NC5JREVOVElUWSgpLCA8xpIuTWF0ZXJpYWw+Tm9kZUFycm93LmludGVybmFsUmVzb3VyY2VzLmdldChcIk1hdGVyaWFsXCIpLCA8xpIuTWVzaD5Ob2RlQXJyb3cuaW50ZXJuYWxSZXNvdXJjZXMuZ2V0KFwiSGVhZFwiKSk7XHJcbiAgICAgIHNoYWZ0Lm10eExvY2FsLnNjYWxlKG5ldyDGki5WZWN0b3IzKDAuMDEsIDEsIDAuMDEpKTtcclxuICAgICAgaGVhZC5tdHhMb2NhbC50cmFuc2xhdGVZKDAuNSk7XHJcbiAgICAgIGhlYWQubXR4TG9jYWwuc2NhbGUobmV3IMaSLlZlY3RvcjMoMC4wNSwgMC4xLCAwLjA1KSk7XHJcblxyXG4gICAgICBzaGFmdC5nZXRDb21wb25lbnQoxpIuQ29tcG9uZW50TWF0ZXJpYWwpLmNsclByaW1hcnkgPSBfY29sb3I7XHJcbiAgICAgIGhlYWQuZ2V0Q29tcG9uZW50KMaSLkNvbXBvbmVudE1hdGVyaWFsKS5jbHJQcmltYXJ5ID0gX2NvbG9yO1xyXG5cclxuICAgICAgdGhpcy5hZGRDaGlsZChzaGFmdCk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoaGVhZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlSW50ZXJuYWxSZXNvdXJjZXMoKTogTWFwPHN0cmluZywgxpIuU2VyaWFsaXphYmxlUmVzb3VyY2U+IHtcclxuICAgICAgbGV0IG1hcDogTWFwPHN0cmluZywgxpIuU2VyaWFsaXphYmxlUmVzb3VyY2U+ID0gbmV3IE1hcCgpO1xyXG4gICAgICBtYXAuc2V0KFwiU2hhZnRcIiwgIG5ldyDGki5NZXNoQ3ViZShcIkFycm93U2hhZnRcIikpO1xyXG4gICAgICBtYXAuc2V0KFwiSGVhZFwiLCBuZXcgxpIuTWVzaFB5cmFtaWQoXCJBcnJvd0hlYWRcIikpO1xyXG4gICAgICBsZXQgY29hdDogxpIuQ29hdENvbG9yZWQgPSBuZXcgxpIuQ29hdENvbG9yZWQoxpIuQ29sb3IuQ1NTKFwid2hpdGVcIikpO1xyXG4gICAgICBtYXAuc2V0KFwiTWF0ZXJpYWxcIiwgbmV3IMaSLk1hdGVyaWFsKFwiQXJyb3dcIiwgxpIuU2hhZGVyVW5pQ29sb3IsIGNvYXQpKTtcclxuXHJcbiAgICAgIG1hcC5mb3JFYWNoKChfcmVzb3VyY2UpID0+IMaSLlByb2plY3QuZGVyZWdpc3RlcihfcmVzb3VyY2UpKTtcclxuICAgICAgcmV0dXJuIG1hcDtcclxuICAgIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XG5cbiAgZXhwb3J0IGNsYXNzIE5vZGVDb29yZGluYXRlU3lzdGVtIGV4dGVuZHMgTm9kZSB7XG4gICAgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZyA9IFwiQ29vcmRpbmF0ZVN5c3RlbVwiLCBfdHJhbnNmb3JtPzogxpIuTWF0cml4NHg0KSB7XG4gICAgICBzdXBlcihfbmFtZSwgX3RyYW5zZm9ybSk7XG4gICAgICBsZXQgYXJyb3dSZWQ6IMaSLk5vZGUgPSBuZXcgTm9kZUFycm93KFwiQXJyb3dSZWRcIiwgbmV3IMaSLkNvbG9yKDEsIDAsIDAsIDEpKTtcbiAgICAgIGxldCBhcnJvd0dyZWVuOiDGki5Ob2RlID0gbmV3IE5vZGVBcnJvdyhcIkFycm93R3JlZW5cIiwgbmV3IMaSLkNvbG9yKDAsIDEsIDAsIDEpKTtcbiAgICAgIGxldCBhcnJvd0JsdWU6IMaSLk5vZGUgPSBuZXcgTm9kZUFycm93KFwiQXJyb3dCbHVlXCIsIG5ldyDGki5Db2xvcigwLCAwLCAxLCAxKSk7XG5cbiAgICAgIGFycm93UmVkLm10eExvY2FsLnJvdGF0ZVooLTkwKTtcbiAgICAgIGFycm93Qmx1ZS5tdHhMb2NhbC5yb3RhdGVYKDkwKTtcblxuICAgICAgdGhpcy5hZGRDaGlsZChhcnJvd1JlZCk7XG4gICAgICB0aGlzLmFkZENoaWxkKGFycm93R3JlZW4pO1xuICAgICAgdGhpcy5hZGRDaGlsZChhcnJvd0JsdWUpO1xuICAgIH1cbiAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi9Db3JlL0J1aWxkL0Z1ZGdlQ29yZS5kLnRzXCIvPlxyXG5cclxubmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBsaWdodCBzZXR1cCB0byB0aGUgbm9kZSBnaXZlbiwgY29uc2lzdGluZyBvZiBhbiBhbWJpZW50IGxpZ2h0LCBhIGRpcmVjdGlvbmFsIGtleSBsaWdodCBhbmQgYSBkaXJlY3Rpb25hbCBiYWNrIGxpZ2h0LlxyXG4gICAqIEV4ZXB0IG9mIHRoZSBub2RlIHRvIGJlY29tZSB0aGUgY29udGFpbmVyLCBhbGwgcGFyYW1ldGVycyBhcmUgb3B0aW9uYWwgYW5kIHByb3ZpZGVkIGRlZmF1bHQgdmFsdWVzIGZvciBnZW5lcmFsIHB1cnBvc2UuIFxyXG4gICAqL1xyXG4gIGV4cG9ydCBmdW5jdGlvbiBhZGRTdGFuZGFyZExpZ2h0Q29tcG9uZW50cyhcclxuICAgIF9ub2RlOiDGki5Ob2RlLFxyXG4gICAgX2NsckFtYmllbnQ6IMaSLkNvbG9yID0gbmV3IMaSLkNvbG9yKDAuMiwgMC4yLCAwLjIpLCBfY2xyS2V5OiDGki5Db2xvciA9IG5ldyDGki5Db2xvcigwLjksIDAuOSwgMC45KSwgX2NsckJhY2s6IMaSLkNvbG9yID0gbmV3IMaSLkNvbG9yKDAuNiwgMC42LCAwLjYpLFxyXG4gICAgX3Bvc0tleTogxpIuVmVjdG9yMyA9IG5ldyDGki5WZWN0b3IzKDQsIDEyLCA4KSwgX3Bvc0JhY2s6IMaSLlZlY3RvcjMgPSBuZXcgxpIuVmVjdG9yMygtMSwgLTAuNSwgLTMpXHJcbiAgKTogdm9pZCB7XHJcbiAgICBsZXQga2V5OiDGki5Db21wb25lbnRMaWdodCA9IG5ldyDGki5Db21wb25lbnRMaWdodChuZXcgxpIuTGlnaHREaXJlY3Rpb25hbChfY2xyS2V5KSk7XHJcbiAgICBrZXkucGl2b3QudHJhbnNsYXRlKF9wb3NLZXkpO1xyXG4gICAga2V5LnBpdm90Lmxvb2tBdCjGki5WZWN0b3IzLlpFUk8oKSk7XHJcblxyXG4gICAgbGV0IGJhY2s6IMaSLkNvbXBvbmVudExpZ2h0ID0gbmV3IMaSLkNvbXBvbmVudExpZ2h0KG5ldyDGki5MaWdodERpcmVjdGlvbmFsKF9jbHJCYWNrKSk7XHJcbiAgICBiYWNrLnBpdm90LnRyYW5zbGF0ZShfcG9zQmFjayk7XHJcbiAgICBiYWNrLnBpdm90Lmxvb2tBdCjGki5WZWN0b3IzLlpFUk8oKSk7XHJcblxyXG4gICAgbGV0IGFtYmllbnQ6IMaSLkNvbXBvbmVudExpZ2h0ID0gbmV3IMaSLkNvbXBvbmVudExpZ2h0KG5ldyDGki5MaWdodEFtYmllbnQoX2NsckFtYmllbnQpKTtcclxuXHJcbiAgICBfbm9kZS5hZGRDb21wb25lbnQoa2V5KTtcclxuICAgIF9ub2RlLmFkZENvbXBvbmVudChiYWNrKTtcclxuICAgIF9ub2RlLmFkZENvbXBvbmVudChhbWJpZW50KTtcclxuICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICAvKipcclxuICAgKiBIYW5kbGVzIHRoZSBhbmltYXRpb24gY3ljbGUgb2YgYSBzcHJpdGUgb24gYSBbW05vZGVdXVxyXG4gICAqL1xyXG4gIGV4cG9ydCBjbGFzcyBOb2RlU3ByaXRlIGV4dGVuZHMgxpIuTm9kZSB7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBtZXNoOiDGki5NZXNoU3ByaXRlID0gTm9kZVNwcml0ZS5jcmVhdGVJbnRlcm5hbFJlc291cmNlKCk7XHJcbiAgICBwdWJsaWMgZnJhbWVyYXRlOiBudW1iZXIgPSAxMjsgLy8gYW5pbWF0aW9uIGZyYW1lcyBwZXIgc2Vjb25kLCBzaW5nbGUgZnJhbWVzIGNhbiBiZSBzaG9ydGVyIG9yIGxvbmdlciBiYXNlZCBvbiB0aGVpciB0aW1lc2NhbGVcclxuXHJcbiAgICBwcml2YXRlIGNtcE1lc2g6IMaSLkNvbXBvbmVudE1lc2g7XHJcbiAgICBwcml2YXRlIGNtcE1hdGVyaWFsOiDGki5Db21wb25lbnRNYXRlcmlhbDtcclxuICAgIHByaXZhdGUgYW5pbWF0aW9uOiBTcHJpdGVTaGVldEFuaW1hdGlvbjtcclxuICAgIHByaXZhdGUgZnJhbWVDdXJyZW50OiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBkaXJlY3Rpb246IG51bWJlciA9IDE7XHJcbiAgICBwcml2YXRlIHRpbWVyOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZykge1xyXG4gICAgICBzdXBlcihfbmFtZSk7XHJcblxyXG4gICAgICB0aGlzLmNtcE1lc2ggPSBuZXcgxpIuQ29tcG9uZW50TWVzaChOb2RlU3ByaXRlLm1lc2gpO1xyXG4gICAgICAvLyBEZWZpbmUgY29hdCBmcm9tIHRoZSBTcHJpdGVTaGVldCB0byB1c2Ugd2hlbiByZW5kZXJpbmdcclxuICAgICAgdGhpcy5jbXBNYXRlcmlhbCA9IG5ldyDGki5Db21wb25lbnRNYXRlcmlhbChuZXcgxpIuTWF0ZXJpYWwoX25hbWUsIMaSLlNoYWRlclRleHR1cmUsIG51bGwpKTtcclxuICAgICAgdGhpcy5hZGRDb21wb25lbnQodGhpcy5jbXBNZXNoKTtcclxuICAgICAgdGhpcy5hZGRDb21wb25lbnQodGhpcy5jbXBNYXRlcmlhbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlSW50ZXJuYWxSZXNvdXJjZSgpOiDGki5NZXNoU3ByaXRlIHtcclxuICAgICAgbGV0IG1lc2g6IMaSLk1lc2hTcHJpdGUgPSBuZXcgxpIuTWVzaFNwcml0ZShcIlNwcml0ZVwiKTtcclxuICAgICAgxpIuUHJvamVjdC5kZXJlZ2lzdGVyKG1lc2gpO1xyXG4gICAgICByZXR1cm4gbWVzaDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0QW5pbWF0aW9uKF9hbmltYXRpb246IFNwcml0ZVNoZWV0QW5pbWF0aW9uKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uID0gX2FuaW1hdGlvbjtcclxuICAgICAgaWYgKHRoaXMudGltZXIpXHJcbiAgICAgICAgxpIuVGltZS5nYW1lLmRlbGV0ZVRpbWVyKHRoaXMudGltZXIpO1xyXG4gICAgICB0aGlzLnNob3dGcmFtZSgwKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3cgYSBzcGVjaWZpYyBmcmFtZSBvZiB0aGUgc2VxdWVuY2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNob3dGcmFtZShfaW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICBsZXQgc3ByaXRlRnJhbWU6IFNwcml0ZUZyYW1lID0gdGhpcy5hbmltYXRpb24uZnJhbWVzW19pbmRleF07XHJcbiAgICAgIHRoaXMuY21wTWVzaC5waXZvdCA9IHNwcml0ZUZyYW1lLm10eFBpdm90O1xyXG4gICAgICB0aGlzLmNtcE1hdGVyaWFsLnBpdm90ID0gc3ByaXRlRnJhbWUubXR4VGV4dHVyZTtcclxuICAgICAgdGhpcy5jbXBNYXRlcmlhbC5tYXRlcmlhbC5zZXRDb2F0KHRoaXMuYW5pbWF0aW9uLnNwcml0ZXNoZWV0KTtcclxuICAgICAgdGhpcy5mcmFtZUN1cnJlbnQgPSBfaW5kZXg7XHJcbiAgICAgIHRoaXMudGltZXIgPSDGki5UaW1lLmdhbWUuc2V0VGltZXIoc3ByaXRlRnJhbWUudGltZVNjYWxlICogMTAwMCAvIHRoaXMuZnJhbWVyYXRlLCAxLCB0aGlzLnNob3dGcmFtZU5leHQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdyB0aGUgbmV4dCBmcmFtZSBvZiB0aGUgc2VxdWVuY2Ugb3Igc3RhcnQgYW5ldyB3aGVuIHRoZSBlbmQgb3IgdGhlIHN0YXJ0IHdhcyByZWFjaGVkLCBhY2NvcmRpbmcgdG8gdGhlIGRpcmVjdGlvbiBvZiBwbGF5aW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzaG93RnJhbWVOZXh0ID0gKF9ldmVudDogxpIuRXZlbnRUaW1lcik6IHZvaWQgPT4ge1xyXG4gICAgICB0aGlzLmZyYW1lQ3VycmVudCA9ICh0aGlzLmZyYW1lQ3VycmVudCArIHRoaXMuZGlyZWN0aW9uICsgdGhpcy5hbmltYXRpb24uZnJhbWVzLmxlbmd0aCkgJSB0aGlzLmFuaW1hdGlvbi5mcmFtZXMubGVuZ3RoO1xyXG4gICAgICB0aGlzLnNob3dGcmFtZSh0aGlzLmZyYW1lQ3VycmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBkaXJlY3Rpb24gZm9yIGFuaW1hdGlvbiBwbGF5YmFjaywgbmVnYXRpdiBudW1iZXJzIG1ha2UgaXQgcGxheSBiYWNrd2FyZHMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRGcmFtZURpcmVjdGlvbihfZGlyZWN0aW9uOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5kaXJlY3Rpb24gPSBNYXRoLmZsb29yKF9kaXJlY3Rpb24pO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUFpZCB7XHJcbiAgaW1wb3J0IMaSID0gRnVkZ2VDb3JlO1xyXG5cclxuICAvKipcclxuICAgKiBEZXNjcmliZXMgYSBzaW5nbGUgZnJhbWUgb2YgYSBzcHJpdGUgYW5pbWF0aW9uXHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIFNwcml0ZUZyYW1lIHtcclxuICAgIHJlY3RUZXh0dXJlOiDGki5SZWN0YW5nbGU7XHJcbiAgICBtdHhQaXZvdDogxpIuTWF0cml4NHg0O1xyXG4gICAgbXR4VGV4dHVyZTogxpIuTWF0cml4M3gzO1xyXG4gICAgdGltZVNjYWxlOiBudW1iZXI7XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb252ZW5pZW5jZSBmb3IgY3JlYXRpbmcgYSBbW0NvYXRUZXh0dXJlXV0gdG8gdXNlIGFzIHNwcml0ZXNoZWV0XHJcbiAgICovXHJcbiAgZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZVNwcml0ZVNoZWV0KF9uYW1lOiBzdHJpbmcsIF9pbWFnZTogSFRNTEltYWdlRWxlbWVudCk6IMaSLkNvYXRUZXh0dXJlZCB7XHJcbiAgICBsZXQgY29hdDogxpIuQ29hdFRleHR1cmVkID0gbmV3IMaSLkNvYXRUZXh0dXJlZCgpO1xyXG4gICAgY29hdC5uYW1lID0gX25hbWU7XHJcbiAgICBsZXQgdGV4dHVyZTogxpIuVGV4dHVyZUltYWdlID0gbmV3IMaSLlRleHR1cmVJbWFnZSgpO1xyXG4gICAgdGV4dHVyZS5pbWFnZSA9IF9pbWFnZTtcclxuICAgIGNvYXQudGV4dHVyZSA9IHRleHR1cmU7XHJcbiAgICByZXR1cm4gY29hdDtcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhvbGRzIFNwcml0ZVNoZWV0QW5pbWF0aW9ucyBpbiBhbiBhc3NvY2lhdGl2ZSBoaWVyYXJjaGljYWwgYXJyYXlcclxuICAgKi9cclxuICBleHBvcnQgaW50ZXJmYWNlIFNwcml0ZVNoZWV0QW5pbWF0aW9ucyB7XHJcbiAgICBba2V5OiBzdHJpbmddOiBTcHJpdGVTaGVldEFuaW1hdGlvbiB8IFNwcml0ZVNoZWV0QW5pbWF0aW9ucztcclxuICB9XHJcblxyXG4gIC8qKlxyXG4gICAqIEhhbmRsZXMgYSBzZXJpZXMgb2YgW1tTcHJpdGVGcmFtZV1dcyB0byBiZSBtYXBwZWQgb250byBhIFtbTWVzaFNwcml0ZV1dXHJcbiAgICogQ29udGFpbnMgdGhlIFtbTWVzaFNwcml0ZV1dLCB0aGUgW1tNYXRlcmlhbF1dIGFuZCB0aGUgc3ByaXRlc2hlZXQtdGV4dHVyZVxyXG4gICAqL1xyXG4gIGV4cG9ydCBjbGFzcyBTcHJpdGVTaGVldEFuaW1hdGlvbiB7XHJcbiAgICBwdWJsaWMgZnJhbWVzOiBTcHJpdGVGcmFtZVtdID0gW107XHJcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xyXG4gICAgcHVibGljIHNwcml0ZXNoZWV0OiDGki5Db2F0VGV4dHVyZWQ7XHJcblxyXG4gICAgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZywgX3Nwcml0ZXNoZWV0OiDGki5Db2F0VGV4dHVyZWQpIHtcclxuICAgICAgdGhpcy5uYW1lID0gX25hbWU7XHJcbiAgICAgIHRoaXMuc3ByaXRlc2hlZXQgPSBfc3ByaXRlc2hlZXQ7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTdG9yZXMgYSBzZXJpZXMgb2YgZnJhbWVzIGluIHRoaXMgW1tTcHJpdGVdXSwgY2FsY3VsYXRpbmcgdGhlIG1hdHJpY2VzIHRvIHVzZSBpbiB0aGUgY29tcG9uZW50cyBvZiBhIFtbTm9kZVNwcml0ZV1dXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBnZW5lcmF0ZShfcmVjdHM6IMaSLlJlY3RhbmdsZVtdLCBfcmVzb2x1dGlvblF1YWQ6IG51bWJlciwgX29yaWdpbjogxpIuT1JJR0lOMkQpOiB2b2lkIHtcclxuICAgICAgbGV0IGltZzogVGV4SW1hZ2VTb3VyY2UgPSB0aGlzLnNwcml0ZXNoZWV0LnRleHR1cmUudGV4SW1hZ2VTb3VyY2U7XHJcbiAgICAgIHRoaXMuZnJhbWVzID0gW107XHJcbiAgICAgIGxldCBmcmFtaW5nOiDGki5GcmFtaW5nU2NhbGVkID0gbmV3IMaSLkZyYW1pbmdTY2FsZWQoKTtcclxuICAgICAgZnJhbWluZy5zZXRTY2FsZSgxIC8gaW1nLndpZHRoLCAxIC8gaW1nLmhlaWdodCk7XHJcblxyXG4gICAgICBsZXQgY291bnQ6IG51bWJlciA9IDA7XHJcbiAgICAgIGZvciAobGV0IHJlY3Qgb2YgX3JlY3RzKSB7XHJcbiAgICAgICAgbGV0IGZyYW1lOiBTcHJpdGVGcmFtZSA9IHRoaXMuY3JlYXRlRnJhbWUodGhpcy5uYW1lICsgYCR7Y291bnR9YCwgZnJhbWluZywgcmVjdCwgX3Jlc29sdXRpb25RdWFkLCBfb3JpZ2luKTtcclxuICAgICAgICBmcmFtZS50aW1lU2NhbGUgPSAxO1xyXG4gICAgICAgIHRoaXMuZnJhbWVzLnB1c2goZnJhbWUpO1xyXG5cclxuICAgICAgICBjb3VudCsrO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBZGQgc3ByaXRlIGZyYW1lcyB1c2luZyBhIGdyaWQgb24gdGhlIHNwcml0ZXNoZWV0IGRlZmluZWQgYnkgYSByZWN0YW5nbGUgdG8gc3RhcnQgd2l0aCwgdGhlIG51bWJlciBvZiBmcmFtZXMsIFxyXG4gICAgICogdGhlIHJlc29sdXRpb24gd2hpY2ggZGV0ZXJtaW5lcyB0aGUgc2l6ZSBvZiB0aGUgc3ByaXRlcyBtZXNoIGJhc2VkIG9uIHRoZSBudW1iZXIgb2YgcGl4ZWxzIG9mIHRoZSB0ZXh0dXJlIGZyYW1lLFxyXG4gICAgICogdGhlIG9mZnNldCBmcm9tIG9uZSBjZWxsIG9mIHRoZSBncmlkIHRvIHRoZSBuZXh0IGluIHRoZSBzZXF1ZW5jZSBhbmQsIGluIGNhc2UgdGhlIHNlcXVlbmNlIHNwYW5zIG92ZXIgbW9yZSB0aGFuIG9uZSByb3cgb3IgY29sdW1uLFxyXG4gICAgICogdGhlIG9mZnNldCB0byBtb3ZlIHRoZSBzdGFydCByZWN0YW5nbGUgd2hlbiB0aGUgbWFyZ2luIG9mIHRoZSB0ZXh0dXJlIGlzIHJlYWNoZWQgYW5kIHdyYXBwaW5nIG9jY3Vycy5cclxuICAgICAqL1xyXG4gICAgcHVibGljIGdlbmVyYXRlQnlHcmlkKF9zdGFydFJlY3Q6IMaSLlJlY3RhbmdsZSwgX2ZyYW1lczogbnVtYmVyLCBfcmVzb2x1dGlvblF1YWQ6IG51bWJlciwgX29yaWdpbjogxpIuT1JJR0lOMkQsIF9vZmZzZXROZXh0OiDGki5WZWN0b3IyLCBfb2Zmc2V0V3JhcDogxpIuVmVjdG9yMiA9IMaSLlZlY3RvcjIuWkVSTygpKTogdm9pZCB7XHJcbiAgICAgIGxldCBpbWc6IFRleEltYWdlU291cmNlID0gdGhpcy5zcHJpdGVzaGVldC50ZXh0dXJlLnRleEltYWdlU291cmNlO1xyXG4gICAgICBsZXQgcmVjdEltYWdlOiDGki5SZWN0YW5nbGUgPSBuZXcgxpIuUmVjdGFuZ2xlKDAsIDAsIGltZy53aWR0aCwgaW1nLmhlaWdodCk7XHJcbiAgICAgIGxldCByZWN0OiDGki5SZWN0YW5nbGUgPSBfc3RhcnRSZWN0LmNvcHk7XHJcbiAgICAgIGxldCByZWN0czogxpIuUmVjdGFuZ2xlW10gPSBbXTtcclxuICAgICAgd2hpbGUgKF9mcmFtZXMtLSkge1xyXG4gICAgICAgIHJlY3RzLnB1c2gocmVjdC5jb3B5KTtcclxuICAgICAgICByZWN0LnBvc2l0aW9uLmFkZChfb2Zmc2V0TmV4dCk7XHJcblxyXG4gICAgICAgIGlmIChyZWN0SW1hZ2UuY292ZXJzKHJlY3QpKVxyXG4gICAgICAgICAgY29udGludWU7XHJcblxyXG4gICAgICAgIF9zdGFydFJlY3QucG9zaXRpb24uYWRkKF9vZmZzZXRXcmFwKTtcclxuICAgICAgICByZWN0ID0gX3N0YXJ0UmVjdC5jb3B5O1xyXG4gICAgICAgIGlmICghcmVjdEltYWdlLmNvdmVycyhyZWN0KSlcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZWN0cy5mb3JFYWNoKChfcmVjdDogxpIuUmVjdGFuZ2xlKSA9PiDGki5EZWJ1Zy5sb2coX3JlY3QudG9TdHJpbmcoKSkpO1xyXG4gICAgICB0aGlzLmdlbmVyYXRlKHJlY3RzLCBfcmVzb2x1dGlvblF1YWQsIF9vcmlnaW4pO1xyXG4gICAgfVxyXG5cclxuICAgIHByaXZhdGUgY3JlYXRlRnJhbWUoX25hbWU6IHN0cmluZywgX2ZyYW1pbmc6IMaSLkZyYW1pbmdTY2FsZWQsIF9yZWN0OiDGki5SZWN0YW5nbGUsIF9yZXNvbHV0aW9uUXVhZDogbnVtYmVyLCBfb3JpZ2luOiDGki5PUklHSU4yRCk6IFNwcml0ZUZyYW1lIHtcclxuICAgICAgbGV0IGltZzogVGV4SW1hZ2VTb3VyY2UgPSB0aGlzLnNwcml0ZXNoZWV0LnRleHR1cmUudGV4SW1hZ2VTb3VyY2U7XHJcbiAgICAgIGxldCByZWN0VGV4dHVyZTogxpIuUmVjdGFuZ2xlID0gbmV3IMaSLlJlY3RhbmdsZSgwLCAwLCBpbWcud2lkdGgsIGltZy5oZWlnaHQpO1xyXG4gICAgICBsZXQgZnJhbWU6IFNwcml0ZUZyYW1lID0gbmV3IFNwcml0ZUZyYW1lKCk7XHJcblxyXG4gICAgICBmcmFtZS5yZWN0VGV4dHVyZSA9IF9mcmFtaW5nLmdldFJlY3QoX3JlY3QpO1xyXG4gICAgICBmcmFtZS5yZWN0VGV4dHVyZS5wb3NpdGlvbiA9IF9mcmFtaW5nLmdldFBvaW50KF9yZWN0LnBvc2l0aW9uLCByZWN0VGV4dHVyZSk7XHJcblxyXG4gICAgICBsZXQgcmVjdFF1YWQ6IMaSLlJlY3RhbmdsZSA9IG5ldyDGki5SZWN0YW5nbGUoMCwgMCwgX3JlY3Qud2lkdGggLyBfcmVzb2x1dGlvblF1YWQsIF9yZWN0LmhlaWdodCAvIF9yZXNvbHV0aW9uUXVhZCwgX29yaWdpbik7XHJcbiAgICAgIGZyYW1lLm10eFBpdm90ID0gxpIuTWF0cml4NHg0LklERU5USVRZKCk7XHJcbiAgICAgIGZyYW1lLm10eFBpdm90LnRyYW5zbGF0ZShuZXcgxpIuVmVjdG9yMyhyZWN0UXVhZC5wb3NpdGlvbi54ICsgcmVjdFF1YWQuc2l6ZS54IC8gMiwgLXJlY3RRdWFkLnBvc2l0aW9uLnkgLSByZWN0UXVhZC5zaXplLnkgLyAyLCAwKSk7XHJcbiAgICAgIGZyYW1lLm10eFBpdm90LnNjYWxlWChyZWN0UXVhZC5zaXplLngpO1xyXG4gICAgICBmcmFtZS5tdHhQaXZvdC5zY2FsZVkocmVjdFF1YWQuc2l6ZS55KTtcclxuICAgICAgLy8gxpIuRGVidWcubG9nKHJlY3RRdWFkLnRvU3RyaW5nKCkpO1xyXG5cclxuICAgICAgZnJhbWUubXR4VGV4dHVyZSA9IMaSLk1hdHJpeDN4My5JREVOVElUWSgpO1xyXG4gICAgICBmcmFtZS5tdHhUZXh0dXJlLnRyYW5zbGF0ZShmcmFtZS5yZWN0VGV4dHVyZS5wb3NpdGlvbik7XHJcbiAgICAgIGZyYW1lLm10eFRleHR1cmUuc2NhbGUoZnJhbWUucmVjdFRleHR1cmUuc2l6ZSk7XHJcblxyXG4gICAgICByZXR1cm4gZnJhbWU7XHJcbiAgICB9XHJcbiAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XHJcbiAgXHJcbiAgZXhwb3J0IGNsYXNzIENvbXBvbmVudFN0YXRlTWFjaGluZTxTdGF0ZT4gZXh0ZW5kcyDGki5Db21wb25lbnRTY3JpcHQgaW1wbGVtZW50cyBTdGF0ZU1hY2hpbmU8U3RhdGU+IHtcclxuICAgIHB1YmxpYyBzdGF0ZUN1cnJlbnQ6IFN0YXRlO1xyXG4gICAgcHVibGljIHN0YXRlTmV4dDogU3RhdGU7XHJcbiAgICBwdWJsaWMgaW5zdHJ1Y3Rpb25zOiBTdGF0ZU1hY2hpbmVJbnN0cnVjdGlvbnM8U3RhdGU+O1xyXG5cclxuICAgIHB1YmxpYyB0cmFuc2l0KF9uZXh0OiBTdGF0ZSk6IHZvaWQge1xyXG4gICAgICB0aGlzLmluc3RydWN0aW9ucy50cmFuc2l0KHRoaXMuc3RhdGVDdXJyZW50LCBfbmV4dCwgdGhpcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGFjdCgpOiB2b2lkIHtcclxuICAgICAgdGhpcy5pbnN0cnVjdGlvbnMuYWN0KHRoaXMuc3RhdGVDdXJyZW50LCB0aGlzKTtcclxuICAgIH1cclxuICB9XHJcbn0iLCIvKipcclxuICogU3RhdGUgbWFjaGluZSBvZmZlcnMgYSBzdHJ1Y3R1cmUgYW5kIGZ1bmRhbWVudGFsIGZ1bmN0aW9uYWxpdHkgZm9yIHN0YXRlIG1hY2hpbmVzXHJcbiAqIDxTdGF0ZT4gc2hvdWxkIGJlIGFuIGVudW0gZGVmaW5pbmcgdGhlIHZhcmlvdXMgc3RhdGVzIG9mIHRoZSBtYWNoaW5lXHJcbiAqL1xyXG5cclxubmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICAvKiogRm9ybWF0IG9mIG1ldGhvZHMgdG8gYmUgdXNlZCBhcyB0cmFuc2l0aW9ucyBvciBhY3Rpb25zICovXHJcbiAgdHlwZSBTdGF0ZU1hY2hpbmVNZXRob2Q8U3RhdGU+ID0gKF9tYWNoaW5lOiBTdGF0ZU1hY2hpbmU8U3RhdGU+KSA9PiB2b2lkO1xyXG4gIC8qKiBUeXBlIGZvciBtYXBzIGFzc29jaWF0aW5nIGEgc3RhdGUgdG8gYSBtZXRob2QgKi9cclxuICB0eXBlIFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2Q8U3RhdGU+ID0gTWFwPFN0YXRlLCBTdGF0ZU1hY2hpbmVNZXRob2Q8U3RhdGU+PjtcclxuICAvKiogSW50ZXJmYWNlIG1hcHBpbmcgYSBzdGF0ZSB0byBvbmUgYWN0aW9uIG11bHRpcGxlIHRyYW5zaXRpb25zICovXHJcbiAgaW50ZXJmYWNlIFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2RzPFN0YXRlPiB7XHJcbiAgICBhY3Rpb246IFN0YXRlTWFjaGluZU1ldGhvZDxTdGF0ZT47XHJcbiAgICB0cmFuc2l0aW9uczogU3RhdGVNYWNoaW5lTWFwU3RhdGVUb01ldGhvZDxTdGF0ZT47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb3JlIGZ1bmN0aW9uYWxpdHkgb2YgdGhlIHN0YXRlIG1hY2hpbmUsIGhvbGRpbmcgc29sZWx5IHRoZSBjdXJyZW50IHN0YXRlIGFuZCwgd2hpbGUgaW4gdHJhbnNpdGlvbiwgdGhlIG5leHQgc3RhdGUsXHJcbiAgICogdGhlIGluc3RydWN0aW9ucyBmb3IgdGhlIG1hY2hpbmUgYW5kIGNvbWZvcnQgbWV0aG9kcyB0byB0cmFuc2l0IGFuZCBhY3QuXHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIFN0YXRlTWFjaGluZTxTdGF0ZT4ge1xyXG4gICAgcHVibGljIHN0YXRlQ3VycmVudDogU3RhdGU7XHJcbiAgICBwdWJsaWMgc3RhdGVOZXh0OiBTdGF0ZTtcclxuICAgIHB1YmxpYyBpbnN0cnVjdGlvbnM6IFN0YXRlTWFjaGluZUluc3RydWN0aW9uczxTdGF0ZT47XHJcblxyXG4gICAgcHVibGljIHRyYW5zaXQoX25leHQ6IFN0YXRlKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuaW5zdHJ1Y3Rpb25zLnRyYW5zaXQodGhpcy5zdGF0ZUN1cnJlbnQsIF9uZXh0LCB0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWN0KCk6IHZvaWQge1xyXG4gICAgICB0aGlzLmluc3RydWN0aW9ucy5hY3QodGhpcy5zdGF0ZUN1cnJlbnQsIHRoaXMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IG9mIGluc3RydWN0aW9ucyBmb3IgYSBzdGF0ZSBtYWNoaW5lLiBUaGUgc2V0IGtlZXBzIGFsbCBtZXRob2RzIGZvciBkZWRpY2F0ZWQgYWN0aW9ucyBkZWZpbmVkIGZvciB0aGUgc3RhdGVzXHJcbiAgICogYW5kIGFsbCBkZWRpY2F0ZWQgbWV0aG9kcyBkZWZpbmVkIGZvciB0cmFuc2l0aW9ucyB0byBvdGhlciBzdGF0ZXMsIGFzIHdlbGwgYXMgZGVmYXVsdCBtZXRob2RzLlxyXG4gICAqIEluc3RydWN0aW9ucyBleGlzdCBpbmRlcGVuZGVudGx5IGZyb20gU3RhdGVNYWNoaW5lcy4gQSBzdGF0ZW1hY2hpbmUgaW5zdGFuY2UgaXMgcGFzc2VkIGFzIHBhcmFtZXRlciB0byB0aGUgaW5zdHJ1Y3Rpb24gc2V0LlxyXG4gICAqIE11bHRpcGxlIHN0YXRlbWFjaGluZS1pbnN0YW5jZXMgY2FuIHRodXMgdXNlIHRoZSBzYW1lIGluc3RydWN0aW9uIHNldCBhbmQgZGlmZmVyZW50IGluc3RydWN0aW9uIHNldHMgY291bGQgb3BlcmF0ZSBvbiB0aGUgc2FtZSBzdGF0ZW1hY2hpbmUuXHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIFN0YXRlTWFjaGluZUluc3RydWN0aW9uczxTdGF0ZT4gZXh0ZW5kcyBNYXA8U3RhdGUsIFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2RzPFN0YXRlPj4ge1xyXG4gICAgLyoqIERlZmluZSBkZWRpY2F0ZWQgdHJhbnNpdGlvbiBtZXRob2QgdG8gdHJhbnNpdCBmcm9tIG9uZSBzdGF0ZSB0byBhbm90aGVyKi9cclxuICAgIHB1YmxpYyBzZXRUcmFuc2l0aW9uKF9jdXJyZW50OiBTdGF0ZSwgX25leHQ6IFN0YXRlLCBfdHJhbnNpdGlvbjogU3RhdGVNYWNoaW5lTWV0aG9kPFN0YXRlPik6IHZvaWQge1xyXG4gICAgICBsZXQgYWN0aXZlOiBTdGF0ZU1hY2hpbmVNYXBTdGF0ZVRvTWV0aG9kczxTdGF0ZT4gPSB0aGlzLmdldFN0YXRlTWV0aG9kcyhfY3VycmVudCk7XHJcbiAgICAgIGFjdGl2ZS50cmFuc2l0aW9ucy5zZXQoX25leHQsIF90cmFuc2l0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogRGVmaW5lIGRlZGljYXRlZCBhY3Rpb24gbWV0aG9kIGZvciBhIHN0YXRlICovXHJcbiAgICBwdWJsaWMgc2V0QWN0aW9uKF9jdXJyZW50OiBTdGF0ZSwgX2FjdGlvbjogU3RhdGVNYWNoaW5lTWV0aG9kPFN0YXRlPik6IHZvaWQge1xyXG4gICAgICBsZXQgYWN0aXZlOiBTdGF0ZU1hY2hpbmVNYXBTdGF0ZVRvTWV0aG9kczxTdGF0ZT4gPSB0aGlzLmdldFN0YXRlTWV0aG9kcyhfY3VycmVudCk7XHJcbiAgICAgIGFjdGl2ZS5hY3Rpb24gPSBfYWN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBEZWZhdWx0IHRyYW5zaXRpb24gbWV0aG9kIHRvIGludm9rZSBpZiBubyBkZWRpY2F0ZWQgdHJhbnNpdGlvbiBleGlzdHMsIHNob3VsZCBiZSBvdmVycmlkZW4gaW4gc3ViY2xhc3MgKi9cclxuICAgIHB1YmxpYyB0cmFuc2l0RGVmYXVsdChfbWFjaGluZTogU3RhdGVNYWNoaW5lPFN0YXRlPik6IHZvaWQge1xyXG4gICAgICAvL1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKiogRGVmYXVsdCBhY3Rpb24gbWV0aG9kIHRvIGludm9rZSBpZiBubyBkZWRpY2F0ZWQgYWN0aW9uIGV4aXN0cywgc2hvdWxkIGJlIG92ZXJyaWRlbiBpbiBzdWJjbGFzcyAqL1xyXG4gICAgcHVibGljIGFjdERlZmF1bHQoX21hY2hpbmU6IFN0YXRlTWFjaGluZTxTdGF0ZT4pOiB2b2lkIHtcclxuICAgICAgLy9cclxuICAgIH1cclxuXHJcbiAgICAvKiogSW52b2tlIGEgZGVkaWNhdGVkIHRyYW5zaXRpb24gbWV0aG9kIGlmIGZvdW5kIGZvciB0aGUgY3VycmVudCBhbmQgdGhlIG5leHQgc3RhdGUsIG9yIHRoZSBkZWZhdWx0IG1ldGhvZCAqL1xyXG4gICAgcHVibGljIHRyYW5zaXQoX2N1cnJlbnQ6IFN0YXRlLCBfbmV4dDogU3RhdGUsIF9tYWNoaW5lOiBTdGF0ZU1hY2hpbmU8U3RhdGU+KTogdm9pZCB7XHJcbiAgICAgIF9tYWNoaW5lLnN0YXRlTmV4dCA9IF9uZXh0O1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGxldCBhY3RpdmU6IFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2RzPFN0YXRlPiA9IHRoaXMuZ2V0KF9jdXJyZW50KTtcclxuICAgICAgICBsZXQgdHJhbnNpdGlvbjogU3RhdGVNYWNoaW5lTWV0aG9kPFN0YXRlPiA9IGFjdGl2ZS50cmFuc2l0aW9ucy5nZXQoX25leHQpO1xyXG4gICAgICAgIHRyYW5zaXRpb24oX21hY2hpbmUpO1xyXG4gICAgICB9IGNhdGNoIChfZXJyb3IpIHtcclxuICAgICAgICAvLyBjb25zb2xlLmluZm8oX2Vycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdERlZmF1bHQoX21hY2hpbmUpO1xyXG4gICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIF9tYWNoaW5lLnN0YXRlQ3VycmVudCA9IF9uZXh0O1xyXG4gICAgICAgIF9tYWNoaW5lLnN0YXRlTmV4dCA9IHVuZGVmaW5lZDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBJbnZva2UgdGhlIGRlZGljYXRlZCBhY3Rpb24gbWV0aG9kIGlmIGZvdW5kIGZvciB0aGUgY3VycmVudCBzdGF0ZSwgb3IgdGhlIGRlZmF1bHQgbWV0aG9kICovXHJcbiAgICBwdWJsaWMgYWN0KF9jdXJyZW50OiBTdGF0ZSwgX21hY2hpbmU6IFN0YXRlTWFjaGluZTxTdGF0ZT4pOiB2b2lkIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBsZXQgYWN0aXZlOiBTdGF0ZU1hY2hpbmVNYXBTdGF0ZVRvTWV0aG9kczxTdGF0ZT4gPSB0aGlzLmdldChfY3VycmVudCk7XHJcbiAgICAgICAgYWN0aXZlLmFjdGlvbihfbWFjaGluZSk7XHJcbiAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xyXG4gICAgICAgIC8vIGNvbnNvbGUuaW5mbyhfZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgdGhpcy5hY3REZWZhdWx0KF9tYWNoaW5lKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBGaW5kIHRoZSBpbnN0cnVjdGlvbnMgZGVkaWNhdGVkIGZvciB0aGUgY3VycmVudCBzdGF0ZSBvciBjcmVhdGUgYW4gZW1wdHkgc2V0IGZvciBpdCAqL1xyXG4gICAgcHJpdmF0ZSBnZXRTdGF0ZU1ldGhvZHMoX2N1cnJlbnQ6IFN0YXRlKTogU3RhdGVNYWNoaW5lTWFwU3RhdGVUb01ldGhvZHM8U3RhdGU+IHtcclxuICAgICAgbGV0IGFjdGl2ZTogU3RhdGVNYWNoaW5lTWFwU3RhdGVUb01ldGhvZHM8U3RhdGU+ID0gdGhpcy5nZXQoX2N1cnJlbnQpO1xyXG4gICAgICBpZiAoIWFjdGl2ZSkge1xyXG4gICAgICAgIGFjdGl2ZSA9IHsgYWN0aW9uOiBudWxsLCB0cmFuc2l0aW9uczogbmV3IE1hcCgpIH07XHJcbiAgICAgICAgdGhpcy5zZXQoX2N1cnJlbnQsIGFjdGl2ZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFjdGl2ZTtcclxuICAgIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xyXG4gIGV4cG9ydCBjbGFzcyBWaWV3cG9ydCB7XHJcbiAgICBwdWJsaWMgc3RhdGljIGV4cGFuZENhbWVyYVRvSW50ZXJhY3RpdmVPcmJpdChfdmlld3BvcnQ6IMaSLlZpZXdwb3J0LCBfc2hvd0ZvY3VzOiBib29sZWFuID0gdHJ1ZSwgX3NwZWVkQ2FtZXJhUm90YXRpb246IG51bWJlciA9IDEsIF9zcGVlZENhbWVyYVRyYW5zbGF0aW9uOiBudW1iZXIgPSAwLjAxLCBfc3BlZWRDYW1lcmFEaXN0YW5jZTogbnVtYmVyID0gMC4wMDEpOiBDYW1lcmFPcmJpdCB7XHJcbiAgICAgIF92aWV3cG9ydC5zZXRGb2N1cyh0cnVlKTtcclxuICAgICAgX3ZpZXdwb3J0LmFjdGl2YXRlUG9pbnRlckV2ZW50KMaSLkVWRU5UX1BPSU5URVIuTU9WRSwgdHJ1ZSk7XHJcbiAgICAgIF92aWV3cG9ydC5hY3RpdmF0ZVdoZWVsRXZlbnQoxpIuRVZFTlRfV0hFRUwuV0hFRUwsIHRydWUpO1xyXG4gICAgICBfdmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcijGki5FVkVOVF9QT0lOVEVSLk1PVkUsIGhuZFBvaW50ZXJNb3ZlKTtcclxuICAgICAgX3ZpZXdwb3J0LmFkZEV2ZW50TGlzdGVuZXIoxpIuRVZFTlRfV0hFRUwuV0hFRUwsIGhuZFdoZWVsTW92ZSk7XHJcblxyXG4gICAgICBsZXQgY250TW91c2VIb3Jpem9udGFsOiDGki5Db250cm9sID0gbmV3IMaSLkNvbnRyb2woXCJNb3VzZUhvcml6b250YWxcIik7XHJcbiAgICAgIGxldCBjbnRNb3VzZVZlcnRpY2FsOiDGki5Db250cm9sID0gbmV3IMaSLkNvbnRyb2woXCJNb3VzZVZlcnRpY2FsXCIpO1xyXG4gICAgICBsZXQgY250TW91c2VXaGVlbDogxpIuQ29udHJvbCA9IG5ldyDGki5Db250cm9sKFwiTW91c2VXaGVlbFwiKTtcclxuXHJcbiAgICAgIC8vIGNhbWVyYSBzZXR1cFxyXG4gICAgICBsZXQgY2FtZXJhOiBDYW1lcmFPcmJpdE1vdmluZ0ZvY3VzO1xyXG4gICAgICBjYW1lcmEgPSBuZXcgQ2FtZXJhT3JiaXRNb3ZpbmdGb2N1cyhfdmlld3BvcnQuY2FtZXJhLCAzLCA4MCwgMC4xLCA1MCk7XHJcblxyXG4gICAgICAvLyBzZXQgdXAgYXhpcyB0byBjb250cm9sXHJcbiAgICAgIGNhbWVyYS5heGlzUm90YXRlWC5hZGRDb250cm9sKGNudE1vdXNlVmVydGljYWwpO1xyXG4gICAgICBjYW1lcmEuYXhpc1JvdGF0ZVguc2V0RmFjdG9yKF9zcGVlZENhbWVyYVJvdGF0aW9uKTtcclxuXHJcbiAgICAgIGNhbWVyYS5heGlzUm90YXRlWS5hZGRDb250cm9sKGNudE1vdXNlSG9yaXpvbnRhbCk7XHJcbiAgICAgIGNhbWVyYS5heGlzUm90YXRlWS5zZXRGYWN0b3IoX3NwZWVkQ2FtZXJhUm90YXRpb24pO1xyXG5cclxuICAgICAgY2FtZXJhLmF4aXNUcmFuc2xhdGVYLmFkZENvbnRyb2woY250TW91c2VIb3Jpem9udGFsKTtcclxuICAgICAgY2FtZXJhLmF4aXNUcmFuc2xhdGVYLnNldEZhY3Rvcihfc3BlZWRDYW1lcmFUcmFuc2xhdGlvbik7XHJcblxyXG4gICAgICBjYW1lcmEuYXhpc1RyYW5zbGF0ZVkuYWRkQ29udHJvbChjbnRNb3VzZVZlcnRpY2FsKTtcclxuICAgICAgY2FtZXJhLmF4aXNUcmFuc2xhdGVZLnNldEZhY3Rvcihfc3BlZWRDYW1lcmFUcmFuc2xhdGlvbik7XHJcblxyXG4gICAgICBjYW1lcmEuYXhpc1RyYW5zbGF0ZVouYWRkQ29udHJvbChjbnRNb3VzZVdoZWVsKTtcclxuICAgICAgY2FtZXJhLmF4aXNUcmFuc2xhdGVaLnNldEZhY3Rvcihfc3BlZWRDYW1lcmFEaXN0YW5jZSk7XHJcblxyXG4gICAgICBfdmlld3BvcnQuZ2V0R3JhcGgoKS5hZGRDaGlsZChjYW1lcmEpO1xyXG5cclxuICAgICAgbGV0IGZvY3VzOiDGki5Ob2RlO1xyXG4gICAgICBpZiAoX3Nob3dGb2N1cykge1xyXG4gICAgICAgIGZvY3VzID0gbmV3IE5vZGVDb29yZGluYXRlU3lzdGVtKFwiRm9jdXNcIik7XHJcbiAgICAgICAgZm9jdXMuYWRkQ29tcG9uZW50KG5ldyDGki5Db21wb25lbnRUcmFuc2Zvcm0oKSk7XHJcbiAgICAgICAgX3ZpZXdwb3J0LmdldEdyYXBoKCkuYWRkQ2hpbGQoZm9jdXMpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICByZXR1cm4gY2FtZXJhO1xyXG5cclxuICAgICAgZnVuY3Rpb24gaG5kUG9pbnRlck1vdmUoX2V2ZW50OiDGki5FdmVudFBvaW50ZXIpOiB2b2lkIHtcclxuICAgICAgICBpZiAoISgoX2V2ZW50LmJ1dHRvbnMgJiA0KSA9PT0gNCkpXHJcbiAgICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICAgIGFjdGl2YXRlQXhpcyhfZXZlbnQpO1xyXG4gICAgICAgIGxldCBwb3NDYW1lcmE6IMaSLlZlY3RvcjMgPSBjYW1lcmEubm9kZS5tdHhXb3JsZC50cmFuc2xhdGlvbi5jb3B5O1xyXG5cclxuICAgICAgICBjbnRNb3VzZUhvcml6b250YWwuc2V0SW5wdXQoX2V2ZW50Lm1vdmVtZW50WCk7XHJcbiAgICAgICAgY250TW91c2VWZXJ0aWNhbC5zZXRJbnB1dCgoX2V2ZW50LnNoaWZ0S2V5ID8gLTEgOiAxKSAqIF9ldmVudC5tb3ZlbWVudFkpO1xyXG5cclxuICAgICAgICBpZiAoX3Nob3dGb2N1cylcclxuICAgICAgICAgIGZvY3VzLm10eExvY2FsLnRyYW5zbGF0aW9uID0gY2FtZXJhLm10eExvY2FsLnRyYW5zbGF0aW9uO1xyXG4gICAgICAgIC8vX3ZpZXdwb3J0LmRyYXcoKTtcclxuICAgICAgICBcclxuICAgICAgICBpZiAoX2V2ZW50LmFsdEtleSAmJiAhX2V2ZW50LnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICBsZXQgb2Zmc2V0OiDGki5WZWN0b3IzID0gxpIuVmVjdG9yMy5ESUZGRVJFTkNFKHBvc0NhbWVyYSwgY2FtZXJhLm5vZGUubXR4V29ybGQudHJhbnNsYXRpb24pO1xyXG4gICAgICAgICAgLy8gY29uc29sZS5sb2cocG9zQ2FtZXJhLnRvU3RyaW5nKCksIGNhbWVyYS5ub2RlLm10eFdvcmxkLnRyYW5zbGF0aW9uLnRvU3RyaW5nKCkpO1xyXG4gICAgICAgICAgY2FtZXJhLm10eExvY2FsLnRyYW5zbGF0ZShvZmZzZXQsIGZhbHNlKTtcclxuICAgICAgICAgIGZvY3VzLm10eExvY2FsLnRyYW5zbGF0aW9uID0gY2FtZXJhLm10eExvY2FsLnRyYW5zbGF0aW9uO1xyXG4gICAgICAgICAgLy9fdmlld3BvcnQuZHJhdygpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gaG5kV2hlZWxNb3ZlKF9ldmVudDogV2hlZWxFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIGFjdGl2YXRlQXhpcyhfZXZlbnQpO1xyXG5cclxuICAgICAgICBpZiAoX2V2ZW50LnNoaWZ0S2V5KSB7XHJcbiAgICAgICAgICBjbnRNb3VzZVdoZWVsLnNldElucHV0KF9ldmVudC5kZWx0YVkpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBlbHNlXHJcbiAgICAgICAgICBjYW1lcmEuZGlzdGFuY2UgKz0gX2V2ZW50LmRlbHRhWSAqIF9zcGVlZENhbWVyYURpc3RhbmNlO1xyXG5cclxuICAgICAgICBpZiAoX3Nob3dGb2N1cylcclxuICAgICAgICAgIGZvY3VzLm10eExvY2FsLnRyYW5zbGF0aW9uID0gY2FtZXJhLm10eExvY2FsLnRyYW5zbGF0aW9uO1xyXG4gICAgICAgIC8vX3ZpZXdwb3J0LmRyYXcoKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgZnVuY3Rpb24gYWN0aXZhdGVBeGlzKF9ldmVudDogUG9pbnRlckV2ZW50IHwgV2hlZWxFdmVudCk6IHZvaWQge1xyXG4gICAgICAgIGNhbWVyYS5heGlzVHJhbnNsYXRlWC5hY3RpdmUgPSBfZXZlbnQuc2hpZnRLZXk7XHJcbiAgICAgICAgY2FtZXJhLmF4aXNUcmFuc2xhdGVZLmFjdGl2ZSA9IF9ldmVudC5zaGlmdEtleTtcclxuICAgICAgICBjYW1lcmEuYXhpc1RyYW5zbGF0ZVouYWN0aXZlID0gX2V2ZW50LnNoaWZ0S2V5O1xyXG5cclxuICAgICAgICBjYW1lcmEuYXhpc1JvdGF0ZVguYWN0aXZlID0gIV9ldmVudC5zaGlmdEtleTtcclxuICAgICAgICBjYW1lcmEuYXhpc1JvdGF0ZVkuYWN0aXZlID0gIV9ldmVudC5zaGlmdEtleTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH1cclxufSJdfQ==