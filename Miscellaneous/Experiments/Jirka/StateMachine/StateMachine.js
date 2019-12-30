///<reference types="../../../../Core/Build/FudgeCore"/>
var StateMachine;
(function (StateMachine_1) {
    var ƒ = FudgeCore;
    class StateMachine extends Map {
        setTransition(_current, _next, _transition) {
            let active = this.getStateMethods(_current);
            active.transitions.set(_next, _transition);
        }
        setAction(_current, _action) {
            let active = this.getStateMethods(_current);
            active.action = _action;
        }
        transit(_current, _next, _cmpAgent) {
            let active = this.get(_current);
            let transition = active.transitions.get(_next);
            transition(_cmpAgent);
        }
        act(_current, _cmpAgent) {
            let active = this.get(_current);
            active.action(_cmpAgent);
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
    class ComponentStateMachine extends ƒ.ComponentScript {
        transit(_current, _next) {
            this.stateMachine.transit(_current, _next, this);
        }
        act(_current) {
            this.stateMachine.act(_current, this);
        }
    }
    StateMachine_1.ComponentStateMachine = ComponentStateMachine;
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=StateMachine.js.map