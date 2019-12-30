///<reference types="../../../../Core/Build/FudgeCore"/>
var StateMachine;
(function (StateMachine) {
    let JOB;
    (function (JOB) {
        JOB[JOB["IDLE"] = 0] = "IDLE";
        JOB[JOB["PATROL"] = 1] = "PATROL";
        JOB[JOB["CHASE"] = 2] = "CHASE";
    })(JOB || (JOB = {}));
    class Guard extends StateMachine.StateMachineAgent {
        constructor() {
            super();
            this.stateMachine = Guard.stateMachine;
        }
        static transition(_cmp) {
            console.log("Guard transits from ", _cmp.state);
        }
        static action(_cmp) {
            console.log("Guard acts on ", _cmp.state);
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
    Guard.stateMachine = Guard.setupStateMachine();
    class ComponentGuard extends StateMachine.ComponentStateMachine {
        constructor() {
            super();
            this.stateMachine = ComponentGuard.stateMachine;
        }
        static transition(_cmp) {
            console.log("ComponentGuard transits from ", _cmp.state);
        }
        static action(_cmp) {
            console.log("ComponentGuard acts on ", _cmp.state);
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
    let guard = new Guard();
    guard.state = JOB.IDLE;
    guard.act();
    guard.transit(JOB.PATROL);
    guard.act();
    guard.transit(JOB.IDLE);
    guard.act();
    console.groupEnd();
    console.group("ComponentGuard");
    let cmpGuard = new ComponentGuard();
    cmpGuard.state = JOB.IDLE;
    cmpGuard.act();
    cmpGuard.transit(JOB.PATROL);
    cmpGuard.act();
    cmpGuard.transit(JOB.IDLE);
    cmpGuard.act();
    console.groupEnd();
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=Test.js.map