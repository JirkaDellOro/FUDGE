///<reference types="../../Aid/Build/FudgeAid"/>

namespace StateMachine {
  enum JOB {
    IDLE, PATROL, CHASE
  }

  import ƒAid = FudgeAid;
  type GuardMachine = ƒAid.StateMachine<JOB>;
  window.addEventListener("load", start);

  /**
   * Instruction set to be used by StateMachine and ComponentStateMachine for this test.
   * In production code, the instructions are most likely defined within the state machines.
   */
  class GuardInstructions {
    public static get(): ƒAid.StateMachineInstructions<JOB> {
      let setup: ƒAid.StateMachineInstructions<JOB> = new ƒAid.StateMachineInstructions();
      setup.transitDefault = GuardInstructions.transitDefault;
      setup.actDefault = GuardInstructions.actDefault;
      setup.setTransition(JOB.CHASE, JOB.CHASE, this.transit);
      setup.setAction(JOB.CHASE, this.act);
      return setup;
    }

    private static transitDefault(_machine: GuardMachine): void {
      log(_machine, `Default Transition   ${JOB[_machine.stateCurrent]} -> ${JOB[_machine.stateNext]}`);
    }

    private static async actDefault(_machine: GuardMachine): Promise<void> {
      log(_machine, `Default Action       ${JOB[_machine.stateCurrent]}`);
      await new Promise(resolve => window.setTimeout(resolve, 1000));
      let random: number = Math.floor(Math.random() * Object.keys(JOB).length / 2);
      _machine.transit(JOB[JOB[random]]);
      _machine.act();
    }

    private static transit(_machine: GuardMachine): void {
      log(_machine, `Special Transition ! ${JOB[_machine.stateCurrent]} -> ${JOB[_machine.stateNext]}`);
    }

    private static async act(_machine: GuardMachine): Promise<void> {
      log(_machine, `Special Action     ! ${JOB[_machine.stateCurrent]}`);
      GuardInstructions.actDefault(_machine);
    }
  }

  class Guard extends ƒAid.StateMachine<JOB> {
    private static instructions: ƒAid.StateMachineInstructions<JOB> = GuardInstructions.get();

    public constructor() {
      super();
      this.instructions = Guard.instructions;
    }
  }

  class ComponentGuard extends ƒAid.ComponentStateMachine<JOB> {
    private static instructions: ƒAid.StateMachineInstructions<JOB> = GuardInstructions.get();

    public constructor() {
      super();
      this.instructions = ComponentGuard.instructions;
    }
  }


  function start(): void {
    let guard: Guard = new Guard();
    guard.act();

    let cmpGuard: ComponentGuard = new ComponentGuard();
    cmpGuard.act();
  }

  function log(_machine: GuardMachine, _message: string): void {
    let textarea: HTMLTextAreaElement = document.querySelector(`textarea#${_machine.constructor.name}`);
    textarea.value += _message + "\n";
    textarea.scrollTop = textarea.scrollHeight;
  }
}