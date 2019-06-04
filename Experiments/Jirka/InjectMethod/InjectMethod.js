"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var InjectMethod;
(function (InjectMethod) {
    // @injectViaConstructorReplacement()
    let Test = class Test {
        constructor(_name) {
            this.name = _name;
        }
        replaced() {
            console.log("Hi, I've NOT been replaced for ", this);
        }
        remain() {
            console.log("Hi, I've remained untouched in ", this);
        }
    };
    __decorate([
        replaceViaMethodDecorator // function must already exist
    ], Test.prototype, "replaced", null);
    Test = __decorate([
        injectViaConstructorExtension
    ], Test);
    function replaceViaMethodDecorator(_target, _propertyKey, _descriptor) {
        console.log(_target, _propertyKey, _descriptor);
        console.log(_target.constructor == Test);
        _descriptor.value = function () {
            console.log("Hi, I've been replaced for ", this);
            innerCall(this);
        };
    }
    function innerCall(_o) {
        console.log("And this is an inner call from ", _o);
    }
    function injectViaConstructorReplacement() {
        function injected() {
            console.log("Hey, I've been injected into ", this);
        }
        return function (_constructor) {
            Object.defineProperty(_constructor.prototype, "injected", {
                value: injected
            });
            return _constructor;
        };
    }
    function injectViaConstructorExtension(_constructor) {
        function injected() {
            console.log("Hey, I've been injected into ", this);
        }
        Object.defineProperty(_constructor.prototype, "injected", {
            value: injected
        });
    }
    let test = new Test("Test-Instance_1");
    console.log(Test);
    test.injected();
    test.replaced();
    test.remain();
})(InjectMethod || (InjectMethod = {}));
//# sourceMappingURL=InjectMethod.js.map