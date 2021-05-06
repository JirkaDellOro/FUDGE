
namespace ProxyTest {
  class ProxyBase {
    private static hndProxy: Object = {
      set: (_target: Object, _property: PropertyKey, _value: Object): boolean => {
        // console.log("Set", _property, _value);
        Reflect.set(_target, _property, _value);
        return true;
      }
    };

    public proxyTarget: Object;
    constructor() {
      this.proxyTarget = this;
      return new Proxy(this, ProxyBase.hndProxy);
    }
  }

  let proxyBase: ProxyBase = new ProxyBase();
  console.log(proxyBase);
  Reflect.set(proxyBase, "x", 1);
  console.log(proxyBase.proxyTarget);


  class ProxySub extends ProxyBase {
    public a: number = 1;
  }

  class Klass {
    public a: number = 1;
  }

  let proxySub: ProxySub = new ProxySub();
  console.log(proxySub);
  proxySub.a = 2;
  console.log(proxySub.proxyTarget);

  let n: number = Math.pow(10, 7);

  for (let twice: number = 0; twice < 2; twice++) {
    let object: { a: number } = { a: 0 };
    console.time("simple" + twice);
    for (let i: number = 1; i < n; i++) {
      object.a = i;
    }
    console.timeLog("simple" + twice, object);
  }

  for (let twice: number = 0; twice < 2; twice++) {
    let klass: Klass = new Klass();
    console.time("class" + twice);
    for (let i: number = 1; i < n; i++) {
      klass.a = i;
    }
    console.timeLog("class" + twice, klass);
  }

  for (let twice: number = 0; twice < 2; twice++) {
    let proxy: ProxySub = new ProxySub();
    console.time("proxy" + twice);
    for (let i: number = 1; i < n; i++) {
      proxy.a = i;
    }
    console.timeLog("proxy" + twice, proxy);
  }
}
