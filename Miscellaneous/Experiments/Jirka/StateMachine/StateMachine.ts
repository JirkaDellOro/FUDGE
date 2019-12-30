///<reference types="../../../../Core/Build/FudgeCore"/>

namespace StateMachine {
  import ƒ = FudgeCore;

  type StateMachineMethod<State> = (_agent: StateMachineAgent<State>) => void;
  type StateMachineMapStateToMethod<State> = Map<State, StateMachineMethod<State>>;
  interface StateMachineMapStateToMethods<State> {
    action: StateMachineMethod<State>;
    transitions: StateMachineMapStateToMethod<State>;
  }
  export interface StateMachineAgent<State> {
    state: State;
    stateMachine: StateMachine<State>;
  }

  export class StateMachine<State> extends Map<State, StateMachineMapStateToMethods<State>> {
    public setTransition(_current: State, _next: State, _transition: StateMachineMethod<State>): void {
      let active: StateMachineMapStateToMethods<State> = this.getStateMethods(_current);
      active.transitions.set(_next, _transition);
    }

    public setAction(_current: State, _action: StateMachineMethod<State>): void {
      let active: StateMachineMapStateToMethods<State> = this.getStateMethods(_current);
      active.action = _action;
    }

    public transit(_current: State, _next: State, _agent: StateMachineAgent<State>): void {
      let active: StateMachineMapStateToMethods<State> = this.get(_current);
      let transition: StateMachineMethod<State> = active.transitions.get(_next);
      transition(_agent);
      _agent.state = _next;
    }

    public act(_current: State, _agent: StateMachineAgent<State>): void {
      let active: StateMachineMapStateToMethods<State> = this.get(_current);
      active.action(_agent);
    }

    private getStateMethods(_current: State): StateMachineMapStateToMethods<State> {
      let active: StateMachineMapStateToMethods<State> = this.get(_current);
      if (!active) {
        active = { action: null, transitions: new Map() };
        this.set(_current, active);
      }
      return active;
    }
  }
}