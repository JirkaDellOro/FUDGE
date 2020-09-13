var ResourceManager;
(function (ResourceManager) {
    var ƒ = FudgeCore;
    class Script extends ƒ.ComponentScript {
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
            };
            this.addEventListener("componentAdd" /* COMPONENT_ADD */, this.hndAddComponent);
            this.addEventListener("componentRemove" /* COMPONENT_REMOVE */, this.hndRemoveComponent);
        }
    }
    ResourceManager.Script = Script;
})(ResourceManager || (ResourceManager = {}));
//# sourceMappingURL=Script.js.map