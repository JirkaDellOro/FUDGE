///<reference types="../../../../Core/Build/FudgeCore"/>
var StateMachine;
(function (StateMachine) {
    let JOB;
    (function (JOB) {
        JOB[JOB["IDLE"] = 0] = "IDLE";
        JOB[JOB["PATROL"] = 1] = "PATROL";
        JOB[JOB["CHASE"] = 2] = "CHASE";
    })(JOB || (JOB = {}));
    class Guard {
        constructor() {
            super();
            this.stateMachine = ComponentGuard.stateMachine;
        }
    }
    class ComponentGuard extends StateMachine.ComponentStateMachine {
        constructor() {
            super();
            this.stateMachine = ComponentGuard.stateMachine;
        }
        static transition(_cmp) {
            console.log("Transition from ", _cmp.state);
        }
        static action(_cmp) {
            console.log("Action on ", _cmp.state);
        }
        static setupStateMachine() {
            let setup = new StateMachine.StateMachine();
            setup.setTransition(JOB.IDLE, JOB.PATROL, this.transition);
            setup.setTransition(JOB.PATROL, JOB.IDLE, this.transition);
            setup.setAction(JOB.IDLE, this.action);
            setup.setAction(JOB.PATROL, this.action);
            return setup;
        }
    }
    ComponentGuard.stateMachine = ComponentGuard.setupStateMachine();
    console.group("Guard");
    let cmpStateMachine = new ComponentGuard();
    cmpStateMachine.state = JOB.IDLE;
    cmpStateMachine.act();
    cmpStateMachine.transit(JOB.PATROL);
    cmpStateMachine.act();
    cmpStateMachine.transit(JOB.IDLE);
    cmpStateMachine.act();
    console.groupEnd();
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=Test.js.map