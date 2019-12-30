///<reference types="../../../../Core/Build/FudgeCore"/>

namespace StateMachine {
  enum JOB {
    IDLE, PATROL, CHASE
  }

  class Guard implements StateMachineAgent<JOB> {
    public state: JOB;
    public stateMachine: StateMachine<JOB>;

    public constructor() {
      super();
      this.stateMachine = ComponentGuard.stateMachine;
    }
  }

  class ComponentGuard extends ComponentStateMachine<JOB> {
    private static stateMachine: StateMachine<JOB> = ComponentGuard.setupStateMachine();

    public constructor() {
      super();
      this.stateMachine = ComponentGuard.stateMachine;
    }

    public static transition(_cmp: ComponentStateMachine<JOB>): void {
      console.log("Transition from ", _cmp.state);
    }
    public static action(_cmp: ComponentStateMachine<JOB>): void {
      console.log("Action on ", _cmp.state);
    }

    private static setupStateMachine(): StateMachine<JOB> {
      let setup: StateMachine<JOB> = new StateMachine();
      setup.setTransition(JOB.IDLE, JOB.PATROL, this.transition);
      setup.setTransition(JOB.PATROL, JOB.IDLE, this.transition);
      setup.setAction(JOB.IDLE, this.action);
      setup.setAction(JOB.PATROL, this.action);
      return setup;
    }
  }



  console.group("Guard");
  let cmpStateMachine: ComponentGuard = new ComponentGuard();
  cmpStateMachine.state = JOB.IDLE;
  cmpStateMachine.act();
  cmpStateMachine.transit(JOB.PATROL);
  cmpStateMachine.act();
  cmpStateMachine.transit(JOB.IDLE);
  cmpStateMachine.act();
  console.groupEnd();
}