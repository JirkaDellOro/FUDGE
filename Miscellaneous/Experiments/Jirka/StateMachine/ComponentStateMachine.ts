///<reference types="../../../../Core/Build/FudgeCore"/>

namespace StateMachine {
  import ƒ = FudgeCore;
  
  export class ComponentStateMachine<State> extends ƒ.ComponentScript implements StateMachineAgent<State> {
    public state: State;
    public stateMachine: StateMachine<State>;

    public transit(_next: State): void {
      this.stateMachine.transit(this.state, _next, this);
    }

    public act(): void {
      this.stateMachine.act(this.state, this);
    }
  }
}