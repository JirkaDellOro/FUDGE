///<reference types="../../../../Core/Build/FudgeCore"/>
var StateMachine;
(function (StateMachine_1) {
    class StateMachine extends Map {
        setTransition(_current, _next, _transition) {
            let active = this.getStateMethods(_current);
            active.transitions.set(_next, _transition);
        }
        setAction(_current, _action) {
            let active = this.getStateMethods(_current);
            active.action = _action;
        }
        transit(_current, _next, _agent) {
            let active = this.get(_current);
            let transition = active.transitions.get(_next);
            transition(_agent);
            _agent.state = _next;
        }
        act(_current, _agent) {
            let active = this.get(_current);
            active.action(_agent);
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