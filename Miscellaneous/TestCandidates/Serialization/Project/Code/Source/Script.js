// /<reference types="../../../../../Core/Build/FudgeCore"/>
var Script;
// /<reference types="../../../../../Core/Build/FudgeCore"/>
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Serializer.registerNamespace(Script);
    class TimerMessage extends ƒ.ComponentScript {
        constructor() {
            super();
            this.prefix = "Script: ";
            this.count = 0;
            this.hndTimer = (_event) => {
                console.log(this.prefix + this.count++);
            };
            this.hndAddComponent = (_event) => {
                this.timer = new ƒ.Timer(ƒ.Time.game, 1000, 0, this.hndTimer);
            };
            this.hndRemoveComponent = (_event) => {
                this.timer.clear();
                this.removeEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndAddComponent);
                this.removeEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndRemoveComponent);
            };
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener(ƒ.EVENT.COMPONENT_ADD, this.hndAddComponent);
            this.addEventListener(ƒ.EVENT.COMPONENT_REMOVE, this.hndRemoveComponent);
        }
    }
    Script.TimerMessage = TimerMessage;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map