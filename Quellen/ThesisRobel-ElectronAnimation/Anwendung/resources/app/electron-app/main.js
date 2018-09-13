(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/*!**********************************************************!*\
  !*** ./src/$$_lazy_route_resource lazy namespace object ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error('Cannot find module "' + req + '".');
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/animation/anim-create/anim-create.component.css":
/*!*****************************************************************!*\
  !*** ./src/app/animation/anim-create/anim-create.component.css ***!
  \*****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "#animOptButton{\r\n    width: 20px;\r\n    height: 20px;\r\n}\r\n\r\n#animName {\r\n    width: 6em;\r\n}\r\n\r\n#animFrames{\r\n    width: 3em;\r\n}\r\n\r\ndiv{\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-between;\r\n    flex-wrap: wrap;\r\n}"

/***/ }),

/***/ "./src/app/animation/anim-create/anim-create.component.html":
/*!******************************************************************!*\
  !*** ./src/app/animation/anim-create/anim-create.component.html ***!
  \******************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<fieldset>\r\n\r\n  <input type=\"image\" src=\"assets/icons/plus.png\" alt=\"Create\" id=\"animOptButton\" />\r\n\r\n  <div>\r\n    <label> name: </label>\r\n    <input type=\"text\" id=\"animName\">\r\n  </div>\r\n\r\n  <div>\r\n    <label> target: </label>\r\n    <select id=\"animProperty\">\r\n      <option value=\"position\" selected>position</option>\r\n      <option value=\"rotation\">rotation</option>\r\n      <option value=\"scaling\">scaling</option>\r\n    </select>\r\n  </div>\r\n\r\n  <div>\r\n    <label> fps: </label>\r\n    <input type=\"number\" id=\"animFrames\" class=\"animPropGroup\" min=\"1\" max=\"120\" value=\"30\">\r\n  </div>\r\n\r\n  <div>\r\n    <label> loop: </label>\r\n    <select id=\"animBehavior\">\r\n      <option value=\"cycle\" selected>cycle</option>\r\n      <option value=\"relative\">relative</option>\r\n      <option value=\"constant\">constant</option>\r\n    </select>\r\n  </div>\r\n\r\n  <div>\r\n    <label for=\"setEasing\"> easing </label>\r\n    <input type=\"checkbox\" id=\"setEasing\">\r\n\r\n    <div *ngIf=\"useEasing\">\r\n\r\n      <select id=\"easingFn\">\r\n        <option value=\"circle\" selected>circle ease</option>\r\n        <option value=\"back\">back ease</option>\r\n        <option value=\"bounce\">bounce ease</option>\r\n        <option value=\"cubic\">cubic ease</option>\r\n        <option value=\"elastic\">elastic ease</option>\r\n        <option value=\"exponential\">exponential ease</option>\r\n        <option value=\"power\">power ease</option>\r\n        <option value=\"quadratic\">quadratic ease</option>\r\n        <option value=\"quartic\">quartic ease</option>\r\n        <option value=\"quintic\">quintic ease</option>\r\n        <option value=\"sine\">sine ease</option>\r\n        <option value=\"bezier\">bezier curve ease</option>\r\n      </select>\r\n\r\n      <select id=\"easingMode\">\r\n        <option value=\"easeIn\" selected>ease in</option>\r\n        <option value=\"easeOut\">ease out</option>\r\n        <option value=\"easeInOut\">ease inout</option>\r\n      </select>\r\n    </div>\r\n  </div>\r\n</fieldset>"

/***/ }),

/***/ "./src/app/animation/anim-create/anim-create.component.ts":
/*!****************************************************************!*\
  !*** ./src/app/animation/anim-create/anim-create.component.ts ***!
  \****************************************************************/
/*! exports provided: AnimCreateComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AnimCreateComponent", function() { return AnimCreateComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var AnimCreateComponent = /** @class */ (function () {
    function AnimCreateComponent(globals) {
        var _this = this;
        this.globals = globals;
        /**
         * get the selected mesh
         * @param {BABYLON.AbstractMesh} _mesh - selected mesh
         */
        this.getMesh = function (_mesh) {
            _this.mesh = _mesh;
        };
        /**
         * sets the state of the easing checkbox
         */
        this.setEasing = function () {
            _this.useEasing = document.getElementById('setEasing').checked;
        };
        /**
         * get the input values and call createAnimation()
         */
        this.getAnimInfo = function () {
            if (_this.mesh === undefined) {
                _this.globals.ipcRenderer.send('show-message', 'No mesh selected', 'warning');
                return;
            }
            _this.animTarget = document.getElementById('animProperty').value;
            _this.animName = document.getElementById('animName').value;
            _this.animFps = document.getElementById('animFrames').value;
            _this.animBehavior = document.getElementById('animBehavior').value;
            // check if name is available
            if (_this.animName === '') {
                _this.globals.ipcRenderer.send('show-message', 'The animation name is invalid', 'warning');
                return;
            }
            var animationName = _this.mesh.getAnimationByName(_this.animName);
            if (animationName !== null) {
                _this.globals.ipcRenderer.send('show-message', 'This name is not available', 'warning');
                return;
            }
            _this.createAnimation();
        };
        this.meshSubscription = this.globals.selectedMesh.subscribe(this.getMesh);
        this.useEasing = false;
    }
    AnimCreateComponent.prototype.ngOnInit = function () {
        document.getElementById('setEasing').addEventListener('click', this.setEasing);
        document.getElementById('animOptButton').addEventListener('click', this.getAnimInfo);
    };
    /**
     * create a new animation
     */
    AnimCreateComponent.prototype.createAnimation = function () {
        var fps = parseInt(this.animFps, 10);
        var animDataTyp = babylonjs__WEBPACK_IMPORTED_MODULE_1__["Animation"].ANIMATIONTYPE_VECTOR3;
        var loopmode;
        // loop mode
        switch (this.animBehavior) {
            case 'relative':
                loopmode = babylonjs__WEBPACK_IMPORTED_MODULE_1__["Animation"].ANIMATIONLOOPMODE_RELATIVE;
                break;
            case 'cycle':
                loopmode = babylonjs__WEBPACK_IMPORTED_MODULE_1__["Animation"].ANIMATIONLOOPMODE_CYCLE;
                break;
            case 'constant':
                loopmode = babylonjs__WEBPACK_IMPORTED_MODULE_1__["Animation"].ANIMATIONLOOPMODE_CONSTANT;
                break;
        }
        // create ainmation
        var newAnimation = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["Animation"](this.animName, this.animTarget, fps, animDataTyp, loopmode);
        // define empty animation (important for the SceneSerializer)
        newAnimation.setKeys([]);
        // if use easing is checked, add selected easing function to animaation
        if (this.useEasing) {
            this.createEasing();
            newAnimation.setEasingFunction(this.createEasing());
        }
        // add animation to mesh
        this.mesh.animations.push(newAnimation);
    };
    /**
     * create an easing function
     * @returns {BABYLON.EasingFunction} a new easing function
     */
    AnimCreateComponent.prototype.createEasing = function () {
        this.easingFunction = document.getElementById('easingFn').value;
        this.easingMode = document.getElementById('easingMode').value;
        var easingFn;
        // easing function
        switch (this.easingFunction) {
            case 'circle':
                easingFn = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["CircleEase"]();
                break;
            case 'back':
                easingFn = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["BackEase"]();
                break;
            case 'bounce':
                easingFn = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["BounceEase"]();
                break;
            case 'cubic':
                easingFn = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["CubicEase"]();
                break;
            case 'elastic':
                easingFn = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["ElasticEase"]();
                break;
            case 'exponential':
                easingFn = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["ExponentialEase"]();
                break;
            case 'power':
                easingFn = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["PowerEase"]();
                break;
            case 'quadratic':
                easingFn = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["QuadraticEase"]();
                break;
            case 'quartic':
                easingFn = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["QuarticEase"]();
                break;
            case 'quintic':
                easingFn = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["QuinticEase"]();
                break;
            case 'sine':
                easingFn = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["SineEase"]();
                break;
            case 'bezier':
                easingFn = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["BezierCurveEase"]();
                break;
        }
        // easing mode
        switch (this.easingMode) {
            case 'easeIn':
                easingFn.setEasingMode(babylonjs__WEBPACK_IMPORTED_MODULE_1__["EasingFunction"].EASINGMODE_EASEIN);
                break;
            case 'easeOut':
                easingFn.setEasingMode(babylonjs__WEBPACK_IMPORTED_MODULE_1__["EasingFunction"].EASINGMODE_EASEOUT);
                break;
            case 'easeInOut':
                easingFn.setEasingMode(babylonjs__WEBPACK_IMPORTED_MODULE_1__["EasingFunction"].EASINGMODE_EASEINOUT);
                break;
        }
        return easingFn;
    };
    AnimCreateComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-anim-create',
            template: __webpack_require__(/*! ./anim-create.component.html */ "./src/app/animation/anim-create/anim-create.component.html"),
            styles: [__webpack_require__(/*! ./anim-create.component.css */ "./src/app/animation/anim-create/anim-create.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_2__["GlobalsService"]])
    ], AnimCreateComponent);
    return AnimCreateComponent;
}());



/***/ }),

/***/ "./src/app/animation/anim-timeline/anim-timeline.component.css":
/*!*********************************************************************!*\
  !*** ./src/app/animation/anim-timeline/anim-timeline.component.css ***!
  \*********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "#timelineDiv{\r\n    width: 100%;\r\n    overflow: auto;\r\n    background-color: rgb(77, 72, 76);\r\n}\r\n\r\n#konvaContainer {\r\n    width: 100%;\r\n    min-width: 800px;\r\n    height: 100px;\r\n}\r\n\r\n:host ::ng-deep #timelineInfo{\r\n    width: 100%;\r\n    background-color: rgb(77, 72, 76);\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-between;\r\n    align-items: center;\r\n}\r\n\r\n#timelineTextSpan{\r\n    width: 80%;\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-between;\r\n    flex-wrap: wrap;\r\n}\r\n\r\n.timelineButtons{\r\n    width: 20px;\r\n    height: 20px;\r\n}"

/***/ }),

/***/ "./src/app/animation/anim-timeline/anim-timeline.component.html":
/*!**********************************************************************!*\
  !*** ./src/app/animation/anim-timeline/anim-timeline.component.html ***!
  \**********************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div id=\"timelineInfo\">\r\n    <!-- animation info when an animation is selected-->\r\n    <span *ngIf=\"animation\" class=\"flexItem\" id=\"timelineTextSpan\">\r\n        <span class=\"timelineText\">name: {{animation.name}}</span>\r\n        <span class=\"timelineText\">target: {{animation.targetProperty}}</span>\r\n        <span class=\"timelineText\" *ngIf=\"animation.getKeys().length > 0\">\r\n            last frame: {{animation.getKeys()[animation.getKeys().length - 1].frame}}\r\n        </span>\r\n        <span class=\"timelineText\" *ngIf=\"!animation.getKeys() || animation.getKeys().length == 0\">\r\n            last frame:\r\n        </span>\r\n        <span class=\"timelineText\" id=\"timelineValue\">value: -</span>\r\n    </span>\r\n    <!-- animation info when an animation is not selected-->\r\n    <span *ngIf=\"!animation\" class=\"flexItem\" id=\"timelineTextSpan\">\r\n        <span class=\"timelineText\">name:</span>\r\n        <span class=\"timelineText\">target:</span>\r\n        <span class=\"timelineText\">last frame:</span>\r\n        <span class=\"timelineText\">value:</span>\r\n    </span>\r\n\r\n    <!-- buttons -->\r\n    <span *ngIf=\"animation\" class=\"flexItem\">\r\n        <span *ngIf=\"this.animKeys.length > 0\">\r\n            <input type=\"image\" id=\"applyKeys\" class=\"timelineButtons\" src=\"assets/icons/check.png\" alt=\"apply\" (click)=\"getAction('add');\"/>\r\n            <input type=\"image\" id=\"revertKeys\" class=\"timelineButtons\" src=\"assets/icons/cancel.png\" alt=\"revert\" (click)=\"getAction('revert');\"/>\r\n        </span>\r\n        <input type=\"image\" id=\"cancelSelection\" class=\"timelineButtons\" src=\"assets/icons/ban.png\" alt=\"cancel\" (click)=\"getAction('cancel');\"/>\r\n    </span>\r\n</div>\r\n<div id=\"timelineDiv\">\r\n    <div id=\"konvaContainer\"></div>\r\n</div>"

/***/ }),

/***/ "./src/app/animation/anim-timeline/anim-timeline.component.ts":
/*!********************************************************************!*\
  !*** ./src/app/animation/anim-timeline/anim-timeline.component.ts ***!
  \********************************************************************/
