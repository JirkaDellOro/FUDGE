// /<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../Aid/Build/FudgeAid"/>
var StateMachine;
// /<reference types="../../../Core/Build/FudgeCore"/>
///<reference types="../../../Aid/Build/FudgeAid"/>
(function (StateMachine) {
    let JOB;
    (function (JOB) {
        JOB[JOB["IDLE"] = 0] = "IDLE";
        JOB[JOB["PATROL"] = 1] = "PATROL";
        JOB[JOB["CHASE"] = 2] = "CHASE";
    })(JOB || (JOB = {}));
    var ƒAid = FudgeAid;
    class Guard extends ƒAid.StateMachine {
        constructor() {
            super();
            this.instructions = Guard.stateMachine;
        }
        static transit(_machine) {
            console.log(`${JOB[_machine.stateCurrent]} -> ${JOB[_machine.stateNext]} | Dedicated Transition`);
        }
        static transitDefault(_machine) {
            console.log(`${JOB[_machine.stateCurrent]} -> ${JOB[_machine.stateNext]} | Default Transition`);
        }
        static async actDefault(_machine) {
            console.log(`${JOB[_machine.stateCurrent]} | Default Action`);
            await new Promise(resolve => window.setTimeout(resolve, 1000));
            let random = Math.floor(Math.random() * Object.keys(JOB).length / 2);
            _machine.transit(JOB[JOB[random]]);
            _machine.act();
        }
        static async act(_machine) {
            console.log(`${JOB[_machine.stateCurrent]} | Dedicated Action`);
            Guard.actDefault(_machine);
        }
        static setupStateMachine() {
            let setup = new ƒAid.StateMachineInstructions();
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
    class ComponentGuard extends ƒAid.ComponentStateMachine {
        constructor() {
            super();
            this.instructions = ComponentGuard.stateMachine;
        }
        static transit(_machine) {
            console.log("ComponentGuard transits from ", _machine.stateCurrent);
        }
        static act(_machine) {
            console.log("ComponentGuard acts on ", _machine.stateCurrent);
        }
        static setupStateMachine() {
            let setup = new ƒAid.StateMachineInstructions();
            setup.setTransition(JOB.IDLE, JOB.PATROL, this.transit);
            setup.setTransition(JOB.PATROL, JOB.IDLE, this.transit);
            setup.setAction(JOB.IDLE, this.act);
            setup.setAction(JOB.PATROL, this.act);
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