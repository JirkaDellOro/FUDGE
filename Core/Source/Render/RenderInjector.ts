namespace FudgeCore {
  //Baseclass for {@link RenderInjectorCoat} and {@link RenderInjectorTexture]]
  export class RenderInjector {

    public static inject(_constructor: Function, _injector: typeof RenderInjector): void {
      let injection: Function = Reflect.get(_injector, "inject" + _constructor.name);
      if (!injection) {
        Debug.error("No injection decorator defined for " + _constructor.name);
      }
      Object.defineProperty(_constructor.prototype, "useRenderData", {
        value: injection
      });
    }
  }
}