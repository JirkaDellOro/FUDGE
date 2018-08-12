namespace Scripttest {
    export class Script extends EventTarget {
        constructor() {
            super();
            console.log("Script created");
        }
        sayHello(): void {
            console.log("Hello from " + this.constructor.name);
        }
    }
}