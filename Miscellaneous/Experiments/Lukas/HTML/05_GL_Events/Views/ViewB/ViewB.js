"use strict";
var GLEventTest;
(function (GLEventTest) {
    class ViewB extends GLEventTest.View {
        fillContent() {
            this.content = document.createElement("div");
            this.content.innerHTML = "<h1>This is View B</h1>";
        }
    }
    GLEventTest.ViewB = ViewB;
})(GLEventTest || (GLEventTest = {}));
//# sourceMappingURL=ViewB.js.map