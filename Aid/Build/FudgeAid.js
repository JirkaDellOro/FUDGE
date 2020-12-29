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
            let shaft = new FudgeAid.Node("Shaft", ƒ.Matrix4x4.IDENTITY(), NodeArrow.internalResources.get("Material"), NodeArrow.internalResources.get("Shaft"));
            let head = new FudgeAid.Node("Head", ƒ.Matrix4x4.IDENTITY(), NodeArrow.internalResources.get("Material"), NodeArrow.internalResources.get("Head"));
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
        coat.texture = new ƒ.TextureImage();
        coat.texture.image = _image;
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
            let img = this.spritesheet.texture.image;
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
         * the size of the borders of the grid and more
         */
        generateByGrid(_startRect, _frames, _borderSize, _resolutionQuad, _origin) {
            let img = this.spritesheet.texture.image;
            let rect = _startRect.copy;
            let rects = [];
            while (_frames--) {
                rects.push(rect.copy);
                rect.position.x += _startRect.size.x + _borderSize.x;
                if (rect.right < img.width)
                    continue;
                _startRect.position.y += _startRect.size.y + _borderSize.y;
                rect = _startRect.copy;
                if (rect.bottom > img.height)
                    break;
            }
            rects.forEach((_rect) => ƒ.Debug.log(_rect.toString()));
            this.generate(rects, _resolutionQuad, _origin);
        }
        createFrame(_name, _framing, _rect, _resolutionQuad, _origin) {
            let img = this.spritesheet.texture.image;
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
            this.stateMachine.transit(this.stateCurrent, _next, this);
        }
        act() {
            this.stateMachine.act(this.stateCurrent, this);
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
            this.stateMachine.transit(this.stateCurrent, _next, this);
        }
        act() {
            this.stateMachine.act(this.stateCurrent, this);
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
                console.info(_error.message);
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
                console.info(_error.message);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVkZ2VBaWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9Tb3VyY2UvUmVmZXJlbmNlcy50cyIsIi4uL1NvdXJjZS9Bcml0aG1ldGljL0FyaXRoLnRzIiwiLi4vU291cmNlL0FyaXRobWV0aWMvQXJpdGhCaXNlY3Rpb24udHMiLCIuLi9Tb3VyY2UvQ2FtZXJhL0NhbWVyYU9yYml0LnRzIiwiLi4vU291cmNlL0NhbWVyYS9DYW1lcmFPcmJpdE1vdmluZ0ZvY3VzLnRzIiwiLi4vU291cmNlL0NhbnZhcy9DYW52YXMudHMiLCIuLi9Tb3VyY2UvR2VvbWV0cnkvTm9kZS50cyIsIi4uL1NvdXJjZS9HZW9tZXRyeS9Ob2RlQXJyb3cudHMiLCIuLi9Tb3VyY2UvR2VvbWV0cnkvTm9kZUNvb3JkaW5hdGVTeXN0ZW0udHMiLCIuLi9Tb3VyY2UvTGlnaHQvTm9kZUxpZ2h0U2V0dXAudHMiLCIuLi9Tb3VyY2UvU3ByaXRlL05vZGVTcHJpdGUudHMiLCIuLi9Tb3VyY2UvU3ByaXRlL1Nwcml0ZVNoZWV0QW5pbWF0aW9uLnRzIiwiLi4vU291cmNlL1N0YXRlTWFjaGluZS9Db21wb25lbnRTdGF0ZU1hY2hpbmUudHMiLCIuLi9Tb3VyY2UvU3RhdGVNYWNoaW5lL1N0YXRlTWFjaGluZS50cyIsIi4uL1NvdXJjZS9WaWV3cG9ydC9WaWV3cG9ydC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsbURBQW1EO0FBQ25ELElBQU8sQ0FBQyxHQUFHLFNBQVMsQ0FBQztBQUNyQixJQUFPLElBQUksR0FBRyxRQUFRLENBQUM7QUFDdkIsSUFBVSxRQUFRLENBRWpCO0FBRkQsV0FBVSxRQUFRO0lBQ2hCLENBQUMsQ0FBQyxVQUFVLENBQUMsaUJBQWlCLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDM0MsQ0FBQyxFQUZTLFFBQVEsS0FBUixRQUFRLFFBRWpCO0FDTEQsSUFBVSxRQUFRLENBZWpCO0FBZkQsV0FBVSxRQUFRO0lBQ2hCOztPQUVHO0lBQ0gsTUFBc0IsS0FB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RCxJQUFJLFdBQVcsR0FBZ0IsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDNUUsSUFBSSxLQUFLLEdBQWdCLElBQUksV0FBVyxFQUFFLENBQUM7WUFFM0MsS0FBSyxDQUFDLFdBQVcsR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFDLEtBQUssQ0FBQyxDQUFDO1lBQzVDLEtBQUssQ0FBQyxXQUFXLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsQ0FBQztZQUU1RSxJQUFJLFFBQVEsR0FBZ0IsSUFBSSxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsS0FBSyxDQUFDLEtBQUssR0FBRyxlQUFlLEVBQUUsS0FBSyxDQUFDLE1BQU0sR0FBRyxlQUFlLEVBQUUsT0FBTyxDQUFDLENBQUM7WUFDMUgsS0FBSyxDQUFDLFFBQVEsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3hDLEtBQUssQ0FBQyxRQUFRLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUNsSSxLQUFLLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1lBQ3ZDLEtBQUssQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDdkMsb0NBQW9DO1lBRXBDLEtBQUssQ0FB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TSxDQUFDLFFBQVEsQ0FBQztnQkFDL0MsTUFBTSxDQUFDLGNBQWMsQ0FBQyxNQUFNLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFFL0MsTUFBTSxDQUFDLFdBQVcsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDO2dCQUM3QyxNQUFNLENBQUMsV0FBVyxDQUFDLE1BQU0sR0FBRyxDQUFDLE1BQU0sQ0FBQyxRQUFRLENBQUM7WUFDL0MsQ0FBQztRQUNILENBQUM7S0FDRjtJQXpGWSxpQkFBUSxXQXlGcEIsQ0FBQTtBQUNILENBQUMsRUEzRlMsUUFBUSxLQUFSLFFBQVEsUUEyRmpCIiwic291cmNlc0NvbnRlbnQiOlsiLy8gLzxyZWZlcmVuY2UgdHlwZXM9XCIuLi8uLi9Db3JlL0J1aWxkL0Z1ZGdlQ29yZVwiLz5cbmltcG9ydCDGkiA9IEZ1ZGdlQ29yZTtcbmltcG9ydCDGkkFpZCA9IEZ1ZGdlQWlkO1xubmFtZXNwYWNlIEZ1ZGdlQWlkIHtcbiAgxpIuU2VyaWFsaXplci5yZWdpc3Rlck5hbWVzcGFjZShGdWRnZUFpZCk7XG59IiwibmFtZXNwYWNlIEZ1ZGdlQWlkIHtcbiAgLyoqXG4gICAqIEFic3RyYWN0IGNsYXNzIHN1cHBvcnRpbmcgdmVyc2lvdXMgYXJpdGhtZXRpY2FsIGhlbHBlciBmdW5jdGlvbnNcbiAgICovXG4gIGV4cG9ydCBhYnN0cmFjdCBjbGFzcyBBcml0aCB7XG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIG9uZSBvZiB0aGUgdmFsdWVzIHBhc3NlZCBpbiwgZWl0aGVyIF92YWx1ZSBpZiB3aXRoaW4gX21pbiBhbmQgX21heCBvciB0aGUgYm91bmRhcnkgYmVpbmcgZXhjZWVkZWQgYnkgX3ZhbHVlXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjbGFtcDxUPihfdmFsdWU6IFQsIF9taW46IFQsIF9tYXg6IFQsIF9pc1NtYWxsZXI6IChfdmFsdWUxOiBULCBfdmFsdWUyOiBUKSA9PiBib29sZWFuID0gKF92YWx1ZTE6IFQsIF92YWx1ZTI6IFQpID0+IHsgcmV0dXJuIF92YWx1ZTEgPCBfdmFsdWUyOyB9KTogVCB7XG4gICAgICBpZiAoX2lzU21hbGxlcihfdmFsdWUsIF9taW4pKSByZXR1cm4gX21pbjtcbiAgICAgIGlmIChfaXNTbWFsbGVyKF9tYXgsIF92YWx1ZSkpIHJldHVybiBfbWF4O1xuICAgICAgcmV0dXJuIF92YWx1ZTtcbiAgICB9XG4gIH1cbn0iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xuICAvKipcbiAgICogV2l0aGluIGEgZ2l2ZW4gcHJlY2lzaW9uLCBhbiBvYmplY3Qgb2YgdGhpcyBjbGFzcyBmaW5kcyB0aGUgcGFyYW1ldGVyIHZhbHVlIGF0IHdoaWNoIGEgZ2l2ZW4gZnVuY3Rpb24gXG4gICAqIHN3aXRjaGVzIGl0cyBib29sZWFuIHJldHVybiB2YWx1ZSB1c2luZyBpbnRlcnZhbCBzcGxpdHRpbmcgKGJpc2VjdGlvbikuIFxuICAgKiBQYXNzIHRoZSB0eXBlIG9mIHRoZSBwYXJhbWV0ZXIgYW5kIHRoZSB0eXBlIHRoZSBwcmVjaXNpb24gaXMgbWVhc3VyZWQgaW4uXG4gICAqL1xuICBleHBvcnQgY2xhc3MgQXJpdGhCaXNlY3Rpb248UGFyYW1ldGVyLCBFcHNpbG9uPiB7XG4gICAgLyoqIFRoZSBsZWZ0IGJvcmRlciBvZiB0aGUgaW50ZXJ2YWwgZm91bmQgKi9cbiAgICBwdWJsaWMgbGVmdDogUGFyYW1ldGVyO1xuICAgIC8qKiBUaGUgcmlnaHQgYm9yZGVyIG9mIHRoZSBpbnRlcnZhbCBmb3VuZCAqL1xuICAgIHB1YmxpYyByaWdodDogUGFyYW1ldGVyO1xuICAgIC8qKiBUaGUgZnVuY3Rpb24gdmFsdWUgYXQgdGhlIGxlZnQgYm9yZGVyIG9mIHRoZSBpbnRlcnZhbCBmb3VuZCAqL1xuICAgIHB1YmxpYyBsZWZ0VmFsdWU6IGJvb2xlYW47XG4gICAgLyoqIFRoZSBmdW5jdGlvbiB2YWx1ZSBhdCB0aGUgcmlnaHQgYm9yZGVyIG9mIHRoZSBpbnRlcnZhbCBmb3VuZCAqL1xuICAgIHB1YmxpYyByaWdodFZhbHVlOiBib29sZWFuO1xuXG4gICAgcHJpdmF0ZSBmdW5jdGlvbjogKF90OiBQYXJhbWV0ZXIpID0+IGJvb2xlYW47XG4gICAgcHJpdmF0ZSBkaXZpZGU6IChfbGVmdDogUGFyYW1ldGVyLCBfcmlnaHQ6IFBhcmFtZXRlcikgPT4gUGFyYW1ldGVyO1xuICAgIHByaXZhdGUgaXNTbWFsbGVyOiAoX2xlZnQ6IFBhcmFtZXRlciwgX3JpZ2h0OiBQYXJhbWV0ZXIsIF9lcHNpbG9uOiBFcHNpbG9uKSA9PiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBTb2x2ZXJcbiAgICAgKiBAcGFyYW0gX2Z1bmN0aW9uIEEgZnVuY3Rpb24gdGhhdCB0YWtlcyBhbiBhcmd1bWVudCBvZiB0aGUgZ2VuZXJpYyB0eXBlIDxQYXJhbWV0ZXI+IGFuZCByZXR1cm5zIGEgYm9vbGVhbiB2YWx1ZS5cbiAgICAgKiBAcGFyYW0gX2RpdmlkZSBBIGZ1bmN0aW9uIHNwbGl0dGluZyB0aGUgaW50ZXJ2YWwgdG8gZmluZCBhIHBhcmFtZXRlciBmb3IgdGhlIG5leHQgaXRlcmF0aW9uLCBtYXkgc2ltcGx5IGJlIHRoZSBhcml0aG1ldGljIG1lYW5cbiAgICAgKiBAcGFyYW0gX2lzU21hbGxlciBBIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyBhIGRpZmZlcmVuY2UgYmV0d2VlbiB0aGUgYm9yZGVycyBvZiB0aGUgY3VycmVudCBpbnRlcnZhbCBhbmQgY29tcGFyZXMgdGhpcyB0byB0aGUgZ2l2ZW4gcHJlY2lzaW9uIFxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKFxuICAgICAgX2Z1bmN0aW9uOiAoX3Q6IFBhcmFtZXRlcikgPT4gYm9vbGVhbixcbiAgICAgIF9kaXZpZGU6IChfbGVmdDogUGFyYW1ldGVyLCBfcmlnaHQ6IFBhcmFtZXRlcikgPT4gUGFyYW1ldGVyLFxuICAgICAgX2lzU21hbGxlcjogKF9sZWZ0OiBQYXJhbWV0ZXIsIF9yaWdodDogUGFyYW1ldGVyLCBfZXBzaWxvbjogRXBzaWxvbikgPT4gYm9vbGVhbikge1xuICAgICAgdGhpcy5mdW5jdGlvbiA9IF9mdW5jdGlvbjtcbiAgICAgIHRoaXMuZGl2aWRlID0gX2RpdmlkZTtcbiAgICAgIHRoaXMuaXNTbWFsbGVyID0gX2lzU21hbGxlcjtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyBhIHNvbHV0aW9uIHdpdGggdGhlIGdpdmVuIHByZWNpc2lvbiBpbiB0aGUgZ2l2ZW4gaW50ZXJ2YWwgdXNpbmcgdGhlIGZ1bmN0aW9ucyB0aGlzIFNvbHZlciB3YXMgY29uc3RydWN0ZWQgd2l0aC5cbiAgICAgKiBBZnRlciB0aGUgbWV0aG9kIHJldHVybnMsIGZpbmQgdGhlIGRhdGEgaW4gdGhpcyBvYmplY3RzIHByb3BlcnRpZXMuXG4gICAgICogQHBhcmFtIF9sZWZ0IFRoZSBwYXJhbWV0ZXIgb24gb25lIHNpZGUgb2YgdGhlIGludGVydmFsLlxuICAgICAqIEBwYXJhbSBfcmlnaHQgVGhlIHBhcmFtZXRlciBvbiB0aGUgb3RoZXIgc2lkZSwgbWF5IGJlIFwic21hbGxlclwiIHRoYW4gW1tfbGVmdF1dLlxuICAgICAqIEBwYXJhbSBfZXBzaWxvbiBUaGUgZGVzaXJlZCBwcmVjaXNpb24gb2YgdGhlIHNvbHV0aW9uLlxuICAgICAqIEBwYXJhbSBfbGVmdFZhbHVlIFRoZSB2YWx1ZSBvbiB0aGUgbGVmdCBzaWRlIG9mIHRoZSBpbnRlcnZhbCwgb21pdCBpZiB5ZXQgdW5rbm93biBvciBwYXNzIGluIGlmIGtub3duIGZvciBiZXR0ZXIgcGVyZm9ybWFuY2UuXG4gICAgICogQHBhcmFtIF9yaWdodFZhbHVlIFRoZSB2YWx1ZSBvbiB0aGUgcmlnaHQgc2lkZSBvZiB0aGUgaW50ZXJ2YWwsIG9taXQgaWYgeWV0IHVua25vd24gb3IgcGFzcyBpbiBpZiBrbm93biBmb3IgYmV0dGVyIHBlcmZvcm1hbmNlLlxuICAgICAqIEB0aHJvd3MgRXJyb3IgaWYgYm90aCBzaWRlcyBvZiB0aGUgaW50ZXJ2YWwgcmV0dXJuIHRoZSBzYW1lIHZhbHVlLlxuICAgICAqL1xuICAgIHB1YmxpYyBzb2x2ZShfbGVmdDogUGFyYW1ldGVyLCBfcmlnaHQ6IFBhcmFtZXRlciwgX2Vwc2lsb246IEVwc2lsb24sIF9sZWZ0VmFsdWU6IGJvb2xlYW4gPSB1bmRlZmluZWQsIF9yaWdodFZhbHVlOiBib29sZWFuID0gdW5kZWZpbmVkKTogdm9pZCB7XG4gICAgICB0aGlzLmxlZnQgPSBfbGVmdDtcbiAgICAgIHRoaXMubGVmdFZhbHVlID0gX2xlZnRWYWx1ZSB8fCB0aGlzLmZ1bmN0aW9uKF9sZWZ0KTtcbiAgICAgIHRoaXMucmlnaHQgPSBfcmlnaHQ7XG4gICAgICB0aGlzLnJpZ2h0VmFsdWUgPSBfcmlnaHRWYWx1ZSB8fCB0aGlzLmZ1bmN0aW9uKF9yaWdodCk7XG5cbiAgICAgIGlmICh0aGlzLmlzU21hbGxlcihfbGVmdCwgX3JpZ2h0LCBfZXBzaWxvbikpXG4gICAgICAgIHJldHVybjtcblxuICAgICAgaWYgKHRoaXMubGVmdFZhbHVlID09IHRoaXMucmlnaHRWYWx1ZSlcbiAgICAgICAgdGhyb3cobmV3IEVycm9yKFwiSW50ZXJ2YWwgc29sdmVyIGNhbid0IG9wZXJhdGUgd2l0aCBpZGVudGljYWwgZnVuY3Rpb24gdmFsdWVzIG9uIGJvdGggc2lkZXMgb2YgdGhlIGludGVydmFsXCIpKTtcblxuICAgICAgbGV0IGJldHdlZW46IFBhcmFtZXRlciA9IHRoaXMuZGl2aWRlKF9sZWZ0LCBfcmlnaHQpO1xuICAgICAgbGV0IGJldHdlZW5WYWx1ZTogYm9vbGVhbiA9IHRoaXMuZnVuY3Rpb24oYmV0d2Vlbik7XG4gICAgICBpZiAoYmV0d2VlblZhbHVlID09IHRoaXMubGVmdFZhbHVlKVxuICAgICAgICB0aGlzLnNvbHZlKGJldHdlZW4sIHRoaXMucmlnaHQsIF9lcHNpbG9uLCBiZXR3ZWVuVmFsdWUsIHRoaXMucmlnaHRWYWx1ZSk7XG4gICAgICBlbHNlXG4gICAgICAgIHRoaXMuc29sdmUodGhpcy5sZWZ0LCBiZXR3ZWVuLCBfZXBzaWxvbiwgdGhpcy5sZWZ0VmFsdWUsIGJldHdlZW5WYWx1ZSk7XG4gICAgfVxuXG4gICAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZyB7XG4gICAgICBsZXQgb3V0OiBzdHJpbmcgPSBcIlwiO1xuICAgICAgb3V0ICs9IGBsZWZ0OiAke3RoaXMubGVmdC50b1N0cmluZygpfSAtPiAke3RoaXMubGVmdFZhbHVlfWA7XG4gICAgICBvdXQgKz0gXCJcXG5cIjtcbiAgICAgIG91dCArPSBgcmlnaHQ6ICR7dGhpcy5yaWdodC50b1N0cmluZygpfSAtPiAke3RoaXMucmlnaHRWYWx1ZX1gO1xuICAgICAgcmV0dXJuIG91dDtcbiAgICB9XG4gIH1cbn0iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xyXG4gIGltcG9ydCDGkiA9IEZ1ZGdlQ29yZTtcclxuXHJcbiAgZXhwb3J0IGNsYXNzIENhbWVyYU9yYml0IGV4dGVuZHMgxpIuTm9kZSB7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgYXhpc1JvdGF0ZVg6IMaSLkF4aXMgPSBuZXcgxpIuQXhpcyhcIlJvdGF0ZVhcIiwgMSwgxpIuQ09OVFJPTF9UWVBFLlBST1BPUlRJT05BTCwgdHJ1ZSk7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgYXhpc1JvdGF0ZVk6IMaSLkF4aXMgPSBuZXcgxpIuQXhpcyhcIlJvdGF0ZVlcIiwgMSwgxpIuQ09OVFJPTF9UWVBFLlBST1BPUlRJT05BTCwgdHJ1ZSk7XHJcbiAgICBwdWJsaWMgcmVhZG9ubHkgYXhpc0Rpc3RhbmNlOiDGki5BeGlzID0gbmV3IMaSLkF4aXMoXCJEaXN0YW5jZVwiLCAxLCDGki5DT05UUk9MX1RZUEUuUFJPUE9SVElPTkFMLCB0cnVlKTtcclxuXHJcbiAgICBwcm90ZWN0ZWQgdHJhbnNsYXRvcjogxpIuTm9kZTtcclxuICAgIHByb3RlY3RlZCByb3RhdG9yWDogxpIuTm9kZTtcclxuICAgIHByaXZhdGUgbWF4Um90WDogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBtaW5EaXN0YW5jZTogbnVtYmVyO1xyXG4gICAgcHJpdmF0ZSBtYXhEaXN0YW5jZTogbnVtYmVyO1xyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihfY21wQ2FtZXJhOiDGki5Db21wb25lbnRDYW1lcmEsIF9kaXN0YW5jZVN0YXJ0OiBudW1iZXIgPSAyLCBfbWF4Um90WDogbnVtYmVyID0gNzUsIF9taW5EaXN0YW5jZTogbnVtYmVyID0gMSwgX21heERpc3RhbmNlOiBudW1iZXIgPSAxMCkge1xyXG4gICAgICBzdXBlcihcIkNhbWVyYU9yYml0XCIpO1xyXG5cclxuICAgICAgdGhpcy5tYXhSb3RYID0gTWF0aC5taW4oX21heFJvdFgsIDg5KTtcclxuICAgICAgdGhpcy5taW5EaXN0YW5jZSA9IF9taW5EaXN0YW5jZTtcclxuICAgICAgdGhpcy5tYXhEaXN0YW5jZSA9IF9tYXhEaXN0YW5jZTtcclxuXHJcbiAgICAgIGxldCBjbXBUcmFuc2Zvcm06IMaSLkNvbXBvbmVudFRyYW5zZm9ybSA9IG5ldyDGki5Db21wb25lbnRUcmFuc2Zvcm0oKTtcclxuICAgICAgdGhpcy5hZGRDb21wb25lbnQoY21wVHJhbnNmb3JtKTtcclxuXHJcbiAgICAgIHRoaXMucm90YXRvclggPSBuZXcgxpIuTm9kZShcIkNhbWVyYVJvdGF0aW9uWFwiKTtcclxuICAgICAgdGhpcy5yb3RhdG9yWC5hZGRDb21wb25lbnQobmV3IMaSLkNvbXBvbmVudFRyYW5zZm9ybSgpKTtcclxuICAgICAgdGhpcy5hZGRDaGlsZCh0aGlzLnJvdGF0b3JYKTtcclxuICAgICAgdGhpcy50cmFuc2xhdG9yID0gbmV3IMaSLk5vZGUoXCJDYW1lcmFUcmFuc2xhdGVcIik7XHJcbiAgICAgIHRoaXMudHJhbnNsYXRvci5hZGRDb21wb25lbnQobmV3IMaSLkNvbXBvbmVudFRyYW5zZm9ybSgpKTtcclxuICAgICAgdGhpcy50cmFuc2xhdG9yLm10eExvY2FsLnJvdGF0ZVkoMTgwKTtcclxuICAgICAgdGhpcy5yb3RhdG9yWC5hZGRDaGlsZCh0aGlzLnRyYW5zbGF0b3IpO1xyXG5cclxuICAgICAgdGhpcy50cmFuc2xhdG9yLmFkZENvbXBvbmVudChfY21wQ2FtZXJhKTtcclxuICAgICAgdGhpcy5kaXN0YW5jZSA9IF9kaXN0YW5jZVN0YXJ0O1xyXG5cclxuICAgICAgdGhpcy5heGlzUm90YXRlWC5hZGRFdmVudExpc3RlbmVyKMaSLkVWRU5UX0NPTlRST0wuT1VUUFVULCB0aGlzLmhuZEF4aXNPdXRwdXQpO1xyXG4gICAgICB0aGlzLmF4aXNSb3RhdGVZLmFkZEV2ZW50TGlzdGVuZXIoxpIuRVZFTlRfQ09OVFJPTC5PVVRQVVQsIHRoaXMuaG5kQXhpc091dHB1dCk7XHJcbiAgICAgIHRoaXMuYXhpc0Rpc3RhbmNlLmFkZEV2ZW50TGlzdGVuZXIoxpIuRVZFTlRfQ09OVFJPTC5PVVRQVVQsIHRoaXMuaG5kQXhpc091dHB1dCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBjb21wb25lbnQoKTogxpIuQ29tcG9uZW50Q2FtZXJhIHtcclxuICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRvci5nZXRDb21wb25lbnQoxpIuQ29tcG9uZW50Q2FtZXJhKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IG5vZGUoKTogxpIuTm9kZSB7XHJcbiAgICAgIHJldHVybiB0aGlzLnRyYW5zbGF0b3I7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHNldCBkaXN0YW5jZShfZGlzdGFuY2U6IG51bWJlcikge1xyXG4gICAgICBsZXQgbmV3RGlzdGFuY2U6IG51bWJlciA9IE1hdGgubWluKHRoaXMubWF4RGlzdGFuY2UsIE1hdGgubWF4KHRoaXMubWluRGlzdGFuY2UsIF9kaXN0YW5jZSkpO1xyXG4gICAgICB0aGlzLnRyYW5zbGF0b3IubXR4TG9jYWwudHJhbnNsYXRpb24gPSDGki5WZWN0b3IzLloobmV3RGlzdGFuY2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgZGlzdGFuY2UoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRvci5tdHhMb2NhbC50cmFuc2xhdGlvbi56O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgcm90YXRpb25ZKF9hbmdsZTogbnVtYmVyKSB7XHJcbiAgICAgIHRoaXMubXR4TG9jYWwucm90YXRpb24gPSDGki5WZWN0b3IzLlkoX2FuZ2xlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHJvdGF0aW9uWSgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5tdHhMb2NhbC5yb3RhdGlvbi55O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgcm90YXRpb25YKF9hbmdsZTogbnVtYmVyKSB7XHJcbiAgICAgIF9hbmdsZSA9IE1hdGgubWluKE1hdGgubWF4KC10aGlzLm1heFJvdFgsIF9hbmdsZSksIHRoaXMubWF4Um90WCk7XHJcbiAgICAgIHRoaXMucm90YXRvclgubXR4TG9jYWwucm90YXRpb24gPSDGki5WZWN0b3IzLlgoX2FuZ2xlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IHJvdGF0aW9uWCgpOiBudW1iZXIge1xyXG4gICAgICByZXR1cm4gdGhpcy5yb3RhdG9yWC5tdHhMb2NhbC5yb3RhdGlvbi54O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByb3RhdGVZKF9kZWx0YTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMubXR4TG9jYWwucm90YXRlWShfZGVsdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByb3RhdGVYKF9kZWx0YTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMucm90YXRpb25YID0gdGhpcy5yb3RhdG9yWC5tdHhMb2NhbC5yb3RhdGlvbi54ICsgX2RlbHRhO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBobmRBeGlzT3V0cHV0OiBFdmVudExpc3RlbmVyID0gKF9ldmVudDogRXZlbnQpOiB2b2lkID0+IHtcclxuICAgICAgbGV0IG91dHB1dDogbnVtYmVyID0gKDxDdXN0b21FdmVudD5fZXZlbnQpLmRldGFpbC5vdXRwdXQ7XHJcbiAgICAgIHN3aXRjaCAoKDzGki5BeGlzPl9ldmVudC50YXJnZXQpLm5hbWUpIHtcclxuICAgICAgICBjYXNlIFwiUm90YXRlWFwiOlxyXG4gICAgICAgICAgdGhpcy5yb3RhdGVYKG91dHB1dCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiUm90YXRlWVwiOlxyXG4gICAgICAgICAgdGhpcy5yb3RhdGVZKG91dHB1dCk7XHJcbiAgICAgICAgICBicmVhaztcclxuICAgICAgICBjYXNlIFwiRGlzdGFuY2VcIjpcclxuICAgICAgICAgIHRoaXMuZGlzdGFuY2UgKz0gb3V0cHV0O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XHJcblxyXG4gIGV4cG9ydCBjbGFzcyBDYW1lcmFPcmJpdE1vdmluZ0ZvY3VzIGV4dGVuZHMgQ2FtZXJhT3JiaXQge1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGF4aXNUcmFuc2xhdGVYOiDGki5BeGlzID0gbmV3IMaSLkF4aXMoXCJUcmFuc2xhdGVYXCIsIDEsIMaSLkNPTlRST0xfVFlQRS5QUk9QT1JUSU9OQUwsIHRydWUpO1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGF4aXNUcmFuc2xhdGVZOiDGki5BeGlzID0gbmV3IMaSLkF4aXMoXCJUcmFuc2xhdGVZXCIsIDEsIMaSLkNPTlRST0xfVFlQRS5QUk9QT1JUSU9OQUwsIHRydWUpO1xyXG4gICAgcHVibGljIHJlYWRvbmx5IGF4aXNUcmFuc2xhdGVaOiDGki5BeGlzID0gbmV3IMaSLkF4aXMoXCJUcmFuc2xhdGVaXCIsIDEsIMaSLkNPTlRST0xfVFlQRS5QUk9QT1JUSU9OQUwsIHRydWUpO1xyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihfY21wQ2FtZXJhOiDGki5Db21wb25lbnRDYW1lcmEsIF9kaXN0YW5jZVN0YXJ0OiBudW1iZXIgPSAyLCBfbWF4Um90WDogbnVtYmVyID0gNzUsIF9taW5EaXN0YW5jZTogbnVtYmVyID0gMSwgX21heERpc3RhbmNlOiBudW1iZXIgPSAxMCkge1xyXG4gICAgICBzdXBlcihfY21wQ2FtZXJhLCBfZGlzdGFuY2VTdGFydCwgX21heFJvdFgsIF9taW5EaXN0YW5jZSwgX21heERpc3RhbmNlKTtcclxuICAgICAgdGhpcy5uYW1lID0gXCJDYW1lcmFPcmJpdE1vdmluZ0ZvY3VzXCI7XHJcblxyXG4gICAgICB0aGlzLmF4aXNUcmFuc2xhdGVYLmFkZEV2ZW50TGlzdGVuZXIoxpIuRVZFTlRfQ09OVFJPTC5PVVRQVVQsIHRoaXMuaG5kQXhpc091dHB1dCk7XHJcbiAgICAgIHRoaXMuYXhpc1RyYW5zbGF0ZVkuYWRkRXZlbnRMaXN0ZW5lcijGki5FVkVOVF9DT05UUk9MLk9VVFBVVCwgdGhpcy5obmRBeGlzT3V0cHV0KTtcclxuICAgICAgdGhpcy5heGlzVHJhbnNsYXRlWi5hZGRFdmVudExpc3RlbmVyKMaSLkVWRU5UX0NPTlRST0wuT1VUUFVULCB0aGlzLmhuZEF4aXNPdXRwdXQpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0cmFuc2xhdGVYKF9kZWx0YTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMubXR4TG9jYWwudHJhbnNsYXRlWChfZGVsdGEpO1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICBwdWJsaWMgdHJhbnNsYXRlWShfZGVsdGE6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICBsZXQgdHJhbnNsYXRpb246IMaSLlZlY3RvcjMgPSB0aGlzLnJvdGF0b3JYLm10eFdvcmxkLmdldFkoKTtcclxuICAgICAgdHJhbnNsYXRpb24ubm9ybWFsaXplKF9kZWx0YSk7XHJcbiAgICAgIHRoaXMubXR4TG9jYWwudHJhbnNsYXRlKHRyYW5zbGF0aW9uLCBmYWxzZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHRyYW5zbGF0ZVooX2RlbHRhOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgLy8gdGhpcy5tdHhMb2NhbC50cmFuc2xhdGVaKF9kZWx0YSk7XHJcbiAgICAgIGxldCB0cmFuc2xhdGlvbjogxpIuVmVjdG9yMyA9IHRoaXMucm90YXRvclgubXR4V29ybGQuZ2V0WigpO1xyXG4gICAgICB0cmFuc2xhdGlvbi5ub3JtYWxpemUoX2RlbHRhKTtcclxuICAgICAgdGhpcy5tdHhMb2NhbC50cmFuc2xhdGUodHJhbnNsYXRpb24sIGZhbHNlKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgaG5kQXhpc091dHB1dDogRXZlbnRMaXN0ZW5lciA9IChfZXZlbnQ6IEV2ZW50KTogdm9pZCA9PiB7XHJcbiAgICAgIGxldCBvdXRwdXQ6IG51bWJlciA9ICg8Q3VzdG9tRXZlbnQ+X2V2ZW50KS5kZXRhaWwub3V0cHV0O1xyXG4gICAgICBzd2l0Y2ggKCg8xpIuQXhpcz5fZXZlbnQudGFyZ2V0KS5uYW1lKSB7XHJcbiAgICAgICAgY2FzZSBcIlRyYW5zbGF0ZVhcIjpcclxuICAgICAgICAgIHRoaXMudHJhbnNsYXRlWChvdXRwdXQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIlRyYW5zbGF0ZVlcIjpcclxuICAgICAgICAgIHRoaXMudHJhbnNsYXRlWShvdXRwdXQpO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgY2FzZSBcIlRyYW5zbGF0ZVpcIjpcclxuICAgICAgICAgIHRoaXMudHJhbnNsYXRlWihvdXRwdXQpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59IiwibmFtZXNwYWNlIEZ1ZGdlQWlkIHtcbiAgZXhwb3J0IGVudW0gSU1BR0VfUkVOREVSSU5HIHtcbiAgICBBVVRPID0gXCJhdXRvXCIsXG4gICAgU01PT1RIID0gXCJzbW9vdGhcIixcbiAgICBISUdIX1FVQUxJVFkgPSBcImhpZ2gtcXVhbGl0eVwiLFxuICAgIENSSVNQX0VER0VTID0gXCJjcmlzcC1lZGdlc1wiLFxuICAgIFBJWEVMQVRFRCA9IFwicGl4ZWxhdGVkXCJcbiAgfVxuICAvKipcbiAgICogQWRkcyBjb21mb3J0IG1ldGhvZHMgdG8gY3JlYXRlIGEgcmVuZGVyIGNhbnZhc1xuICAgKi9cbiAgZXhwb3J0IGNsYXNzIENhbnZhcyB7XG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGUoX2ZpbGxQYXJlbnQ6IGJvb2xlYW4gPSB0cnVlLCBfaW1hZ2VSZW5kZXJpbmc6IElNQUdFX1JFTkRFUklORyA9IElNQUdFX1JFTkRFUklORy5BVVRPLCBfd2lkdGg6IG51bWJlciA9IDgwMCwgX2hlaWdodDogbnVtYmVyID0gNjAwKTogSFRNTENhbnZhc0VsZW1lbnQge1xuICAgICAgbGV0IGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnQgPSA8SFRNTENhbnZhc0VsZW1lbnQ+ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImNhbnZhc1wiKTtcbiAgICAgIGNhbnZhcy5pZCA9IFwiRlVER0VcIjtcbiAgICAgIGxldCBzdHlsZTogQ1NTU3R5bGVEZWNsYXJhdGlvbiA9IGNhbnZhcy5zdHlsZTtcbiAgICAgIHN0eWxlLmltYWdlUmVuZGVyaW5nID0gX2ltYWdlUmVuZGVyaW5nO1xuICAgICAgc3R5bGUud2lkdGggPSBfd2lkdGggKyBcInB4XCI7XG4gICAgICBzdHlsZS5oZWlnaHQgPSBfaGVpZ2h0ICsgXCJweFwiO1xuICAgICAgc3R5bGUubWFyZ2luQm90dG9tID0gXCItMC4yNWVtXCI7XG4gICAgICBcbiAgICAgIGlmIChfZmlsbFBhcmVudCkge1xuICAgICAgICBzdHlsZS53aWR0aCA9IFwiMTAwJVwiO1xuICAgICAgICBzdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBjYW52YXM7XG4gICAgfVxuICB9XG59IiwibmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XHJcblxyXG4gIGV4cG9ydCBjbGFzcyBOb2RlIGV4dGVuZHMgxpIuTm9kZSB7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBjb3VudDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfbmFtZTogc3RyaW5nID0gTm9kZS5nZXROZXh0TmFtZSgpLCBfdHJhbnNmb3JtPzogxpIuTWF0cml4NHg0LCBfbWF0ZXJpYWw/OiDGki5NYXRlcmlhbCwgX21lc2g/OiDGki5NZXNoKSB7XHJcbiAgICAgIHN1cGVyKF9uYW1lKTtcclxuICAgICAgaWYgKF90cmFuc2Zvcm0pXHJcbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQobmV3IMaSLkNvbXBvbmVudFRyYW5zZm9ybShfdHJhbnNmb3JtKSk7XHJcbiAgICAgIGlmIChfbWF0ZXJpYWwpXHJcbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQobmV3IMaSLkNvbXBvbmVudE1hdGVyaWFsKF9tYXRlcmlhbCkpO1xyXG4gICAgICBpZiAoX21lc2gpXHJcbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQobmV3IMaSLkNvbXBvbmVudE1lc2goX21lc2gpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXROZXh0TmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICByZXR1cm4gXCLGkkFpZE5vZGVfXCIgKyBOb2RlLmNvdW50Kys7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBwaXZvdCgpOiDGki5NYXRyaXg0eDQge1xyXG4gICAgICBsZXQgY21wTWVzaDogxpIuQ29tcG9uZW50TWVzaCA9IHRoaXMuZ2V0Q29tcG9uZW50KMaSLkNvbXBvbmVudE1lc2gpO1xyXG4gICAgICByZXR1cm4gY21wTWVzaCA/IGNtcE1lc2gucGl2b3QgOiBudWxsO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBhc3luYyBkZXNlcmlhbGl6ZShfc2VyaWFsaXphdGlvbjogxpIuU2VyaWFsaXphdGlvbik6IFByb21pc2U8xpIuU2VyaWFsaXphYmxlPiB7XHJcbiAgICAgIC8vIFF1aWNrIGFuZCBtYXliZSBoYWNreSBzb2x1dGlvbi4gQ3JlYXRlZCBub2RlIGlzIGNvbXBsZXRlbHkgZGlzbWlzc2VkIGFuZCBhIHJlY3JlYXRpb24gb2YgdGhlIGJhc2VjbGFzcyBnZXRzIHJldHVybi4gT3RoZXJ3aXNlLCBjb21wb25lbnRzIHdpbGwgYmUgZG91YmxlZC4uLlxyXG4gICAgICBsZXQgbm9kZTogxpIuTm9kZSA9IG5ldyDGki5Ob2RlKF9zZXJpYWxpemF0aW9uLm5hbWUpO1xyXG4gICAgICBhd2FpdCBub2RlLmRlc2VyaWFsaXplKF9zZXJpYWxpemF0aW9uKTtcclxuICAgICAgLy8gY29uc29sZS5sb2cobm9kZSk7XHJcbiAgICAgIHJldHVybiBub2RlO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUFpZCB7XHJcbiAgaW1wb3J0IMaSID0gRnVkZ2VDb3JlO1xyXG5cclxuXHJcbiAgZXhwb3J0IGNsYXNzIE5vZGVBcnJvdyBleHRlbmRzIE5vZGUge1xyXG4gICAgcHJpdmF0ZSBzdGF0aWMgaW50ZXJuYWxSZXNvdXJjZXM6IE1hcDxzdHJpbmcsIMaSLlNlcmlhbGl6YWJsZVJlc291cmNlPiA9IE5vZGVBcnJvdy5jcmVhdGVJbnRlcm5hbFJlc291cmNlcygpO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKF9uYW1lOiBzdHJpbmcsIF9jb2xvcjogxpIuQ29sb3IpIHtcclxuICAgICAgc3VwZXIoX25hbWUsIMaSLk1hdHJpeDR4NC5JREVOVElUWSgpKTtcclxuXHJcbiAgICAgIGxldCBzaGFmdDogTm9kZSA9IG5ldyBOb2RlKFwiU2hhZnRcIiwgxpIuTWF0cml4NHg0LklERU5USVRZKCksIDzGki5NYXRlcmlhbD5Ob2RlQXJyb3cuaW50ZXJuYWxSZXNvdXJjZXMuZ2V0KFwiTWF0ZXJpYWxcIiksIDzGki5NZXNoPk5vZGVBcnJvdy5pbnRlcm5hbFJlc291cmNlcy5nZXQoXCJTaGFmdFwiKSk7XHJcbiAgICAgIGxldCBoZWFkOiBOb2RlID0gbmV3IE5vZGUoXCJIZWFkXCIsIMaSLk1hdHJpeDR4NC5JREVOVElUWSgpLCA8xpIuTWF0ZXJpYWw+Tm9kZUFycm93LmludGVybmFsUmVzb3VyY2VzLmdldChcIk1hdGVyaWFsXCIpLCA8xpIuTWVzaD5Ob2RlQXJyb3cuaW50ZXJuYWxSZXNvdXJjZXMuZ2V0KFwiSGVhZFwiKSk7XHJcbiAgICAgIHNoYWZ0Lm10eExvY2FsLnNjYWxlKG5ldyDGki5WZWN0b3IzKDAuMDEsIDEsIDAuMDEpKTtcclxuICAgICAgaGVhZC5tdHhMb2NhbC50cmFuc2xhdGVZKDAuNSk7XHJcbiAgICAgIGhlYWQubXR4TG9jYWwuc2NhbGUobmV3IMaSLlZlY3RvcjMoMC4wNSwgMC4xLCAwLjA1KSk7XHJcblxyXG4gICAgICBzaGFmdC5nZXRDb21wb25lbnQoxpIuQ29tcG9uZW50TWF0ZXJpYWwpLmNsclByaW1hcnkgPSBfY29sb3I7XHJcbiAgICAgIGhlYWQuZ2V0Q29tcG9uZW50KMaSLkNvbXBvbmVudE1hdGVyaWFsKS5jbHJQcmltYXJ5ID0gX2NvbG9yO1xyXG5cclxuICAgICAgdGhpcy5hZGRDaGlsZChzaGFmdCk7XHJcbiAgICAgIHRoaXMuYWRkQ2hpbGQoaGVhZCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlSW50ZXJuYWxSZXNvdXJjZXMoKTogTWFwPHN0cmluZywgxpIuU2VyaWFsaXphYmxlUmVzb3VyY2U+IHtcclxuICAgICAgbGV0IG1hcDogTWFwPHN0cmluZywgxpIuU2VyaWFsaXphYmxlUmVzb3VyY2U+ID0gbmV3IE1hcCgpO1xyXG4gICAgICBtYXAuc2V0KFwiU2hhZnRcIiwgIG5ldyDGki5NZXNoQ3ViZShcIkFycm93U2hhZnRcIikpO1xyXG4gICAgICBtYXAuc2V0KFwiSGVhZFwiLCBuZXcgxpIuTWVzaFB5cmFtaWQoXCJBcnJvd0hlYWRcIikpO1xyXG4gICAgICBsZXQgY29hdDogxpIuQ29hdENvbG9yZWQgPSBuZXcgxpIuQ29hdENvbG9yZWQoxpIuQ29sb3IuQ1NTKFwid2hpdGVcIikpO1xyXG4gICAgICBtYXAuc2V0KFwiTWF0ZXJpYWxcIiwgbmV3IMaSLk1hdGVyaWFsKFwiQXJyb3dcIiwgxpIuU2hhZGVyVW5pQ29sb3IsIGNvYXQpKTtcclxuXHJcbiAgICAgIG1hcC5mb3JFYWNoKChfcmVzb3VyY2UpID0+IMaSLlByb2plY3QuZGVyZWdpc3RlcihfcmVzb3VyY2UpKTtcclxuICAgICAgcmV0dXJuIG1hcDtcclxuICAgIH1cclxuICB9XHJcbn0iLCJuYW1lc3BhY2UgRnVkZ2VBaWQge1xuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XG5cbiAgZXhwb3J0IGNsYXNzIE5vZGVDb29yZGluYXRlU3lzdGVtIGV4dGVuZHMgTm9kZSB7XG4gICAgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZyA9IFwiQ29vcmRpbmF0ZVN5c3RlbVwiLCBfdHJhbnNmb3JtPzogxpIuTWF0cml4NHg0KSB7XG4gICAgICBzdXBlcihfbmFtZSwgX3RyYW5zZm9ybSk7XG4gICAgICBsZXQgYXJyb3dSZWQ6IMaSLk5vZGUgPSBuZXcgTm9kZUFycm93KFwiQXJyb3dSZWRcIiwgbmV3IMaSLkNvbG9yKDEsIDAsIDAsIDEpKTtcbiAgICAgIGxldCBhcnJvd0dyZWVuOiDGki5Ob2RlID0gbmV3IE5vZGVBcnJvdyhcIkFycm93R3JlZW5cIiwgbmV3IMaSLkNvbG9yKDAsIDEsIDAsIDEpKTtcbiAgICAgIGxldCBhcnJvd0JsdWU6IMaSLk5vZGUgPSBuZXcgTm9kZUFycm93KFwiQXJyb3dCbHVlXCIsIG5ldyDGki5Db2xvcigwLCAwLCAxLCAxKSk7XG5cbiAgICAgIGFycm93UmVkLm10eExvY2FsLnJvdGF0ZVooLTkwKTtcbiAgICAgIGFycm93Qmx1ZS5tdHhMb2NhbC5yb3RhdGVYKDkwKTtcblxuICAgICAgdGhpcy5hZGRDaGlsZChhcnJvd1JlZCk7XG4gICAgICB0aGlzLmFkZENoaWxkKGFycm93R3JlZW4pO1xuICAgICAgdGhpcy5hZGRDaGlsZChhcnJvd0JsdWUpO1xuICAgIH1cbiAgfVxufSIsIi8vLyA8cmVmZXJlbmNlIHBhdGg9XCIuLi8uLi8uLi9Db3JlL0J1aWxkL0Z1ZGdlQ29yZS5kLnRzXCIvPlxyXG5cclxubmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XHJcblxyXG4gIC8qKlxyXG4gICAqIEFkZHMgYSBsaWdodCBzZXR1cCB0byB0aGUgbm9kZSBnaXZlbiwgY29uc2lzdGluZyBvZiBhbiBhbWJpZW50IGxpZ2h0LCBhIGRpcmVjdGlvbmFsIGtleSBsaWdodCBhbmQgYSBkaXJlY3Rpb25hbCBiYWNrIGxpZ2h0LlxyXG4gICAqIEV4ZXB0IG9mIHRoZSBub2RlIHRvIGJlY29tZSB0aGUgY29udGFpbmVyLCBhbGwgcGFyYW1ldGVycyBhcmUgb3B0aW9uYWwgYW5kIHByb3ZpZGVkIGRlZmF1bHQgdmFsdWVzIGZvciBnZW5lcmFsIHB1cnBvc2UuIFxyXG4gICAqL1xyXG4gIGV4cG9ydCBmdW5jdGlvbiBhZGRTdGFuZGFyZExpZ2h0Q29tcG9uZW50cyhcclxuICAgIF9ub2RlOiDGki5Ob2RlLFxyXG4gICAgX2NsckFtYmllbnQ6IMaSLkNvbG9yID0gbmV3IMaSLkNvbG9yKDAuMiwgMC4yLCAwLjIpLCBfY2xyS2V5OiDGki5Db2xvciA9IG5ldyDGki5Db2xvcigwLjksIDAuOSwgMC45KSwgX2NsckJhY2s6IMaSLkNvbG9yID0gbmV3IMaSLkNvbG9yKDAuNiwgMC42LCAwLjYpLFxyXG4gICAgX3Bvc0tleTogxpIuVmVjdG9yMyA9IG5ldyDGki5WZWN0b3IzKDQsIDEyLCA4KSwgX3Bvc0JhY2s6IMaSLlZlY3RvcjMgPSBuZXcgxpIuVmVjdG9yMygtMSwgLTAuNSwgLTMpXHJcbiAgKTogdm9pZCB7XHJcbiAgICBsZXQga2V5OiDGki5Db21wb25lbnRMaWdodCA9IG5ldyDGki5Db21wb25lbnRMaWdodChuZXcgxpIuTGlnaHREaXJlY3Rpb25hbChfY2xyS2V5KSk7XHJcbiAgICBrZXkucGl2b3QudHJhbnNsYXRlKF9wb3NLZXkpO1xyXG4gICAga2V5LnBpdm90Lmxvb2tBdCjGki5WZWN0b3IzLlpFUk8oKSk7XHJcblxyXG4gICAgbGV0IGJhY2s6IMaSLkNvbXBvbmVudExpZ2h0ID0gbmV3IMaSLkNvbXBvbmVudExpZ2h0KG5ldyDGki5MaWdodERpcmVjdGlvbmFsKF9jbHJCYWNrKSk7XHJcbiAgICBiYWNrLnBpdm90LnRyYW5zbGF0ZShfcG9zQmFjayk7XHJcbiAgICBiYWNrLnBpdm90Lmxvb2tBdCjGki5WZWN0b3IzLlpFUk8oKSk7XHJcblxyXG4gICAgbGV0IGFtYmllbnQ6IMaSLkNvbXBvbmVudExpZ2h0ID0gbmV3IMaSLkNvbXBvbmVudExpZ2h0KG5ldyDGki5MaWdodEFtYmllbnQoX2NsckFtYmllbnQpKTtcclxuXHJcbiAgICBfbm9kZS5hZGRDb21wb25lbnQoa2V5KTtcclxuICAgIF9ub2RlLmFkZENvbXBvbmVudChiYWNrKTtcclxuICAgIF9ub2RlLmFkZENvbXBvbmVudChhbWJpZW50KTtcclxuICB9XHJcbn1cclxuIiwibmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICAvKipcclxuICAgKiBIYW5kbGVzIHRoZSBhbmltYXRpb24gY3ljbGUgb2YgYSBzcHJpdGUgb24gYSBbW05vZGVdXVxyXG4gICAqL1xyXG4gIGV4cG9ydCBjbGFzcyBOb2RlU3ByaXRlIGV4dGVuZHMgxpIuTm9kZSB7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBtZXNoOiDGki5NZXNoU3ByaXRlID0gTm9kZVNwcml0ZS5jcmVhdGVJbnRlcm5hbFJlc291cmNlKCk7XHJcbiAgICBwdWJsaWMgZnJhbWVyYXRlOiBudW1iZXIgPSAxMjsgLy8gYW5pbWF0aW9uIGZyYW1lcyBwZXIgc2Vjb25kLCBzaW5nbGUgZnJhbWVzIGNhbiBiZSBzaG9ydGVyIG9yIGxvbmdlciBiYXNlZCBvbiB0aGVpciB0aW1lc2NhbGVcclxuXHJcbiAgICBwcml2YXRlIGNtcE1lc2g6IMaSLkNvbXBvbmVudE1lc2g7XHJcbiAgICBwcml2YXRlIGNtcE1hdGVyaWFsOiDGki5Db21wb25lbnRNYXRlcmlhbDtcclxuICAgIHByaXZhdGUgYW5pbWF0aW9uOiBTcHJpdGVTaGVldEFuaW1hdGlvbjtcclxuICAgIHByaXZhdGUgZnJhbWVDdXJyZW50OiBudW1iZXIgPSAwO1xyXG4gICAgcHJpdmF0ZSBkaXJlY3Rpb246IG51bWJlciA9IDE7XHJcbiAgICBwcml2YXRlIHRpbWVyOiBudW1iZXI7XHJcblxyXG4gICAgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZykge1xyXG4gICAgICBzdXBlcihfbmFtZSk7XHJcblxyXG4gICAgICB0aGlzLmNtcE1lc2ggPSBuZXcgxpIuQ29tcG9uZW50TWVzaChOb2RlU3ByaXRlLm1lc2gpO1xyXG4gICAgICAvLyBEZWZpbmUgY29hdCBmcm9tIHRoZSBTcHJpdGVTaGVldCB0byB1c2Ugd2hlbiByZW5kZXJpbmdcclxuICAgICAgdGhpcy5jbXBNYXRlcmlhbCA9IG5ldyDGki5Db21wb25lbnRNYXRlcmlhbChuZXcgxpIuTWF0ZXJpYWwoX25hbWUsIMaSLlNoYWRlclRleHR1cmUsIG51bGwpKTtcclxuICAgICAgdGhpcy5hZGRDb21wb25lbnQodGhpcy5jbXBNZXNoKTtcclxuICAgICAgdGhpcy5hZGRDb21wb25lbnQodGhpcy5jbXBNYXRlcmlhbCk7XHJcbiAgICB9XHJcblxyXG4gICAgcHJpdmF0ZSBzdGF0aWMgY3JlYXRlSW50ZXJuYWxSZXNvdXJjZSgpOiDGki5NZXNoU3ByaXRlIHtcclxuICAgICAgbGV0IG1lc2g6IMaSLk1lc2hTcHJpdGUgPSBuZXcgxpIuTWVzaFNwcml0ZShcIlNwcml0ZVwiKTtcclxuICAgICAgxpIuUHJvamVjdC5kZXJlZ2lzdGVyKG1lc2gpO1xyXG4gICAgICByZXR1cm4gbWVzaDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0QW5pbWF0aW9uKF9hbmltYXRpb246IFNwcml0ZVNoZWV0QW5pbWF0aW9uKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuYW5pbWF0aW9uID0gX2FuaW1hdGlvbjtcclxuICAgICAgaWYgKHRoaXMudGltZXIpXHJcbiAgICAgICAgxpIuVGltZS5nYW1lLmRlbGV0ZVRpbWVyKHRoaXMudGltZXIpO1xyXG4gICAgICB0aGlzLnNob3dGcmFtZSgwKTtcclxuICAgIH1cclxuXHJcbiAgICAvKipcclxuICAgICAqIFNob3cgYSBzcGVjaWZpYyBmcmFtZSBvZiB0aGUgc2VxdWVuY2VcclxuICAgICAqL1xyXG4gICAgcHVibGljIHNob3dGcmFtZShfaW5kZXg6IG51bWJlcik6IHZvaWQge1xyXG4gICAgICBsZXQgc3ByaXRlRnJhbWU6IFNwcml0ZUZyYW1lID0gdGhpcy5hbmltYXRpb24uZnJhbWVzW19pbmRleF07XHJcbiAgICAgIHRoaXMuY21wTWVzaC5waXZvdCA9IHNwcml0ZUZyYW1lLm10eFBpdm90O1xyXG4gICAgICB0aGlzLmNtcE1hdGVyaWFsLnBpdm90ID0gc3ByaXRlRnJhbWUubXR4VGV4dHVyZTtcclxuICAgICAgdGhpcy5jbXBNYXRlcmlhbC5tYXRlcmlhbC5zZXRDb2F0KHRoaXMuYW5pbWF0aW9uLnNwcml0ZXNoZWV0KTtcclxuICAgICAgdGhpcy5mcmFtZUN1cnJlbnQgPSBfaW5kZXg7XHJcbiAgICAgIHRoaXMudGltZXIgPSDGki5UaW1lLmdhbWUuc2V0VGltZXIoc3ByaXRlRnJhbWUudGltZVNjYWxlICogMTAwMCAvIHRoaXMuZnJhbWVyYXRlLCAxLCB0aGlzLnNob3dGcmFtZU5leHQpO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2hvdyB0aGUgbmV4dCBmcmFtZSBvZiB0aGUgc2VxdWVuY2Ugb3Igc3RhcnQgYW5ldyB3aGVuIHRoZSBlbmQgb3IgdGhlIHN0YXJ0IHdhcyByZWFjaGVkLCBhY2NvcmRpbmcgdG8gdGhlIGRpcmVjdGlvbiBvZiBwbGF5aW5nXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzaG93RnJhbWVOZXh0ID0gKF9ldmVudDogxpIuRXZlbnRUaW1lcik6IHZvaWQgPT4ge1xyXG4gICAgICB0aGlzLmZyYW1lQ3VycmVudCA9ICh0aGlzLmZyYW1lQ3VycmVudCArIHRoaXMuZGlyZWN0aW9uICsgdGhpcy5hbmltYXRpb24uZnJhbWVzLmxlbmd0aCkgJSB0aGlzLmFuaW1hdGlvbi5mcmFtZXMubGVuZ3RoO1xyXG4gICAgICB0aGlzLnNob3dGcmFtZSh0aGlzLmZyYW1lQ3VycmVudCk7XHJcbiAgICB9XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTZXRzIHRoZSBkaXJlY3Rpb24gZm9yIGFuaW1hdGlvbiBwbGF5YmFjaywgbmVnYXRpdiBudW1iZXJzIG1ha2UgaXQgcGxheSBiYWNrd2FyZHMuXHJcbiAgICAgKi9cclxuICAgIHB1YmxpYyBzZXRGcmFtZURpcmVjdGlvbihfZGlyZWN0aW9uOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5kaXJlY3Rpb24gPSBNYXRoLmZsb29yKF9kaXJlY3Rpb24pO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIm5hbWVzcGFjZSBGdWRnZUFpZCB7XG4gIGltcG9ydCDGkiA9IEZ1ZGdlQ29yZTtcblxuICAvKipcbiAgICogRGVzY3JpYmVzIGEgc2luZ2xlIGZyYW1lIG9mIGEgc3ByaXRlIGFuaW1hdGlvblxuICAgKi9cbiAgZXhwb3J0IGNsYXNzIFNwcml0ZUZyYW1lIHtcbiAgICByZWN0VGV4dHVyZTogxpIuUmVjdGFuZ2xlO1xuICAgIG10eFBpdm90OiDGki5NYXRyaXg0eDQ7XG4gICAgbXR4VGV4dHVyZTogxpIuTWF0cml4M3gzO1xuICAgIHRpbWVTY2FsZTogbnVtYmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIENvbnZlbmllbmNlIGZvciBjcmVhdGluZyBhIFtbQ29hdFRleHR1cmVdXSB0byB1c2UgYXMgc3ByaXRlc2hlZXRcbiAgICovXG4gIGV4cG9ydCBmdW5jdGlvbiBjcmVhdGVTcHJpdGVTaGVldChfbmFtZTogc3RyaW5nLCBfaW1hZ2U6IEhUTUxJbWFnZUVsZW1lbnQpOiDGki5Db2F0VGV4dHVyZWQge1xuICAgIGxldCBjb2F0OiDGki5Db2F0VGV4dHVyZWQgPSBuZXcgxpIuQ29hdFRleHR1cmVkKCk7XG4gICAgY29hdC5uYW1lID0gX25hbWU7XG4gICAgY29hdC50ZXh0dXJlID0gbmV3IMaSLlRleHR1cmVJbWFnZSgpO1xuICAgIGNvYXQudGV4dHVyZS5pbWFnZSA9IF9pbWFnZTtcbiAgICByZXR1cm4gY29hdDtcbiAgfVxuICBcbiAgLyoqXG4gICAqIEhvbGRzIFNwcml0ZVNoZWV0QW5pbWF0aW9ucyBpbiBhbiBhc3NvY2lhdGl2ZSBoaWVyYXJjaGljYWwgYXJyYXlcbiAgICovXG4gIGV4cG9ydCBpbnRlcmZhY2UgU3ByaXRlU2hlZXRBbmltYXRpb25zIHtcbiAgICBba2V5OiBzdHJpbmddOiBTcHJpdGVTaGVldEFuaW1hdGlvbiB8IFNwcml0ZVNoZWV0QW5pbWF0aW9ucztcbiAgfVxuXG4gIC8qKlxuICAgKiBIYW5kbGVzIGEgc2VyaWVzIG9mIFtbU3ByaXRlRnJhbWVdXXMgdG8gYmUgbWFwcGVkIG9udG8gYSBbW01lc2hTcHJpdGVdXVxuICAgKiBDb250YWlucyB0aGUgW1tNZXNoU3ByaXRlXV0sIHRoZSBbW01hdGVyaWFsXV0gYW5kIHRoZSBzcHJpdGVzaGVldC10ZXh0dXJlXG4gICAqL1xuICBleHBvcnQgY2xhc3MgU3ByaXRlU2hlZXRBbmltYXRpb24ge1xuICAgIHB1YmxpYyBmcmFtZXM6IFNwcml0ZUZyYW1lW10gPSBbXTtcbiAgICBwdWJsaWMgbmFtZTogc3RyaW5nO1xuICAgIHB1YmxpYyBzcHJpdGVzaGVldDogxpIuQ29hdFRleHR1cmVkO1xuXG4gICAgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZywgX3Nwcml0ZXNoZWV0OiDGki5Db2F0VGV4dHVyZWQpIHtcbiAgICAgIHRoaXMubmFtZSA9IF9uYW1lO1xuICAgICAgdGhpcy5zcHJpdGVzaGVldCA9IF9zcHJpdGVzaGVldDtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTdG9yZXMgYSBzZXJpZXMgb2YgZnJhbWVzIGluIHRoaXMgW1tTcHJpdGVdXSwgY2FsY3VsYXRpbmcgdGhlIG1hdHJpY2VzIHRvIHVzZSBpbiB0aGUgY29tcG9uZW50cyBvZiBhIFtbTm9kZVNwcml0ZV1dXG4gICAgICovXG4gICAgcHVibGljIGdlbmVyYXRlKF9yZWN0czogxpIuUmVjdGFuZ2xlW10sIF9yZXNvbHV0aW9uUXVhZDogbnVtYmVyLCBfb3JpZ2luOiDGki5PUklHSU4yRCk6IHZvaWQge1xuICAgICAgbGV0IGltZzogSFRNTEltYWdlRWxlbWVudCA9IHRoaXMuc3ByaXRlc2hlZXQudGV4dHVyZS5pbWFnZTtcbiAgICAgIHRoaXMuZnJhbWVzID0gW107XG4gICAgICBsZXQgZnJhbWluZzogxpIuRnJhbWluZ1NjYWxlZCA9IG5ldyDGki5GcmFtaW5nU2NhbGVkKCk7XG4gICAgICBmcmFtaW5nLnNldFNjYWxlKDEgLyBpbWcud2lkdGgsIDEgLyBpbWcuaGVpZ2h0KTtcbiAgICAgIFxuICAgICAgbGV0IGNvdW50OiBudW1iZXIgPSAwO1xuICAgICAgZm9yIChsZXQgcmVjdCBvZiBfcmVjdHMpIHtcbiAgICAgICAgbGV0IGZyYW1lOiBTcHJpdGVGcmFtZSA9IHRoaXMuY3JlYXRlRnJhbWUodGhpcy5uYW1lICsgYCR7Y291bnR9YCwgZnJhbWluZywgcmVjdCwgX3Jlc29sdXRpb25RdWFkLCBfb3JpZ2luKTtcbiAgICAgICAgZnJhbWUudGltZVNjYWxlID0gMTtcbiAgICAgICAgdGhpcy5mcmFtZXMucHVzaChmcmFtZSk7XG4gICAgICAgIFxuICAgICAgICBjb3VudCsrO1xuICAgICAgfVxuICAgIH1cbiAgICBcbiAgICAvKipcbiAgICAgKiBBZGQgc3ByaXRlIGZyYW1lcyB1c2luZyBhIGdyaWQgb24gdGhlIHNwcml0ZXNoZWV0IGRlZmluZWQgYnkgYSByZWN0YW5nbGUgdG8gc3RhcnQgd2l0aCwgdGhlIG51bWJlciBvZiBmcmFtZXMsXG4gICAgICogdGhlIHNpemUgb2YgdGhlIGJvcmRlcnMgb2YgdGhlIGdyaWQgYW5kIG1vcmVcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2VuZXJhdGVCeUdyaWQoX3N0YXJ0UmVjdDogxpIuUmVjdGFuZ2xlLCBfZnJhbWVzOiBudW1iZXIsIF9ib3JkZXJTaXplOiDGki5WZWN0b3IyLCBfcmVzb2x1dGlvblF1YWQ6IG51bWJlciwgX29yaWdpbjogxpIuT1JJR0lOMkQpOiB2b2lkIHtcbiAgICAgIGxldCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQgPSB0aGlzLnNwcml0ZXNoZWV0LnRleHR1cmUuaW1hZ2U7XG4gICAgICBsZXQgcmVjdDogxpIuUmVjdGFuZ2xlID0gX3N0YXJ0UmVjdC5jb3B5O1xuICAgICAgbGV0IHJlY3RzOiDGki5SZWN0YW5nbGVbXSA9IFtdO1xuICAgICAgd2hpbGUgKF9mcmFtZXMtLSkge1xuICAgICAgICByZWN0cy5wdXNoKHJlY3QuY29weSk7XG4gICAgICAgIHJlY3QucG9zaXRpb24ueCArPSBfc3RhcnRSZWN0LnNpemUueCArIF9ib3JkZXJTaXplLng7XG4gICAgICAgIFxuICAgICAgICBpZiAocmVjdC5yaWdodCA8IGltZy53aWR0aClcbiAgICAgICAgY29udGludWU7XG4gICAgICAgIFxuICAgICAgICBfc3RhcnRSZWN0LnBvc2l0aW9uLnkgKz0gX3N0YXJ0UmVjdC5zaXplLnkgKyBfYm9yZGVyU2l6ZS55O1xuICAgICAgICByZWN0ID0gX3N0YXJ0UmVjdC5jb3B5O1xuICAgICAgICBpZiAocmVjdC5ib3R0b20gPiBpbWcuaGVpZ2h0KVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIFxuICAgICAgcmVjdHMuZm9yRWFjaCgoX3JlY3Q6IMaSLlJlY3RhbmdsZSkgPT4gxpIuRGVidWcubG9nKF9yZWN0LnRvU3RyaW5nKCkpKTtcbiAgICAgIHRoaXMuZ2VuZXJhdGUocmVjdHMsIF9yZXNvbHV0aW9uUXVhZCwgX29yaWdpbik7XG4gICAgfVxuICAgIFxuICAgIHByaXZhdGUgY3JlYXRlRnJhbWUoX25hbWU6IHN0cmluZywgX2ZyYW1pbmc6IMaSLkZyYW1pbmdTY2FsZWQsIF9yZWN0OiDGki5SZWN0YW5nbGUsIF9yZXNvbHV0aW9uUXVhZDogbnVtYmVyLCBfb3JpZ2luOiDGki5PUklHSU4yRCk6IFNwcml0ZUZyYW1lIHtcbiAgICAgIGxldCBpbWc6IEhUTUxJbWFnZUVsZW1lbnQgPSB0aGlzLnNwcml0ZXNoZWV0LnRleHR1cmUuaW1hZ2U7XG4gICAgICBsZXQgcmVjdFRleHR1cmU6IMaSLlJlY3RhbmdsZSA9IG5ldyDGki5SZWN0YW5nbGUoMCwgMCwgaW1nLndpZHRoLCBpbWcuaGVpZ2h0KTtcbiAgICAgIGxldCBmcmFtZTogU3ByaXRlRnJhbWUgPSBuZXcgU3ByaXRlRnJhbWUoKTtcblxuICAgICAgZnJhbWUucmVjdFRleHR1cmUgPSBfZnJhbWluZy5nZXRSZWN0KF9yZWN0KTtcbiAgICAgIGZyYW1lLnJlY3RUZXh0dXJlLnBvc2l0aW9uID0gX2ZyYW1pbmcuZ2V0UG9pbnQoX3JlY3QucG9zaXRpb24sIHJlY3RUZXh0dXJlKTtcblxuICAgICAgbGV0IHJlY3RRdWFkOiDGki5SZWN0YW5nbGUgPSBuZXcgxpIuUmVjdGFuZ2xlKDAsIDAsIF9yZWN0LndpZHRoIC8gX3Jlc29sdXRpb25RdWFkLCBfcmVjdC5oZWlnaHQgLyBfcmVzb2x1dGlvblF1YWQsIF9vcmlnaW4pO1xuICAgICAgZnJhbWUubXR4UGl2b3QgPSDGki5NYXRyaXg0eDQuSURFTlRJVFkoKTtcbiAgICAgIGZyYW1lLm10eFBpdm90LnRyYW5zbGF0ZShuZXcgxpIuVmVjdG9yMyhyZWN0UXVhZC5wb3NpdGlvbi54ICsgcmVjdFF1YWQuc2l6ZS54IC8gMiwgLXJlY3RRdWFkLnBvc2l0aW9uLnkgLSByZWN0UXVhZC5zaXplLnkgLyAyLCAwKSk7XG4gICAgICBmcmFtZS5tdHhQaXZvdC5zY2FsZVgocmVjdFF1YWQuc2l6ZS54KTtcbiAgICAgIGZyYW1lLm10eFBpdm90LnNjYWxlWShyZWN0UXVhZC5zaXplLnkpO1xuICAgICAgLy8gxpIuRGVidWcubG9nKHJlY3RRdWFkLnRvU3RyaW5nKCkpO1xuXG4gICAgICBmcmFtZS5tdHhUZXh0dXJlID0gxpIuTWF0cml4M3gzLklERU5USVRZKCk7XG4gICAgICBmcmFtZS5tdHhUZXh0dXJlLnRyYW5zbGF0ZShmcmFtZS5yZWN0VGV4dHVyZS5wb3NpdGlvbik7XG4gICAgICBmcmFtZS5tdHhUZXh0dXJlLnNjYWxlKGZyYW1lLnJlY3RUZXh0dXJlLnNpemUpO1xuXG4gICAgICByZXR1cm4gZnJhbWU7XG4gICAgfVxuICB9XG59IiwibmFtZXNwYWNlIEZ1ZGdlQWlkIHtcbiAgaW1wb3J0IMaSID0gRnVkZ2VDb3JlO1xuICBcbiAgZXhwb3J0IGNsYXNzIENvbXBvbmVudFN0YXRlTWFjaGluZTxTdGF0ZT4gZXh0ZW5kcyDGki5Db21wb25lbnRTY3JpcHQgaW1wbGVtZW50cyBTdGF0ZU1hY2hpbmU8U3RhdGU+IHtcbiAgICBwdWJsaWMgc3RhdGVDdXJyZW50OiBTdGF0ZTtcbiAgICBwdWJsaWMgc3RhdGVOZXh0OiBTdGF0ZTtcbiAgICBwdWJsaWMgc3RhdGVNYWNoaW5lOiBTdGF0ZU1hY2hpbmVJbnN0cnVjdGlvbnM8U3RhdGU+O1xuXG4gICAgcHVibGljIHRyYW5zaXQoX25leHQ6IFN0YXRlKTogdm9pZCB7XG4gICAgICB0aGlzLnN0YXRlTWFjaGluZS50cmFuc2l0KHRoaXMuc3RhdGVDdXJyZW50LCBfbmV4dCwgdGhpcyk7XG4gICAgfVxuXG4gICAgcHVibGljIGFjdCgpOiB2b2lkIHtcbiAgICAgIHRoaXMuc3RhdGVNYWNoaW5lLmFjdCh0aGlzLnN0YXRlQ3VycmVudCwgdGhpcyk7XG4gICAgfVxuICB9XG59IiwiLyoqXG4gKiBTdGF0ZSBtYWNoaW5lIG9mZmVycyBhIHN0cnVjdHVyZSBhbmQgZnVuZGFtZW50YWwgZnVuY3Rpb25hbGl0eSBmb3Igc3RhdGUgbWFjaGluZXNcbiAqIDxTdGF0ZT4gc2hvdWxkIGJlIGFuIGVudW0gZGVmaW5pbmcgdGhlIHZhcmlvdXMgc3RhdGVzIG9mIHRoZSBtYWNoaW5lXG4gKi9cblxubmFtZXNwYWNlIEZ1ZGdlQWlkIHtcbiAgLyoqIEZvcm1hdCBvZiBtZXRob2RzIHRvIGJlIHVzZWQgYXMgdHJhbnNpdGlvbnMgb3IgYWN0aW9ucyAqL1xuICB0eXBlIFN0YXRlTWFjaGluZU1ldGhvZDxTdGF0ZT4gPSAoX21hY2hpbmU6IFN0YXRlTWFjaGluZTxTdGF0ZT4pID0+IHZvaWQ7XG4gIC8qKiBUeXBlIGZvciBtYXBzIGFzc29jaWF0aW5nIGEgc3RhdGUgdG8gYSBtZXRob2QgKi9cbiAgdHlwZSBTdGF0ZU1hY2hpbmVNYXBTdGF0ZVRvTWV0aG9kPFN0YXRlPiA9IE1hcDxTdGF0ZSwgU3RhdGVNYWNoaW5lTWV0aG9kPFN0YXRlPj47XG4gIC8qKiBJbnRlcmZhY2UgbWFwcGluZyBhIHN0YXRlIHRvIG9uZSBhY3Rpb24gbXVsdGlwbGUgdHJhbnNpdGlvbnMgKi9cbiAgaW50ZXJmYWNlIFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2RzPFN0YXRlPiB7XG4gICAgYWN0aW9uOiBTdGF0ZU1hY2hpbmVNZXRob2Q8U3RhdGU+O1xuICAgIHRyYW5zaXRpb25zOiBTdGF0ZU1hY2hpbmVNYXBTdGF0ZVRvTWV0aG9kPFN0YXRlPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb3JlIGZ1bmN0aW9uYWxpdHkgb2YgdGhlIHN0YXRlIG1hY2hpbmUsIGhvbGRpbmcgc29sZWx5IHRoZSBjdXJyZW50IHN0YXRlIGFuZCwgd2hpbGUgaW4gdHJhbnNpdGlvbiwgdGhlIG5leHQgc3RhdGUsXG4gICAqIHRoZSBpbnN0cnVjdGlvbnMgZm9yIHRoZSBtYWNoaW5lIGFuZCBjb21mb3J0IG1ldGhvZHMgdG8gdHJhbnNpdCBhbmQgYWN0LlxuICAgKi9cbiAgZXhwb3J0IGNsYXNzIFN0YXRlTWFjaGluZTxTdGF0ZT4ge1xuICAgIHB1YmxpYyBzdGF0ZUN1cnJlbnQ6IFN0YXRlO1xuICAgIHB1YmxpYyBzdGF0ZU5leHQ6IFN0YXRlO1xuICAgIHB1YmxpYyBzdGF0ZU1hY2hpbmU6IFN0YXRlTWFjaGluZUluc3RydWN0aW9uczxTdGF0ZT47XG5cbiAgICBwdWJsaWMgdHJhbnNpdChfbmV4dDogU3RhdGUpOiB2b2lkIHtcbiAgICAgIHRoaXMuc3RhdGVNYWNoaW5lLnRyYW5zaXQodGhpcy5zdGF0ZUN1cnJlbnQsIF9uZXh0LCB0aGlzKTtcbiAgICB9XG5cbiAgICBwdWJsaWMgYWN0KCk6IHZvaWQge1xuICAgICAgdGhpcy5zdGF0ZU1hY2hpbmUuYWN0KHRoaXMuc3RhdGVDdXJyZW50LCB0aGlzKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogU2V0IG9mIGluc3RydWN0aW9ucyBmb3IgYSBzdGF0ZSBtYWNoaW5lLiBUaGUgc2V0IGtlZXBzIGFsbCBtZXRob2RzIGZvciBkZWRpY2F0ZWQgYWN0aW9ucyBkZWZpbmVkIGZvciB0aGUgc3RhdGVzXG4gICAqIGFuZCBhbGwgZGVkaWNhdGVkIG1ldGhvZHMgZGVmaW5lZCBmb3IgdHJhbnNpdGlvbnMgdG8gb3RoZXIgc3RhdGVzLCBhcyB3ZWxsIGFzIGRlZmF1bHQgbWV0aG9kcy5cbiAgICogSW5zdHJ1Y3Rpb25zIGV4aXN0IGluZGVwZW5kZW50bHkgZnJvbSBTdGF0ZU1hY2hpbmVzLiBBIHN0YXRlbWFjaGluZSBpbnN0YW5jZSBpcyBwYXNzZWQgYXMgcGFyYW1ldGVyIHRvIHRoZSBpbnN0cnVjdGlvbiBzZXQuXG4gICAqIE11bHRpcGxlIHN0YXRlbWFjaGluZS1pbnN0YW5jZXMgY2FuIHRodXMgdXNlIHRoZSBzYW1lIGluc3RydWN0aW9uIHNldCBhbmQgZGlmZmVyZW50IGluc3RydWN0aW9uIHNldHMgY291bGQgb3BlcmF0ZSBvbiB0aGUgc2FtZSBzdGF0ZW1hY2hpbmUuXG4gICAqL1xuICBleHBvcnQgY2xhc3MgU3RhdGVNYWNoaW5lSW5zdHJ1Y3Rpb25zPFN0YXRlPiBleHRlbmRzIE1hcDxTdGF0ZSwgU3RhdGVNYWNoaW5lTWFwU3RhdGVUb01ldGhvZHM8U3RhdGU+PiB7XG4gICAgLyoqIERlZmluZSBkZWRpY2F0ZWQgdHJhbnNpdGlvbiBtZXRob2QgdG8gdHJhbnNpdCBmcm9tIG9uZSBzdGF0ZSB0byBhbm90aGVyKi9cbiAgICBwdWJsaWMgc2V0VHJhbnNpdGlvbihfY3VycmVudDogU3RhdGUsIF9uZXh0OiBTdGF0ZSwgX3RyYW5zaXRpb246IFN0YXRlTWFjaGluZU1ldGhvZDxTdGF0ZT4pOiB2b2lkIHtcbiAgICAgIGxldCBhY3RpdmU6IFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2RzPFN0YXRlPiA9IHRoaXMuZ2V0U3RhdGVNZXRob2RzKF9jdXJyZW50KTtcbiAgICAgIGFjdGl2ZS50cmFuc2l0aW9ucy5zZXQoX25leHQsIF90cmFuc2l0aW9uKTtcbiAgICB9XG5cbiAgICAvKiogRGVmaW5lIGRlZGljYXRlZCBhY3Rpb24gbWV0aG9kIGZvciBhIHN0YXRlICovXG4gICAgcHVibGljIHNldEFjdGlvbihfY3VycmVudDogU3RhdGUsIF9hY3Rpb246IFN0YXRlTWFjaGluZU1ldGhvZDxTdGF0ZT4pOiB2b2lkIHtcbiAgICAgIGxldCBhY3RpdmU6IFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2RzPFN0YXRlPiA9IHRoaXMuZ2V0U3RhdGVNZXRob2RzKF9jdXJyZW50KTtcbiAgICAgIGFjdGl2ZS5hY3Rpb24gPSBfYWN0aW9uO1xuICAgIH1cblxuICAgIC8qKiBEZWZhdWx0IHRyYW5zaXRpb24gbWV0aG9kIHRvIGludm9rZSBpZiBubyBkZWRpY2F0ZWQgdHJhbnNpdGlvbiBleGlzdHMsIHNob3VsZCBiZSBvdmVycmlkZW4gaW4gc3ViY2xhc3MgKi9cbiAgICBwdWJsaWMgdHJhbnNpdERlZmF1bHQoX21hY2hpbmU6IFN0YXRlTWFjaGluZTxTdGF0ZT4pOiB2b2lkIHtcbiAgICAgIC8vXG4gICAgfVxuICAgIFxuICAgIC8qKiBEZWZhdWx0IGFjdGlvbiBtZXRob2QgdG8gaW52b2tlIGlmIG5vIGRlZGljYXRlZCBhY3Rpb24gZXhpc3RzLCBzaG91bGQgYmUgb3ZlcnJpZGVuIGluIHN1YmNsYXNzICovXG4gICAgcHVibGljIGFjdERlZmF1bHQoX21hY2hpbmU6IFN0YXRlTWFjaGluZTxTdGF0ZT4pOiB2b2lkIHtcbiAgICAgIC8vXG4gICAgfVxuXG4gICAgLyoqIEludm9rZSBhIGRlZGljYXRlZCB0cmFuc2l0aW9uIG1ldGhvZCBpZiBmb3VuZCBmb3IgdGhlIGN1cnJlbnQgYW5kIHRoZSBuZXh0IHN0YXRlLCBvciB0aGUgZGVmYXVsdCBtZXRob2QgKi9cbiAgICBwdWJsaWMgdHJhbnNpdChfY3VycmVudDogU3RhdGUsIF9uZXh0OiBTdGF0ZSwgX21hY2hpbmU6IFN0YXRlTWFjaGluZTxTdGF0ZT4pOiB2b2lkIHtcbiAgICAgIF9tYWNoaW5lLnN0YXRlTmV4dCA9IF9uZXh0O1xuICAgICAgdHJ5IHtcbiAgICAgICAgbGV0IGFjdGl2ZTogU3RhdGVNYWNoaW5lTWFwU3RhdGVUb01ldGhvZHM8U3RhdGU+ID0gdGhpcy5nZXQoX2N1cnJlbnQpO1xuICAgICAgICBsZXQgdHJhbnNpdGlvbjogU3RhdGVNYWNoaW5lTWV0aG9kPFN0YXRlPiA9IGFjdGl2ZS50cmFuc2l0aW9ucy5nZXQoX25leHQpO1xuICAgICAgICB0cmFuc2l0aW9uKF9tYWNoaW5lKTtcbiAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xuICAgICAgICBjb25zb2xlLmluZm8oX2Vycm9yLm1lc3NhZ2UpO1xuICAgICAgICB0aGlzLnRyYW5zaXREZWZhdWx0KF9tYWNoaW5lKTtcbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIF9tYWNoaW5lLnN0YXRlQ3VycmVudCA9IF9uZXh0O1xuICAgICAgICBfbWFjaGluZS5zdGF0ZU5leHQgPSB1bmRlZmluZWQ7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqIEludm9rZSB0aGUgZGVkaWNhdGVkIGFjdGlvbiBtZXRob2QgaWYgZm91bmQgZm9yIHRoZSBjdXJyZW50IHN0YXRlLCBvciB0aGUgZGVmYXVsdCBtZXRob2QgKi9cbiAgICBwdWJsaWMgYWN0KF9jdXJyZW50OiBTdGF0ZSwgX21hY2hpbmU6IFN0YXRlTWFjaGluZTxTdGF0ZT4pOiB2b2lkIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxldCBhY3RpdmU6IFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2RzPFN0YXRlPiA9IHRoaXMuZ2V0KF9jdXJyZW50KTtcbiAgICAgICAgYWN0aXZlLmFjdGlvbihfbWFjaGluZSk7XG4gICAgICB9IGNhdGNoIChfZXJyb3IpIHtcbiAgICAgICAgY29uc29sZS5pbmZvKF9lcnJvci5tZXNzYWdlKTtcbiAgICAgICAgdGhpcy5hY3REZWZhdWx0KF9tYWNoaW5lKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiogRmluZCB0aGUgaW5zdHJ1Y3Rpb25zIGRlZGljYXRlZCBmb3IgdGhlIGN1cnJlbnQgc3RhdGUgb3IgY3JlYXRlIGFuIGVtcHR5IHNldCBmb3IgaXQgKi9cbiAgICBwcml2YXRlIGdldFN0YXRlTWV0aG9kcyhfY3VycmVudDogU3RhdGUpOiBTdGF0ZU1hY2hpbmVNYXBTdGF0ZVRvTWV0aG9kczxTdGF0ZT4ge1xuICAgICAgbGV0IGFjdGl2ZTogU3RhdGVNYWNoaW5lTWFwU3RhdGVUb01ldGhvZHM8U3RhdGU+ID0gdGhpcy5nZXQoX2N1cnJlbnQpO1xuICAgICAgaWYgKCFhY3RpdmUpIHtcbiAgICAgICAgYWN0aXZlID0geyBhY3Rpb246IG51bGwsIHRyYW5zaXRpb25zOiBuZXcgTWFwKCkgfTtcbiAgICAgICAgdGhpcy5zZXQoX2N1cnJlbnQsIGFjdGl2ZSk7XG4gICAgICB9XG4gICAgICByZXR1cm4gYWN0aXZlO1xuICAgIH1cbiAgfVxufSIsIm5hbWVzcGFjZSBGdWRnZUFpZCB7XHJcbiAgZXhwb3J0IGNsYXNzIFZpZXdwb3J0IHtcclxuICAgIHB1YmxpYyBzdGF0aWMgZXhwYW5kQ2FtZXJhVG9JbnRlcmFjdGl2ZU9yYml0KF92aWV3cG9ydDogxpIuVmlld3BvcnQsIF9zaG93Rm9jdXM6IGJvb2xlYW4gPSB0cnVlLCBfc3BlZWRDYW1lcmFSb3RhdGlvbjogbnVtYmVyID0gMSwgX3NwZWVkQ2FtZXJhVHJhbnNsYXRpb246IG51bWJlciA9IDAuMDEsIF9zcGVlZENhbWVyYURpc3RhbmNlOiBudW1iZXIgPSAwLjAwMSk6IENhbWVyYU9yYml0IHtcclxuICAgICAgX3ZpZXdwb3J0LnNldEZvY3VzKHRydWUpO1xyXG4gICAgICBfdmlld3BvcnQuYWN0aXZhdGVQb2ludGVyRXZlbnQoxpIuRVZFTlRfUE9JTlRFUi5NT1ZFLCB0cnVlKTtcclxuICAgICAgX3ZpZXdwb3J0LmFjdGl2YXRlV2hlZWxFdmVudCjGki5FVkVOVF9XSEVFTC5XSEVFTCwgdHJ1ZSk7XHJcbiAgICAgIF92aWV3cG9ydC5hZGRFdmVudExpc3RlbmVyKMaSLkVWRU5UX1BPSU5URVIuTU9WRSwgaG5kUG9pbnRlck1vdmUpO1xyXG4gICAgICBfdmlld3BvcnQuYWRkRXZlbnRMaXN0ZW5lcijGki5FVkVOVF9XSEVFTC5XSEVFTCwgaG5kV2hlZWxNb3ZlKTtcclxuXHJcbiAgICAgIGxldCBjbnRNb3VzZUhvcml6b250YWw6IMaSLkNvbnRyb2wgPSBuZXcgxpIuQ29udHJvbChcIk1vdXNlSG9yaXpvbnRhbFwiKTtcclxuICAgICAgbGV0IGNudE1vdXNlVmVydGljYWw6IMaSLkNvbnRyb2wgPSBuZXcgxpIuQ29udHJvbChcIk1vdXNlVmVydGljYWxcIik7XHJcbiAgICAgIGxldCBjbnRNb3VzZVdoZWVsOiDGki5Db250cm9sID0gbmV3IMaSLkNvbnRyb2woXCJNb3VzZVdoZWVsXCIpO1xyXG5cclxuICAgICAgLy8gY2FtZXJhIHNldHVwXHJcbiAgICAgIGxldCBjYW1lcmE6IENhbWVyYU9yYml0TW92aW5nRm9jdXM7XHJcbiAgICAgIGNhbWVyYSA9IG5ldyBDYW1lcmFPcmJpdE1vdmluZ0ZvY3VzKF92aWV3cG9ydC5jYW1lcmEsIDMsIDgwLCAwLjEsIDUwKTtcclxuXHJcbiAgICAgIC8vIHNldCB1cCBheGlzIHRvIGNvbnRyb2xcclxuICAgICAgY2FtZXJhLmF4aXNSb3RhdGVYLmFkZENvbnRyb2woY250TW91c2VWZXJ0aWNhbCk7XHJcbiAgICAgIGNhbWVyYS5heGlzUm90YXRlWC5zZXRGYWN0b3IoX3NwZWVkQ2FtZXJhUm90YXRpb24pO1xyXG5cclxuICAgICAgY2FtZXJhLmF4aXNSb3RhdGVZLmFkZENvbnRyb2woY250TW91c2VIb3Jpem9udGFsKTtcclxuICAgICAgY2FtZXJhLmF4aXNSb3RhdGVZLnNldEZhY3Rvcihfc3BlZWRDYW1lcmFSb3RhdGlvbik7XHJcblxyXG4gICAgICBjYW1lcmEuYXhpc1RyYW5zbGF0ZVguYWRkQ29udHJvbChjbnRNb3VzZUhvcml6b250YWwpO1xyXG4gICAgICBjYW1lcmEuYXhpc1RyYW5zbGF0ZVguc2V0RmFjdG9yKF9zcGVlZENhbWVyYVRyYW5zbGF0aW9uKTtcclxuXHJcbiAgICAgIGNhbWVyYS5heGlzVHJhbnNsYXRlWS5hZGRDb250cm9sKGNudE1vdXNlVmVydGljYWwpO1xyXG4gICAgICBjYW1lcmEuYXhpc1RyYW5zbGF0ZVkuc2V0RmFjdG9yKF9zcGVlZENhbWVyYVRyYW5zbGF0aW9uKTtcclxuXHJcbiAgICAgIGNhbWVyYS5heGlzVHJhbnNsYXRlWi5hZGRDb250cm9sKGNudE1vdXNlV2hlZWwpO1xyXG4gICAgICBjYW1lcmEuYXhpc1RyYW5zbGF0ZVouc2V0RmFjdG9yKF9zcGVlZENhbWVyYURpc3RhbmNlKTtcclxuXHJcbiAgICAgIF92aWV3cG9ydC5nZXRHcmFwaCgpLmFkZENoaWxkKGNhbWVyYSk7XHJcblxyXG4gICAgICBsZXQgZm9jdXM6IMaSLk5vZGU7XHJcbiAgICAgIGlmIChfc2hvd0ZvY3VzKSB7XHJcbiAgICAgICAgZm9jdXMgPSBuZXcgTm9kZUNvb3JkaW5hdGVTeXN0ZW0oXCJGb2N1c1wiKTtcclxuICAgICAgICBmb2N1cy5hZGRDb21wb25lbnQobmV3IMaSLkNvbXBvbmVudFRyYW5zZm9ybSgpKTtcclxuICAgICAgICBfdmlld3BvcnQuZ2V0R3JhcGgoKS5hZGRDaGlsZChmb2N1cyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHJldHVybiBjYW1lcmE7XHJcblxyXG4gICAgICBmdW5jdGlvbiBobmRQb2ludGVyTW92ZShfZXZlbnQ6IMaSLkV2ZW50UG9pbnRlcik6IHZvaWQge1xyXG4gICAgICAgIGlmICghKChfZXZlbnQuYnV0dG9ucyAmIDQpID09PSA0KSlcclxuICAgICAgICAgIHJldHVybjtcclxuXHJcbiAgICAgICAgYWN0aXZhdGVBeGlzKF9ldmVudCk7XHJcbiAgICAgICAgbGV0IHBvc0NhbWVyYTogxpIuVmVjdG9yMyA9IGNhbWVyYS5ub2RlLm10eFdvcmxkLnRyYW5zbGF0aW9uLmNvcHk7XHJcblxyXG4gICAgICAgIGNudE1vdXNlSG9yaXpvbnRhbC5zZXRJbnB1dChfZXZlbnQubW92ZW1lbnRYKTtcclxuICAgICAgICBjbnRNb3VzZVZlcnRpY2FsLnNldElucHV0KChfZXZlbnQuc2hpZnRLZXkgPyAtMSA6IDEpICogX2V2ZW50Lm1vdmVtZW50WSk7XHJcblxyXG4gICAgICAgIGlmIChfc2hvd0ZvY3VzKVxyXG4gICAgICAgICAgZm9jdXMubXR4TG9jYWwudHJhbnNsYXRpb24gPSBjYW1lcmEubXR4TG9jYWwudHJhbnNsYXRpb247XHJcbiAgICAgICAgLy9fdmlld3BvcnQuZHJhdygpO1xyXG4gICAgICAgIFxyXG4gICAgICAgIGlmIChfZXZlbnQuYWx0S2V5ICYmICFfZXZlbnQuc2hpZnRLZXkpIHtcclxuICAgICAgICAgIGxldCBvZmZzZXQ6IMaSLlZlY3RvcjMgPSDGki5WZWN0b3IzLkRJRkZFUkVOQ0UocG9zQ2FtZXJhLCBjYW1lcmEubm9kZS5tdHhXb3JsZC50cmFuc2xhdGlvbik7XHJcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZyhwb3NDYW1lcmEudG9TdHJpbmcoKSwgY2FtZXJhLm5vZGUubXR4V29ybGQudHJhbnNsYXRpb24udG9TdHJpbmcoKSk7XHJcbiAgICAgICAgICBjYW1lcmEubXR4TG9jYWwudHJhbnNsYXRlKG9mZnNldCwgZmFsc2UpO1xyXG4gICAgICAgICAgZm9jdXMubXR4TG9jYWwudHJhbnNsYXRpb24gPSBjYW1lcmEubXR4TG9jYWwudHJhbnNsYXRpb247XHJcbiAgICAgICAgICAvL192aWV3cG9ydC5kcmF3KCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBobmRXaGVlbE1vdmUoX2V2ZW50OiBXaGVlbEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgYWN0aXZhdGVBeGlzKF9ldmVudCk7XHJcblxyXG4gICAgICAgIGlmIChfZXZlbnQuc2hpZnRLZXkpIHtcclxuICAgICAgICAgIGNudE1vdXNlV2hlZWwuc2V0SW5wdXQoX2V2ZW50LmRlbHRhWSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGVsc2VcclxuICAgICAgICAgIGNhbWVyYS5kaXN0YW5jZSArPSBfZXZlbnQuZGVsdGFZICogX3NwZWVkQ2FtZXJhRGlzdGFuY2U7XHJcblxyXG4gICAgICAgIGlmIChfc2hvd0ZvY3VzKVxyXG4gICAgICAgICAgZm9jdXMubXR4TG9jYWwudHJhbnNsYXRpb24gPSBjYW1lcmEubXR4TG9jYWwudHJhbnNsYXRpb247XHJcbiAgICAgICAgLy9fdmlld3BvcnQuZHJhdygpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmdW5jdGlvbiBhY3RpdmF0ZUF4aXMoX2V2ZW50OiBQb2ludGVyRXZlbnQgfCBXaGVlbEV2ZW50KTogdm9pZCB7XHJcbiAgICAgICAgY2FtZXJhLmF4aXNUcmFuc2xhdGVYLmFjdGl2ZSA9IF9ldmVudC5zaGlmdEtleTtcclxuICAgICAgICBjYW1lcmEuYXhpc1RyYW5zbGF0ZVkuYWN0aXZlID0gX2V2ZW50LnNoaWZ0S2V5O1xyXG4gICAgICAgIGNhbWVyYS5heGlzVHJhbnNsYXRlWi5hY3RpdmUgPSBfZXZlbnQuc2hpZnRLZXk7XHJcblxyXG4gICAgICAgIGNhbWVyYS5heGlzUm90YXRlWC5hY3RpdmUgPSAhX2V2ZW50LnNoaWZ0S2V5O1xyXG4gICAgICAgIGNhbWVyYS5heGlzUm90YXRlWS5hY3RpdmUgPSAhX2V2ZW50LnNoaWZ0S2V5O1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfVxyXG59Il19