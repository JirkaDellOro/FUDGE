///<reference types="../../../../Core/Build/FudgeCore"/>

namespace StateMachine {
  import ƒ = FudgeCore;

  enum JOB {
    IDLE, PATROL, CHASE
  }

  // class Guard1 extends ƒ.ComponentScript implements StateMachineAgent<JOB>{
  //   private static stateMachine: StateMachine<JOB> = Guard1.getInstructions();
  //   public state: JOB;
  //   public stateMachine: StateMachine<JOB> = Guard1.stateMachine;

  //   public constructor() {
  //     super();
  //   }

  //   private static getInstructions(): StateMachine<JOB> {
  //     let instructions: StateMachine<JOB> = new StateMachine<JOB>();
  //     instructions.setTransition(JOB.IDLE, JOB.PATROL, _node => ƒ.Debug.log("Transit from IDLE to PATROL"));
  //     instructions.setTransition(JOB.PATROL, JOB.IDLE, _node => ƒ.Debug.log("Transit from PATROL to IDLE"));
  //     return instructions;
  //   }
  // }

  class Guard2 extends ComponentStateMachine<JOB> {
    private static stateMachineMap: StateMachineMap<JOB> = Guard2.getInstructions();

    public constructor() {
      super();
      this.stateMachineMap = Guard2.stateMachineMap;
    }

    private static getInstructions(): StateMachineMap<JOB> {
      let instructions: StateMachineMap<JOB> = new StateMachineMap();
      instructions.setTransition(JOB.IDLE, JOB.PATROL, _node => ƒ.Debug.log("Transit from IDLE to PATROL"));
      instructions.setTransition(JOB.PATROL, JOB.IDLE, _node => ƒ.Debug.log("Transit from PATROL to IDLE"));
      return instructions;
    }
  }

  

  // let node: ƒ.Node = new ƒ.Node("StateMachine");
  // node.addComponent(cmpStateMachine1);
  // ƒ.Debug.log(node);
  
  // console.group("Guard1");
  // let cmpStateMachine1: Guard1 = new Guard1();
  // cmpStateMachine1.stateMachine.transit(JOB.IDLE, JOB.PATROL, cmpStateMachine1);
  // cmpStateMachine1.stateMachine.transit(JOB.PATROL, JOB.IDLE, cmpStateMachine1);
  // console.groupEnd();
  
  console.group("Guard2");
  let cmpStateMachine2: Guard2 = new Guard2();
  cmpStateMachine2.stateMachineMap.transit(JOB.IDLE, JOB.PATROL, cmpStateMachine2);
  cmpStateMachine2.stateMachineMap.transit(JOB.PATROL, JOB.IDLE, cmpStateMachine2);
  console.groupEnd();
}