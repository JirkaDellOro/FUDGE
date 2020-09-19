var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var Scripttest;
(function (Scripttest) {
    // list of scripts to load
    let load = ["GameObject", "Script", "ScriptExtended", "../ScriptModule/Script/Build/Script"];
    // call init when everything including the scripts is loaded
    window.addEventListener("load", init);
    function init(_event) {
        return __awaiter(this, void 0, void 0, function* () {
            // actually... using await and promises enables loading after website was loaded
            yield loadScripts(load);
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
        });
    }
    function test(_event) {
        console.log(_event);
    }
    function loadScripts(scriptNames) {
        return __awaiter(this, void 0, void 0, function* () {
            // load the scripts by appending script-tags to the loading html-document
            console.group("Loading scripts");
            for (let scriptName of scriptNames) {
                yield loadScript(scriptName);
            }
            console.groupEnd();
        });
    }
    function loadScript(_scriptName) {
        return __awaiter(this, void 0, void 0, function* () {
            let script = document.createElement("script");
            script.type = "text/javascript";
            // script.type = "module";
            script.async = false;
            // script.addEventListener("load", handleLoadedScript)
            let head = document.head;
            head.appendChild(script);
            console.log(_scriptName);
            return new Promise((resolve, reject) => {
                script.addEventListener("load", () => resolve());
                script.addEventListener("error", () => reject());
                script.src = _scriptName + ".js";
            });
        });
    }
})(Scripttest || (Scripttest = {}));
//# sourceMappingURL=Main.js.map