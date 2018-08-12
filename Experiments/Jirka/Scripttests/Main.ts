namespace Scripttest {
    // list of scripts to load
    let load: string[] = ["GameObject", "Script", "ScriptExtended"];
    loadScripts(load);
    // call init when everything including the scripts is loaded
    window.addEventListener("load", init);


    function init(_event: Event): void {
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

    function loadScripts(scriptNames: string[]): void {
        // load the scripts by appending script-tags to the loading html-document
        console.group("Loading scripts");
        let head: HTMLHeadElement = document.head;
        for (let scriptName of scriptNames) {
            let script: HTMLScriptElement = document.createElement("script");
            script.type = "text/javascript";
            script.src = scriptName + ".js";
            script.async = false;
            // script.addEventListener("load", handleLoadedScript)
            head.appendChild(script);
            console.log(scriptName);
        }
        console.groupEnd();
    }
}