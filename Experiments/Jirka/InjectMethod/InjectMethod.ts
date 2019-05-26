namespace InjectMethod {

    // fool typescript 
    interface Test {
        injected?: Function;
    }
    
    // @injectViaConstructorReplacement()
    @injectViaConstructorExtension
    class Test {
        name: string;

        constructor(_name: string) {
            this.name = _name;
        }

        @replace
        public replaced(): void {
            console.log("Hi, I've NOT been replaced for ", this);
        }

        public remain(): void {
            console.log("Hi, I've remained untouched in ", this);
        }
    }

    function replace(_target: Object, _propertyKey: string, _descriptor: PropertyDescriptor): void {
        console.log(_target, _propertyKey, _descriptor);
        console.log(_target.constructor == Test);
        _descriptor.value = function (this: Object): void {
            console.log("Hi, I've been replaced for ", this);
        };
    }

    function injectViaConstructorReplacement(): Function {
        function injected(this: Object): void {
            console.log("Hey, I've been injected into ", this);
        }
        return function <Constructor extends Function>(_constructor: Constructor): Constructor {
            Object.defineProperty(_constructor.prototype, "injected", {
                value: injected
            });
            return _constructor;
        };
    }

    function injectViaConstructorExtension(_constructor: Function): void {
        function injected(this: Object): void {
            console.log("Hey, I've been injected into ", this);
        }
        Object.defineProperty(_constructor.prototype, "injected", {
            value: injected
        });
    }

    
    let test: Test = new Test("Test-Instance_1");
    console.log(Test);
    test.injected();
    test.replaced();
    test.remain();
}
