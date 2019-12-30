///<reference types="../../../../Core/Build/FudgeCore"/>
var StateMachine;
(function (StateMachine) {
    var ƒ = FudgeCore;
    class ComponentStateMachine extends ƒ.ComponentScript {
        transit(_next) {
            this.stateMachine.transit(this.state, _next, this);
        }
        act() {
            this.stateMachine.act(this.state, this);
        }
    }
    StateMachine.ComponentStateMachine = ComponentStateMachine;
})(StateMachine || (StateMachine = {}));
//# sourceMappingURL=ComponentStateMachine.js.map