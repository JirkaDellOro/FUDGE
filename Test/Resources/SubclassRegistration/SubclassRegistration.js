var SubclassRegistration;
(function (SubclassRegistration) {
    var ƒ = FudgeCore;
    console.group("Mesh");
    for (let subclass of ƒ.Mesh.subclasses)
        log(subclass, ƒ.Mesh);
    console.groupEnd();
    console.group("Component");
    for (let subclass of ƒ.Component.subclasses)
        log(subclass, ƒ.Component);
    console.groupEnd();
    console.group("Shader");
    for (let subclass of ƒ.Shader.subclasses)
        log(subclass, ƒ.Shader);
    console.groupEnd();
    function log(_class, _baseclass) {
        if (_class["baseClass"] == _baseclass)
            console.dir(_class);
        else
            console.warn(_class);
    }
})(SubclassRegistration || (SubclassRegistration = {}));
//# sourceMappingURL=SubclassRegistration.js.map