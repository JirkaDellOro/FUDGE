namespace Fudge {
    export class Test {
        static sayHello(): void {
            console.log("Hello from the Test-Class of Fudge");
        }

        private _x: string;
        public get x(): string { return this._x; }
        public set x(v: string) { this._x = v; }
    }
}