/*! exports provided: AnimTimelineComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AnimTimelineComponent", function() { return AnimTimelineComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/globals.service */ "./src/app/services/globals.service.ts");
/* harmony import */ var konva__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! konva */ "./node_modules/konva/konva.js");
/* harmony import */ var konva__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(konva__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_3__);
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var AnimTimelineComponent = /** @class */ (function () {
    function AnimTimelineComponent(globals) {
        var _this = this;
        this.globals = globals;
        this.animKeys = [];
        this.linesDrawn = [];
        this.keysDrawn = [];
        /**
         * get selected mesh
         */
        this.getMesh = function (_mesh) {
            _this.mesh = _mesh;
        };
        /**
         * get selected animation
         * @param {strin[]} _anim - contains animation name and whether it gets added or removed
         */
        this.getAnimation = function (_anim) {
            if (_anim === undefined) {
                _this.animation = undefined;
                _this.animKeys.length = 0;
                if (_this.stage) {
                    _this.deleteDrawnKeys(true);
                }
                return;
            }
            if (_this.animation === undefined && _anim[1] === 'add') {
                _this.animation = _this.mesh.getAnimationByName(_anim[0]);
                _this.getAnimationKeys();
            }
            else if (_this.animation !== undefined && _anim[1] === 'remove') {
                if (_this.animation.name === _anim[0]) {
                    _this.animation = undefined;
                    _this.animKeys.length = 0;
                    _this.deleteDrawnKeys(true);
                }
            }
        };
        /**
         * Reacts to the click events. Gets called from the html template.
         * @param {strin} _action - add / revert / cancel
         */
        this.getAction = function (_action) {
            switch (_action) {
                case 'cancel':
                    _this.animation = undefined;
                    _this.animKeys.length = 0;
                    _this.deleteDrawnKeys(true);
                    break;
                case 'add':
                    if (_this.animation && _this.animKeys.length !== 0) {
                        _this.animKeys = _this.animKeys.sort(function (a, b) { return a.frame - b.frame; }); // sort keys numerically
                        _this.animation.setKeys(_this.animKeys);
                        _this.animKeys.length = 0;
                        _this.deleteDrawnKeys(true);
                        _this.getAnimationKeys();
                    }
                    break;
                case 'revert':
                    _this.animKeys.length = 0;
                    _this.deleteDrawnKeys(false);
                    break;
            }
        };
        /**
         * scroll horizontally
         *  @param {MouseWheelEvent} _event
         */
        this.scrollDiv = function (_event) {
            _event.preventDefault();
            var target = _this.container.parentElement;
            var deltaY = _event.deltaY;
            target.scrollLeft += deltaY;
        };
        this.minDistance = 10;
        this.startX = 5;
        this.framesNum = 500;
        this.lineHeight = 50;
        this.lineWidth = 3;
        this.globals.selectedMesh.subscribe(this.getMesh);
        this.globals.selectedAnimation.subscribe(this.getAnimation);
    }
    AnimTimelineComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.container = document.getElementById('konvaContainer');
        this.container.addEventListener('mousewheel', this.scrollDiv);
        // wait until other components initialize
        setTimeout(function () { _this.initStage(); }, 10);
    };
    /**
     * get the keyframes of the animation
     */
    AnimTimelineComponent.prototype.getAnimationKeys = function () {
        var animationKeys = this.animation.getKeys();
        if (animationKeys) {
            this.animKeys = animationKeys.slice(0); // get a copy of the animation key array
            var frame = void 0;
            var value = void 0;
            var xPos = void 0;
            for (var index = 0; index < animationKeys.length; index++) {
                frame = animationKeys[index].frame;
                value = animationKeys[index].value;
                xPos = this.linesDrawn[frame].x();
                this.drawOldKeys(xPos, frame, value.toString());
            }
        }
    };
    /**
     * initiate the stage with 2 layer and drawn lines
     */
    AnimTimelineComponent.prototype.initStage = function () {
        this.width = this.container.clientWidth;
        this.height = this.container.clientHeight;
        this.stage = new konva__WEBPACK_IMPORTED_MODULE_2__["Stage"]({
            container: this.container.id,
            width: this.width,
            height: this.height
        });
        this.staticLayer = new konva__WEBPACK_IMPORTED_MODULE_2__["Layer"]();
        this.dynamicLayer = new konva__WEBPACK_IMPORTED_MODULE_2__["Layer"]();
        this.stage.add(this.staticLayer);
        this.stage.add(this.dynamicLayer);
        this.drawLines(this.framesNum);
        this.drawPointer();
        this.drawHorizontalLine(52);
        this.drawHorizontalLine(75);
    };
    /**
     * draw the old keyframes of the animation
     * @param {number} _x - position of the key in the timeline
     * @param {number} _frame - frame of the keyframe
     * @param {number} _data - value of the keyframe
     */
    AnimTimelineComponent.prototype.drawOldKeys = function (_x, _frame, _data) {
        var _this = this;
        var w = 10;
        var y = 55;
        var color = 'rgb(253, 46, 98)';
        var id = 'oldKey' + _frame.toString();
        var data = _data;
        var poly = new konva__WEBPACK_IMPORTED_MODULE_2__["Line"]({
            points: [_x, y, _x + w, y + w, _x, y + (2 * w), _x - w, y + w],
            fill: color,
            stroke: 'black',
            strokeWidth: 2,
            closed: true,
            id: id,
            name: data
        });
        // event: delete symbol + keyframe
        poly.on('click', function () {
            poly.destroy();
            if (_this.keysDrawn.indexOf(id) !== -1) {
                _this.keysDrawn.splice(_this.keysDrawn.indexOf(id), 1);
                _this.deleteAnimKey(poly.id().replace('oldKey', ''));
            }
            _this.showKeyValue(null);
            _this.dynamicLayer.draw();
        });
        // event: show tooltip
        poly.on('mouseenter', function () {
            _this.showKeyValue(poly.name());
        });
        // event: hide tooltip
        poly.on('mouseleave', function () {
            _this.showKeyValue(null);
        });
        this.keysDrawn.push(id);
        this.dynamicLayer.add(poly);
        this.dynamicLayer.draw();
    };
    /**
     * draw pointer
     */
    AnimTimelineComponent.prototype.drawPointer = function () {
        var _this = this;
        this.pointer = new konva__WEBPACK_IMPORTED_MODULE_2__["Rect"]({
            x: 0,
            y: 0,
            width: this.lineWidth,
            height: this.height,
            fill: 'red',
            stroke: 'red',
            strokeWidth: 1,
        });
        // custom hit box is bigger than the standard
        this.pointer.hitFunc(function (context) {
            var xStart = -(_this.distance - 4);
            var xEnd = _this.pointer.width() + (xStart * (-2));
            context.beginPath();
            context.rect(xStart, 0, xEnd, _this.height);
            context.closePath();
            context.fillStrokeShape(_this.pointer);
        });
        // event: create key at pointer position
        this.pointer.on('click', function () {
            if (_this.mesh === undefined) {
                _this.globals.ipcRenderer.send('show-message', 'No mesh selected', 'warning');
                return;
            }
            if (_this.animation !== undefined) {
                var xPos = _this.pointer.position().x;
                var data = [];
                // save the position/rotation/scaling of the mesh
                switch (_this.animation.targetProperty) {
                    case 'rotation':
                        if (_this.mesh.rotationQuaternion !== null && _this.mesh.rotationQuaternion !== undefined) {
                            data[0] = _this.mesh.rotationQuaternion.toEulerAngles().x;
                            data[1] = _this.mesh.rotationQuaternion.toEulerAngles().y;
                            data[2] = _this.mesh.rotationQuaternion.toEulerAngles().z;
                        }
                        else {
                            data[0] = _this.mesh.rotation.x;
                            data[1] = _this.mesh.rotation.y;
                            data[2] = _this.mesh.rotation.z;
                        }
                        break;
                    case 'scaling':
                        data[0] = _this.mesh.scaling.x;
                        data[1] = _this.mesh.scaling.y;
                        data[2] = _this.mesh.scaling.z;
                        break;
                    default:
                        data[0] = _this.mesh.position.x;
                        data[1] = _this.mesh.position.y;
                        data[2] = _this.mesh.position.z;
                        break;
                }
                var dataDisplay = '{ X: ' + data[0] + ' Y: ' + data[1] + ' Z: ' + data[2] + ' }';
                _this.drawKey(xPos, _this.pointer.name(), dataDisplay);
                _this.addAnimKey(_this.pointer.name(), data);
            }
            else {
                _this.globals.ipcRenderer.send('show-message', 'No animation selected', 'warning');
            }
        });
        // add to layer
        this.dynamicLayer.add(this.pointer);
        this.dynamicLayer.draw();
    };
    /**
     * resize the container and stage
     *  @param {number} _width - new width of stage
     */
    AnimTimelineComponent.prototype.resizeStage = function (_width) {
        this.container.setAttribute('style', 'width:' + _width.toString() + 'px;');
        this.width = this.container.clientWidth;
        this.stage.width(this.width);
    };
    /**
     * draw the lines and numbers for the frames
     *  @param {number} _amount - the max frame value
     */
    AnimTimelineComponent.prototype.drawLines = function (_amount) {
        var _this = this;
        var xPos = this.startX;
        this.distance = Math.round(this.width / _amount);
        var simpleText;
        if (this.distance < this.minDistance) {
            this.distance = this.minDistance;
        }
        var _loop_1 = function (index) {
            if (index % 10 === 0) {
                this_1.linesDrawn[index] = new konva__WEBPACK_IMPORTED_MODULE_2__["Rect"]({
                    x: xPos,
                    y: 0,
                    width: this_1.lineWidth,
                    height: (this_1.lineHeight * 0.8),
                    fill: 'black',
                    stroke: 'black',
                    strokeWidth: 1,
                });
                simpleText = new konva__WEBPACK_IMPORTED_MODULE_2__["Text"]({
                    x: xPos,
                    y: this_1.lineHeight - 10,
                    text: index.toString(),
                    fontSize: 12,
                    fontFamily: 'Calibri',
                    fill: 'white'
                });
                // text align
                simpleText.offsetX(simpleText.getWidth() / 2);
            }
            else if (index % 5 === 0) {
                this_1.linesDrawn[index] = new konva__WEBPACK_IMPORTED_MODULE_2__["Rect"]({
                    x: xPos,
                    y: 0,
                    width: this_1.lineWidth,
                    height: (this_1.lineHeight * 0.6),
                    fill: 'black',
                    stroke: 'black',
                    strokeWidth: 1,
                });
            }
            else {
                this_1.linesDrawn[index] = new konva__WEBPACK_IMPORTED_MODULE_2__["Rect"]({
                    x: xPos,
                    y: 0,
                    width: this_1.lineWidth,
                    height: (this_1.lineHeight * 0.5),
                    fill: 'black',
                    stroke: 'black',
                    strokeWidth: 1,
                });
            }
            // custom hit box: longer than the line itself
            this_1.linesDrawn[index].hitFunc(function (context) {
                context.beginPath();
                context.rect(0, 0, _this.lineWidth, _this.height);
                context.closePath();
                context.fillStrokeShape(_this.linesDrawn[index]);
            });
            // event: pointer saves the frame of the line in the name property
            this_1.linesDrawn[index].on('mouseover', function () {
                var pos = _this.linesDrawn[index].position().x;
                _this.pointer.x(pos);
                _this.pointer.name(index.toString());
                _this.dynamicLayer.draw();
            });
            // add to layer
            this_1.staticLayer.add(simpleText);
            this_1.staticLayer.add(this_1.linesDrawn[index]);
            xPos += this_1.distance;
        };
        var this_1 = this;
        for (var index = 0; index <= _amount; index++) {
            _loop_1(index);
        }
        // draw layer
        this.staticLayer.draw();
        // check size
        if (xPos > (this.width + this.distance)) {
            this.resizeStage(xPos);
        }
    };
    /**
     * draw the new keys in the timeline
     * @param {number} _x - position the key will be drawn
     * @param {number} _frame - frame of the keyframe
     * @param {number} _data - value of the keyframe
     */
    AnimTimelineComponent.prototype.drawKey = function (_x, _frame, _data) {
        var _this = this;
        var w = 10;
        var y = 75;
        var color = '#00D2FF';
        var id = _frame;
        var data = _data;
        // check if key already exists
        // if true create new key and save id in keyArray, else show on top of the layer
        if (this.keysDrawn.indexOf(id) === -1) {
            var poly_1 = new konva__WEBPACK_IMPORTED_MODULE_2__["Line"]({
                points: [_x, y, _x + w, y + w, _x, y + (2 * w), _x - w, y + w],
                fill: color,
                stroke: 'black',
                strokeWidth: 2,
                closed: true,
                id: id,
                name: data
            });
            // event: show value
            poly_1.on('mouseenter', function () {
                _this.showKeyValue(poly_1.name());
            });
            // event: hide value
            poly_1.on('mouseleave', function () {
                _this.showKeyValue(null);
            });
            // event: delete symbol + keyframe and hide value
            poly_1.on('click', function () {
                poly_1.destroy();
                if (_this.keysDrawn.indexOf(id) !== -1) {
                    _this.keysDrawn.splice(_this.keysDrawn.indexOf(id), 1);
                    _this.deleteAnimKey(poly_1.id());
                }
                _this.showKeyValue(null);
                _this.dynamicLayer.draw();
            });
            // add to keysDrawn array
            this.keysDrawn.push(id);
            // add too layer
            this.dynamicLayer.add(poly_1);
        }
        else {
            var shape = this.stage.find('#' + id)[0];
            shape.moveToTop();
        }
        this.dynamicLayer.draw();
    };
    /**
     * delete drawn keys from the timeline
     * @param {boolean} _deleteAll - true = delete old and new keys from timeline false= only new keys
     */
    AnimTimelineComponent.prototype.deleteDrawnKeys = function (_deleteAll) {
        var col;
        if (_deleteAll) {
            col = this.stage.find('Line');
        }
        else {
            col = this.dynamicLayer.find('Line');
        }
        col.each(function (el) {
            el.destroy();
        });
        this.keysDrawn.length = 0;
        if (_deleteAll) {
            this.staticLayer.draw();
            this.dynamicLayer.draw();
        }
        else {
            this.dynamicLayer.draw();
        }
    };
    /**
     * add a new keyframe to the animKey array
     * @param {string} _frame - frame of the  new keyframe
     * @param {number[]} _values - value of the new keyframe
     */
    AnimTimelineComponent.prototype.addAnimKey = function (_frame, _values) {
        var frame = parseInt(_frame, 10);
        var value = new babylonjs__WEBPACK_IMPORTED_MODULE_3__["Vector3"](_values[0], _values[1], _values[2]);
        // delete the old entry if frame already exists in array
        for (var i = 0; i < this.animKeys.length; i++) {
            if (this.animKeys[i].frame === frame) {
                this.animKeys.splice(i, 1);
            }
        }
        this.animKeys.push({
            frame: frame,
            value: value
        });
    };
    /**
     * delete keyframe from animKey array
     * @param {string} _frame - frame of the keyframe
     */
    AnimTimelineComponent.prototype.deleteAnimKey = function (_frame) {
        var frame = parseInt(_frame, 10);
        for (var i = 0; i < this.animKeys.length; i++) {
            if (this.animKeys[i].frame === frame) {
                this.animKeys.splice(i, 1);
            }
        }
    };
    /**
     * draw a horizontal line
     * @param {number} _y - y position of the line
     */
    AnimTimelineComponent.prototype.drawHorizontalLine = function (_y) {
        var line = new konva__WEBPACK_IMPORTED_MODULE_2__["Rect"]({
            x: 0,
            y: _y,
            width: this.width,
            stroke: 'black',
            strokeWidth: 3,
            opacity: 0.7
        });
        this.staticLayer.add(line);
        line.moveToBottom();
        this.staticLayer.draw();
    };
    /**
     * show the value of selected keyframe in the infobox
     * @param {string} _content - value of the keyframe
     */
    AnimTimelineComponent.prototype.showKeyValue = function (_content) {
        if (_content === null) {
            document.getElementById('timelineValue').innerHTML = 'value: -';
        }
        else {
            document.getElementById('timelineValue').innerHTML = 'value: ' + _content;
        }
    };
    AnimTimelineComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-anim-timeline',
            template: __webpack_require__(/*! ./anim-timeline.component.html */ "./src/app/animation/anim-timeline/anim-timeline.component.html"),
            styles: [__webpack_require__(/*! ./anim-timeline.component.css */ "./src/app/animation/anim-timeline/anim-timeline.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_1__["GlobalsService"]])
    ], AnimTimelineComponent);
    return AnimTimelineComponent;
}());



