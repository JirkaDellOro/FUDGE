"use strict";
var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    class View {
        constructor(_container, _state) {
            this.container = document.createElement("div");
            _container.getElement().append(this.container);
        }
    }
    GoldenLayoutTest.View = View;
    class ViewA extends View {
        constructor(_container, _state) {
            super(_container, _state);
            this.container.style.backgroundColor = "red";
            this.container.innerHTML = `<h2>${_state.text}</h2>`;
        }
    }
    GoldenLayoutTest.ViewA = ViewA;
    class ViewB extends View {
        constructor(_container, _state) {
            super(_container, _state);
            this.container.style.backgroundColor = "blue";
            this.container.innerHTML = `<h2>${_state.text}</h2>`;
        }
    }
    GoldenLayoutTest.ViewB = ViewB;
    class ViewC extends View {
        constructor(_container, _state) {
            super(_container, _state);
            this.container.style.backgroundColor = "green";
            this.container.innerHTML = `<h2>${_state.text}</h2>`;
        }
    }
    GoldenLayoutTest.ViewC = ViewC;
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=View.js.map