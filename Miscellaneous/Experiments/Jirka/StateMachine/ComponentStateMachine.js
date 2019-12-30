///<reference types="../../../../Core/Build/FudgeCore"/>
var StateMachine;
(function (StateMachine) {
    var ƒ = FudgeCore;
    let JOB;
    (function (JOB) {
        JOB[JOB["IDLE"] = 0] = "IDLE";
        JOB[JOB["PATROL"] = 1] = "PATROL";
        JOB[JOB["CHASE"] = 2] = "CHASE";
    })(JOB || (JOB = {}));
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
    class Guard2 extends StateMachine.ComponentStateMachine {
        constructor() {
            super();
            this.stateMachineMap = Guard2.stateMachineMap;
        }
        static getInstructions() {
            let instructions = new StateMachine.StateMachineMap();
            instructions.setTransition(JOB.IDLE, JOB.PATROL, _node => ƒ.Debug.log("Transit from IDLE to PATROL"));
            instructions.setTransition(JOB.PATROL, JOB.IDLE, _node => ƒ.Debug.log("Transit from PATROL to IDLE"));
            return instructions;
        }
    }
    Guard2.stateMachineMap = Guard2.getInstructions();
    // let node: ƒ.Node = new ƒ.Node("StateMachine");
    // node.addComponent(cmpStateMachine1);
    // ƒ.Debug.log(node);
    // console.group("Guard1");
    // let cmpStateMachine1: Guard1 = new Guard1();
    // cmpStateMachine1.stateMachine.transit(JOB.IDLE, JOB.PATROL, cmpStateMachine1);
    // cmpStateMachine1.stateMachine.transit(JOB.PATROL, JOB.IDLE, cmpStateMachine1);
    // console.groupEnd();
    console.group("Guard2");
    let cmpStateMachine2 = new Guard2();
    cmpStateMachine2.stateMachineMap.transit(JOB.IDLE, JOB.PATROL, cmpStateMachine2);
    cmpStateMachine2.stateMachineMap.transit(JOB.PATROL, JOB.IDLE, cmpStateMachine2);
    console.groupEnd();
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=ComponentStateMachine.js.map