"use strict";
var NamespaceModule;
(function (NamespaceModule) {
    class ClassModule1 {
        constructor() {
            console.log(this.constructor.name, this);
        }
    }
    NamespaceModule.ClassModule1 = ClassModule1;
})(NamespaceModule || (NamespaceModule = {}));
var NamespaceModule;
(function (NamespaceModule) {
    class ClassModule2 {
        constructor() {
            console.log(this.constructor.name, this);
        }
    }
    NamespaceModule.ClassModule2 = ClassModule2;
})(NamespaceModule || (NamespaceModule = {}));
//# sourceMappingURL=Module.js.map