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

    public static transit(_guard: Guard): void {
      console.log(`${JOB[_guard.stateCurrent]} -> ${JOB[_guard.stateNext]} | Dedicated Transition`);
    }
    
    public static transitDefault(_guard: Guard): void {
      console.log(`${JOB[_guard.stateCurrent]} -> ${JOB[_guard.stateNext]} | Default Transition`);
    }

    public static async actDefault(_guard: Guard): Promise<void> {
      console.log(`${JOB[_guard.stateCurrent]} | Default Action`);
      await new Promise(resolve => window.setTimeout(resolve, 1000));
      let random: number = Math.floor(Math.random() * Object.keys(JOB).length / 2);
      _guard.transit(JOB[JOB[random]]);
      _guard.actDefault();
    }

    public static async act(_guard: Guard): Promise<void> {
      console.log(`${JOB[_guard.stateCurrent]} | Dedicated Action`);
      Guard.actDefault(_guard);
    }

    private static setupStateMachine(): StateMachine<JOB> {
      let setup: StateMachine<JOB> = new StateMachine();
      setup.transitDefault = Guard.transitDefault ;
      setup.actDefault = Guard.actDefault;
      setup.setTransition(JOB.IDLE, JOB.IDLE, this.transit);
      setup.setTransition(JOB.CHASE, JOB.CHASE, this.transit);
      //...
      setup.setAction(JOB.IDLE, this.act);
      setup.setAction(JOB.PATROL, this.act);
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
  guard.actDefault();
  // guard.act();
  // guard.transit(JOB.IDLE);
  // guard.act();
  console.groupEnd();


  console.group("ComponentGuard");
  let cmpGuard: ComponentGuard = new ComponentGuard();
  cmpGuard.stateCurrent = JOB.IDLE;
  cmpGuard.actDefault();
  cmpGuard.transit(JOB.PATROL);
  cmpGuard.actDefault();
  cmpGuard.transit(JOB.IDLE);
  cmpGuard.actDefault();
  console.groupEnd();
}