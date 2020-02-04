///<reference types="../../../../Core/Build/FudgeCore"/>

namespace StateMachine {
  enum JOB {
    IDLE, PATROL, CHASE
  }

  class Guard extends StateMachine<JOB> {
    private static stateMachine: StateMachineInstructions<JOB> = Guard.setupStateMachine();

    public constructor() {
      super();
      this.stateMachine = Guard.stateMachine;
    }

    public static transit(_machine: Guard): void {
      console.log(`${JOB[_machine.stateCurrent]} -> ${JOB[_machine.stateNext]} | Dedicated Transition`);
    }
    
    public static transitDefault(_machine: Guard): void {
      console.log(`${JOB[_machine.stateCurrent]} -> ${JOB[_machine.stateNext]} | Default Transition`);
    }

    public static async actDefault(_machine: Guard): Promise<void> {
      console.log(`${JOB[_machine.stateCurrent]} | Default Action`);
      await new Promise(resolve => window.setTimeout(resolve, 1000));
      let random: number = Math.floor(Math.random() * Object.keys(JOB).length / 2);
      _machine.transit(JOB[JOB[random]]);
      _machine.act();
    }

    public static async act(_machine: Guard): Promise<void> {
      console.log(`${JOB[_machine.stateCurrent]} | Dedicated Action`);
      Guard.actDefault(_machine);
    }

    private static setupStateMachine(): StateMachineInstructions<JOB> {
      let setup: StateMachineInstructions<JOB> = new StateMachineInstructions();
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
    private static stateMachine: StateMachineInstructions<JOB> = ComponentGuard.setupStateMachine();

    public constructor() {
      super();
      this.stateMachine = ComponentGuard.stateMachine;
    }

    public static transit(_machine: ComponentGuard): void {
      console.log("ComponentGuard transits from ", _machine.stateCurrent);
    }
    public static act(_machine: ComponentGuard): void {
      console.log("ComponentGuard acts on ", _machine.stateCurrent);
    }

    private static setupStateMachine(): StateMachineInstructions<JOB> {
      let setup: StateMachineInstructions<JOB> = new StateMachineInstructions();
      setup.setTransition(JOB.IDLE, JOB.PATROL, this.transit);
      setup.setTransition(JOB.PATROL, JOB.IDLE, this.transit);
      setup.setAction(JOB.IDLE, this.act);
      setup.setAction(JOB.PATROL, this.act);
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