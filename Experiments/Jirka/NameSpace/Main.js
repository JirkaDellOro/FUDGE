var NamespaceRegistrar;
(function (NamespaceRegistrar) {
    class Registrar {
        static reconstruct(_path) {
            let typeName = _path.substr(_path.lastIndexOf(".") + 1);
            let namespace = Registrar.getNamespace(_path);
            let reconstruction = new namespace[typeName];
            return reconstruction;
        }
        static registerNamespace(_namespace) {
            for (let name in Registrar.namespaces)
                if (Registrar.namespaces[name] == _namespace)
                    return;
            let name = Registrar.findNamespaceIn(_namespace, window);
            if (!name)
                for (let parentName in Registrar.namespaces) {
                    name = Registrar.findNamespaceIn(_namespace, Registrar.namespaces[parentName]);
                    if (name) {
                        name = parentName + "." + name;
                        break;
                    }
                }
            if (!name)
                throw ("Namespace not found. Maybe parent namespace hasn't been registered before?");
            Registrar.namespaces[name] = _namespace;
        }
        static getFullPath(_object) {
            let typeName = _object.constructor.name;
            console.log("Searching namespace of: " + typeName);
            for (let namespaceName in Registrar.namespaces) {
                if (_object instanceof Registrar.namespaces[namespaceName][typeName])
                    return namespaceName + "." + typeName;
            }
            return null;
        }
        static getNamespace(_path) {
            let namespaceName = _path.substr(0, _path.lastIndexOf("."));
            return Registrar.namespaces[namespaceName];
        }
        static findNamespaceIn(_namespace, _parent) {
            for (let prop in _parent)
                if (_parent[prop] == _namespace)
                    return prop;
            return null;
        }
    }
    Registrar.namespaces = {};
    NamespaceRegistrar.Registrar = Registrar;
})(NamespaceRegistrar || (NamespaceRegistrar = {}));
var NamespaceReflection;
(function (NamespaceReflection) {
    window.addEventListener("load", test);
    function test(_event) {
        console.group("A");
        console.dir(NamespaceReflection.ClassA.getNamespace());
        console.dir(NamespaceReflection.ClassA.args);
        console.groupEnd();
        console.group("B");
        console.dir(NamespaceReflection.ClassB.args);
        console.dir(NamespaceReflection.ClassB.getNamespace());
        console.groupEnd();
        console.group("C");
        console.dir(NamespaceReflection.ClassC["ƒnamespace"]);
        console.dir(NamespaceReflection.ClassC.getNamespace());
        console.dir(NamespaceReflection.ClassC.getNamespace());
        console.groupEnd();
        console.log("Namespace Registration ------------------- ");
        let a = new NamespaceReflection.ClassA();
        let a2 = new NamespaceReflection2.ClassA();
        let nested = new NamespaceReflection2.NamespaceReflectionNested.ClassA();
        testNamespaceRegistration(a, "a");
        testNamespaceRegistration(a2, "a2");
        testNamespaceRegistration(nested, "nested");
        let o = new window["NamespaceReflection2"]["NamespaceReflectionNested"]["ClassA"];
        console.log("Reconstruction: ", o);
    }
    function testNamespaceRegistration(_o, _name) {
        console.group(_name);
        let path = NamespaceRegistrar.Registrar.getFullPath(_o);
        let namespace;
        namespace = NamespaceRegistrar.Registrar.getNamespace(path);
        let reconstruction = new namespace[_o.constructor.name];
        let reconViaPath = NamespaceRegistrar.Registrar.reconstruct(path);
        console.log("Path: ", path);
        console.log("Namespace: ", namespace);
        console.log("Reconstruction: ", reconstruction);
        console.log("Reconstruction via Path: ", reconViaPath);
        console.groupEnd();
    }
})(NamespaceReflection || (NamespaceReflection = {}));
//# sourceMappingURL=Main.js.map