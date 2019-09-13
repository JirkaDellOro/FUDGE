"use strict";
var GLEventTest;
(function (GLEventTest) {
    class ViewA extends GLEventTest.View {
        constructor(_parent) {
            super(_parent);
            this.config.title = "View A";
        }
        fillContent() {
            super.fillContent();
            let button = document.createElement("button");
            button.innerText = "click me";
            button.addEventListener("click", this.handleButtonClick.bind(this));
            this.content.appendChild(button);
            // this.content.innerHTML = "<h1>View A my friends</h1>";
        }
        handleButtonClick(_e) {
            console.log(_e.target);
            let e = new CustomEvent("change", { detail: _e.target });
            this.parentPanel.dispatchEvent(e);
        }
    }
    GLEventTest.ViewA = ViewA;
})(GLEventTest || (GLEventTest = {}));
//# sourceMappingURL=ViewA.js.map