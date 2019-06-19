/// <reference path="../../../../../Core/build/Fudge.d.ts"/>
var UI;
(function (UI) {
    class MutableUI {
        constructor() {
            this.updateInterval = 30;
            window.setInterval(this.updateMutator, this.updateInterval);
        }
        resetUpdateInterval() {
            window.clearInterval();
            window.setInterval(this.updateMutator, this.updateInterval);
        }
    }
    UI.MutableUI = MutableUI;
})(UI || (UI = {}));
//# sourceMappingURL=MutableUI.js.map