/***/ }),

/***/ "./src/app/animation/animation-display/animation-display.component.css":
/*!*****************************************************************************!*\
  !*** ./src/app/animation/animation-display/animation-display.component.css ***!
  \*****************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "#animField {\r\n    width: 100%;\r\n    overflow: auto;\r\n    border: solid 1px white;\r\n}\r\n\r\nfieldset {\r\n    border: none;\r\n}\r\n\r\n:host ::ng-deep .animInfo {\r\n    padding-left: 10px;\r\n}\r\n\r\n.trashButton {\r\n    margin-right: 1px;\r\n    width: 15px;\r\n    height: 15px;\r\n}"

/***/ }),

/***/ "./src/app/animation/animation-display/animation-display.component.html":
/*!******************************************************************************!*\
  !*** ./src/app/animation/animation-display/animation-display.component.html ***!
  \******************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<legend>Animations</legend>\r\n<div id=\"animField\" >\r\n  <fieldset open>\r\n    <div *ngIf=\"mesh\">\r\n      <div *ngIf=\"mesh.animations.length !== 0\">\r\n        <details *ngFor=\"let anim of mesh.animations\">\r\n          <!-- name of animation -->\r\n          <summary (click)=\"getAnimation($event);\">\r\n            <input type=\"image\" class=\"trashButton\" src=\"assets/icons/trash.png\" alt=\"delete\" (click)=\"deleteAnim($event);\" />\r\n            <span>{{anim.name}}</span>\r\n          </summary>\r\n          <!-- animation target -->\r\n          <span class=\"animInfo\">typ: {{anim.targetProperty}} </span>\r\n          <!-- show all frames -->\r\n          <details class=\"animInfo\">\r\n            <summary>frames</summary>\r\n            <details *ngFor=\"let key of anim.getKeys()\" class=\"animInfo\">\r\n              <summary>{{key.frame}}</summary>\r\n              <span class=\"animInfo\">({{key.value.x}}|{{key.value.y}}|{{key.value.z}})</span>\r\n            </details>\r\n          </details>\r\n        </details>\r\n      </div>\r\n\r\n      <div *ngIf=\"mesh.animations.length === 0\">\r\n        empty\r\n      </div>\r\n    </div>\r\n  </fieldset>\r\n</div>"

/***/ }),

/***/ "./src/app/animation/animation-display/animation-display.component.ts":
/*!****************************************************************************!*\
  !*** ./src/app/animation/animation-display/animation-display.component.ts ***!
  \****************************************************************************/
/*! exports provided: AnimationDisplayComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AnimationDisplayComponent", function() { return AnimationDisplayComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var AnimationDisplayComponent = /** @class */ (function () {
    function AnimationDisplayComponent(globals) {
        var _this = this;
        this.globals = globals;
        /**
         * get selected mesh
         * @param {AbstractMesh} _mesh - selected mesh
         */
        this.getSelectedMesh = function (_mesh) {
            _this.mesh = _mesh;
        };
        /**
         * Get selected animation. Gets called from the html template.
         * @param {MouseEvent} _event
         */
        this.getAnimation = function (_event) {
            var span = _event.currentTarget;
            var animName = span.lastChild.innerHTML;
            // emit animation name
            _this.globals.selectedAnimation.next([animName, 'add']);
        };
        /**
         * Delete animation. Gets called from the html template.
         * @param {MouseEvent} _event
         */
        this.deleteAnim = function (_event) {
            var target = _event.target;
            var animName = target.parentElement.lastElementChild.innerHTML;
            var meshAnimations = _this.mesh.animations;
            var animtable = _this.globals.scene.getAnimatableByTarget(_this.mesh);
            _this.globals.selectedAnimation.next([animName, 'remove']);
            for (var index = 0; index < meshAnimations.length; index++) {
                var element = meshAnimations[index];
                // stop animation if it is playing
                if (element.name === animName) {
                    if (animtable) {
                        animtable.stop();
                        animtable.reset();
                    }
                    // delete animation
                    meshAnimations.splice(index, 1);
                }
            }
        };
    }
    AnimationDisplayComponent.prototype.ngOnInit = function () {
        this.selectedMeshSubscription = this.globals.selectedMesh.subscribe(this.getSelectedMesh);
    };
    AnimationDisplayComponent.prototype.ngOnDestroy = function () {
        this.selectedMeshSubscription.unsubscribe();
    };
    AnimationDisplayComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-animation-display',
            template: __webpack_require__(/*! ./animation-display.component.html */ "./src/app/animation/animation-display/animation-display.component.html"),
            styles: [__webpack_require__(/*! ./animation-display.component.css */ "./src/app/animation/animation-display/animation-display.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_1__["GlobalsService"]])
    ], AnimationDisplayComponent);
    return AnimationDisplayComponent;
}());



/***/ }),

/***/ "./src/app/animation/player/player.component.css":
/*!*******************************************************!*\
  !*** ./src/app/animation/player/player.component.css ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".animRange {\r\n    width: 3em;\r\n}\r\n\r\n.playerBtn {\r\n    width: 20px;\r\n    height: 20px;\r\n    margin: 0 2px;\r\n}\r\n\r\n.playerBtn:hover{\r\n    cursor: pointer;\r\n}\r\n\r\nspan{\r\n    width: 100%;\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-between;\r\n    flex-wrap: wrap;\r\n}"

/***/ }),

/***/ "./src/app/animation/player/player.component.html":
/*!********************************************************!*\
  !*** ./src/app/animation/player/player.component.html ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<fieldset>\r\n  <section>\r\n    <input type=\"image\" src=\"assets/icons/play.png\" alt=\"revert\" id=\"play\" class=\"playerBtn\" value=\"play\" />\r\n    <input type=\"image\" src=\"assets/icons/pause.png\" alt=\"revert\" id=\"pause\" class=\"playerBtn\" value=\"pause\" />\r\n    <input type=\"image\" src=\"assets/icons/stop.png\" alt=\"revert\" id=\"stop\" class=\"playerBtn\" value=\"stop\" />\r\n    <input type=\"image\" src=\"assets/icons/backwards.png\" alt=\"revert\" id=\"reset\" class=\"playerBtn\" value=\"reset\" />\r\n    <br>\r\n    <span>\r\n      <label for=\"startFrame\"> start: </label>\r\n      <input type=\"number\" id=\"startFrame\" class=\"animRange\" value=\"0\" min=\"0\" step=\"1\">\r\n    </span>\r\n    <span>\r\n      <label for=\"endFrame\"> end: </label>\r\n      <input type=\"number\" id=\"endFrame\" class=\"animRange\" value=\"100\" min=\"0\" step=\"1\">\r\n    </span>\r\n\r\n  </section>\r\n</fieldset>"

/***/ }),

/***/ "./src/app/animation/player/player.component.ts":
/*!******************************************************!*\
  !*** ./src/app/animation/player/player.component.ts ***!
  \******************************************************/
/*! exports provided: PlayerComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PlayerComponent", function() { return PlayerComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var PlayerComponent = /** @class */ (function () {
    function PlayerComponent(globals) {
        var _this = this;
        this.globals = globals;
        /**
         * get selected mesh
         * @param {BABYLON.AbstractMesh} _mesh
         */
        this.getMesh = function (_mesh) {
            _this.mesh = _mesh;
        };
        /**
         * control animation
         * @param {Event} _event
         */
        this.playerController = function (_event) {
            var target = _event.target;
            if (_this.mesh === undefined) {
                return;
            }
            // get current running animatables of target mesh
            if (_this.globals.scene.getAnimatableByTarget(_this.mesh)) {
                _this.player = _this.globals.scene.getAnimatableByTarget(_this.mesh);
            }
            switch (target.id) {
                case 'play':
                    _this.startFrame = document.getElementById('startFrame').valueAsNumber;
                    _this.endFrame = document.getElementById('endFrame').valueAsNumber;
                    _this.player = _this.globals.scene.beginAnimation(_this.mesh, _this.startFrame, _this.endFrame, true);
                    break;
                case 'pause':
                    if (_this.player.animationStarted) {
                        _this.player.pause();
                    }
                    else {
                        _this.player.restart();
                    }
                    break;
                case 'stop':
                    _this.player.stop();
                    break;
                case 'reset':
                    _this.player.reset();
                    break;
            }
        };
    }
    PlayerComponent.prototype.ngOnInit = function () {
        document.getElementById('play').addEventListener('click', this.playerController);
        document.getElementById('pause').addEventListener('click', this.playerController);
        document.getElementById('stop').addEventListener('click', this.playerController);
        document.getElementById('reset').addEventListener('click', this.playerController);
        this.globals.selectedMesh.subscribe(this.getMesh);
    };
    PlayerComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-player',
            template: __webpack_require__(/*! ./player.component.html */ "./src/app/animation/player/player.component.html"),
            styles: [__webpack_require__(/*! ./player.component.css */ "./src/app/animation/player/player.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_1__["GlobalsService"]])
    ], PlayerComponent);
    return PlayerComponent;
}());



/***/ }),

/***/ "./src/app/app.component.css":
/*!***********************************!*\
  !*** ./src/app/app.component.css ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ":host {\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-evenly;\r\n    flex-wrap: wrap;\r\n}\r\n\r\n#hierarchyContainer {\r\n    width: 8%;\r\n    max-height: 99vh;\r\n}\r\n\r\n#canvasContainer{\r\n    width: 80%;\r\n}"

/***/ }),

/***/ "./src/app/app.component.html":
/*!************************************!*\
  !*** ./src/app/app.component.html ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div id=\"hierarchyContainer\">\r\n    <app-hierarchy></app-hierarchy>\r\n    <app-animation-display></app-animation-display>\r\n</div>\r\n<div id=\"canvasContainer\">\r\n    <app-canvas></app-canvas>\r\n    <app-anim-timeline></app-anim-timeline>\r\n</div>\r\n<app-editor></app-editor>\r\n"

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! exports provided: AppComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppComponent", function() { return AppComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};

var AppComponent = /** @class */ (function () {
    function AppComponent() {
    }
    AppComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-root',
            template: __webpack_require__(/*! ./app.component.html */ "./src/app/app.component.html"),
            styles: [__webpack_require__(/*! ./app.component.css */ "./src/app/app.component.css")]
        })
    ], AppComponent);
    return AppComponent;
}());



