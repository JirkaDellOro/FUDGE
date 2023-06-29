namespace FudgeCore {
  
  /**
   * Baseclass for {@link RenderInjectorCoat} and {@link RenderInjectorTexture}
   * @internal
   */
  export class RenderInjector {

    /**
     * Injects the given constructor with the functionality of the given injector. Name of the constructor and the name of the injector method must match.
     * Used in subclasses of this class.
     */
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