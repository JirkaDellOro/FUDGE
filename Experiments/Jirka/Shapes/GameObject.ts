namespace Shapes {
    export interface Components {
        [name: string]: Component[];
    }

    export class GameObject extends Component {
        transform: Transform;
        components: Components = {};

        constructor() {
            super();
            //this.name = _name;
            this.transform = new Transform();
            this.addComponent(this.transform);
        }

        addComponent(_c: Component): boolean {
            if (this.components[_c.getClassname()] == undefined)
                this.components[_c.getClassname()] = [_c];
            else
                if (_c.singleton)
                    return false;
                else
                    this.components[_c.getClassname()].push(_c);

            _c.parent = this;
            return true;
        }

        getComponents(_type: typeof Component): Component[] {
            let key: string = _type.name;
            return this.components[key];
        }
        getComponentsExtending(_type: typeof Component): Component[] {
            let components: Component[] = [];
            for (let key in this.components)
                for (let component of this.components[key])
                    if (component instanceof _type)
                        components.push(component);
            return components;
        }
/*
        find(_name: string): GameObject {
            let children: GameObject[] = <GameObject[]>this.getComponents(GameObject);
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
*/
/*
        getScript(_class: Function): Script {
            let scripts: Script[] = <Script[]>this.getComponentsExtending(Script);
            for (let script of scripts)
                if (script instanceof _class)
                    return script;
            return null;
        }
*/
        render(_c: CanvasRenderingContext2D): void {
            _c.save();
            this.transform.apply(_c);
            let s: Shape = <Shape>this.getComponents(Shape)[0];
            s.createPath(_c);
            s.draw(_c);

            let children: GameObject[] = <GameObject[]>this.getComponents(GameObject);
            if (children)
                for (let i: number = 0; i < children.length; i++)
                    children[i].render(_c);

            _c.restore();
        }
    }
}