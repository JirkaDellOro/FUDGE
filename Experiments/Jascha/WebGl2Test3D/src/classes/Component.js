var WebGl2Test3D;
(function (WebGl2Test3D) {
    var Component = /** @class */ (function () {
        function Component() {
            parent = null;
        }
        Component.prototype.setName = function (_name) {
            this.name = _name;
        };
        Component.prototype.getName = function () {
            return this.name;
        };
        Component.prototype.getParent = function () {
            return this.parent;
        };
        Component.prototype.setParent = function (_parent) {
            this.parent = _parent;
        };
        return Component;
    }());
    WebGl2Test3D.Component = Component;
})(WebGl2Test3D || (WebGl2Test3D = {}));
//# sourceMappingURL=Component.js.map