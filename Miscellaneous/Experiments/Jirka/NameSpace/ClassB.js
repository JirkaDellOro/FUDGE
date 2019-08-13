var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var NamespaceReflection;
(function (NamespaceReflection) {
    var ClassB_1;
    function reflectNamespaceOnClass(_constructor) {
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
    let ClassB = ClassB_1 = class ClassB {
        // @ts-ignore
        // private static ƒnamespace: string = findNamespaceName(arguments[0]);
        static getNamespace() {
            return ClassB_1.prototype["ƒnamespace"];
        }
    };
    // @ts-ignore
    ClassB.args = eval(arguments);
    ClassB = ClassB_1 = __decorate([
        reflectNamespaceOnClass
    ], ClassB);
    NamespaceReflection.ClassB = ClassB;
})(NamespaceReflection || (NamespaceReflection = {}));
//# sourceMappingURL=ClassB.js.map