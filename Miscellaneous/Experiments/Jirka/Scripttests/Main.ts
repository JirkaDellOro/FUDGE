namespace Scripttest {
  // list of scripts to load
  let load: string[] = ["GameObject", "Script", "ScriptExtended", "../ScriptModule/Script/Build/Script"];
  // call init when everything including the scripts is loaded
  window.addEventListener("load", init);


  async function init(_event: Event): Promise<void> {
    // actually... using await and promises enables loading after website was loaded
    await loadScripts(load);
    // create some game-objects with scripts attached
    let gameObjects: GameObject[] = [new GameObject("Script"), new GameObject("ScriptExtended")];

    // make the attached scripts do something and add a listener to them
    for (let go of gameObjects) {
      let script: Script = go.scriptObject;
      script.sayHello();
      script.addEventListener("click", test);
    }

    // invoke a listener, may later be an "Update" or "OnMouseDown"
    let script: Script = gameObjects[0].scriptObject;
    script.dispatchEvent(new Event("click"));

    // create an unattached script-object
    let scriptExtended: ScriptExtended = new ScriptExtended();
  }

  function test(_event: Event): void {
    console.log(_event);
  }

  async function loadScripts(scriptNames: string[]): Promise<void> {
    // load the scripts by appending script-tags to the loading html-document
    console.group("Loading scripts");
    for (let scriptName of scriptNames) {
      await loadScript(scriptName);
    }
    console.groupEnd();
  }

  async function loadScript(_scriptName: string): Promise<void> {
    let script: HTMLScriptElement = document.createElement("script");
    script.type = "text/javascript";
    // script.type = "module";
    script.async = false;
    // script.addEventListener("load", handleLoadedScript)
    let head: HTMLHeadElement = document.head;
    head.appendChild(script);
    console.log(_scriptName);


    return new Promise((resolve, reject) => {
      script.addEventListener("load", () => resolve());
      script.addEventListener("error", () => reject());
      script.src = _scriptName + ".js";
    });
  }
}
