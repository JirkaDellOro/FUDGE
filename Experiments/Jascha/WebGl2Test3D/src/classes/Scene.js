var WebGl2Test3D;
(function (WebGl2Test3D) {
    var Scene = /** @class */ (function () {
        function Scene(_name) {
            this.setName(_name);
            this.sceneObjects = [];
        }
        Scene.prototype.getName = function () {
            return this.name;
        };
        Scene.prototype.setName = function (_name) {
            this.name = _name;
        };
        Scene.prototype.addSceneObject = function (_sceneObject) {
            this.sceneObjects.push(_sceneObject);
        };
        Scene.prototype.removeSceneObject = function (_name) {
            var sceneObject;
            for (var i = 0; i < this.sceneObjects.length; i++) {
                if (this.sceneObjects[i].getName() == _name) {
                    sceneObject = this.sceneObjects[i];
                    console.log(sceneObject);
                    return sceneObject;
                }
            }
            if (sceneObject == undefined) {
                throw new Error("Unable to find sceneobject named  '" + _name + "'in FudgeNode named '" + this.getName() + "'");
            }
        };
        Scene.prototype.draw = function () {
            WebGl2Test3D.gl2.viewport(0, 0, WebGl2Test3D.gl2.canvas.width, WebGl2Test3D.gl2.canvas.height);
            WebGl2Test3D.gl2.clearColor(0, 0, 0, 0);
            WebGl2Test3D.gl2.clear(WebGl2Test3D.gl2.COLOR_BUFFER_BIT);
        };
        return Scene;
    }());
    WebGl2Test3D.Scene = Scene;
})(WebGl2Test3D || (WebGl2Test3D = {}));
//# sourceMappingURL=Scene.js.map