/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! exports provided: AppModule */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "AppModule", function() { return AppModule; });
/* harmony import */ var _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm5/platform-browser.js");
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _app_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
/* harmony import */ var _canvas_canvas_component__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./canvas/canvas.component */ "./src/app/canvas/canvas.component.ts");
/* harmony import */ var _editor_editor_component__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./editor/editor.component */ "./src/app/editor/editor.component.ts");
/* harmony import */ var _editor_hierarchy_hierarchy_component__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./editor/hierarchy/hierarchy.component */ "./src/app/editor/hierarchy/hierarchy.component.ts");
/* harmony import */ var _editor_transform_transform_component__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./editor/transform/transform.component */ "./src/app/editor/transform/transform.component.ts");
/* harmony import */ var _editor_material_material_component__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./editor/material/material.component */ "./src/app/editor/material/material.component.ts");
/* harmony import */ var ngx_electron__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ngx-electron */ "./node_modules/ngx-electron/index.js");
/* harmony import */ var _editor_meshes_meshes_component__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./editor/meshes/meshes.component */ "./src/app/editor/meshes/meshes.component.ts");
/* harmony import */ var _editor_meshes_box_box_component__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./editor/meshes/box/box.component */ "./src/app/editor/meshes/box/box.component.ts");
/* harmony import */ var _editor_meshes_sphere_sphere_component__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./editor/meshes/sphere/sphere.component */ "./src/app/editor/meshes/sphere/sphere.component.ts");
/* harmony import */ var _editor_meshes_cylinder_cylinder_component__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./editor/meshes/cylinder/cylinder.component */ "./src/app/editor/meshes/cylinder/cylinder.component.ts");
/* harmony import */ var _editor_meshes_plane_plane_component__WEBPACK_IMPORTED_MODULE_13__ = __webpack_require__(/*! ./editor/meshes/plane/plane.component */ "./src/app/editor/meshes/plane/plane.component.ts");
/* harmony import */ var _editor_meshes_disc_disc_component__WEBPACK_IMPORTED_MODULE_14__ = __webpack_require__(/*! ./editor/meshes/disc/disc.component */ "./src/app/editor/meshes/disc/disc.component.ts");
/* harmony import */ var _editor_meshes_torus_torus_component__WEBPACK_IMPORTED_MODULE_15__ = __webpack_require__(/*! ./editor/meshes/torus/torus.component */ "./src/app/editor/meshes/torus/torus.component.ts");
/* harmony import */ var _editor_meshes_ground_ground_component__WEBPACK_IMPORTED_MODULE_16__ = __webpack_require__(/*! ./editor/meshes/ground/ground.component */ "./src/app/editor/meshes/ground/ground.component.ts");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_17__ = __webpack_require__(/*! ./services/globals.service */ "./src/app/services/globals.service.ts");
/* harmony import */ var _animation_player_player_component__WEBPACK_IMPORTED_MODULE_18__ = __webpack_require__(/*! ./animation/player/player.component */ "./src/app/animation/player/player.component.ts");
/* harmony import */ var _animation_animation_display_animation_display_component__WEBPACK_IMPORTED_MODULE_19__ = __webpack_require__(/*! ./animation/animation-display/animation-display.component */ "./src/app/animation/animation-display/animation-display.component.ts");
/* harmony import */ var _animation_anim_timeline_anim_timeline_component__WEBPACK_IMPORTED_MODULE_20__ = __webpack_require__(/*! ./animation/anim-timeline/anim-timeline.component */ "./src/app/animation/anim-timeline/anim-timeline.component.ts");
/* harmony import */ var _animation_anim_create_anim_create_component__WEBPACK_IMPORTED_MODULE_21__ = __webpack_require__(/*! ./animation/anim-create/anim-create.component */ "./src/app/animation/anim-create/anim-create.component.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};






















var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_1__["NgModule"])({
            declarations: [
                _app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"],
                _canvas_canvas_component__WEBPACK_IMPORTED_MODULE_3__["CanvasComponent"],
                _editor_editor_component__WEBPACK_IMPORTED_MODULE_4__["EditorComponent"],
                _editor_hierarchy_hierarchy_component__WEBPACK_IMPORTED_MODULE_5__["HierarchyComponent"],
                _editor_transform_transform_component__WEBPACK_IMPORTED_MODULE_6__["TransformComponent"],
                _editor_material_material_component__WEBPACK_IMPORTED_MODULE_7__["MaterialComponent"],
                _editor_meshes_meshes_component__WEBPACK_IMPORTED_MODULE_9__["MeshesComponent"],
                _editor_meshes_box_box_component__WEBPACK_IMPORTED_MODULE_10__["BoxComponent"],
                _editor_meshes_sphere_sphere_component__WEBPACK_IMPORTED_MODULE_11__["SphereComponent"],
                _editor_meshes_cylinder_cylinder_component__WEBPACK_IMPORTED_MODULE_12__["CylinderComponent"],
                _editor_meshes_plane_plane_component__WEBPACK_IMPORTED_MODULE_13__["PlaneComponent"],
                _editor_meshes_disc_disc_component__WEBPACK_IMPORTED_MODULE_14__["DiscComponent"],
                _editor_meshes_torus_torus_component__WEBPACK_IMPORTED_MODULE_15__["TorusComponent"],
                _editor_meshes_ground_ground_component__WEBPACK_IMPORTED_MODULE_16__["GroundComponent"],
                _animation_player_player_component__WEBPACK_IMPORTED_MODULE_18__["PlayerComponent"],
                _animation_animation_display_animation_display_component__WEBPACK_IMPORTED_MODULE_19__["AnimationDisplayComponent"],
                _animation_anim_timeline_anim_timeline_component__WEBPACK_IMPORTED_MODULE_20__["AnimTimelineComponent"],
                _animation_anim_create_anim_create_component__WEBPACK_IMPORTED_MODULE_21__["AnimCreateComponent"]
            ],
            imports: [
                _angular_platform_browser__WEBPACK_IMPORTED_MODULE_0__["BrowserModule"],
                ngx_electron__WEBPACK_IMPORTED_MODULE_8__["NgxElectronModule"]
            ],
            providers: [
                _services_globals_service__WEBPACK_IMPORTED_MODULE_17__["GlobalsService"]
            ],
            bootstrap: [_app_component__WEBPACK_IMPORTED_MODULE_2__["AppComponent"]]
        })
    ], AppModule);
    return AppModule;
}());



/***/ }),

/***/ "./src/app/canvas/canvas.component.css":
/*!*********************************************!*\
  !*** ./src/app/canvas/canvas.component.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "#renderCanvas { \r\n    width: 100%; \r\n    height: 800px;\r\n    float: left;\r\n}"

/***/ }),

/***/ "./src/app/canvas/canvas.component.html":
/*!**********************************************!*\
  !*** ./src/app/canvas/canvas.component.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<canvas id=\"renderCanvas\"></canvas>\r\n"

/***/ }),

/***/ "./src/app/canvas/canvas.component.ts":
/*!********************************************!*\
  !*** ./src/app/canvas/canvas.component.ts ***!
  \********************************************/
/*! exports provided: CanvasComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CanvasComponent", function() { return CanvasComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var CanvasComponent = /** @class */ (function () {
    function CanvasComponent(globals) {
        var _this = this;
        this.globals = globals;
        /*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        *                                        event handler
        */ ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
        /**
         * creates a new scene
         * @param {Event} _event
         */
        this.newScene = function (_event) {
            _this.scenePath = '';
            _this.initScene();
        };
        /**
         * saves the scene and shows an info dialog if successful
         * @param {Event} _event
         * @param {boolean} _save - true = save false= save as
         */
        this.saveScene = function (_event, _save) {
            var success;
            // destroy the gizmos to make sure it is not saved as well
            _this.destroyUtilGizmo();
            var serialize = babylonjs__WEBPACK_IMPORTED_MODULE_1__["SceneSerializer"].Serialize(_this.scene);
            var json = JSON.stringify(serialize);
            if (_save) {
                success = _this.globals.ipcRenderer.sendSync('save-scene', json);
            }
            else {
                success = _this.globals.ipcRenderer.sendSync('saveAs-scene', json);
            }
            if (success) {
                _this.globals.ipcRenderer.send('show-message', 'Scene is saved successfully', 'info');
                _this.initUtilGizmos();
            }
        };
        /**
         * loads a  scene
         */
        this.loadScene = function (_event) {
            var path = _this.globals.ipcRenderer.sendSync('load-scene');
            if (path) {
                _this.scenePath = path;
                _this.initScene();
            }
        };
        /**
         * prevents the distortion of the engine after resizing the window
         */
        this.resizeEngine = function () {
            _this.engine.resize();
        };
        /**
         * pick collisions
         */
        this.pickMesh = function () {
            var pickResult = _this.scene.pick(_this.scene.pointerX, _this.scene.pointerY);
            if (pickResult.hit) {
                var pickedMesh = pickResult.pickedMesh;
                _this.highlightMesh(pickedMesh);
                _this.showGizmo(pickedMesh);
                _this.globals.selectedMesh.next(pickedMesh);
            }
            else {
                _this.removeHighlight();
                _this.showGizmo(null);
                _this.globals.selectedMesh.next(undefined);
            }
        };
        /**
         * receive the selected mesh and inform the main process
         */
        this.receiveSelectedMesh = function (_mesh) {
            if (_mesh) {
                _this.highlightMesh(_mesh);
                _this.showGizmo(_mesh);
                _this.globals.ipcRenderer.send('send-mesh-selected', true);
            }
            else {
                _this.globals.ipcRenderer.send('send-mesh-selected', false);
            }
        };
        /**
         * change between translation, ratotation and scaling
         */
        this.changeEditMode = function (_event, _mode) {
            if (_mode === void 0) { _mode = ''; }
            if (_mode === '') {
                var target = _event.target;
                _mode = target.id;
            }
            switch (_mode.toLowerCase()) {
                case 'translation':
                    if (_this.activGizmo !== _this.positionGizmo) {
                        _this.positionGizmo.attachedMesh = _this.highlightedMesh;
                        _this.showGizmo(null);
                        _this.activGizmo = _this.positionGizmo;
                    }
                    break;
                case 'rotation':
                    if (_this.activGizmo !== _this.rotationGizmo) {
                        _this.rotationGizmo.attachedMesh = _this.highlightedMesh;
                        _this.showGizmo(null);
                        _this.activGizmo = _this.rotationGizmo;
                    }
                    break;
                case 'scaling':
                    if (_this.activGizmo !== _this.scalingGizmo) {
                        _this.scalingGizmo.attachedMesh = _this.highlightedMesh;
                        _this.showGizmo(null);
                        _this.activGizmo = _this.scalingGizmo;
                    }
                    break;
            }
        };
        /**
         * delete selected mesh
         */
        this.removeMesh = function (_event) {
            _this.highlightedMesh.dispose();
            _this.globals.selectedMesh.next(undefined);
            _this.globals.sceneTree.next([_this.highlightedMesh.name, 'remove']);
            _this.highlightedMesh = undefined;
            _this.showGizmo(null);
        };
        /**
         * reset selected mesh
         */
        this.resetMesh = function (_event) {
            _this.highlightedMesh.position = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["Vector3"](0, 0, 0);
            _this.highlightedMesh.rotationQuaternion = babylonjs__WEBPACK_IMPORTED_MODULE_1__["Quaternion"].Zero();
            _this.highlightedMesh.scaling = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["Vector3"](1, 1, 1);
        };
        /**
         * restore camera position
         */
        this.resetCamera = function (_event) {
            _this.camera.restoreState();
        };
        this.scenePath = '';
    }
    CanvasComponent.prototype.ngOnInit = function () {
        this.canvas = document.getElementById('renderCanvas');
        this.engine = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["Engine"](this.canvas, true, { stencil: true });
        this.engine.enableOfflineSupport = false;
        this.initScene();
        ///////////////////////// events /////////////////////////
        window.addEventListener('resize', this.resizeEngine);
        this.canvas.addEventListener('click', this.pickMesh);
        var buttons = document.getElementsByClassName('buttons');
        for (var index = 0; index < buttons.length; index++) {
            buttons[index].addEventListener('click', this.changeEditMode);
        }
        // subscribe to get the selected mesh
        this.selectedMeshSubscription = this.globals.selectedMesh.subscribe(this.receiveSelectedMesh);
        ///////////////////////// ipc /////////////////////////
        this.globals.ipcRenderer.on('delete-mesh', this.removeMesh);
        this.globals.ipcRenderer.on('reset-mesh', this.resetMesh);
        this.globals.ipcRenderer.on('reset-camera', this.resetCamera);
        this.globals.ipcRenderer.on('edit-mode', this.changeEditMode);
        this.globals.ipcRenderer.on('save-request', this.saveScene);
        this.globals.ipcRenderer.on('load-request', this.loadScene);
        this.globals.ipcRenderer.on('new-scene-request', this.newScene);
    };
    /*////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    *                                         methods
    */ ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    /**
     * initiate either a new or an existing scene
     */
    CanvasComponent.prototype.initScene = function () {
        var _this = this;
        this.deleteScene();
        // new scene
        if (this.scenePath === '') {
            this.scene = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["Scene"](this.engine);
            this.globals.scene = this.scene;
            // camera
            this.camera = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["ArcRotateCamera"]('arcCamera', -Math.PI / 2, Math.PI / 4, 15, babylonjs__WEBPACK_IMPORTED_MODULE_1__["Vector3"].Zero(), this.scene);
            this.camera.attachControl(this.canvas);
            this.camera.storeState();
            // light
            var light = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["HemisphericLight"]('light', new babylonjs__WEBPACK_IMPORTED_MODULE_1__["Vector3"](0, 1, 0), this.scene);
            // ground
            var ground = babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreateGround('ground', { width: 10, height: 10, subdivisions: 4 }, this.scene);
            this.globals.sceneTree.next([ground.name, 'add']);
            this.initUtilGizmos();
        }
        else {
            // load scene
            babylonjs__WEBPACK_IMPORTED_MODULE_1__["SceneLoader"].Load(this.scenePath, '', this.engine, function (_scene) {
                _this.scene = _scene;
                _this.globals.scene = _this.scene;
                _this.camera = _this.scene.activeCamera;
                _this.camera.attachControl(_this.canvas);
                _this.camera.storeState();
                // add meshes to scene graph
                for (var index = 0; index < _this.scene.meshes.length; index++) {
                    if (_this.scene.meshes[index].parent) {
                        _this.globals.sceneTree.next([_this.scene.meshes[index].name, 'add', _this.scene.meshes[index].parent.name]);
                    }
                    else {
                        _this.globals.sceneTree.next([_this.scene.meshes[index].name, 'add']);
                    }
                }
                _this.initUtilGizmos();
            });
        }
        this.engine.runRenderLoop(function () {
            _this.scene.render();
        });
    };
    /**
     * clean up and delete the scene
     */
    CanvasComponent.prototype.deleteScene = function () {
        this.globals.sceneTree.next(undefined);
        this.globals.selectedMesh.next(undefined);
        this.globals.selectedAnimation.next(undefined);
        this.highlightedMesh = undefined;
        if (this.scene) {
            this.scene.dispose();
        }
    };
    /**
     * highlight the selected mesh
     */
    CanvasComponent.prototype.highlightMesh = function (_mesh) {
        this.removeHighlight();
        _mesh.enableEdgesRendering();
        _mesh.edgesWidth = 5;
        _mesh.edgesColor = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["Color4"](255, 0, 0, 1);
        this.highlightedMesh = _mesh;
    };
    /**
     * remove the highlight of the last selected mesh
     */
    CanvasComponent.prototype.removeHighlight = function () {
        if (this.highlightedMesh !== undefined) {
            this.highlightedMesh.disableEdgesRendering();
        }
        this.highlightedMesh = undefined;
    };
    /**
     * init utilityLayer and gizmos
     */
    CanvasComponent.prototype.initUtilGizmos = function () {
        this.utilLayer = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["UtilityLayerRenderer"](this.scene);
        this.positionGizmo = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["PositionGizmo"](this.utilLayer);
        this.rotationGizmo = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["RotationGizmo"](this.utilLayer);
        this.scalingGizmo = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["ScaleGizmo"](this.utilLayer);
        this.activGizmo = this.positionGizmo;
    };
    /**
     * show/hide gizmo
     */
    CanvasComponent.prototype.showGizmo = function (_mesh) {
        this.activGizmo.attachedMesh = _mesh;
    };
    /**
     * destroy the utilityLayer and gizmos
     */
    CanvasComponent.prototype.destroyUtilGizmo = function () {
        this.utilLayer.dispose();
        this.positionGizmo.dispose();
        this.rotationGizmo.dispose();
        this.scalingGizmo.dispose();
    };
    CanvasComponent.prototype.ngOnDestroy = function () {
        this.selectedMeshSubscription.unsubscribe();
    };
    CanvasComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-canvas',
            template: __webpack_require__(/*! ./canvas.component.html */ "./src/app/canvas/canvas.component.html"),
            styles: [__webpack_require__(/*! ./canvas.component.css */ "./src/app/canvas/canvas.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_2__["GlobalsService"]])
    ], CanvasComponent);
    return CanvasComponent;
}());



