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
            this.content.innerHTML = "<h1>View A my friends</h1>";
        }
    }
    GLEventTest.ViewA = ViewA;
})(GLEventTest || (GLEventTest = {}));
//# sourceMappingURL=ViewA.js.map