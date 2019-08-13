namespace NamespaceReflection {
    function reflectNamespaceOnClass(_constructor: Function): void {
        
        Object.defineProperty(_constructor.prototype, "ƒnamespace", {
            value: eval("arguments")
            // value: "TestReflection"

            // value: (function (_args: Object): Object {
            //     for (let prop in window)
            //     // @ts-ignore
            //         if (window[prop] == _args[0])
            //             return prop;
            //     return null;
            //     // @ts-ignore
            // })(arguments)
            
        });
    }

    @reflectNamespaceOnClass
    export class ClassB {
        // @ts-ignore
        public static args: Object = eval(arguments);
        // @ts-ignore
        // private static ƒnamespace: string = findNamespaceName(arguments[0]);

        public static getNamespace(): string {
            return ClassB.prototype["ƒnamespace"];
        }
    }
}