/***/ }),

/***/ "./src/app/editor/editor.component.css":
/*!*********************************************!*\
  !*** ./src/app/editor/editor.component.css ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ":host {\r\n    width: 10%;\r\n}\r\n"

/***/ }),

/***/ "./src/app/editor/editor.component.html":
/*!**********************************************!*\
  !*** ./src/app/editor/editor.component.html ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<details open>\r\n    <summary> Transform </summary>\r\n    <app-transform></app-transform>\r\n</details>\r\n<details open>\r\n    <summary> Mesh </summary>\r\n    <app-meshes></app-meshes>\r\n</details>\r\n<details open>\r\n    <summary> Material </summary>\r\n    <app-material></app-material>\r\n</details>\r\n<details open>\r\n    <summary> Player </summary>\r\n    <app-player></app-player>\r\n</details>\r\n<details open>\r\n    <summary> Create Animation </summary>\r\n    <app-anim-create></app-anim-create>\r\n</details>"

/***/ }),

/***/ "./src/app/editor/editor.component.ts":
/*!********************************************!*\
  !*** ./src/app/editor/editor.component.ts ***!
  \********************************************/
/*! exports provided: EditorComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "EditorComponent", function() { return EditorComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var EditorComponent = /** @class */ (function () {
    function EditorComponent() {
    }
    EditorComponent.prototype.ngOnInit = function () {
    };
    EditorComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-editor',
            template: __webpack_require__(/*! ./editor.component.html */ "./src/app/editor/editor.component.html"),
            styles: [__webpack_require__(/*! ./editor.component.css */ "./src/app/editor/editor.component.css")]
        }),
        __metadata("design:paramtypes", [])
    ], EditorComponent);
    return EditorComponent;
}());



/***/ }),

/***/ "./src/app/editor/hierarchy/hierarchy.component.css":
/*!**********************************************************!*\
  !*** ./src/app/editor/hierarchy/hierarchy.component.css ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "/* :host /deep/ mySelector { */\r\n:host ::ng-deep .childNode {\r\n  padding-left: 1em;\r\n}\r\n:host ::ng-deep #selected {\r\n  background-color: rgb(65, 163, 187);\r\n}\r\ndiv {\r\n  width: 100%;\r\n  height: 70%;\r\n  overflow: auto;\r\n  border: 1px solid white;\r\n}\r\nfieldset {\r\n  border: none;\r\n}"

/***/ }),

/***/ "./src/app/editor/hierarchy/hierarchy.component.html":
/*!***********************************************************!*\
  !*** ./src/app/editor/hierarchy/hierarchy.component.html ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div>\r\n  <fieldset id=\"sceneField\">\r\n    <details id='scene' open>\r\n      <summary>scene</summary>\r\n    </details>\r\n  </fieldset>\r\n</div>"

/***/ }),

/***/ "./src/app/editor/hierarchy/hierarchy.component.ts":
/*!*********************************************************!*\
  !*** ./src/app/editor/hierarchy/hierarchy.component.ts ***!
  \*********************************************************/
/*! exports provided: HierarchyComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "HierarchyComponent", function() { return HierarchyComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var HierarchyComponent = /** @class */ (function () {
    function HierarchyComponent(globals) {
        var _this = this;
        this.globals = globals;
        this.getSelectedMesh = function (_mesh) {
            // last selected node
            var selected = document.getElementById('selected');
            if (selected) {
                selected.removeAttribute('id');
            }
            if (_mesh) {
                var node = document.getElementById(_mesh.id);
                var child = node.firstElementChild;
                child.id = 'selected';
            }
        };
        this.receiveNodeChange = function (_data) {
            if (_data === undefined) {
                _this.removeAllNodes();
                return;
            }
            if (_data[1] === 'add') {
                _this.addNode(_data[0], _data[2]);
            }
            if (_data[1] === 'remove') {
                _this.removeNode(_data[0]);
            }
        };
        this.selectMesh = function (_event) {
            var target = _event.target;
            if (target.parentElement.id !== 'camera' && target.parentElement.id !== 'light') {
                _this.globals.selectedMesh.next(_this.globals.scene.getMeshByID(target.parentElement.id));
            }
        };
        this.dragStart = function (_event) {
            var target = _event.target;
            _event.dataTransfer.setData('id', target.id);
        };
        this.dragOverHandler = function (_event) {
            _event.preventDefault();
        };
        this.dropHandler = function (_event) {
            var target = _event.target;
            var data = _event.dataTransfer.getData('id');
            var node = document.getElementById(data);
            var parent = target.parentElement;
            if (parent.id === 'camera' || parent.id === 'light') {
                return;
            }
            // check if same drag and drop target
            if (parent.id === data) {
                return;
            }
            // check if drag target is child of drop target
            if (node.contains(parent)) {
                return;
            }
            parent.appendChild(node);
            _this.setParent(node.id, parent.id);
        };
    }
    HierarchyComponent.prototype.ngOnInit = function () {
        this.sceneList = document.getElementById('scene');
        this.sceneList.addEventListener('dragover', this.dragOverHandler);
        this.sceneList.addEventListener('drop', this.dropHandler);
        this.nodeChangeSubscription = this.globals.sceneTree.subscribe(this.receiveNodeChange);
        this.selectedMeshSubscription = this.globals.selectedMesh.subscribe(this.getSelectedMesh);
    };
    HierarchyComponent.prototype.addNode = function (_nodeName, _parentNode) {
        if (_parentNode === void 0) { _parentNode = 'scene'; }
        var newListItem = document.createElement('DETAILS');
        newListItem.id = _nodeName;
        newListItem.className = 'childNode';
        newListItem.open = true;
        newListItem.draggable = true;
        newListItem.addEventListener('drop', this.dropHandler);
        newListItem.addEventListener('dragover', this.dragOverHandler);
        newListItem.addEventListener('dragstart', this.dragStart);
        newListItem.addEventListener('click', this.selectMesh);
        var summary = document.createElement('SUMMARY');
        summary.innerHTML = _nodeName;
        newListItem.appendChild(summary);
        document.getElementById(_parentNode).appendChild(newListItem);
    };
    HierarchyComponent.prototype.removeNode = function (_nodeName) {
        var node = document.getElementById(_nodeName);
        node.parentElement.removeChild(node);
    };
    HierarchyComponent.prototype.setParent = function (_mesh, _parent) {
        this.globals.scene.getMeshByID(_mesh).parent = this.globals.scene.getMeshByID(_parent);
    };
    HierarchyComponent.prototype.removeAllNodes = function () {
        var nodes = document.getElementsByClassName('childNode');
        while (nodes.length > 0) {
            nodes[0].parentNode.removeChild(nodes[0]);
        }
    };
    HierarchyComponent.prototype.ngOnDestroy = function () {
        this.nodeChangeSubscription.unsubscribe();
        this.selectedMeshSubscription.unsubscribe();
    };
    HierarchyComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-hierarchy',
            template: __webpack_require__(/*! ./hierarchy.component.html */ "./src/app/editor/hierarchy/hierarchy.component.html"),
            styles: [__webpack_require__(/*! ./hierarchy.component.css */ "./src/app/editor/hierarchy/hierarchy.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_1__["GlobalsService"]])
    ], HierarchyComponent);
    return HierarchyComponent;
}());



/***/ }),

/***/ "./src/app/editor/material/material.component.css":
/*!********************************************************!*\
  !*** ./src/app/editor/material/material.component.css ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "input[type=\"text\"] {\r\n    width: 5em;\r\n}\r\n\r\ninput[type=\"color\"] {\r\n\t-webkit-appearance: none;\r\n    border-radius: 4px;\r\n\twidth: 25px;\r\n\theight: 25px;\r\n}\r\n\r\ninput[type=\"color\"]::-webkit-color-swatch-wrapper {\r\n    padding: 0;\r\n}\r\n\r\ninput[type=\"color\"]::-webkit-color-swatch {\r\n    border: none;\r\n    border-radius: 4px;\r\n}\r\n\r\ninput[type=\"color\"]:hover {\r\n    cursor: pointer;\r\n}\r\n\r\ndiv{\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-between;\r\n    flex-wrap: wrap;\r\n    align-items: flex-end;\r\n}\r\n\r\ninput[type=\"button\"] {\r\n    background: #e3e3e3;\r\n    border: 1px solid #bbb;\r\n    border-radius: 3px;\r\n    box-shadow: inset 0 0 1px 1px #f6f6f6;\r\n    padding:4px;\r\n    background-color: rgb(85, 85, 129);\r\n    color: white;\r\n}\r\n\r\ninput[type=\"button\"]:hover  {\r\n    background: #d9d9d9;\r\n    box-shadow: inset 0 0 1px 1px #eaeaea;\r\n    cursor: pointer; \r\n}\r\n\r\ninput[type=\"button\"]:active {\r\n    background: #d0d0d0;\r\n    box-shadow: inset 0 0 1px 1px #e3e3e3;\r\n}\r\n"

/***/ }),

/***/ "./src/app/editor/material/material.component.html":
/*!*********************************************************!*\
  !*** ./src/app/editor/material/material.component.html ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<fieldset>\r\n  Color:\r\n  <div>\r\n    <input type=\"color\" id=\"color\">\r\n    <input type=\"text\" id=\"colorName\" placeholder=\"name\">\r\n    <input type=\"button\" id=\"apply\" value=\"apply\">\r\n  </div>\r\n\r\n  Texture:\r\n  <div>\r\n    <input type=\"text\" id=\"textureName\" placeholder=\"name\">\r\n    <input type=\"button\" id=\"file\" value=\"select\">\r\n  </div>\r\n\r\n\r\n</fieldset>"

/***/ }),

/***/ "./src/app/editor/material/material.component.ts":
/*!*******************************************************!*\
  !*** ./src/app/editor/material/material.component.ts ***!
  \*******************************************************/
/*! exports provided: MaterialComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MaterialComponent", function() { return MaterialComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/globals.service */ "./src/app/services/globals.service.ts");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_2__);
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var MaterialComponent = /** @class */ (function () {
    function MaterialComponent(globals) {
        var _this = this;
        this.globals = globals;
        this.getMesh = function (_mesh) {
            _this.mesh = _mesh;
        };
        this.applyColor = function (_event) {
            var colorName = document.getElementById('colorName');
            if (colorName.value === '') {
                _this.globals.ipcRenderer.send('show-message', 'The name is invalid', 'warning');
                return;
            }
            else if (_this.mesh === undefined) {
                _this.globals.ipcRenderer.send('show-message', 'No mesh selected', 'warning');
            }
            _this.material = new babylonjs__WEBPACK_IMPORTED_MODULE_2__["StandardMaterial"](colorName.value, _this.globals.scene);
            _this.material.diffuseColor = babylonjs__WEBPACK_IMPORTED_MODULE_2__["Color3"].FromHexString(_this.colorPicker.value);
            if (_this.mesh !== undefined) {
                _this.mesh.material = _this.material;
            }
        };
        this.requestTexturePath = function (_event) {
            if (_this.mesh === undefined) {
                _this.globals.ipcRenderer.send('show-message', 'No mesh selected', 'warning');
                return;
            }
            var target = _event.target;
            target.disabled = true;
            _this.globals.ipcRenderer.send('get-texture-path');
        };
        this.applyTexture = function (_event, _texturePath) {
            var button = document.getElementById('file');
            var textureName = document.getElementById('textureName');
            button.disabled = false;
            if (textureName.value === '') {
                _this.globals.ipcRenderer.send('show-message', 'The name is invalid', 'warning');
                return;
            }
            if (_texturePath) {
                var material2 = new babylonjs__WEBPACK_IMPORTED_MODULE_2__["StandardMaterial"](textureName.value, _this.globals.scene);
                material2.diffuseTexture = new babylonjs__WEBPACK_IMPORTED_MODULE_2__["Texture"](_texturePath, _this.globals.scene);
                if (_this.mesh !== undefined) {
                    _this.mesh.material = material2;
                }
            }
        };
    }
    MaterialComponent.prototype.ngOnInit = function () {
        this.colorPicker = document.getElementById('color');
        // events
        document.getElementById('apply').addEventListener('click', this.applyColor);
        document.getElementById('file').addEventListener('click', this.requestTexturePath);
        this.globals.ipcRenderer.on('texturePath-reply', this.applyTexture);
        this.globals.selectedMesh.subscribe(this.getMesh);
    };
    MaterialComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-material',
            template: __webpack_require__(/*! ./material.component.html */ "./src/app/editor/material/material.component.html"),
            styles: [__webpack_require__(/*! ./material.component.css */ "./src/app/editor/material/material.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_1__["GlobalsService"]])
    ], MaterialComponent);
    return MaterialComponent;
}());



/***/ }),

/***/ "./src/app/editor/meshes/box/box.component.css":
/*!*****************************************************!*\
  !*** ./src/app/editor/meshes/box/box.component.css ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".boxOptions {\r\n    width: 3em;\r\n}\r\n\r\nsection{\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-between;\r\n    flex-wrap: wrap;\r\n}\r\n\r\nbutton {\r\n    background: #e3e3e3;\r\n    border: 1px solid #bbb;\r\n    border-radius: 3px;\r\n    box-shadow: inset 0 0 1px 1px #f6f6f6;\r\n    padding:4px;\r\n    background-color: rgb(85, 85, 129);\r\n    color: white;\r\n}\r\n\r\nbutton:hover  {\r\n    background: #d9d9d9;\r\n    box-shadow: inset 0 0 1px 1px #eaeaea;\r\n    cursor: pointer; \r\n}\r\n\r\nbutton:active {\r\n    background: #d0d0d0;\r\n    box-shadow: inset 0 0 1px 1px #e3e3e3;\r\n}\r\n"

/***/ }),

