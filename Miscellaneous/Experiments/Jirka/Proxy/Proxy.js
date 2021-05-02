"use strict";
var ProxyTest;
(function (ProxyTest) {
    class ProxyBase {
        constructor() {
            this.proxyTarget = this;
            return new Proxy(this, ProxyBase.hndProxy);
        }
    }
    ProxyBase.hndProxy = {
        set: (_target, _property, _value) => {
            // console.log("Set", _property, _value);
            Reflect.set(_target, _property, _value);
            return true;
        }
    };
    let proxyBase = new ProxyBase();
    console.log(proxyBase);
    Reflect.set(proxyBase, "x", 1);
    console.log(proxyBase.proxyTarget);
    class ProxySub extends ProxyBase {
        constructor() {
            super(...arguments);
            this.a = 1;
        }
    }
    class Klass {
        constructor() {
            this.a = 1;
        }
    }
    let proxySub = new ProxySub();
    console.log(proxySub);
    proxySub.a = 2;
    console.log(proxySub.proxyTarget);
    let n = Math.pow(10, 7);
    for (let twice = 0; twice < 2; twice++) {
        let object = { a: 0 };
        console.time("simple" + twice);
        for (let i = 1; i < n; i++) {
            object.a = i;
        }
        console.timeLog("simple" + twice, object);
    }
    for (let twice = 0; twice < 2; twice++) {
        let klass = new Klass();
        console.time("class" + twice);
        for (let i = 1; i < n; i++) {
            klass.a = i;
        }
        console.timeLog("class" + twice, klass);
    }
    for (let twice = 0; twice < 2; twice++) {
        let proxy = new ProxySub();
        console.time("proxy" + twice);
        for (let i = 1; i < n; i++) {
            proxy.a = i;
        }
        console.timeLog("proxy" + twice, proxy);
    }
})(ProxyTest || (ProxyTest = {}));
//# sourceMappingURL=Proxy.js.map