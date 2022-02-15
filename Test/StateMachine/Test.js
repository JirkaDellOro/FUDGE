///<reference types="../../Aid/Build/FudgeAid"/>
var StateMachine;
///<reference types="../../Aid/Build/FudgeAid"/>
(function (StateMachine) {
    let JOB;
    (function (JOB) {
        JOB[JOB["IDLE"] = 0] = "IDLE";
        JOB[JOB["PATROL"] = 1] = "PATROL";
        JOB[JOB["CHASE"] = 2] = "CHASE";
    })(JOB || (JOB = {}));
    var ƒAid = FudgeAid;
    window.addEventListener("load", start);
    /**
     * Instruction set to be used by StateMachine and ComponentStateMachine for this test.
     * In production code, the instructions are most likely defined within the state machines.
     */
    class GuardInstructions {
        static get() {
            let setup = new ƒAid.StateMachineInstructions();
            setup.transitDefault = GuardInstructions.transitDefault;
            setup.actDefault = GuardInstructions.actDefault;
            setup.setTransition(JOB.CHASE, JOB.CHASE, this.transit);
            setup.setAction(JOB.CHASE, this.act);
            return setup;
        }
        static transitDefault(_machine) {
            log(_machine, `Default Transition   ${JOB[_machine.stateCurrent]} -> ${JOB[_machine.stateNext]}`);
        }
        static async actDefault(_machine) {
            log(_machine, `Default Action       ${JOB[_machine.stateCurrent]}`);
            await new Promise(resolve => window.setTimeout(resolve, 1000));
            let random = Math.floor(Math.random() * Object.keys(JOB).length / 2);
            _machine.transit(JOB[JOB[random]]);
            _machine.act();
        }
        static transit(_machine) {
            log(_machine, `Special Transition ! ${JOB[_machine.stateCurrent]} -> ${JOB[_machine.stateNext]}`);
        }
        static async act(_machine) {
            log(_machine, `Special Action     ! ${JOB[_machine.stateCurrent]}`);
            GuardInstructions.actDefault(_machine);
        }
    }
    class Guard extends ƒAid.StateMachine {
        static instructions = GuardInstructions.get();
        constructor() {
            super();
            this.instructions = Guard.instructions;
        }
    }
    class ComponentGuard extends ƒAid.ComponentStateMachine {
        static instructions = GuardInstructions.get();
        constructor() {
            super();
            this.instructions = ComponentGuard.instructions;
        }
    }
    function start() {
        let guard = new Guard();
        guard.act();
        let cmpGuard = new ComponentGuard();
        cmpGuard.act();
    }
    function log(_machine, _message) {
        let textarea = document.querySelector(`textarea#${_machine.constructor.name}`);
        textarea.value += _message + "\n";
        textarea.scrollTop = textarea.scrollHeight;
    }
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=Test.js.map