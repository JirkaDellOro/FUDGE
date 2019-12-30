///<reference types="../../../../Core/Build/FudgeCore"/>

namespace StateMachine {
  import ƒ = FudgeCore;

  // export type StateMachineTransition<State> = (_agent: StateMachineAgent<State>) => void;
  type StateMachineTransition<State> = (_agent: ComponentStateMachine<State>) => void;
  type StateMachineMapTransitions<State> = Map<State, Map<State, StateMachineTransition<State>>>;
  // export interface StateMachineAgent<State> {
  //   stateMachine: StateMachine<State>;
  //   state: State;
  // }

  type StateMachineMapStateToTransitions<State> = Map<State, StateMachineTransition<State>>;
  interface StateMachineMapStateToMethods<State> {
    action: Function;
    transitions: StateMachineMapStateToTransitions<State>;
  }

  export class StateMachineMap<State> extends Map<State, StateMachineMapStateToMethods<State>> {
    public setTransition(_current: State, _next: State, _transition: StateMachineTransition<State>): void {
      let active: StateMachineMapStateToMethods<State> = this.get(_current);
      if (!active) {
        active = {action: null, transitions: new Map()};
        this.set(_current, active);
      }
      active.transitions.set(_next, _transition);
    }
    
    public transit(_current: State, _next: State, _agent: ComponentStateMachine<State>): void {
      let active: StateMachineMapStateToMethods<State> = this.get(_current);
      let transition: StateMachineTransition<State> = active.transitions.get(_next);
      transition(_agent);
    }
  }

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

  export class ComponentStateMachine<State> extends ƒ.ComponentScript {
    public state: State;
    public stateMachineMap: StateMachineMap<State>;
  }
}