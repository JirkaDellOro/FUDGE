"use strict";
/// <reference types="../../../Core/Build/FudgeCore"/>
var FudgeAid;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (FudgeAid) {
    class ArithIntervalSolver {
        constructor(_function, _divide, _isSmaller) {
            this.function = _function;
            this.divide = _divide;
            this.isSmaller = _isSmaller;
        }
        solve(_left, _right, _epsilon, _leftValue = undefined, _rightValue = undefined) {
            this.left = _left;
            this.leftValue = _leftValue || this.function(_left);
            this.right = _right;
            this.rightValue = _rightValue || this.function(_right);
            if (this.isSmaller(_left, _right, _epsilon))
                return;
            let between = this.divide(_left, _right);
            let betweenValue = this.function(between);
            if (betweenValue == _leftValue)
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
    FudgeAid.ArithIntervalSolver = ArithIntervalSolver;
})(FudgeAid || (FudgeAid = {}));
/// <reference types="../../../Core/Build/FudgeCore"/>
var FudgeAid;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class CameraOrbit extends ƒ.Node {
        constructor(_cmpCamera, _distanceStart = 2, _maxRotX = 75, _minDistance = 1, _maxDistance = 10) {
            super("CameraOrbit");
            this.maxRotX = Math.min(_maxRotX, 89);
            this.minDistance = _minDistance;
            this.maxDistance = _maxDistance;
            let cmpTransform = new ƒ.ComponentTransform();
            this.addComponent(cmpTransform);
            this.rotatorX = new ƒ.Node("CameraRotationX");
            this.rotatorX.addComponent(new ƒ.ComponentTransform());
            this.appendChild(this.rotatorX);
            this.translator = new ƒ.Node("CameraTranslate");
            this.translator.addComponent(new ƒ.ComponentTransform());
            this.translator.cmpTransform.local.rotateY(180);
            this.rotatorX.appendChild(this.translator);
            this.translator.addComponent(_cmpCamera);
            this.distance = _distanceStart;
        }
        get component() {
            return this.translator.getComponent(ƒ.ComponentCamera);
        }
        get node() {
            return this.translator;
        }
        set distance(_distance) {
            let newDistance = Math.min(this.maxDistance, Math.max(this.minDistance, _distance));
            this.translator.cmpTransform.local.translation = ƒ.Vector3.Z(newDistance);
        }
        get distance() {
            return this.translator.cmpTransform.local.translation.z;
        }
        set rotationY(_angle) {
            this.cmpTransform.local.rotation = ƒ.Vector3.Y(_angle);
        }
        get rotationY() {
            return this.cmpTransform.local.rotation.y;
        }
        set rotationX(_angle) {
            _angle = Math.min(Math.max(-this.maxRotX, _angle), this.maxRotX);
            this.rotatorX.cmpTransform.local.rotation = ƒ.Vector3.X(_angle);
        }
        get rotationX() {
            return this.rotatorX.cmpTransform.local.rotation.x;
        }
        rotateY(_delta) {
            this.cmpTransform.local.rotateY(_delta);
        }
        rotateX(_delta) {
            this.rotationX = this.rotatorX.cmpTransform.local.rotation.x + _delta;
        }
    }
    FudgeAid.CameraOrbit = CameraOrbit;
})(FudgeAid || (FudgeAid = {}));
/// <reference types="../../../Core/Build/FudgeCore"/>
var FudgeAid;
/// <reference types="../../../Core/Build/FudgeCore"/>
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
        get local() {
            return this.cmpTransform ? this.cmpTransform.local : null;
        }
        get pivot() {
            let cmpMesh = this.getComponent(ƒ.ComponentMesh);
            return cmpMesh ? cmpMesh.pivot : null;
        }
    }
    Node.count = 0;
    FudgeAid.Node = Node;
})(FudgeAid || (FudgeAid = {}));
/// <reference types="../../../Core/Build/FudgeCore"/>
var FudgeAid;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class NodeArrow extends FudgeAid.Node {
        constructor(_name, _color) {
            super(_name, ƒ.Matrix4x4.IDENTITY);
            let coat = new ƒ.CoatColored(_color);
            let material = new ƒ.Material("Arrow", ƒ.ShaderUniColor, coat);
            let meshCube = new ƒ.MeshCube();
            let meshPyramid = new ƒ.MeshPyramid();
            let shaft = new FudgeAid.Node("Shaft", ƒ.Matrix4x4.IDENTITY, material, meshCube);
            let head = new FudgeAid.Node("Head", ƒ.Matrix4x4.IDENTITY, material, meshPyramid);
            shaft.local.scale(new ƒ.Vector3(0.01, 1, 0.01));
            head.local.translateY(0.5);
            head.local.scale(new ƒ.Vector3(0.05, 0.1, 0.05));
            this.appendChild(shaft);
            this.appendChild(head);
        }
    }
    FudgeAid.NodeArrow = NodeArrow;
})(FudgeAid || (FudgeAid = {}));
/// <reference types="../../../Core/Build/FudgeCore"/>
var FudgeAid;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (FudgeAid) {
    var ƒ = FudgeCore;
    class NodeCoordinateSystem extends FudgeAid.Node {
        constructor(_name = "CoordinateSystem", _transform) {
            super(_name, _transform);
            let arrowRed = new FudgeAid.NodeArrow("ArrowRed", new ƒ.Color(1, 0, 0, 1));
            let arrowGreen = new FudgeAid.NodeArrow("ArrowGreen", new ƒ.Color(0, 1, 0, 1));
            let arrowBlue = new FudgeAid.NodeArrow("ArrowBlue", new ƒ.Color(0, 0, 1, 1));
            arrowRed.cmpTransform.local.rotateZ(-90);
            arrowBlue.cmpTransform.local.rotateX(90);
            this.appendChild(arrowRed);
            this.appendChild(arrowGreen);
            this.appendChild(arrowBlue);
        }
    }
    FudgeAid.NodeCoordinateSystem = NodeCoordinateSystem;
})(FudgeAid || (FudgeAid = {}));
///<reference types="../../../Core/Build/FudgeCore"/>
var StateMachine;
///<reference types="../../../Core/Build/FudgeCore"/>
(function (StateMachine) {
    var ƒ = FudgeCore;
    class ComponentStateMachine extends ƒ.ComponentScript {
        transit(_next) {
            this.stateMachine.transit(this.stateCurrent, _next, this);
        }
        act() {
            this.stateMachine.act(this.stateCurrent, this);
        }
    }
    StateMachine.ComponentStateMachine = ComponentStateMachine;
})(StateMachine || (StateMachine = {}));
// /<reference types="../../../Core/Build/FudgeCore"/>
/**
 * State machine offers a structure and fundamental functionality for state machines
 * <State> should be an enum defining the various states of the machine
 */
