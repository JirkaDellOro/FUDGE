"use strict";
// /<reference types="../../../../../Core/Build/FudgeCore"/>
var Script;
// /<reference types="../../../../../Core/Build/FudgeCore"/>
(function (Script) {
    var ƒ = FudgeCore;
    // ƒ.Serializer.registerNamespace(Script);
    ƒ.Project.registerScriptNamespace(Script);
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
                this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndAddComponent);
                this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndRemoveComponent);
            };
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndAddComponent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndRemoveComponent);
        }
    }
    Script.TimerMessage = TimerMessage;
    class NoComponentScript {
        static showCompileMessage() {
            let message = "I've been compiled! But I won't show in the ComponentScripts...";
            NoComponentScript.message = message;
            console.log(NoComponentScript.message);
            return message;
        }
    }
    NoComponentScript.message = NoComponentScript.showCompileMessage();
    Script.NoComponentScript = NoComponentScript;
})(Script || (Script = {}));
//# sourceMappingURL=Compiled.js.map