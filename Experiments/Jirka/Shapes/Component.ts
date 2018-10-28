namespace Shapes {
    export class Component {
        singleton: boolean = false;
        type: string = "";
        parent: GameObject = null;

        constructor(_name: string, _singleton: boolean) {
            this.singleton = _singleton;
            this.type = _name;
        }
    }
}