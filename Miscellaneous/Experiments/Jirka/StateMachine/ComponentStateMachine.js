///<reference types="../../../../Core/Build/FudgeCore"/>
var StateMachine;
(function (StateMachine) {
    var ƒ = FudgeCore;
    class ComponentStateMachine extends ƒ.ComponentScript {
        transit(_next) {
            this.stateMachine.transit(this.stateCurrent, _next, this);
        }
        act() {
            this.stateMachine.act(this.stateCurrent, this);
        }
    }
    StateMachine.ComponentStateMachine = ComponentStateMachine;
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=ComponentStateMachine.js.map