var Shapes;
(function (Shapes) {
    class Component {
        constructor(_name, _singleton) {
            this.singleton = false;
            this.type = "";
            this.parent = null;
            this.singleton = _singleton;
            this.type = _name;
        }
    }
    Shapes.Component = Component;
})(Shapes || (Shapes = {}));
//# sourceMappingURL=Component.js.map