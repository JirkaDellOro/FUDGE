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
    class Guard extends StateMachine.ComponentStateMachine {
        constructor() {
            super();
            this.stateMachine = Guard.stateMachine;
        }
        static setupStateMachine() {
            let setup = new StateMachine.StateMachine();
            setup.setTransition(JOB.IDLE, JOB.PATROL, _cmp => ƒ.Debug.log("Transit from IDLE to PATROL"));
            setup.setTransition(JOB.PATROL, JOB.IDLE, _cmp => ƒ.Debug.log("Transit from PATROL to IDLE"));
            setup.setAction(JOB.IDLE, _cmp => ƒ.Debug.log("IDLE"));
            setup.setAction(JOB.PATROL, _cmp => ƒ.Debug.log("PATROL"));
            return setup;
        }
    }
    Guard.stateMachine = Guard.setupStateMachine();
    console.group("Guard");
    let cmpStateMachine = new Guard();
    cmpStateMachine.transit(JOB.IDLE, JOB.PATROL);
    cmpStateMachine.transit(JOB.PATROL, JOB.IDLE);
    cmpStateMachine.act(JOB.IDLE);
    cmpStateMachine.act(JOB.PATROL);
    console.groupEnd();
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=ComponentStateMachine.js.map