/***/ "./src/app/editor/meshes/box/box.component.html":
/*!******************************************************!*\
  !*** ./src/app/editor/meshes/box/box.component.html ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<fieldset>\r\n    <legend>Box</legend>\r\n    <section>\r\n        <label>height: </label>\r\n        <input type=\"number\" id=\"height\" class=\"boxOptions\" value=\"1\">\r\n    </section>\r\n\r\n    <section>\r\n        <label>width: </label>\r\n        <input type=\"number\" id=\"width\" class=\"boxOptions\" value=\"1\">\r\n    </section>\r\n\r\n    <section>\r\n        <label>depth: </label>\r\n        <input type=\"number\" id=\"depth\" class=\"boxOptions\" value=\"1\">\r\n    </section>\r\n\r\n    <br>\r\n    <button (click)=\"sendMessage()\">Create</button>\r\n\r\n</fieldset>"

/***/ }),

/***/ "./src/app/editor/meshes/box/box.component.ts":
/*!****************************************************!*\
  !*** ./src/app/editor/meshes/box/box.component.ts ***!
  \****************************************************/
/*! exports provided: BoxComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "BoxComponent", function() { return BoxComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _meshes_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../meshes.component */ "./src/app/editor/meshes/meshes.component.ts");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var BoxComponent = /** @class */ (function () {
    function BoxComponent(globals) {
        this.globals = globals;
        this.meshCreatedEvent = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    BoxComponent.prototype.ngOnChanges = function () {
        if (this.createMesh !== undefined && this.createMesh.isBuilt === false) {
            var name_1 = this.createMesh.type + this.createMesh.count;
            babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreateBox(name_1, {}, this.createMesh.scene);
            _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
            this.meshCreatedEvent.emit(name_1);
        }
    };
    BoxComponent.prototype.ngOnInit = function () {
        this.inputs = document.getElementsByClassName('boxOptions');
    };
    BoxComponent.prototype.sendMessage = function () {
        var name = 'box' + _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count;
        var height = parseFloat(this.inputs[0].value);
        var width = parseFloat(this.inputs[1].value);
        var depth = parseFloat(this.inputs[2].value);
        babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreateBox(name, { height: height, width: width, depth: depth }, this.globals.scene);
        _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
        this.meshCreatedEvent.emit(name);
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], BoxComponent.prototype, "createMesh", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"])
    ], BoxComponent.prototype, "meshCreatedEvent", void 0);
    BoxComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-box',
            template: __webpack_require__(/*! ./box.component.html */ "./src/app/editor/meshes/box/box.component.html"),
            styles: [__webpack_require__(/*! ./box.component.css */ "./src/app/editor/meshes/box/box.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_3__["GlobalsService"]])
    ], BoxComponent);
    return BoxComponent;
}());



/***/ }),

/***/ "./src/app/editor/meshes/cylinder/cylinder.component.css":
/*!***************************************************************!*\
  !*** ./src/app/editor/meshes/cylinder/cylinder.component.css ***!
  \***************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".cylinderOptions {\r\n    width: 3em;\r\n}\r\n\r\nsection{\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-between;\r\n    flex-wrap: wrap;\r\n}\r\n\r\nbutton {\r\n    background: #e3e3e3;\r\n    border: 1px solid #bbb;\r\n    border-radius: 3px;\r\n    box-shadow: inset 0 0 1px 1px #f6f6f6;\r\n    padding:4px;\r\n    background-color: rgb(85, 85, 129);\r\n    color: white;\r\n}\r\n\r\nbutton:hover  {\r\n    background: #d9d9d9;\r\n    box-shadow: inset 0 0 1px 1px #eaeaea;\r\n    cursor: pointer; \r\n}\r\n\r\nbutton:active {\r\n    background: #d0d0d0;\r\n    box-shadow: inset 0 0 1px 1px #e3e3e3;\r\n}"

/***/ }),

/***/ "./src/app/editor/meshes/cylinder/cylinder.component.html":
/*!****************************************************************!*\
  !*** ./src/app/editor/meshes/cylinder/cylinder.component.html ***!
  \****************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<fieldset>\r\n  <legend>Cylinder</legend>\r\n  <section>\r\n    <label for=\"\">height</label>\r\n    <input type=\"number\" id=\"height\" class=\"cylinderOptions\" value=\"2\">\r\n  </section>\r\n\r\n  <section>\r\n    <label for=\"\">&#8960; top:</label>\r\n    <input type=\"number\" id=\"diameterTop\" class=\"cylinderOptions\" value=\"1\" min=\"0\">\r\n  </section>\r\n\r\n  <section>\r\n    <label for=\"\">&#8960; bottom:</label>\r\n    <input type=\"number\" id=\"diameterBottom\" class=\"cylinderOptions\" value=\"1\" min=\"1\">\r\n  </section>\r\n\r\n  <section>\r\n    <label for=\"\">tessellation:</label>\r\n    <input type=\"number\" id=\"tessellation\" class=\"cylinderOptions\" value=\"24\" min=\"2\">\r\n  </section>\r\n\r\n  <section>\r\n    <label for=\"\">subdivisions:</label>\r\n    <input type=\"number\" id=\"subdivisions\" class=\"cylinderOptions\" value=\"1\">\r\n  </section>\r\n\r\n  <section>\r\n    <label for=\"\">arc:</label>\r\n    <input type=\"number\" id=\"arc\" class=\"cylinderOptions\" value=\"1\" min=\"0\" max=\"1\" step=\"0.01\">\r\n  </section>\r\n\r\n  <br>\r\n  <button (click)=\"sendMessage()\">Create</button>\r\n\r\n</fieldset>"

/***/ }),

/***/ "./src/app/editor/meshes/cylinder/cylinder.component.ts":
/*!**************************************************************!*\
  !*** ./src/app/editor/meshes/cylinder/cylinder.component.ts ***!
  \**************************************************************/
/*! exports provided: CylinderComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "CylinderComponent", function() { return CylinderComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _meshes_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../meshes.component */ "./src/app/editor/meshes/meshes.component.ts");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var CylinderComponent = /** @class */ (function () {
    function CylinderComponent(globals) {
        this.globals = globals;
        this.meshCreatedEvent = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    CylinderComponent.prototype.ngOnChanges = function () {
        if (this.createMesh !== undefined && this.createMesh.isBuilt === false) {
            var name_1 = this.createMesh.type + this.createMesh.count;
            babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreateCylinder(name_1, {}, this.createMesh.scene);
            _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
            this.meshCreatedEvent.emit(name_1);
        }
    };
    CylinderComponent.prototype.ngOnInit = function () {
        this.inputs = document.getElementsByClassName('cylinderOptions');
    };
    CylinderComponent.prototype.sendMessage = function () {
        var name = 'cylinder' + _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count;
        var height = parseFloat(this.inputs[0].value);
        var diameterTop = parseFloat(this.inputs[1].value);
        var diameterBottom = parseFloat(this.inputs[2].value);
        var tessellation = parseFloat(this.inputs[3].value);
        var subdivisions = parseFloat(this.inputs[4].value);
        var arc = parseFloat(this.inputs[5].value);
        babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreateCylinder(name, {
            height: height,
            diameterTop: diameterTop,
            diameterBottom: diameterBottom,
            tessellation: tessellation,
            subdivisions: subdivisions,
            arc: arc,
            sideOrientation: babylonjs__WEBPACK_IMPORTED_MODULE_1__["Mesh"].DOUBLESIDE
        }, this.globals.scene);
        _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
        this.meshCreatedEvent.emit(name);
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], CylinderComponent.prototype, "createMesh", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"])
    ], CylinderComponent.prototype, "meshCreatedEvent", void 0);
    CylinderComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-cylinder',
            template: __webpack_require__(/*! ./cylinder.component.html */ "./src/app/editor/meshes/cylinder/cylinder.component.html"),
            styles: [__webpack_require__(/*! ./cylinder.component.css */ "./src/app/editor/meshes/cylinder/cylinder.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_3__["GlobalsService"]])
    ], CylinderComponent);
    return CylinderComponent;
}());



/***/ }),

/***/ "./src/app/editor/meshes/disc/disc.component.css":
/*!*******************************************************!*\
  !*** ./src/app/editor/meshes/disc/disc.component.css ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".discOptions {\r\n    width: 3em;\r\n}\r\n\r\nsection{\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-between;\r\n    flex-wrap: wrap;\r\n}\r\n\r\nbutton {\r\n    background: #e3e3e3;\r\n    border: 1px solid #bbb;\r\n    border-radius: 3px;\r\n    box-shadow: inset 0 0 1px 1px #f6f6f6;\r\n    padding:4px;\r\n    background-color: rgb(85, 85, 129);\r\n    color: white;\r\n}\r\n\r\nbutton:hover  {\r\n    background: #d9d9d9;\r\n    box-shadow: inset 0 0 1px 1px #eaeaea;\r\n    cursor: pointer; \r\n}\r\n\r\nbutton:active {\r\n    background: #d0d0d0;\r\n    box-shadow: inset 0 0 1px 1px #e3e3e3;\r\n}"

/***/ }),

/***/ "./src/app/editor/meshes/disc/disc.component.html":
/*!********************************************************!*\
  !*** ./src/app/editor/meshes/disc/disc.component.html ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<fieldset>\r\n  <legend>Disc</legend>\r\n  <section>\r\n    <label>radius:</label>\r\n    <input type=\"number\" id=\"radius\" class=\"discOptions\" value=\"0.5\" step=\"0.25\">\r\n  </section>\r\n\r\n  <section>\r\n    <label>tessellation:</label>\r\n    <input type=\"number\" id=\"tessellation\" class=\"discOptions\" value=\"64\">\r\n  </section>\r\n\r\n  <section>\r\n    <label for=\"\">arc:</label>\r\n    <input type=\"number\" id=\"arc\" class=\"discOptions\" value=\"1\" min=\"0\" max=\"1\" step=\"0.01\">\r\n  </section>\r\n\r\n  <br>\r\n  <button (click)=\"sendMessage()\">Create</button>\r\n\r\n</fieldset>"

/***/ }),

/***/ "./src/app/editor/meshes/disc/disc.component.ts":
/*!******************************************************!*\
  !*** ./src/app/editor/meshes/disc/disc.component.ts ***!
  \******************************************************/
/*! exports provided: DiscComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "DiscComponent", function() { return DiscComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _meshes_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../meshes.component */ "./src/app/editor/meshes/meshes.component.ts");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var DiscComponent = /** @class */ (function () {
    function DiscComponent(globals) {
        this.globals = globals;
        this.meshCreatedEvent = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    DiscComponent.prototype.ngOnChanges = function () {
        if (this.createMesh !== undefined && this.createMesh.isBuilt === false) {
            var name_1 = this.createMesh.type + this.createMesh.count;
            babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreateDisc(name_1, {}, this.createMesh.scene);
            _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
            this.meshCreatedEvent.emit(name_1);
        }
    };
    DiscComponent.prototype.ngOnInit = function () {
        this.inputs = document.getElementsByClassName('discOptions');
    };
    DiscComponent.prototype.sendMessage = function () {
        var name = 'disc' + _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count;
        var radius = parseFloat(this.inputs[0].value);
        var tessellation = parseFloat(this.inputs[1].value);
        var arc = parseFloat(this.inputs[2].value);
        babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreateDisc(name, {
            radius: radius,
            tessellation: tessellation,
            arc: arc
        }, this.globals.scene);
        _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
        this.meshCreatedEvent.emit(name);
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], DiscComponent.prototype, "createMesh", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"])
    ], DiscComponent.prototype, "meshCreatedEvent", void 0);
    DiscComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-disc',
            template: __webpack_require__(/*! ./disc.component.html */ "./src/app/editor/meshes/disc/disc.component.html"),
            styles: [__webpack_require__(/*! ./disc.component.css */ "./src/app/editor/meshes/disc/disc.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_3__["GlobalsService"]])
    ], DiscComponent);
    return DiscComponent;
}());



/***/ }),

/***/ "./src/app/editor/meshes/ground/ground.component.css":
/*!***********************************************************!*\
  !*** ./src/app/editor/meshes/ground/ground.component.css ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".groundOptions {\r\n    width: 3em;\r\n}\r\n\r\nsection{\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-between;\r\n    flex-wrap: wrap;\r\n}\r\n\r\nbutton {\r\n    background: #e3e3e3;\r\n    border: 1px solid #bbb;\r\n    border-radius: 3px;\r\n    box-shadow: inset 0 0 1px 1px #f6f6f6;\r\n    padding:4px;\r\n    background-color: rgb(85, 85, 129);\r\n    color: white;\r\n}\r\n\r\nbutton:hover  {\r\n    background: #d9d9d9;\r\n    box-shadow: inset 0 0 1px 1px #eaeaea;\r\n    cursor: pointer; \r\n}\r\n\r\nbutton:active {\r\n    background: #d0d0d0;\r\n    box-shadow: inset 0 0 1px 1px #e3e3e3;\r\n}"

/***/ }),

/***/ "./src/app/editor/meshes/ground/ground.component.html":
/*!************************************************************!*\
  !*** ./src/app/editor/meshes/ground/ground.component.html ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<fieldset>\r\n  <legend>Ground</legend>\r\n  <section>\r\n    <label for=\"\">width</label>\r\n    <input type=\"number\" id=\"width\" class=\"groundOptions\" value=\"1\" min=\"1\">\r\n  </section>\r\n\r\n  <section>\r\n    <label for=\"\">height</label>\r\n    <input type=\"number\" id=\"height\" class=\"groundOptions\" value=\"1\" min=\"1\">\r\n  </section>\r\n\r\n  <br>\r\n  <button (click)=\"sendMessage()\">Create</button>\r\n\r\n</fieldset>"

/***/ }),

/***/ "./src/app/editor/meshes/ground/ground.component.ts":
/*!**********************************************************!*\
  !*** ./src/app/editor/meshes/ground/ground.component.ts ***!
  \**********************************************************/
