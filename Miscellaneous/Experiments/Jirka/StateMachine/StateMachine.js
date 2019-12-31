///<reference types="../../../../Core/Build/FudgeCore"/>
var StateMachine;
(function (StateMachine_1) {
    class StateMachineAgent {
        transit(_next) {
            this.stateMachine.transit(this.stateCurrent, _next, this);
        }
        actDefault() {
            this.stateMachine.act(this.stateCurrent, this);
        }
    }
    StateMachine_1.StateMachineAgent = StateMachineAgent;
    class StateMachine extends Map {
        setTransition(_current, _next, _transition) {
            let active = this.getStateMethods(_current);
            active.transitions.set(_next, _transition);
        }
        setAction(_current, _action) {
            let active = this.getStateMethods(_current);
            active.action = _action;
        }
        transitDefault(_agent) {
            //
        }
        actDefault(_agent) {
            //
        }
        transit(_current, _next, _agent) {
            _agent.stateNext = _next;
            try {
                let active = this.get(_current);
                let transition = active.transitions.get(_next);
                transition(_agent);
            }
            catch (_error) {
                console.info(_error.message);
                this.transitDefault(_agent);
            }
            finally {
                _agent.stateCurrent = _next;
                _agent.stateNext = undefined;
            }
        }
        act(_current, _agent) {
            try {
                let active = this.get(_current);
                active.action(_agent);
            }
            catch (_error) {
                console.info(_error.message);
                this.actDefault(_agent);
            }
        }
        getStateMethods(_current) {
            let active = this.get(_current);
            if (!active) {
                active = { action: null, transitions: new Map() };
                this.set(_current, active);
            }
            return active;
        }
    }
    StateMachine_1.StateMachine = StateMachine;
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=StateMachine.js.map