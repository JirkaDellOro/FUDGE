///<reference types="../../../../Core/Build/FudgeCore"/>
var StateMachine;
(function (StateMachine) {
    var ƒ = FudgeCore;
    class StateMachineMap extends Map {
        setTransition(_current, _next, _transition) {
            let active = this.get(_current);
            if (!active) {
                active = { action: null, transitions: new Map() };
                this.set(_current, active);
            }
            active.transitions.set(_next, _transition);
        }
        transit(_current, _next, _agent) {
            let active = this.get(_current);
            let transition = active.transitions.get(_next);
            transition(_agent);
        }
    }
    StateMachine.StateMachineMap = StateMachineMap;
    // export class StateMachine<State> {
    //   public mapStateCurrentToNext: StateMachineMapTransitions<State> = new Map();
    //   public setTransition(_current: State, _next: State, _transition: StateMachineTransition<State>): void {
    //     let active: Map<State, StateMachineTransition<State>> = this.mapStateCurrentToNext.get(_current);
    //     if (!active) {
    //       active = new Map();
    //       this.mapStateCurrentToNext.set(_current, active);
    //     }
    //     active.set(_next, _transition);
    //   }
    //   public transit(_current: State, _next: State, _agent: StateMachineAgent<State>): void {
    //     let active: Map<State, StateMachineTransition<State>> = this.mapStateCurrentToNext.get(_current);
    //     let transition: StateMachineTransition<State> = active.get(_next);
    //     transition(_agent);
    //   }
    // }
    class ComponentStateMachine extends ƒ.ComponentScript {
    }
    StateMachine.ComponentStateMachine = ComponentStateMachine;
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=StateMachine.js.map