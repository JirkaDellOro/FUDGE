"use strict";
var GLEventTest;
(function (GLEventTest) {
    class ViewB extends GLEventTest.View {
        constructor(_parent) {
            super(_parent);
            this.config.title = "View B";
            this.addEvents();
        }
        fillContent() {
            this.content = document.createElement("div");
            this.content.innerHTML = "<h1>This is View B</h1>";
        }
        addEvents() {
            this.parentPanel.addEventListener("change", this.changeHandler.bind(this));
        }
        changeHandler(_e) {
            this.content.innerHTML = "<h1>There was a click!</h1>";
            console.log(_e.detail);
            this.content.appendChild(_e.detail);
        }
    }
    GLEventTest.ViewB = ViewB;
})(GLEventTest || (GLEventTest = {}));
//# sourceMappingURL=ViewB.js.map