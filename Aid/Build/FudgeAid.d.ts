/// <reference types="../../core/build/fudgecore" />
declare namespace FudgeAid {
    class ArithIntervalSolver<Interval, Epsilon> {
        left: Interval;
        right: Interval;
        leftValue: boolean;
        rightValue: boolean;
        private function;
        private divide;
        private isSmaller;
        constructor(_function: (_t: Interval) => boolean, _divide: (_left: Interval, _right: Interval) => Interval, _isSmaller: (_left: Interval, _right: Interval, _epsilon: Epsilon) => boolean);
        solve(_left: Interval, _right: Interval, _epsilon: Epsilon, _leftValue?: boolean, _rightValue?: boolean): void;
        toString(): string;
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class CameraOrbit extends ƒ.Node {
        private maxRotX;
        private minDistance;
        private maxDistance;
        private rotatorX;
        private translator;
        constructor(_cmpCamera: ƒ.ComponentCamera, _distanceStart?: number, _maxRotX?: number, _minDistance?: number, _maxDistance?: number);
        get component(): ƒ.ComponentCamera;
        get node(): ƒ.Node;
        set distance(_distance: number);
        get distance(): number;
        set rotationY(_angle: number);
        get rotationY(): number;
        set rotationX(_angle: number);
        get rotationX(): number;
        rotateY(_delta: number): void;
        rotateX(_delta: number): void;
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class Node extends ƒ.Node {
        private static count;
        constructor(_name?: string, _transform?: ƒ.Matrix4x4, _material?: ƒ.Material, _mesh?: ƒ.Mesh);
        private static getNextName;
        get local(): ƒ.Matrix4x4;
        get pivot(): ƒ.Matrix4x4;
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class NodeArrow extends Node {
        constructor(_name: string, _color: ƒ.Color);
    }
}
declare namespace FudgeAid {
    import ƒ = FudgeCore;
    class NodeCoordinateSystem extends Node {
        constructor(_name?: string, _transform?: ƒ.Matrix4x4);
    }
}
declare namespace StateMachine {
    import ƒ = FudgeCore;
    class ComponentStateMachine<State> extends ƒ.ComponentScript implements StateMachine<State> {
        stateCurrent: State;
        stateNext: State;
        stateMachine: StateMachineInstructions<State>;
        transit(_next: State): void;
        act(): void;
    }
}
/**
 * State machine offers a structure and fundamental functionality for state machines
 * <State> should be an enum defining the various states of the machine
 */
declare namespace StateMachine {
    /** Format of methods to be used as transitions or actions */
    type StateMachineMethod<State> = (_machine: StateMachine<State>) => void;
    /** Type for maps associating a state to a method */
    type StateMachineMapStateToMethod<State> = Map<State, StateMachineMethod<State>>;
    /** Interface mapping a state to one action multiple transitions */
    interface StateMachineMapStateToMethods<State> {
        action: StateMachineMethod<State>;
        transitions: StateMachineMapStateToMethod<State>;
    }
    /**
     * Core functionality of the state machine, holding solely the current state and, while in transition, the next state,
     * the instructions for the machine and comfort methods to transit and act.
     */
    export class StateMachine<State> {
        stateCurrent: State;
        stateNext: State;
        stateMachine: StateMachineInstructions<State>;
        transit(_next: State): void;
        act(): void;
    }
    /**
     * Set of instructions for a state machine. The set keeps all methods for dedicated actions defined for the states
     * and all dedicated methods defined for transitions to other states, as well as default methods.
     * Instructions exist independently from StateMachines. A statemachine instance is passed as parameter to the instruction set.
     * Multiple statemachine-instances can thus use the same instruction set and different instruction sets could operate on the same statemachine.
     */
    export class StateMachineInstructions<State> extends Map<State, StateMachineMapStateToMethods<State>> {
        /** Define dedicated transition method to transit from one state to another*/
        setTransition(_current: State, _next: State, _transition: StateMachineMethod<State>): void;
        /** Define dedicated action method for a state */
        setAction(_current: State, _action: StateMachineMethod<State>): void;
        /** Default transition method to invoke if no dedicated transition exists, should be overriden in subclass */
        transitDefault(_machine: StateMachine<State>): void;
        /** Default action method to invoke if no dedicated action exists, should be overriden in subclass */
        actDefault(_machine: StateMachine<State>): void;
        /** Invoke a dedicated transition method if found for the current and the next state, or the default method */
        transit(_current: State, _next: State, _machine: StateMachine<State>): void;
        /** Invoke the dedicated action method if found for the current state, or the default method */
        act(_current: State, _machine: StateMachine<State>): void;
        /** Find the instructions dedicated for the current state or create an empty set for it */
        private getStateMethods;
    }
    export {};
}
