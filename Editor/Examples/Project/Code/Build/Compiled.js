"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    class ComponentCustom extends ƒ.Component {
        constructor() {
            super();
            console.log("I've even been constructed");
        }
        static showCompileMessage() {
            let message = "I've been compiled and should show up in the context menus";
            ComponentCustom.message = message;
            console.log(ComponentCustom.message);
            return message;
        }
    }
    ComponentCustom.iSubclass = ƒ.Component.registerSubclass(ComponentCustom);
    ComponentCustom.message = ComponentCustom.showCompileMessage();
    Script.ComponentCustom = ComponentCustom;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class NoComponentScript {
        static showCompileMessage() {
            let message = "I've been compiled! But I won't show in the Component...";
            NoComponentScript.message = message;
            console.log(NoComponentScript.message);
            return message;
        }
    }
    NoComponentScript.message = NoComponentScript.showCompileMessage();
    Script.NoComponentScript = NoComponentScript;
})(Script || (Script = {}));
var Script2;
(function (Script2) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script2);
    class SubScript {
        static showCompileMessage() {
            let message = "I've been compiled! But I won't show in the Component...";
            SubScript.message = message;
            console.log(SubScript.message);
            return message;
        }
    }
    SubScript.message = SubScript.showCompileMessage();
    Script2.SubScript = SubScript;
})(Script2 || (Script2 = {}));
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
            // public static readonly iSubclass: number = ƒ.Component.registerSubclass(TimerMessage);
            this.prefix = "Script: ";
            this.count = 0;
            this.hndTimer = (_event) => {
                console.log(this.prefix + this.count++);
            };
            this.hndAddComponent = (_event) => {
                this.#timer = new ƒ.Timer(ƒ.Time.game, 1000, 0, this.hndTimer);
            };
            this.hndRemoveComponent = (_event) => {
                this.#timer.clear();
                this.removeEventListener("componentAdd" /* COMPONENT_ADD */, this.hndAddComponent);
                this.removeEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndRemoveComponent);
            };
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndAddComponent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndRemoveComponent);
        }
        #timer;
    }
    Script.TimerMessage = TimerMessage;
})(Script || (Script = {}));
//# sourceMappingURL=Compiled.js.map