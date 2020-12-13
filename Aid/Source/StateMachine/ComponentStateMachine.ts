namespace FudgeAid {
  import ƒ = FudgeCore;
  
  export class ComponentStateMachine<State> extends ƒ.ComponentScript implements StateMachine<State> {
    public stateCurrent: State;
    public stateNext: State;
    public instructions: StateMachineInstructions<State>;

    public transit(_next: State): void {
      this.instructions.transit(this.stateCurrent, _next, this);
    }

    public act(): void {
      this.instructions.act(this.stateCurrent, this);
    }
  }
}