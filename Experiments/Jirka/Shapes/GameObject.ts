namespace Shapes {
    interface Components {
        [name: string]: Component[];
    }

    export class GameObject extends Component {
        transform: Transform;
        components: Components = {};
        name: string;

        constructor(_name: string) {
            super("GameObject", false);
            this.name = _name;
            this.transform = new Transform();
            this.addComponent(this.transform);
        }

        addComponent(_c: Component): boolean {
            if (this.components[_c.type] == undefined)
                this.components[_c.type] = [_c];
            else
                if (_c.singleton)
                    return false;
                else
                    this.components[_c.type].push(_c);

            _c.parent = this;
            return true;
        }

        getComponentsByType(_type: string): Component[] {
            return this.components[_type];
        }

        find(_name: string): GameObject {
            let children: GameObject[] = <GameObject[]>this.components["GameObject"];
            if (children)
                for (let i: number = 0; i < children.length; i++) {
                    let child: GameObject = children[i];
                    if (child.name == _name)
                        return child;
                    else
                        child.find(_name);
                }
            return null;
        }

        getScript(_class: Function): Script {
            let script: Script;
            for (script of this.components["Script"])
                if (script instanceof _class)
                    return script;

            return null;
        }

        render(_c: CanvasRenderingContext2D): void {
            _c.save();
            this.transform.apply(_c);
            let s: Shape = <Shape>this.components["Shape"][0];
            s.createPath(_c);
            s.draw(_c);

            let children: GameObject[] = <GameObject[]>this.components["GameObject"];
            if (children)
                for (let i: number = 0; i < children.length; i++)
                    children[i].render(_c);

            _c.restore();
        }
    }
}