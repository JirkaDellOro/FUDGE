var GoldenLayoutTest;
(function (GoldenLayoutTest) {
    class SimpleComponent {
        constructor(container, state) {
            let element = document.createElement("span");
            element.innerHTML = "<h2>Hallo liebe Menschen, Ich funktioniere.</h2>";
            container.getElement().html(element);
        }
    }
    GoldenLayoutTest.SimpleComponent = SimpleComponent;
})(GoldenLayoutTest || (GoldenLayoutTest = {}));
//# sourceMappingURL=SimpleComponent.js.map