var StateMachine;
// /<reference types="../../../Core/Build/FudgeCore"/>
/**
 * State machine offers a structure and fundamental functionality for state machines
 * <State> should be an enum defining the various states of the machine
 */
(function (StateMachine_1) {
    // import ƒ = FudgeCore;
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
    StateMachine_1.StateMachine = StateMachine;
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
    StateMachine_1.StateMachineInstructions = StateMachineInstructions;
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiRnVkZ2VBaWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9Tb3VyY2UvQXJpdGhtZXRpYy9Bcml0aEludGVydmFsU29sdmVyLnRzIiwiLi4vU291cmNlL0NhbWVyYS9DYW1lcmFPcmJpdC50cyIsIi4uL1NvdXJjZS9HZW9tZXRyeS9Ob2RlLnRzIiwiLi4vU291cmNlL0dlb21ldHJ5L05vZGVBcnJvdy50cyIsIi4uL1NvdXJjZS9HZW9tZXRyeS9Ob2RlQ29vcmRpbmF0ZVN5c3RlbS50cyIsIi4uL1NvdXJjZS9TdGF0ZU1hY2hpbmUvQ29tcG9uZW50U3RhdGVNYWNoaW5lLnRzIiwiLi4vU291cmNlL1N0YXRlTWFjaGluZS9TdGF0ZU1hY2hpbmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLHNEQUFzRDtBQUV0RCxJQUFVLFFBQVEsQ0E0Q2pCO0FBOUNELHNEQUFzRDtBQUV0RCxXQUFVLFFBQVE7SUFDaEIsTUFBYSxtQkFBbUI7UUFTOUIsWUFDRSxTQUFvQyxFQUNwQyxPQUF3RCxFQUN4RCxVQUE2RTtZQUM3RSxJQUFJLENBQUMsUUFBUSxHQUFHLFNBQVMsQ0FBQztZQUMxQixJQUFJLENBQUMsTUFBTSxHQUFHLE9BQU8sQ0FBQztZQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQztRQUM5QixDQUFDO1FBRU0sS0FBSyxDQUFDLEtBQWUsRUFBRSxNQUFnQixFQUFFLFFBQWlCLEVBQUUsYUFBc0IsU0FBUyxFQUFFLGNBQXVCLFNBQVM7WUFDbEksSUFBSSxDQUFDLElBQUksR0FBRyxLQUFLLENBQUM7WUFDbEIsSUFBSSxDQUFDLFNBQVMsR0FBRyxVQUFVLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUNwRCxJQUFJLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztZQUNwQixJQUFJLENBQUMsVUFBVSxHQUFHLFdBQVcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBRXZE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VSxDQUFDLFFBQVEsQ0FBQyxDQUFDO2FBQzNCO1FBQ0gsQ0FBQztRQUVELDBGQUEwRjtRQUNsRixlQUFlLENBQUMsUUFBZTtZQUNyQyxJQUFJLE1BQU0sR0FBeUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQztZQUN0RSxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUNYLE1BQU0sR0FBRyxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsV0FBVyxFQUFFLElBQUksR0FBRyxFQUFFLEVBQUUsQ0FBQztnQkFDbEQsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsTUFBTSxDQUFDLENBQUM7YUFDNUI7WUFDRCxPQUFPLE1BQU0sQ0FBQztRQUNoQixDQUFDO0tBQ0Y7SUEzRFksdUNBQXdCLDJCQTJEcEMsQ0FBQTtBQUNILENBQUMsRUFqR1MsWUFBWSxLQUFaLFlBQVksUUFpR3JCIiwic291cmNlc0NvbnRlbnQiOlsiLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCIuLi8uLi8uLi9Db3JlL0J1aWxkL0Z1ZGdlQ29yZVwiLz5cclxuXHJcbm5hbWVzcGFjZSBGdWRnZUFpZCB7XHJcbiAgZXhwb3J0IGNsYXNzIEFyaXRoSW50ZXJ2YWxTb2x2ZXI8SW50ZXJ2YWwsIEVwc2lsb24+IHtcclxuICAgIHB1YmxpYyBsZWZ0OiBJbnRlcnZhbDtcclxuICAgIHB1YmxpYyByaWdodDogSW50ZXJ2YWw7XHJcbiAgICBwdWJsaWMgbGVmdFZhbHVlOiBib29sZWFuO1xyXG4gICAgcHVibGljIHJpZ2h0VmFsdWU6IGJvb2xlYW47XHJcbiAgICBwcml2YXRlIGZ1bmN0aW9uOiAoX3Q6IEludGVydmFsKSA9PiBib29sZWFuO1xyXG4gICAgcHJpdmF0ZSBkaXZpZGU6IChfbGVmdDogSW50ZXJ2YWwsIF9yaWdodDogSW50ZXJ2YWwpID0+IEludGVydmFsO1xyXG4gICAgcHJpdmF0ZSBpc1NtYWxsZXI6IChfbGVmdDogSW50ZXJ2YWwsIF9yaWdodDogSW50ZXJ2YWwsIF9lcHNpbG9uOiBFcHNpbG9uKSA9PiBib29sZWFuO1xyXG5cclxuICAgIGNvbnN0cnVjdG9yKFxyXG4gICAgICBfZnVuY3Rpb246IChfdDogSW50ZXJ2YWwpID0+IGJvb2xlYW4sXHJcbiAgICAgIF9kaXZpZGU6IChfbGVmdDogSW50ZXJ2YWwsIF9yaWdodDogSW50ZXJ2YWwpID0+IEludGVydmFsLFxyXG4gICAgICBfaXNTbWFsbGVyOiAoX2xlZnQ6IEludGVydmFsLCBfcmlnaHQ6IEludGVydmFsLCBfZXBzaWxvbjogRXBzaWxvbikgPT4gYm9vbGVhbikge1xyXG4gICAgICB0aGlzLmZ1bmN0aW9uID0gX2Z1bmN0aW9uO1xyXG4gICAgICB0aGlzLmRpdmlkZSA9IF9kaXZpZGU7XHJcbiAgICAgIHRoaXMuaXNTbWFsbGVyID0gX2lzU21hbGxlcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc29sdmUoX2xlZnQ6IEludGVydmFsLCBfcmlnaHQ6IEludGVydmFsLCBfZXBzaWxvbjogRXBzaWxvbiwgX2xlZnRWYWx1ZTogYm9vbGVhbiA9IHVuZGVmaW5lZCwgX3JpZ2h0VmFsdWU6IGJvb2xlYW4gPSB1bmRlZmluZWQpOiB2b2lkIHtcclxuICAgICAgdGhpcy5sZWZ0ID0gX2xlZnQ7XHJcbiAgICAgIHRoaXMubGVmdFZhbHVlID0gX2xlZnRWYWx1ZSB8fCB0aGlzLmZ1bmN0aW9uKF9sZWZ0KTtcclxuICAgICAgdGhpcy5yaWdodCA9IF9yaWdodDtcclxuICAgICAgdGhpcy5yaWdodFZhbHVlID0gX3JpZ2h0VmFsdWUgfHwgdGhpcy5mdW5jdGlvbihfcmlnaHQpO1xyXG5cclxuICAgICAgaWYgKHRoaXMuaXNTbWFsbGVyKF9sZWZ0LCBfcmlnaHQsIF9lcHNpbG9uKSlcclxuICAgICAgICByZXR1cm47XHJcblxyXG4gICAgICBsZXQgYmV0d2VlbjogSW50ZXJ2YWwgPSB0aGlzLmRpdmlkZShfbGVmdCwgX3JpZ2h0KTtcclxuICAgICAgbGV0IGJldHdlZW5WYWx1ZTogYm9vbGVhbiA9IHRoaXMuZnVuY3Rpb24oYmV0d2Vlbik7XHJcbiAgICAgIGlmIChiZXR3ZWVuVmFsdWUgPT0gX2xlZnRWYWx1ZSlcclxuICAgICAgICB0aGlzLnNvbHZlKGJldHdlZW4sIHRoaXMucmlnaHQsIF9lcHNpbG9uLCBiZXR3ZWVuVmFsdWUsIHRoaXMucmlnaHRWYWx1ZSk7XHJcbiAgICAgIGVsc2VcclxuICAgICAgICB0aGlzLnNvbHZlKHRoaXMubGVmdCwgYmV0d2VlbiwgX2Vwc2lsb24sIHRoaXMubGVmdFZhbHVlLCBiZXR3ZWVuVmFsdWUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyB0b1N0cmluZygpOiBzdHJpbmcge1xyXG4gICAgICBsZXQgb3V0OiBzdHJpbmcgPSBcIlwiO1xyXG4gICAgICBvdXQgKz0gYGxlZnQ6ICR7dGhpcy5sZWZ0LnRvU3RyaW5nKCl9IC0+ICR7dGhpcy5sZWZ0VmFsdWV9YDtcclxuICAgICAgb3V0ICs9IFwiXFxuXCI7XHJcbiAgICAgIG91dCArPSBgcmlnaHQ6ICR7dGhpcy5yaWdodC50b1N0cmluZygpfSAtPiAke3RoaXMucmlnaHRWYWx1ZX1gO1xyXG4gICAgICByZXR1cm4gb3V0O1xyXG4gICAgfVxyXG4gIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwiLi4vLi4vLi4vQ29yZS9CdWlsZC9GdWRnZUNvcmVcIi8+XHJcblxyXG5uYW1lc3BhY2UgRnVkZ2VBaWQge1xyXG4gIGltcG9ydCDGkiA9IEZ1ZGdlQ29yZTtcclxuXHJcbiAgZXhwb3J0IGNsYXNzIENhbWVyYU9yYml0IGV4dGVuZHMgxpIuTm9kZSB7XHJcbiAgICBwcml2YXRlIG1heFJvdFg6IG51bWJlcjtcclxuICAgIHByaXZhdGUgbWluRGlzdGFuY2U6IG51bWJlcjtcclxuICAgIHByaXZhdGUgbWF4RGlzdGFuY2U6IG51bWJlcjtcclxuICAgIHByaXZhdGUgcm90YXRvclg6IMaSLk5vZGU7XHJcbiAgICBwcml2YXRlIHRyYW5zbGF0b3I6IMaSLk5vZGU7XHJcblxyXG5cclxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihfY21wQ2FtZXJhOiDGki5Db21wb25lbnRDYW1lcmEsIF9kaXN0YW5jZVN0YXJ0OiBudW1iZXIgPSAyLCBfbWF4Um90WDogbnVtYmVyID0gNzUsIF9taW5EaXN0YW5jZTogbnVtYmVyID0gMSwgX21heERpc3RhbmNlOiBudW1iZXIgPSAxMCkge1xyXG4gICAgICBzdXBlcihcIkNhbWVyYU9yYml0XCIpO1xyXG5cclxuICAgICAgdGhpcy5tYXhSb3RYID0gTWF0aC5taW4oX21heFJvdFgsIDg5KTtcclxuICAgICAgdGhpcy5taW5EaXN0YW5jZSA9IF9taW5EaXN0YW5jZTtcclxuICAgICAgdGhpcy5tYXhEaXN0YW5jZSA9IF9tYXhEaXN0YW5jZTtcclxuXHJcbiAgICAgIGxldCBjbXBUcmFuc2Zvcm06IMaSLkNvbXBvbmVudFRyYW5zZm9ybSA9IG5ldyDGki5Db21wb25lbnRUcmFuc2Zvcm0oKTtcclxuICAgICAgdGhpcy5hZGRDb21wb25lbnQoY21wVHJhbnNmb3JtKTtcclxuXHJcbiAgICAgIHRoaXMucm90YXRvclggPSBuZXcgxpIuTm9kZShcIkNhbWVyYVJvdGF0aW9uWFwiKTtcclxuICAgICAgdGhpcy5yb3RhdG9yWC5hZGRDb21wb25lbnQobmV3IMaSLkNvbXBvbmVudFRyYW5zZm9ybSgpKTtcclxuICAgICAgdGhpcy5hcHBlbmRDaGlsZCh0aGlzLnJvdGF0b3JYKTtcclxuICAgICAgdGhpcy50cmFuc2xhdG9yID0gbmV3IMaSLk5vZGUoXCJDYW1lcmFUcmFuc2xhdGVcIik7XHJcbiAgICAgIHRoaXMudHJhbnNsYXRvci5hZGRDb21wb25lbnQobmV3IMaSLkNvbXBvbmVudFRyYW5zZm9ybSgpKTtcclxuICAgICAgdGhpcy50cmFuc2xhdG9yLmNtcFRyYW5zZm9ybS5sb2NhbC5yb3RhdGVZKDE4MCk7XHJcbiAgICAgIHRoaXMucm90YXRvclguYXBwZW5kQ2hpbGQodGhpcy50cmFuc2xhdG9yKTtcclxuXHJcbiAgICAgIHRoaXMudHJhbnNsYXRvci5hZGRDb21wb25lbnQoX2NtcENhbWVyYSk7XHJcbiAgICAgIHRoaXMuZGlzdGFuY2UgPSBfZGlzdGFuY2VTdGFydDtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgZ2V0IGNvbXBvbmVudCgpOiDGki5Db21wb25lbnRDYW1lcmEge1xyXG4gICAgICByZXR1cm4gdGhpcy50cmFuc2xhdG9yLmdldENvbXBvbmVudCjGki5Db21wb25lbnRDYW1lcmEpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgbm9kZSgpOiDGki5Ob2RlIHtcclxuICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRvcjtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IGRpc3RhbmNlKF9kaXN0YW5jZTogbnVtYmVyKSB7XHJcbiAgICAgIGxldCBuZXdEaXN0YW5jZTogbnVtYmVyID0gTWF0aC5taW4odGhpcy5tYXhEaXN0YW5jZSwgTWF0aC5tYXgodGhpcy5taW5EaXN0YW5jZSwgX2Rpc3RhbmNlKSk7XHJcbiAgICAgIHRoaXMudHJhbnNsYXRvci5jbXBUcmFuc2Zvcm0ubG9jYWwudHJhbnNsYXRpb24gPSDGki5WZWN0b3IzLloobmV3RGlzdGFuY2UpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgZGlzdGFuY2UoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMudHJhbnNsYXRvci5jbXBUcmFuc2Zvcm0ubG9jYWwudHJhbnNsYXRpb24uejtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgc2V0IHJvdGF0aW9uWShfYW5nbGU6IG51bWJlcikge1xyXG4gICAgICB0aGlzLmNtcFRyYW5zZm9ybS5sb2NhbC5yb3RhdGlvbiA9IMaSLlZlY3RvcjMuWShfYW5nbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBnZXQgcm90YXRpb25ZKCk6IG51bWJlciB7XHJcbiAgICAgIHJldHVybiB0aGlzLmNtcFRyYW5zZm9ybS5sb2NhbC5yb3RhdGlvbi55O1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyBzZXQgcm90YXRpb25YKF9hbmdsZTogbnVtYmVyKSB7XHJcbiAgICAgIF9hbmdsZSA9IE1hdGgubWluKE1hdGgubWF4KC10aGlzLm1heFJvdFgsIF9hbmdsZSksIHRoaXMubWF4Um90WCk7XHJcbiAgICAgIHRoaXMucm90YXRvclguY21wVHJhbnNmb3JtLmxvY2FsLnJvdGF0aW9uID0gxpIuVmVjdG9yMy5YKF9hbmdsZSk7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCByb3RhdGlvblgoKTogbnVtYmVyIHtcclxuICAgICAgcmV0dXJuIHRoaXMucm90YXRvclguY21wVHJhbnNmb3JtLmxvY2FsLnJvdGF0aW9uLng7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIHJvdGF0ZVkoX2RlbHRhOiBudW1iZXIpOiB2b2lkIHtcclxuICAgICAgdGhpcy5jbXBUcmFuc2Zvcm0ubG9jYWwucm90YXRlWShfZGVsdGEpO1xyXG4gICAgfVxyXG5cclxuICAgIHB1YmxpYyByb3RhdGVYKF9kZWx0YTogbnVtYmVyKTogdm9pZCB7XHJcbiAgICAgIHRoaXMucm90YXRpb25YID0gdGhpcy5yb3RhdG9yWC5jbXBUcmFuc2Zvcm0ubG9jYWwucm90YXRpb24ueCArIF9kZWx0YTtcclxuICAgIH1cclxuICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSB0eXBlcz1cIi4uLy4uLy4uL0NvcmUvQnVpbGQvRnVkZ2VDb3JlXCIvPlxyXG5cclxubmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XHJcblxyXG4gIGV4cG9ydCBjbGFzcyBOb2RlIGV4dGVuZHMgxpIuTm9kZSB7XHJcbiAgICBwcml2YXRlIHN0YXRpYyBjb3VudDogbnVtYmVyID0gMDtcclxuXHJcbiAgICBjb25zdHJ1Y3RvcihfbmFtZTogc3RyaW5nID0gTm9kZS5nZXROZXh0TmFtZSgpLCBfdHJhbnNmb3JtPzogxpIuTWF0cml4NHg0LCBfbWF0ZXJpYWw/OiDGki5NYXRlcmlhbCwgX21lc2g/OiDGki5NZXNoKSB7XHJcbiAgICAgIHN1cGVyKF9uYW1lKTtcclxuICAgICAgaWYgKF90cmFuc2Zvcm0pXHJcbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQobmV3IMaSLkNvbXBvbmVudFRyYW5zZm9ybShfdHJhbnNmb3JtKSk7XHJcbiAgICAgIGlmIChfbWF0ZXJpYWwpXHJcbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQobmV3IMaSLkNvbXBvbmVudE1hdGVyaWFsKF9tYXRlcmlhbCkpO1xyXG4gICAgICBpZiAoX21lc2gpXHJcbiAgICAgICAgdGhpcy5hZGRDb21wb25lbnQobmV3IMaSLkNvbXBvbmVudE1lc2goX21lc2gpKTtcclxuICAgIH1cclxuXHJcbiAgICBwcml2YXRlIHN0YXRpYyBnZXROZXh0TmFtZSgpOiBzdHJpbmcge1xyXG4gICAgICByZXR1cm4gXCLGkkFpZE5vZGVfXCIgKyBOb2RlLmNvdW50Kys7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBsb2NhbCgpOiDGki5NYXRyaXg0eDQge1xyXG4gICAgICByZXR1cm4gdGhpcy5jbXBUcmFuc2Zvcm0gPyB0aGlzLmNtcFRyYW5zZm9ybS5sb2NhbCA6IG51bGw7XHJcbiAgICB9XHJcblxyXG4gICAgcHVibGljIGdldCBwaXZvdCgpOiDGki5NYXRyaXg0eDQge1xyXG4gICAgICBsZXQgY21wTWVzaDogxpIuQ29tcG9uZW50TWVzaCA9IHRoaXMuZ2V0Q29tcG9uZW50KMaSLkNvbXBvbmVudE1lc2gpO1xyXG4gICAgICByZXR1cm4gY21wTWVzaCA/IGNtcE1lc2gucGl2b3QgOiBudWxsO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIi8vLyA8cmVmZXJlbmNlIHR5cGVzPVwiLi4vLi4vLi4vQ29yZS9CdWlsZC9GdWRnZUNvcmVcIi8+XHJcblxyXG5uYW1lc3BhY2UgRnVkZ2VBaWQge1xyXG4gIGltcG9ydCDGkiA9IEZ1ZGdlQ29yZTtcclxuXHJcbiAgZXhwb3J0IGNsYXNzIE5vZGVBcnJvdyBleHRlbmRzIE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZywgX2NvbG9yOiDGki5Db2xvcikge1xyXG4gICAgICBzdXBlcihfbmFtZSwgxpIuTWF0cml4NHg0LklERU5USVRZKTtcclxuICAgICAgbGV0IGNvYXQ6IMaSLkNvYXRDb2xvcmVkID0gbmV3IMaSLkNvYXRDb2xvcmVkKF9jb2xvcik7XHJcbiAgICAgIGxldCBtYXRlcmlhbDogxpIuTWF0ZXJpYWwgPSBuZXcgxpIuTWF0ZXJpYWwoXCJBcnJvd1wiLCDGki5TaGFkZXJVbmlDb2xvciwgY29hdCk7XHJcblxyXG4gICAgICBsZXQgbWVzaEN1YmU6IMaSLk1lc2hDdWJlID0gbmV3IMaSLk1lc2hDdWJlKCk7XHJcbiAgICAgIGxldCBtZXNoUHlyYW1pZDogxpIuTWVzaFB5cmFtaWQgPSBuZXcgxpIuTWVzaFB5cmFtaWQoKTtcclxuXHJcbiAgICAgIGxldCBzaGFmdDogTm9kZSA9IG5ldyBOb2RlKFwiU2hhZnRcIiwgxpIuTWF0cml4NHg0LklERU5USVRZLCBtYXRlcmlhbCwgbWVzaEN1YmUpO1xyXG4gICAgICBsZXQgaGVhZDogTm9kZSA9IG5ldyBOb2RlKFwiSGVhZFwiLCDGki5NYXRyaXg0eDQuSURFTlRJVFksIG1hdGVyaWFsLCBtZXNoUHlyYW1pZCk7XHJcbiAgICAgIHNoYWZ0LmxvY2FsLnNjYWxlKG5ldyDGki5WZWN0b3IzKDAuMDEsIDEsIDAuMDEpKTtcclxuICAgICAgaGVhZC5sb2NhbC50cmFuc2xhdGVZKDAuNSk7XHJcbiAgICAgIGhlYWQubG9jYWwuc2NhbGUobmV3IMaSLlZlY3RvcjMoMC4wNSwgMC4xLCAwLjA1KSk7XHJcblxyXG4gICAgICB0aGlzLmFwcGVuZENoaWxkKHNoYWZ0KTtcclxuICAgICAgdGhpcy5hcHBlbmRDaGlsZChoZWFkKTtcclxuICAgIH1cclxuICB9XHJcbn0iLCIvLy8gPHJlZmVyZW5jZSB0eXBlcz1cIi4uLy4uLy4uL0NvcmUvQnVpbGQvRnVkZ2VDb3JlXCIvPlxyXG5cclxubmFtZXNwYWNlIEZ1ZGdlQWlkIHtcclxuICBpbXBvcnQgxpIgPSBGdWRnZUNvcmU7XHJcblxyXG4gIGV4cG9ydCBjbGFzcyBOb2RlQ29vcmRpbmF0ZVN5c3RlbSBleHRlbmRzIE5vZGUge1xyXG4gICAgY29uc3RydWN0b3IoX25hbWU6IHN0cmluZyA9IFwiQ29vcmRpbmF0ZVN5c3RlbVwiLCBfdHJhbnNmb3JtPzogxpIuTWF0cml4NHg0KSB7XHJcbiAgICAgIHN1cGVyKF9uYW1lLCBfdHJhbnNmb3JtKTtcclxuICAgICAgbGV0IGFycm93UmVkOiDGki5Ob2RlID0gbmV3IE5vZGVBcnJvdyhcIkFycm93UmVkXCIsIG5ldyDGki5Db2xvcigxLCAwLCAwLCAxKSk7XHJcbiAgICAgIGxldCBhcnJvd0dyZWVuOiDGki5Ob2RlID0gbmV3IE5vZGVBcnJvdyhcIkFycm93R3JlZW5cIiwgbmV3IMaSLkNvbG9yKDAsIDEsIDAsIDEpKTtcclxuICAgICAgbGV0IGFycm93Qmx1ZTogxpIuTm9kZSA9IG5ldyBOb2RlQXJyb3coXCJBcnJvd0JsdWVcIiwgbmV3IMaSLkNvbG9yKDAsIDAsIDEsIDEpKTtcclxuXHJcbiAgICAgIGFycm93UmVkLmNtcFRyYW5zZm9ybS5sb2NhbC5yb3RhdGVaKC05MCk7XHJcbiAgICAgIGFycm93Qmx1ZS5jbXBUcmFuc2Zvcm0ubG9jYWwucm90YXRlWCg5MCk7XHJcblxyXG4gICAgICB0aGlzLmFwcGVuZENoaWxkKGFycm93UmVkKTtcclxuICAgICAgdGhpcy5hcHBlbmRDaGlsZChhcnJvd0dyZWVuKTtcclxuICAgICAgdGhpcy5hcHBlbmRDaGlsZChhcnJvd0JsdWUpO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIi8vLzxyZWZlcmVuY2UgdHlwZXM9XCIuLi8uLi8uLi9Db3JlL0J1aWxkL0Z1ZGdlQ29yZVwiLz5cclxuXHJcbm5hbWVzcGFjZSBTdGF0ZU1hY2hpbmUge1xyXG4gIGltcG9ydCDGkiA9IEZ1ZGdlQ29yZTtcclxuICBcclxuICBleHBvcnQgY2xhc3MgQ29tcG9uZW50U3RhdGVNYWNoaW5lPFN0YXRlPiBleHRlbmRzIMaSLkNvbXBvbmVudFNjcmlwdCBpbXBsZW1lbnRzIFN0YXRlTWFjaGluZTxTdGF0ZT4ge1xyXG4gICAgcHVibGljIHN0YXRlQ3VycmVudDogU3RhdGU7XHJcbiAgICBwdWJsaWMgc3RhdGVOZXh0OiBTdGF0ZTtcclxuICAgIHB1YmxpYyBzdGF0ZU1hY2hpbmU6IFN0YXRlTWFjaGluZUluc3RydWN0aW9uczxTdGF0ZT47XHJcblxyXG4gICAgcHVibGljIHRyYW5zaXQoX25leHQ6IFN0YXRlKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuc3RhdGVNYWNoaW5lLnRyYW5zaXQodGhpcy5zdGF0ZUN1cnJlbnQsIF9uZXh0LCB0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWN0KCk6IHZvaWQge1xyXG4gICAgICB0aGlzLnN0YXRlTWFjaGluZS5hY3QodGhpcy5zdGF0ZUN1cnJlbnQsIHRoaXMpO1xyXG4gICAgfVxyXG4gIH1cclxufSIsIi8vIC88cmVmZXJlbmNlIHR5cGVzPVwiLi4vLi4vLi4vQ29yZS9CdWlsZC9GdWRnZUNvcmVcIi8+XHJcblxyXG4vKipcclxuICogU3RhdGUgbWFjaGluZSBvZmZlcnMgYSBzdHJ1Y3R1cmUgYW5kIGZ1bmRhbWVudGFsIGZ1bmN0aW9uYWxpdHkgZm9yIHN0YXRlIG1hY2hpbmVzXHJcbiAqIDxTdGF0ZT4gc2hvdWxkIGJlIGFuIGVudW0gZGVmaW5pbmcgdGhlIHZhcmlvdXMgc3RhdGVzIG9mIHRoZSBtYWNoaW5lXHJcbiAqL1xyXG5cclxubmFtZXNwYWNlIFN0YXRlTWFjaGluZSB7XHJcbiAgLy8gaW1wb3J0IMaSID0gRnVkZ2VDb3JlO1xyXG5cclxuICAvKiogRm9ybWF0IG9mIG1ldGhvZHMgdG8gYmUgdXNlZCBhcyB0cmFuc2l0aW9ucyBvciBhY3Rpb25zICovXHJcbiAgdHlwZSBTdGF0ZU1hY2hpbmVNZXRob2Q8U3RhdGU+ID0gKF9tYWNoaW5lOiBTdGF0ZU1hY2hpbmU8U3RhdGU+KSA9PiB2b2lkO1xyXG4gIC8qKiBUeXBlIGZvciBtYXBzIGFzc29jaWF0aW5nIGEgc3RhdGUgdG8gYSBtZXRob2QgKi9cclxuICB0eXBlIFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2Q8U3RhdGU+ID0gTWFwPFN0YXRlLCBTdGF0ZU1hY2hpbmVNZXRob2Q8U3RhdGU+PjtcclxuICAvKiogSW50ZXJmYWNlIG1hcHBpbmcgYSBzdGF0ZSB0byBvbmUgYWN0aW9uIG11bHRpcGxlIHRyYW5zaXRpb25zICovXHJcbiAgaW50ZXJmYWNlIFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2RzPFN0YXRlPiB7XHJcbiAgICBhY3Rpb246IFN0YXRlTWFjaGluZU1ldGhvZDxTdGF0ZT47XHJcbiAgICB0cmFuc2l0aW9uczogU3RhdGVNYWNoaW5lTWFwU3RhdGVUb01ldGhvZDxTdGF0ZT47XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBDb3JlIGZ1bmN0aW9uYWxpdHkgb2YgdGhlIHN0YXRlIG1hY2hpbmUsIGhvbGRpbmcgc29sZWx5IHRoZSBjdXJyZW50IHN0YXRlIGFuZCwgd2hpbGUgaW4gdHJhbnNpdGlvbiwgdGhlIG5leHQgc3RhdGUsXHJcbiAgICogdGhlIGluc3RydWN0aW9ucyBmb3IgdGhlIG1hY2hpbmUgYW5kIGNvbWZvcnQgbWV0aG9kcyB0byB0cmFuc2l0IGFuZCBhY3QuXHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIFN0YXRlTWFjaGluZTxTdGF0ZT4ge1xyXG4gICAgcHVibGljIHN0YXRlQ3VycmVudDogU3RhdGU7XHJcbiAgICBwdWJsaWMgc3RhdGVOZXh0OiBTdGF0ZTtcclxuICAgIHB1YmxpYyBzdGF0ZU1hY2hpbmU6IFN0YXRlTWFjaGluZUluc3RydWN0aW9uczxTdGF0ZT47XHJcblxyXG4gICAgcHVibGljIHRyYW5zaXQoX25leHQ6IFN0YXRlKTogdm9pZCB7XHJcbiAgICAgIHRoaXMuc3RhdGVNYWNoaW5lLnRyYW5zaXQodGhpcy5zdGF0ZUN1cnJlbnQsIF9uZXh0LCB0aGlzKTtcclxuICAgIH1cclxuXHJcbiAgICBwdWJsaWMgYWN0KCk6IHZvaWQge1xyXG4gICAgICB0aGlzLnN0YXRlTWFjaGluZS5hY3QodGhpcy5zdGF0ZUN1cnJlbnQsIHRoaXMpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgLyoqXHJcbiAgICogU2V0IG9mIGluc3RydWN0aW9ucyBmb3IgYSBzdGF0ZSBtYWNoaW5lLiBUaGUgc2V0IGtlZXBzIGFsbCBtZXRob2RzIGZvciBkZWRpY2F0ZWQgYWN0aW9ucyBkZWZpbmVkIGZvciB0aGUgc3RhdGVzXHJcbiAgICogYW5kIGFsbCBkZWRpY2F0ZWQgbWV0aG9kcyBkZWZpbmVkIGZvciB0cmFuc2l0aW9ucyB0byBvdGhlciBzdGF0ZXMsIGFzIHdlbGwgYXMgZGVmYXVsdCBtZXRob2RzLlxyXG4gICAqIEluc3RydWN0aW9ucyBleGlzdCBpbmRlcGVuZGVudGx5IGZyb20gU3RhdGVNYWNoaW5lcy4gQSBzdGF0ZW1hY2hpbmUgaW5zdGFuY2UgaXMgcGFzc2VkIGFzIHBhcmFtZXRlciB0byB0aGUgaW5zdHJ1Y3Rpb24gc2V0LlxyXG4gICAqIE11bHRpcGxlIHN0YXRlbWFjaGluZS1pbnN0YW5jZXMgY2FuIHRodXMgdXNlIHRoZSBzYW1lIGluc3RydWN0aW9uIHNldCBhbmQgZGlmZmVyZW50IGluc3RydWN0aW9uIHNldHMgY291bGQgb3BlcmF0ZSBvbiB0aGUgc2FtZSBzdGF0ZW1hY2hpbmUuXHJcbiAgICovXHJcbiAgZXhwb3J0IGNsYXNzIFN0YXRlTWFjaGluZUluc3RydWN0aW9uczxTdGF0ZT4gZXh0ZW5kcyBNYXA8U3RhdGUsIFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2RzPFN0YXRlPj4ge1xyXG4gICAgLyoqIERlZmluZSBkZWRpY2F0ZWQgdHJhbnNpdGlvbiBtZXRob2QgdG8gdHJhbnNpdCBmcm9tIG9uZSBzdGF0ZSB0byBhbm90aGVyKi9cclxuICAgIHB1YmxpYyBzZXRUcmFuc2l0aW9uKF9jdXJyZW50OiBTdGF0ZSwgX25leHQ6IFN0YXRlLCBfdHJhbnNpdGlvbjogU3RhdGVNYWNoaW5lTWV0aG9kPFN0YXRlPik6IHZvaWQge1xyXG4gICAgICBsZXQgYWN0aXZlOiBTdGF0ZU1hY2hpbmVNYXBTdGF0ZVRvTWV0aG9kczxTdGF0ZT4gPSB0aGlzLmdldFN0YXRlTWV0aG9kcyhfY3VycmVudCk7XHJcbiAgICAgIGFjdGl2ZS50cmFuc2l0aW9ucy5zZXQoX25leHQsIF90cmFuc2l0aW9uKTtcclxuICAgIH1cclxuXHJcbiAgICAvKiogRGVmaW5lIGRlZGljYXRlZCBhY3Rpb24gbWV0aG9kIGZvciBhIHN0YXRlICovXHJcbiAgICBwdWJsaWMgc2V0QWN0aW9uKF9jdXJyZW50OiBTdGF0ZSwgX2FjdGlvbjogU3RhdGVNYWNoaW5lTWV0aG9kPFN0YXRlPik6IHZvaWQge1xyXG4gICAgICBsZXQgYWN0aXZlOiBTdGF0ZU1hY2hpbmVNYXBTdGF0ZVRvTWV0aG9kczxTdGF0ZT4gPSB0aGlzLmdldFN0YXRlTWV0aG9kcyhfY3VycmVudCk7XHJcbiAgICAgIGFjdGl2ZS5hY3Rpb24gPSBfYWN0aW9uO1xyXG4gICAgfVxyXG5cclxuICAgIC8qKiBEZWZhdWx0IHRyYW5zaXRpb24gbWV0aG9kIHRvIGludm9rZSBpZiBubyBkZWRpY2F0ZWQgdHJhbnNpdGlvbiBleGlzdHMsIHNob3VsZCBiZSBvdmVycmlkZW4gaW4gc3ViY2xhc3MgKi9cclxuICAgIHB1YmxpYyB0cmFuc2l0RGVmYXVsdChfbWFjaGluZTogU3RhdGVNYWNoaW5lPFN0YXRlPik6IHZvaWQge1xyXG4gICAgICAvL1xyXG4gICAgfVxyXG4gICAgXHJcbiAgICAvKiogRGVmYXVsdCBhY3Rpb24gbWV0aG9kIHRvIGludm9rZSBpZiBubyBkZWRpY2F0ZWQgYWN0aW9uIGV4aXN0cywgc2hvdWxkIGJlIG92ZXJyaWRlbiBpbiBzdWJjbGFzcyAqL1xyXG4gICAgcHVibGljIGFjdERlZmF1bHQoX21hY2hpbmU6IFN0YXRlTWFjaGluZTxTdGF0ZT4pOiB2b2lkIHtcclxuICAgICAgLy9cclxuICAgIH1cclxuXHJcbiAgICAvKiogSW52b2tlIGEgZGVkaWNhdGVkIHRyYW5zaXRpb24gbWV0aG9kIGlmIGZvdW5kIGZvciB0aGUgY3VycmVudCBhbmQgdGhlIG5leHQgc3RhdGUsIG9yIHRoZSBkZWZhdWx0IG1ldGhvZCAqL1xyXG4gICAgcHVibGljIHRyYW5zaXQoX2N1cnJlbnQ6IFN0YXRlLCBfbmV4dDogU3RhdGUsIF9tYWNoaW5lOiBTdGF0ZU1hY2hpbmU8U3RhdGU+KTogdm9pZCB7XHJcbiAgICAgIF9tYWNoaW5lLnN0YXRlTmV4dCA9IF9uZXh0O1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGxldCBhY3RpdmU6IFN0YXRlTWFjaGluZU1hcFN0YXRlVG9NZXRob2RzPFN0YXRlPiA9IHRoaXMuZ2V0KF9jdXJyZW50KTtcclxuICAgICAgICBsZXQgdHJhbnNpdGlvbjogU3RhdGVNYWNoaW5lTWV0aG9kPFN0YXRlPiA9IGFjdGl2ZS50cmFuc2l0aW9ucy5nZXQoX25leHQpO1xyXG4gICAgICAgIHRyYW5zaXRpb24oX21hY2hpbmUpO1xyXG4gICAgICB9IGNhdGNoIChfZXJyb3IpIHtcclxuICAgICAgICBjb25zb2xlLmluZm8oX2Vycm9yLm1lc3NhZ2UpO1xyXG4gICAgICAgIHRoaXMudHJhbnNpdERlZmF1bHQoX21hY2hpbmUpO1xyXG4gICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIF9tYWNoaW5lLnN0YXRlQ3VycmVudCA9IF9uZXh0O1xyXG4gICAgICAgIF9tYWNoaW5lLnN0YXRlTmV4dCA9IHVuZGVmaW5lZDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBJbnZva2UgdGhlIGRlZGljYXRlZCBhY3Rpb24gbWV0aG9kIGlmIGZvdW5kIGZvciB0aGUgY3VycmVudCBzdGF0ZSwgb3IgdGhlIGRlZmF1bHQgbWV0aG9kICovXHJcbiAgICBwdWJsaWMgYWN0KF9jdXJyZW50OiBTdGF0ZSwgX21hY2hpbmU6IFN0YXRlTWFjaGluZTxTdGF0ZT4pOiB2b2lkIHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBsZXQgYWN0aXZlOiBTdGF0ZU1hY2hpbmVNYXBTdGF0ZVRvTWV0aG9kczxTdGF0ZT4gPSB0aGlzLmdldChfY3VycmVudCk7XHJcbiAgICAgICAgYWN0aXZlLmFjdGlvbihfbWFjaGluZSk7XHJcbiAgICAgIH0gY2F0Y2ggKF9lcnJvcikge1xyXG4gICAgICAgIGNvbnNvbGUuaW5mbyhfZXJyb3IubWVzc2FnZSk7XHJcbiAgICAgICAgdGhpcy5hY3REZWZhdWx0KF9tYWNoaW5lKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8qKiBGaW5kIHRoZSBpbnN0cnVjdGlvbnMgZGVkaWNhdGVkIGZvciB0aGUgY3VycmVudCBzdGF0ZSBvciBjcmVhdGUgYW4gZW1wdHkgc2V0IGZvciBpdCAqL1xyXG4gICAgcHJpdmF0ZSBnZXRTdGF0ZU1ldGhvZHMoX2N1cnJlbnQ6IFN0YXRlKTogU3RhdGVNYWNoaW5lTWFwU3RhdGVUb01ldGhvZHM8U3RhdGU+IHtcclxuICAgICAgbGV0IGFjdGl2ZTogU3RhdGVNYWNoaW5lTWFwU3RhdGVUb01ldGhvZHM8U3RhdGU+ID0gdGhpcy5nZXQoX2N1cnJlbnQpO1xyXG4gICAgICBpZiAoIWFjdGl2ZSkge1xyXG4gICAgICAgIGFjdGl2ZSA9IHsgYWN0aW9uOiBudWxsLCB0cmFuc2l0aW9uczogbmV3IE1hcCgpIH07XHJcbiAgICAgICAgdGhpcy5zZXQoX2N1cnJlbnQsIGFjdGl2ZSk7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIGFjdGl2ZTtcclxuICAgIH1cclxuICB9XHJcbn0iXX0=