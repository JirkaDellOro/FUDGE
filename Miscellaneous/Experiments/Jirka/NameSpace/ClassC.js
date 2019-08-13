var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
///<reference path="Main.ts"/>
var NamespaceReflection;
///<reference path="Main.ts"/>
(function (NamespaceReflection) {
    NamespaceRegistrar.Registrar.registerNamespace(NamespaceReflection);
    function reflectNamespaceOnProperty(_constructor, _name, _args) {
        console.dir(_constructor, _name, _args);
        console.dir(arguments);
    }
    class ClassC {
        static getNamespace() {
            return ClassC.ƒnamespace;
        }
    }
    __decorate([
        reflectNamespaceOnProperty(arguments)
    ], ClassC, "\u0192namespace", void 0);
    NamespaceReflection.ClassC = ClassC;
})(NamespaceReflection || (NamespaceReflection = {}));
//# sourceMappingURL=ClassC.js.map