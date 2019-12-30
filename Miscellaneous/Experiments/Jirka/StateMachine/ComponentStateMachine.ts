///<reference types="../../../../Core/Build/FudgeCore"/>

namespace StateMachine {
  import ƒ = FudgeCore;
  
  export class ComponentStateMachine<State> extends ƒ.ComponentScript implements StateMachineAgent<State> {
    public stateCurrent: State;
    public stateNext: State;
    public stateMachine: StateMachine<State>;

    public transit(_next: State): void {
      this.stateMachine.transit(this.stateCurrent, _next, this);
    }

    public act(): void {
      this.stateMachine.act(this.stateCurrent, this);
    }
  }
}