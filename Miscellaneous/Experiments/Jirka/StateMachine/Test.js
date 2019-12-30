///<reference types="../../../../Core/Build/FudgeCore"/>
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        static transition(_guard) {
            console.log(`Guard transits from ${JOB[_guard.stateCurrent]} to ${JOB[_guard.stateNext]}`);
        }
        static action(_guard) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log("Guard acts on ", JOB[_guard.stateCurrent]);
                yield new Promise(resolve => window.setTimeout(resolve, 1000));
                // console.log("Guard finished on ", JOB[_guard.stateCurrent]);
                let random = Math.floor(Math.random() * Object.keys(JOB).length / 2);
                // console.log("Guard chooses ", random);
                _guard.transit(JOB[JOB[random]]);
                _guard.act();
            });
        }
        static setupStateMachine() {
            let setup = new StateMachine.StateMachine();
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
    Guard.stateMachine = Guard.setupStateMachine();
    class ComponentGuard extends StateMachine.ComponentStateMachine {
        constructor() {
            super();
            this.stateMachine = ComponentGuard.stateMachine;
        }
        static transition(_cmp) {
            console.log("ComponentGuard transits from ", _cmp.stateCurrent);
        }
        static action(_cmp) {
            console.log("ComponentGuard acts on ", _cmp.stateCurrent);
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
    guard.stateCurrent = JOB.IDLE;
    guard.act();
    // guard.act();
    // guard.transit(JOB.IDLE);
    // guard.act();
    console.groupEnd();
    console.group("ComponentGuard");
    let cmpGuard = new ComponentGuard();
    cmpGuard.stateCurrent = JOB.IDLE;
    cmpGuard.act();
    cmpGuard.transit(JOB.PATROL);
    cmpGuard.act();
    cmpGuard.transit(JOB.IDLE);
    cmpGuard.act();
    console.groupEnd();
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=Test.js.map