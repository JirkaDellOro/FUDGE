var Scripttest;
(function (Scripttest) {
    // list of scripts to load
    let load = ["GameObject", "Script", "ScriptExtended"];
    loadScripts(load);
    // call init when everything including the scripts is loaded
    window.addEventListener("load", init);
    function init(_event) {
        // create some game-objects with scripts attached
        let gameObjects = [new Scripttest.GameObject("Script"), new Scripttest.GameObject("ScriptExtended")];
        // make the attached scripts do something and add a listener to them
        for (let go of gameObjects) {
            let script = go.scriptObject;
            script.sayHello();
            script.addEventListener("click", test);
        }
        // invoke a listener, may later be an "Update" or "OnMouseDown"
        let script = gameObjects[0].scriptObject;
        script.dispatchEvent(new Event("click"));
        // create an unattached script-object
        let scriptExtended = new Scripttest.ScriptExtended();
    }
    function test(_event) {
        console.log(_event);
    }
    function loadScripts(scriptNames) {
        // load the scripts by appending script-tags to the loading html-document
        console.group("Loading scripts");
        let head = document.head;
        for (let scriptName of scriptNames) {
            let script = document.createElement("script");
            script.type = "text/javascript";
            script.src = scriptName + ".js";
            script.async = false;
            // script.addEventListener("load", handleLoadedScript)
            head.appendChild(script);
            console.log(scriptName);
        }
        console.groupEnd();
    }
})(Scripttest || (Scripttest = {}));
//# sourceMappingURL=Main.js.map