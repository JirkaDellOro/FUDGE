namespace Scripttest {
    // stub class for a game-object that can hold a reference to a script
    export class GameObject {
        public scriptObject: Script;

        constructor(_scriptName: string) {
            // instantiate script-object by using the namespace property. This way, a scene can be rebuild from a json file using classnames to recreate objects
            this.scriptObject = new Scripttest[_scriptName];
        }
    }
}