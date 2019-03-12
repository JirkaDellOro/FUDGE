namespace Shapes {
    export class Component {
        singleton: boolean = false;
        parent: GameObject = null;

        getClassname(): string {
            return this.constructor.name;
        }
    }
}