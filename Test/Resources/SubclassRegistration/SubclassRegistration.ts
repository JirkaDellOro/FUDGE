namespace SubclassRegistration {
  import ƒ = FudgeCore;
  // ƒ.Debug.setFilter(ƒ.DebugConsole, ƒ.DEBUG_FILTER.ALL | ƒ.DEBUG_FILTER.SOURCE);

  test(ƒ.Shader);
  test(ƒ.Mesh);
  test(ƒ.Component);
  test(ƒ.Joint);

  function test(_class: Function): void {
    console.group(_class.name);
    //@ts-ignore
    for (let subclass of _class.subclasses)
      log(subclass, _class);
    console.groupEnd();
  }

  function log(_class: Function, _baseclass: Function): void {
    let instance: Object;
    let color: string = "black";
    let message: string = "";
    if (_class["baseClass"] != _baseclass)
      color = "grey";
    try {
      // @ts-ignore
      instance = new _class();
    } catch (_error) {
      message = _error.message;
      color = "darkred";
    }

    console.groupCollapsed(`%c${_class.name}`, `color: ${color}`);
    console.dir(_class);
    console.dir(instance);
    if (message)
      console.warn(message);
    console.groupEnd();
  }
}