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
        static transit(_guard) {
            console.log(`${JOB[_guard.stateCurrent]} -> ${JOB[_guard.stateNext]} | Dedicated Transition`);
        }
        static transitDefault(_guard) {
            console.log(`${JOB[_guard.stateCurrent]} -> ${JOB[_guard.stateNext]} | Default Transition`);
        }
        static actDefault(_guard) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`${JOB[_guard.stateCurrent]} | Default Action`);
                yield new Promise(resolve => window.setTimeout(resolve, 1000));
                let random = Math.floor(Math.random() * Object.keys(JOB).length / 2);
                _guard.transit(JOB[JOB[random]]);
                _guard.actDefault();
            });
        }
        static act(_guard) {
            return __awaiter(this, void 0, void 0, function* () {
                console.log(`${JOB[_guard.stateCurrent]} | Dedicated Action`);
                Guard.actDefault(_guard);
            });
        }
        static setupStateMachine() {
            let setup = new StateMachine.StateMachine();
            setup.transitDefault = Guard.transitDefault;
            setup.actDefault = Guard.actDefault;
            setup.setTransition(JOB.IDLE, JOB.IDLE, this.transit);
            setup.setTransition(JOB.CHASE, JOB.CHASE, this.transit);
            //...
            setup.setAction(JOB.IDLE, this.act);
            setup.setAction(JOB.PATROL, this.act);
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
    guard.actDefault();
    // guard.act();
    // guard.transit(JOB.IDLE);
    // guard.act();
    console.groupEnd();
    console.group("ComponentGuard");
    let cmpGuard = new ComponentGuard();
    cmpGuard.stateCurrent = JOB.IDLE;
    cmpGuard.actDefault();
    cmpGuard.transit(JOB.PATROL);
    cmpGuard.actDefault();
    cmpGuard.transit(JOB.IDLE);
    cmpGuard.actDefault();
    console.groupEnd();
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=Test.js.map