/*! exports provided: GroundComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GroundComponent", function() { return GroundComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _meshes_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../meshes.component */ "./src/app/editor/meshes/meshes.component.ts");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var GroundComponent = /** @class */ (function () {
    function GroundComponent(globals) {
        this.globals = globals;
        this.meshCreatedEvent = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    GroundComponent.prototype.ngOnChanges = function () {
        if (this.createMesh !== undefined && this.createMesh.isBuilt === false) {
            var name_1 = this.createMesh.type + this.createMesh.count;
            babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreateGround(name_1, {}, this.createMesh.scene);
            _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
            this.meshCreatedEvent.emit(name_1);
        }
    };
    GroundComponent.prototype.ngOnInit = function () {
        this.inputs = document.getElementsByClassName('groundOptions');
    };
    GroundComponent.prototype.sendMessage = function () {
        var name = 'ground' + _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count;
        var width = parseFloat(this.inputs[0].value);
        var height = parseFloat(this.inputs[1].value);
        babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreateGround(name, { width: width, height: height }, this.globals.scene);
        _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
        this.meshCreatedEvent.emit(name);
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], GroundComponent.prototype, "createMesh", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"])
    ], GroundComponent.prototype, "meshCreatedEvent", void 0);
    GroundComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-ground',
            template: __webpack_require__(/*! ./ground.component.html */ "./src/app/editor/meshes/ground/ground.component.html"),
            styles: [__webpack_require__(/*! ./ground.component.css */ "./src/app/editor/meshes/ground/ground.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_3__["GlobalsService"]])
    ], GroundComponent);
    return GroundComponent;
}());



/***/ }),

/***/ "./src/app/editor/meshes/meshes.component.css":
/*!****************************************************!*\
  !*** ./src/app/editor/meshes/meshes.component.css ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".meshButtons{\r\n    width: 20px;\r\n    height: 20px;\r\n    background-color: rgb(85, 85, 129);\r\n    border: 1px solid rgb(0, 0, 0);\r\n    border-radius: 3px;\r\n    padding: 2px;\r\n}\r\n.meshButtons:hover{\r\n    background: #d9d9d9;\r\n}"

/***/ }),

/***/ "./src/app/editor/meshes/meshes.component.html":
/*!*****************************************************!*\
  !*** ./src/app/editor/meshes/meshes.component.html ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<input type=\"image\" class=\"meshButtons\" src=\"assets/shapes/cube.png\" alt=\"translation\" value=\"box\"/>\r\n<input type=\"image\" class=\"meshButtons\" src=\"assets/shapes/cylinder.png\" alt=\"translation\" value=\"cylinder\"/>\r\n<input type=\"image\" class=\"meshButtons\" src=\"assets/shapes/sphere.png\" alt=\"translation\" value=\"sphere\"/>\r\n<input type=\"image\" class=\"meshButtons\" src=\"assets/shapes/disc.png\" alt=\"translation\" value=\"disc\"/>\r\n<input type=\"image\" class=\"meshButtons\" src=\"assets/shapes/torus.png\" alt=\"translation\" value=\"torus\"/>\r\n<input type=\"image\" class=\"meshButtons\" src=\"assets/shapes/plane.png\" alt=\"translation\" value=\"plane\"/>\r\n<input type=\"image\" class=\"meshButtons\" src=\"assets/shapes/ground.png\" alt=\"translation\" value=\"ground\"/>\r\n\r\n\r\n<div [ngSwitch]=\"name\">\r\n  <app-box *ngSwitchCase=\"'box'\" (meshCreatedEvent)=\"createdMesh($event)\" [createMesh]=\"createMeshMessage\"></app-box>\r\n  <app-cylinder *ngSwitchCase=\"'cylinder'\" (meshCreatedEvent)=\"createdMesh($event)\" [createMesh]=\"createMeshMessage\"></app-cylinder>\r\n  <app-sphere *ngSwitchCase=\"'sphere'\" (meshCreatedEvent)=\"createdMesh($event)\" [createMesh]=\"createMeshMessage\"></app-sphere>\r\n  <app-disc *ngSwitchCase=\"'disc'\" (meshCreatedEvent)=\"createdMesh($event)\" [createMesh]=\"createMeshMessage\"></app-disc>\r\n  <app-torus *ngSwitchCase=\"'torus'\" (meshCreatedEvent)=\"createdMesh($event)\" [createMesh]=\"createMeshMessage\"></app-torus>\r\n  <app-plane *ngSwitchCase=\"'plane'\" (meshCreatedEvent)=\"createdMesh($event)\" [createMesh]=\"createMeshMessage\"></app-plane>\r\n  <app-ground *ngSwitchCase=\"'ground'\" (meshCreatedEvent)=\"createdMesh($event)\" [createMesh]=\"createMeshMessage\"></app-ground>\r\n</div>"

/***/ }),

/***/ "./src/app/editor/meshes/meshes.component.ts":
/*!***************************************************!*\
  !*** ./src/app/editor/meshes/meshes.component.ts ***!
  \***************************************************/
/*! exports provided: MeshesComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "MeshesComponent", function() { return MeshesComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var MeshesComponent = /** @class */ (function () {
    function MeshesComponent(globals) {
        var _this = this;
        this.globals = globals;
        this.getMeshName = function (_event) {
            _this.name = _event.target.value;
        };
        this.buildInstructions = function (_event, _name) {
            _this.name = _name.toLowerCase();
            _this.message = {
                count: MeshesComponent_1.count,
                type: _this.name,
                scene: _this.globals.scene,
                isBuilt: false
            };
            _this.createMeshMessage = _this.message;
        };
        MeshesComponent_1.count = 0;
        this.name = 'box';
    }
    MeshesComponent_1 = MeshesComponent;
    MeshesComponent.prototype.ngOnInit = function () {
        var radioBtns = document.getElementsByClassName('meshButtons');
        for (var index = 0; index < radioBtns.length; index++) {
            radioBtns[index].addEventListener('click', this.getMeshName);
        }
        this.globals.ipcRenderer.on('create-mesh', this.buildInstructions);
    };
    MeshesComponent.prototype.createdMesh = function (_name) {
        this.globals.sceneTree.next([_name, 'add']);
        // end of buildmessage
        this.message = {
            count: MeshesComponent_1.count,
            type: this.name,
            scene: this.globals.scene,
            isBuilt: true
        };
        this.createMeshMessage = this.message;
    };
    MeshesComponent = MeshesComponent_1 = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-meshes',
            template: __webpack_require__(/*! ./meshes.component.html */ "./src/app/editor/meshes/meshes.component.html"),
            styles: [__webpack_require__(/*! ./meshes.component.css */ "./src/app/editor/meshes/meshes.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_1__["GlobalsService"]])
    ], MeshesComponent);
    return MeshesComponent;
    var MeshesComponent_1;
}());



/***/ }),

/***/ "./src/app/editor/meshes/plane/plane.component.css":
/*!*********************************************************!*\
  !*** ./src/app/editor/meshes/plane/plane.component.css ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".planeOptions{\r\n    width: 3em;\r\n}\r\n\r\nsection{\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-between;\r\n    flex-wrap: wrap;\r\n}\r\n\r\nbutton {\r\n    background: #e3e3e3;\r\n    border: 1px solid #bbb;\r\n    border-radius: 3px;\r\n    box-shadow: inset 0 0 1px 1px #f6f6f6;\r\n    padding:4px;\r\n    background-color: rgb(85, 85, 129);\r\n    color: white;\r\n}\r\n\r\nbutton:hover  {\r\n    background: #d9d9d9;\r\n    box-shadow: inset 0 0 1px 1px #eaeaea;\r\n    cursor: pointer; \r\n}\r\n\r\nbutton:active {\r\n    background: #d0d0d0;\r\n    box-shadow: inset 0 0 1px 1px #e3e3e3;\r\n}"

/***/ }),

/***/ "./src/app/editor/meshes/plane/plane.component.html":
/*!**********************************************************!*\
  !*** ./src/app/editor/meshes/plane/plane.component.html ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<fieldset>\r\n  <legend>Plane</legend>\r\n  <section>\r\n    <label>width</label>\r\n    <input type=\"number\" id=\"width\" class=\"planeOptions\" value=\"1\">\r\n  </section>\r\n\r\n  <section>\r\n    <label>height</label>\r\n    <input type=\"number\" id=\"height\" class=\"planeOptions\" value=\"1\">\r\n  </section>\r\n\r\n  <br>\r\n  <button (click)=\"sendMessage()\">Create</button>\r\n\r\n</fieldset>"

/***/ }),

/***/ "./src/app/editor/meshes/plane/plane.component.ts":
/*!********************************************************!*\
  !*** ./src/app/editor/meshes/plane/plane.component.ts ***!
  \********************************************************/
/*! exports provided: PlaneComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "PlaneComponent", function() { return PlaneComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _meshes_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../meshes.component */ "./src/app/editor/meshes/meshes.component.ts");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var PlaneComponent = /** @class */ (function () {
    function PlaneComponent(globals) {
        this.globals = globals;
        this.meshCreatedEvent = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    PlaneComponent.prototype.ngOnChanges = function () {
        if (this.createMesh !== undefined && this.createMesh.isBuilt === false) {
            var name_1 = this.createMesh.type + this.createMesh.count;
            babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreatePlane(name_1, {}, this.createMesh.scene);
            _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
            this.meshCreatedEvent.emit(name_1);
        }
    };
    PlaneComponent.prototype.ngOnInit = function () {
        this.inputs = document.getElementsByClassName('planeOptions');
    };
    PlaneComponent.prototype.sendMessage = function () {
        var name = 'plane' + _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count;
        var width = parseFloat(this.inputs[0].value);
        var height = parseFloat(this.inputs[1].value);
        babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreatePlane(name, { width: width, height: height }, this.globals.scene);
        _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
        this.meshCreatedEvent.emit(name);
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], PlaneComponent.prototype, "createMesh", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"])
    ], PlaneComponent.prototype, "meshCreatedEvent", void 0);
    PlaneComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-plane',
            template: __webpack_require__(/*! ./plane.component.html */ "./src/app/editor/meshes/plane/plane.component.html"),
            styles: [__webpack_require__(/*! ./plane.component.css */ "./src/app/editor/meshes/plane/plane.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_3__["GlobalsService"]])
    ], PlaneComponent);
    return PlaneComponent;
}());



/***/ }),

/***/ "./src/app/editor/meshes/sphere/sphere.component.css":
/*!***********************************************************!*\
  !*** ./src/app/editor/meshes/sphere/sphere.component.css ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".sphereOptions {\r\n    width: 3em;\r\n}\r\n\r\nsection{\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-between;\r\n    flex-wrap: wrap;\r\n}\r\n\r\nbutton {\r\n    background: #e3e3e3;\r\n    border: 1px solid #bbb;\r\n    border-radius: 3px;\r\n    box-shadow: inset 0 0 1px 1px #f6f6f6;\r\n    padding:4px;\r\n    background-color: rgb(85, 85, 129);\r\n    color: white;\r\n}\r\n\r\nbutton:hover  {\r\n    background: #d9d9d9;\r\n    box-shadow: inset 0 0 1px 1px #eaeaea;\r\n    cursor: pointer; \r\n}\r\n\r\nbutton:active {\r\n    background: #d0d0d0;\r\n    box-shadow: inset 0 0 1px 1px #e3e3e3;\r\n}"

/***/ }),

/***/ "./src/app/editor/meshes/sphere/sphere.component.html":
/*!************************************************************!*\
  !*** ./src/app/editor/meshes/sphere/sphere.component.html ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<fieldset>\r\n  <legend>Sphere</legend>\r\n  <section>\r\n    <label>segments</label>\r\n    <input type=\"number\" id=\"segments\" class=\"sphereOptions\" value=\"32\" min=\"0\">\r\n  </section>\r\n\r\n  <section>\r\n    <label>&#8960; X</label>\r\n    <input type=\"number\" id=\"diameterX\" class=\"sphereOptions\" value=\"1\">\r\n  </section>\r\n\r\n  <section>\r\n    <label>&#8960; Y</label>\r\n    <input type=\"number\" id=\"diameterY\" class=\"sphereOptions\" value=\"1\">\r\n  </section>\r\n\r\n  <section>\r\n    <label>&#8960; Z</label>\r\n    <input type=\"number\" id=\"diameterZ\" class=\"sphereOptions\" value=\"1\">\r\n  </section>\r\n\r\n  <section>\r\n    <label>arc</label>\r\n    <input type=\"number\" id=\"arc\" class=\"sphereOptions\" value=\"1\" min=\"0\" max=\"1\" step=\"0.01\">\r\n  </section>\r\n\r\n  <section>\r\n    <label>slice</label>\r\n    <input type=\"number\" id=\"slice\" class=\"sphereOptions\" value=\"1\" min=\"0\" max=\"1\" step=\"0.01\">\r\n  </section>\r\n\r\n  <br>\r\n  <button (click)=\"sendMessage()\">Create</button>\r\n\r\n</fieldset>"

/***/ }),

/***/ "./src/app/editor/meshes/sphere/sphere.component.ts":
/*!**********************************************************!*\
  !*** ./src/app/editor/meshes/sphere/sphere.component.ts ***!
  \**********************************************************/
