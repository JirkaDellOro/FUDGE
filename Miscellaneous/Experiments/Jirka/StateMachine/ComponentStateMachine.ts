///<reference types="../../../../Core/Build/FudgeCore"/>

namespace StateMachine {
  import ƒ = FudgeCore;

  enum JOB {
    IDLE, PATROL, CHASE
  }

  class Guard extends ComponentStateMachine<JOB> {
    private static stateMachine: StateMachine<JOB> = Guard.setupStateMachine();

    public constructor() {
      super();
      this.stateMachine = Guard.stateMachine;
    }

    private static setupStateMachine(): StateMachine<JOB> {
      let setup: StateMachine<JOB> = new StateMachine();
      setup.setTransition(JOB.IDLE, JOB.PATROL, _cmp => ƒ.Debug.log("Transit from IDLE to PATROL"));
      setup.setTransition(JOB.PATROL, JOB.IDLE, _cmp => ƒ.Debug.log("Transit from PATROL to IDLE"));
      setup.setAction(JOB.IDLE, _cmp => ƒ.Debug.log("IDLE"));
      setup.setAction(JOB.PATROL, _cmp => ƒ.Debug.log("PATROL"));
      return setup;
    }
  }
  
  console.group("Guard");
  let cmpStateMachine: Guard = new Guard();
  cmpStateMachine.transit(JOB.IDLE, JOB.PATROL);
  cmpStateMachine.transit(JOB.PATROL, JOB.IDLE);
  cmpStateMachine.act(JOB.IDLE);
  cmpStateMachine.act(JOB.PATROL);
  console.groupEnd();
}