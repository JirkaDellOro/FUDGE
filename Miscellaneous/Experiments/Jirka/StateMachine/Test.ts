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

    public static transition(_guard: Guard): void {
      console.log(`Guard transits from ${JOB[_guard.stateCurrent]} to ${JOB[_guard.stateNext]}`);
    }
    public static async action(_guard: Guard): Promise<void> {
      console.log("Guard acts on ", JOB[_guard.stateCurrent]);
      await new Promise(resolve => window.setTimeout(resolve, 1000));
      // console.log("Guard finished on ", JOB[_guard.stateCurrent]);
      let random: number = Math.floor(Math.random() * Object.keys(JOB).length / 2);
      // console.log("Guard chooses ", random);
      _guard.transit(JOB[JOB[random]]);
      _guard.act();
    }

    private static setupStateMachine(): StateMachine<JOB> {
      let setup: StateMachine<JOB> = new StateMachine();
      setup.transitDefault = Guard.transition;
      setup.actDefault = Guard.action;
      setup.setTransition(JOB.IDLE, JOB.IDLE, this.transition);
      setup.setTransition(JOB.CHASE, JOB.CHASE, this.transition);
      //...
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

    public static transition(_cmp: ComponentGuard): void {
      console.log("ComponentGuard transits from ", _cmp.stateCurrent);
    }
    public static action(_cmp: ComponentGuard): void {
      console.log("ComponentGuard acts on ", _cmp.stateCurrent);
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
  guard.stateCurrent = JOB.IDLE;
  guard.act();
  // guard.act();
  // guard.transit(JOB.IDLE);
  // guard.act();
  console.groupEnd();


  console.group("ComponentGuard");
  let cmpGuard: ComponentGuard = new ComponentGuard();
  cmpGuard.stateCurrent = JOB.IDLE;
  cmpGuard.act();
  cmpGuard.transit(JOB.PATROL);
  cmpGuard.act();
  cmpGuard.transit(JOB.IDLE);
  cmpGuard.act();
  console.groupEnd();
}