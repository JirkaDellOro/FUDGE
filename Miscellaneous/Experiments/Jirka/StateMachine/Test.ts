///<reference types="../../../../Core/Build/FudgeCore"/>

namespace StateMachine {
  enum JOB {
    IDLE, PATROL, CHASE
  }

  class Guard extends StateMachineAgent<JOB> {
    private static stateMachine: StateMachine<JOB> = Guard.setupStateMachine();

    public constructor() {
      super();
      this.stateMachine = Guard.stateMachine;
    }

    public static transition(_cmp: ComponentStateMachine<JOB>): void {
      console.log("Guard transits from ", _cmp.state);
    }
    public static action(_cmp: ComponentStateMachine<JOB>): void {
      console.log("Guard acts on ", _cmp.state);
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

  class ComponentGuard extends ComponentStateMachine<JOB> {
    private static stateMachine: StateMachine<JOB> = ComponentGuard.setupStateMachine();

    public constructor() {
      super();
      this.stateMachine = ComponentGuard.stateMachine;
    }

    public static transition(_cmp: ComponentStateMachine<JOB>): void {
      console.log("ComponentGuard transits from ", _cmp.state);
    }
    public static action(_cmp: ComponentStateMachine<JOB>): void {
      console.log("ComponentGuard acts on ", _cmp.state);
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
  let guard: Guard = new Guard();
  guard.state = JOB.IDLE;
  guard.act();
  guard.transit(JOB.PATROL);
  guard.act();
  guard.transit(JOB.IDLE);
  guard.act();
  console.groupEnd();


  console.group("ComponentGuard");
  let cmpGuard: ComponentGuard = new ComponentGuard();
  cmpGuard.state = JOB.IDLE;
  cmpGuard.act();
  cmpGuard.transit(JOB.PATROL);
  cmpGuard.act();
  cmpGuard.transit(JOB.IDLE);
  cmpGuard.act();
  console.groupEnd();
}