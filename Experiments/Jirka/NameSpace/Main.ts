
namespace NamespaceRegistrar {

    interface NamespaceRegister {
        [name: string]: Object;
    }
    export class Registrar {
        private static namespaces: NamespaceRegister = {};

        public static reconstruct(_path: string): Object {
            let typeName: string = _path.substr(_path.lastIndexOf(".") + 1);
            let namespace: Object = Registrar.getNamespace(_path);
            let reconstruction: Object = new namespace[typeName];
            return reconstruction;
        }

        public static registerNamespace(_namespace: Object): void {
            for (let name in Registrar.namespaces)
                if (Registrar.namespaces[name] == _namespace)
                    return;

            let name: string = Registrar.findNamespaceIn(_namespace, window);
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

        public static getFullPath(_object: Object): string {
            let typeName: string = _object.constructor.name;
            console.log("Searching namespace of: " + typeName);
            for (let namespaceName in Registrar.namespaces) {
                if (_object instanceof Registrar.namespaces[namespaceName][typeName])
                    return namespaceName + "." + typeName;
            }
            return null;
        }

        public static getNamespace(_path: string): Object {
            let namespaceName: string = _path.substr(0, _path.lastIndexOf("."));
            return Registrar.namespaces[namespaceName];
        }

        private static findNamespaceIn(_namespace: Object, _parent: Object): string {
            for (let prop in _parent)
                if (_parent[prop] == _namespace)
                    return prop;
            return null;
        }
    }
}

namespace NamespaceReflection {
    window.addEventListener("load", test);
    function test(_event: Event): void {
        console.group("A");
        console.dir(ClassA.getNamespace());
        console.dir(ClassA.args);
        console.groupEnd();

        console.group("B");
        console.dir(ClassB.args);
        console.dir(ClassB.getNamespace());
        console.groupEnd();

        console.group("C");
        console.dir(ClassC["ƒnamespace"]);
        console.dir(ClassC.getNamespace());
        console.dir(ClassC.getNamespace());
        console.groupEnd();

        console.log("Namespace Registration ------------------- ");
        let a: ClassA = new ClassA();
        let a2: NamespaceReflection2.ClassA = new NamespaceReflection2.ClassA();
        let nested: NamespaceReflection2.NamespaceReflectionNested.ClassA = new NamespaceReflection2.NamespaceReflectionNested.ClassA();

        testNamespaceRegistration(a, "a");
        testNamespaceRegistration(a2, "a2");
        testNamespaceRegistration(nested, "nested");

        let o: Object = new window["NamespaceReflection2"]["NamespaceReflectionNested"]["ClassA"];
        console.log("Reconstruction: ", o);
    }

    function testNamespaceRegistration(_o: Object, _name: string): void {
        console.group(_name);
        let path: string = NamespaceRegistrar.Registrar.getFullPath(_o);
        let namespace: Object;
        namespace = NamespaceRegistrar.Registrar.getNamespace(path);
        let reconstruction: Object = new namespace[_o.constructor.name];
        let reconViaPath: Object = NamespaceRegistrar.Registrar.reconstruct(path);
        console.log("Path: ", path);
        console.log("Namespace: ", namespace);
        console.log("Reconstruction: ", reconstruction);
        console.log("Reconstruction via Path: ", reconViaPath);
        console.groupEnd();
    }
}