/*! exports provided: SphereComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "SphereComponent", function() { return SphereComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _meshes_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../meshes.component */ "./src/app/editor/meshes/meshes.component.ts");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var SphereComponent = /** @class */ (function () {
    function SphereComponent(globals) {
        this.globals = globals;
        this.meshCreatedEvent = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    SphereComponent.prototype.ngOnChanges = function () {
        if (this.createMesh !== undefined && this.createMesh.isBuilt === false) {
            var name_1 = this.createMesh.type + this.createMesh.count;
            babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreateSphere(name_1, {}, this.createMesh.scene);
            _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
            this.meshCreatedEvent.emit(name_1);
        }
    };
    SphereComponent.prototype.ngOnInit = function () {
        this.inputs = document.getElementsByClassName('sphereOptions');
    };
    SphereComponent.prototype.sendMessage = function () {
        var name = 'sphere' + _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count;
        var segments = parseFloat(this.inputs[0].value);
        var diameterX = parseFloat(this.inputs[1].value);
        var diameterY = parseFloat(this.inputs[2].value);
        var diameterZ = parseFloat(this.inputs[3].value);
        var arc = parseFloat(this.inputs[4].value);
        var slice = parseFloat(this.inputs[5].value);
        babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreateSphere(name, {
            segments: segments,
            diameterX: diameterX,
            diameterY: diameterY,
            diameterZ: diameterZ,
            arc: arc,
            slice: slice
        }, this.globals.scene);
        _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
        this.meshCreatedEvent.emit(name);
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], SphereComponent.prototype, "createMesh", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"])
    ], SphereComponent.prototype, "meshCreatedEvent", void 0);
    SphereComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-sphere',
            template: __webpack_require__(/*! ./sphere.component.html */ "./src/app/editor/meshes/sphere/sphere.component.html"),
            styles: [__webpack_require__(/*! ./sphere.component.css */ "./src/app/editor/meshes/sphere/sphere.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_3__["GlobalsService"]])
    ], SphereComponent);
    return SphereComponent;
}());



/***/ }),

/***/ "./src/app/editor/meshes/torus/torus.component.css":
/*!*********************************************************!*\
  !*** ./src/app/editor/meshes/torus/torus.component.css ***!
  \*********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = ".torusOptions {\r\n    width: 3em;\r\n}\r\n\r\nsection{\r\n    display: flex;\r\n    flex-direction: row;\r\n    justify-content: space-between;\r\n    flex-wrap: wrap;\r\n}\r\n\r\nbutton {\r\n    background: #e3e3e3;\r\n    border: 1px solid #bbb;\r\n    border-radius: 3px;\r\n    box-shadow: inset 0 0 1px 1px #f6f6f6;\r\n    padding:4px;\r\n    background-color: rgb(85, 85, 129);\r\n    color: white;\r\n}\r\n\r\nbutton:hover  {\r\n    background: #d9d9d9;\r\n    box-shadow: inset 0 0 1px 1px #eaeaea;\r\n    cursor: pointer; \r\n}\r\n\r\nbutton:active {\r\n    background: #d0d0d0;\r\n    box-shadow: inset 0 0 1px 1px #e3e3e3;\r\n}"

/***/ }),

/***/ "./src/app/editor/meshes/torus/torus.component.html":
/*!**********************************************************!*\
  !*** ./src/app/editor/meshes/torus/torus.component.html ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<fieldset>\r\n  <legend>Torus</legend>\r\n\r\n  <section>\r\n    <label>&#8960; </label>\r\n    <input type=\"number\" id=\"diameter\" class=\"torusOptions\" value=\"1\">\r\n  </section>\r\n\r\n  <section>\r\n    <label>thickness</label>\r\n    <input type=\"number\" id=\"thickness\" class=\"torusOptions\" value=\"0.5\" step=\"0.1\">\r\n  </section>\r\n\r\n  <section>\r\n    <label>tessellation</label>\r\n    <input type=\"number\" id=\"tessellation\" class=\"torusOptions\" value=\"16\" min=\"3\">\r\n  </section>\r\n\r\n  <br>\r\n  <button (click)=\"sendMessage()\">Create</button>\r\n\r\n</fieldset>"

/***/ }),

/***/ "./src/app/editor/meshes/torus/torus.component.ts":
/*!********************************************************!*\
  !*** ./src/app/editor/meshes/torus/torus.component.ts ***!
  \********************************************************/
/*! exports provided: TorusComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TorusComponent", function() { return TorusComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _meshes_component__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../meshes.component */ "./src/app/editor/meshes/meshes.component.ts");
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../../../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var TorusComponent = /** @class */ (function () {
    function TorusComponent(globals) {
        this.globals = globals;
        this.meshCreatedEvent = new _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"]();
    }
    TorusComponent.prototype.ngOnChanges = function () {
        if (this.createMesh !== undefined && this.createMesh.isBuilt === false) {
            var name_1 = this.createMesh.type + this.createMesh.count;
            babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreateTorus(name_1, {}, this.createMesh.scene);
            _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
            this.meshCreatedEvent.emit(name_1);
        }
    };
    TorusComponent.prototype.ngOnInit = function () {
        this.inputs = document.getElementsByClassName('torusOptions');
    };
    TorusComponent.prototype.sendMessage = function () {
        var name = 'torus' + _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count;
        var diameter = parseFloat(this.inputs[0].value);
        var thickness = parseFloat(this.inputs[1].value);
        var tessellation = parseFloat(this.inputs[2].value);
        babylonjs__WEBPACK_IMPORTED_MODULE_1__["MeshBuilder"].CreateTorus(name, {
            diameter: diameter,
            thickness: thickness,
            tessellation: tessellation
        }, this.globals.scene);
        _meshes_component__WEBPACK_IMPORTED_MODULE_2__["MeshesComponent"].count++;
        this.meshCreatedEvent.emit(name);
    };
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Input"])(),
        __metadata("design:type", Object)
    ], TorusComponent.prototype, "createMesh", void 0);
    __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Output"])(),
        __metadata("design:type", _angular_core__WEBPACK_IMPORTED_MODULE_0__["EventEmitter"])
    ], TorusComponent.prototype, "meshCreatedEvent", void 0);
    TorusComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-torus',
            template: __webpack_require__(/*! ./torus.component.html */ "./src/app/editor/meshes/torus/torus.component.html"),
            styles: [__webpack_require__(/*! ./torus.component.css */ "./src/app/editor/meshes/torus/torus.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_3__["GlobalsService"]])
    ], TorusComponent);
    return TorusComponent;
}());



/***/ }),

/***/ "./src/app/editor/transform/transform.component.css":
/*!**********************************************************!*\
  !*** ./src/app/editor/transform/transform.component.css ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "section {\r\n    margin-top: 10px;\r\n}\r\n\r\n.transformValue{\r\n    width: 5em;\r\n    margin-left: 5px;\r\n}\r\n\r\n.buttons{\r\n    width: 20px;\r\n    width: 20px;\r\n    margin: 0 5px;\r\n}"

/***/ }),

/***/ "./src/app/editor/transform/transform.component.html":
/*!***********************************************************!*\
  !*** ./src/app/editor/transform/transform.component.html ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<fieldset>\r\n  <section>\r\n    <input type=\"image\" id=\"translation\" class=\"buttons\" src=\"assets/icons/arrow.png\" alt=\"translation\" />\r\n    <input type=\"image\" id=\"rotation\" class=\"buttons\" src=\"assets/icons/rotate.png\" alt=\"rotation\" />\r\n    <input type=\"image\" id=\"scaling\" class=\"buttons\" src=\"assets/icons/expand-arrow.png\" alt=\"scaling\" />\r\n  </section>\r\n\r\n  <section>\r\n    <label>Translation</label>\r\n    <br> X:\r\n    <input type=\"number\" class=\"transformValue\" id=\"t_x\" value=\"0\">\r\n    <br> Y:\r\n    <input type=\"number\" class=\"transformValue\" id=\"t_y\" value=\"0\">\r\n    <br> Z:\r\n    <input type=\"number\" class=\"transformValue\" id=\"t_z\" value=\"0\">\r\n  </section>\r\n\r\n  <section>\r\n    <label>Rotation</label>\r\n    <br> X:\r\n    <input type=\"number\" class=\"transformValue\" id=\"r_x\" value=\"0\" step=\"0.01\">\r\n    <br> Y:\r\n    <input type=\"number\" class=\"transformValue\" id=\"r_y\" value=\"0\" step=\"0.01\">\r\n    <br> Z:\r\n    <input type=\"number\" class=\"transformValue\" id=\"r_z\" value=\"0\" step=\"0.01\">\r\n  </section>\r\n\r\n  <section>\r\n    <label>Scaling</label>\r\n    <br> X:\r\n    <input type=\"number\" class=\"transformValue\" id=\"s_x\" value=\"0\">\r\n    <br> Y:\r\n    <input type=\"number\" class=\"transformValue\" id=\"s_y\" value=\"0\">\r\n    <br> Z:\r\n    <input type=\"number\" class=\"transformValue\" id=\"s_z\" value=\"0\">\r\n  </section>\r\n\r\n\r\n</fieldset>"

/***/ }),

/***/ "./src/app/editor/transform/transform.component.ts":
/*!*********************************************************!*\
  !*** ./src/app/editor/transform/transform.component.ts ***!
  \*********************************************************/
/*! exports provided: TransformComponent */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "TransformComponent", function() { return TransformComponent; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! babylonjs */ "./node_modules/babylonjs/babylon.js");
/* harmony import */ var babylonjs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(babylonjs__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _services_globals_service__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../../services/globals.service */ "./src/app/services/globals.service.ts");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var TransformComponent = /** @class */ (function () {
    function TransformComponent(globals) {
        var _this = this;
        this.globals = globals;
        this.getMesh = function (_mesh) {
            _this.mesh = _mesh;
            _this.showValues();
        };
        /**
        * change the position, rotation and scaling of selected mesh after changing it in the view
        */
        this.modifyValues = function (_event) {
            var position = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["Vector3"](parseInt(_this.inputs[0].value, 10), parseInt(_this.inputs[1].value, 10), parseInt(_this.inputs[2].value, 10));
            var rotation = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["Vector3"](parseFloat(_this.inputs[3].value), parseFloat(_this.inputs[4].value), parseFloat(_this.inputs[5].value));
            var scaling = new babylonjs__WEBPACK_IMPORTED_MODULE_1__["Vector3"](parseInt(_this.inputs[6].value, 10), parseInt(_this.inputs[7].value, 10), parseInt(_this.inputs[8].value, 10));
            _this.mesh.position = position;
            _this.mesh.scaling = scaling;
            _this.mesh.rotationQuaternion = rotation.toQuaternion();
        };
    }
    TransformComponent.prototype.ngOnInit = function () {
        // event
        this.inputs = document.getElementsByClassName('transformValue');
        for (var index = 0; index < this.inputs.length; index++) {
            this.inputs[index].addEventListener('input', this.modifyValues);
        }
        this.meshSubscription = this.globals.selectedMesh.subscribe(this.getMesh);
    };
    /**
    * receives the position, rotation and scaling of selected mesh
    */
    TransformComponent.prototype.showValues = function () {
        var transformInfo;
        transformInfo = document.getElementsByClassName('transformValue');
        if (this.mesh === undefined) {
            for (var i = 0; i < transformInfo.length; i++) {
                transformInfo[i].value = '0';
            }
            return;
        }
        transformInfo[0].value = this.mesh.position.x.toString();
        transformInfo[1].value = this.mesh.position.y.toString();
        transformInfo[2].value = this.mesh.position.z.toString();
        if (this.mesh.rotationQuaternion !== undefined && this.mesh.rotationQuaternion !== null) {
            transformInfo[3].value = this.mesh.rotationQuaternion.toEulerAngles().x.toString();
            transformInfo[4].value = this.mesh.rotationQuaternion.toEulerAngles().y.toString();
            transformInfo[5].value = this.mesh.rotationQuaternion.toEulerAngles().z.toString();
        }
        else {
            transformInfo[3].value = this.mesh.rotation.x.toString();
            transformInfo[4].value = this.mesh.rotation.y.toString();
            transformInfo[5].value = this.mesh.rotation.z.toString();
        }
        transformInfo[6].value = this.mesh.scaling.x.toString();
        transformInfo[7].value = this.mesh.scaling.y.toString();
        transformInfo[8].value = this.mesh.scaling.z.toString();
    };
    TransformComponent.prototype.ngOnDestroy = function () {
        this.meshSubscription.unsubscribe();
    };
    TransformComponent = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Component"])({
            selector: 'app-transform',
            template: __webpack_require__(/*! ./transform.component.html */ "./src/app/editor/transform/transform.component.html"),
            styles: [__webpack_require__(/*! ./transform.component.css */ "./src/app/editor/transform/transform.component.css")]
        }),
        __metadata("design:paramtypes", [_services_globals_service__WEBPACK_IMPORTED_MODULE_2__["GlobalsService"]])
    ], TransformComponent);
    return TransformComponent;
}());



/***/ }),

/***/ "./src/app/services/globals.service.ts":
/*!*********************************************!*\
  !*** ./src/app/services/globals.service.ts ***!
  \*********************************************/
/*! exports provided: GlobalsService */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "GlobalsService", function() { return GlobalsService; });
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var rxjs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! rxjs */ "./node_modules/rxjs/_esm5/index.js");
/* harmony import */ var ngx_electron__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ngx-electron */ "./node_modules/ngx-electron/index.js");
var __decorate = (undefined && undefined.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (undefined && undefined.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var GlobalsService = /** @class */ (function () {
    function GlobalsService() {
        this.selectedMesh = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.selectedAnimation = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.sceneTree = new rxjs__WEBPACK_IMPORTED_MODULE_1__["Subject"]();
        this.ipcRenderer = new ngx_electron__WEBPACK_IMPORTED_MODULE_2__["ElectronService"]().ipcRenderer;
    }
    GlobalsService = __decorate([
        Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["Injectable"])({
            providedIn: 'root'
        }),
        __metadata("design:paramtypes", [])
    ], GlobalsService);
    return GlobalsService;
}());



/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! exports provided: environment */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "environment", function() { return environment; });
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
var environment = {
    production: false
};
/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _angular_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
/* harmony import */ var _angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm5/platform-browser-dynamic.js");
/* harmony import */ var _app_app_module__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
/* harmony import */ var _environments_environment__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");




if (_environments_environment__WEBPACK_IMPORTED_MODULE_3__["environment"].production) {
    Object(_angular_core__WEBPACK_IMPORTED_MODULE_0__["enableProdMode"])();
}
Object(_angular_platform_browser_dynamic__WEBPACK_IMPORTED_MODULE_1__["platformBrowserDynamic"])().bootstrapModule(_app_app_module__WEBPACK_IMPORTED_MODULE_2__["AppModule"])
    .catch(function (err) { return console.log(err); });


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! D:\GitHub\Electron-2\electron-app\src\main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map