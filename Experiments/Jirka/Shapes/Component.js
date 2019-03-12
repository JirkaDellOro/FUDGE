var Shapes;
(function (Shapes) {
    class Component {
        constructor() {
            this.singleton = false;
            this.parent = null;
        }
        getClassname() {
            return this.constructor.name;
        }
    }
    Shapes.Component = Component;
})(Shapes || (Shapes = {}));
//# sourceMappingURL=Component.js.map