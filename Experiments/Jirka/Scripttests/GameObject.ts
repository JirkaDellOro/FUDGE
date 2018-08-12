namespace Scripttest {
    export class GameObject {
        public scriptName: string;
        public scriptObject: Script;

        constructor(_scriptName: string) {
            this.scriptName = _scriptName;
            this.scriptObject = new Scripttest[this.scriptName];
        }
    }
}