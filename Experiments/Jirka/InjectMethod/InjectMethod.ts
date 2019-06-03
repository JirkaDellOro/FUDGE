namespace InjectMethod {

    // fool typescript in order to use function "injected"   
    interface Test {
        injected?: Function;
    }
    // enforce existence of function "replaced" to be replaced by decoration
    interface Decoratable {
        replaced: Function;
    }

    // @injectViaConstructorReplacement()
    @injectViaConstructorExtension
    class Test implements Decoratable {
        name: string;

        constructor(_name: string) {
            this.name = _name;
        }

        @replaceViaMethodDecorator // function must already exist
        public replaced(): void {
            console.log("Hi, I've NOT been replaced for ", this);
        }

        public remain(): void {
            console.log("Hi, I've remained untouched in ", this);
        }
    }

    function replaceViaMethodDecorator(_target: Decoratable, _propertyKey: string, _descriptor: PropertyDescriptor): void {
        console.log(_target, _propertyKey, _descriptor);
        console.log(_target.constructor == Test);
        _descriptor.value = function (this: Object): void {
            console.log("Hi, I've been replaced for ", this);
            innerCall(this);
        };
    }

    function innerCall( _o: Object): void {
        console.log("And this is an inner call from ", _o);
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
