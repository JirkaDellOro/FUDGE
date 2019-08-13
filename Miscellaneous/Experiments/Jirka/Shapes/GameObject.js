var Shapes;
(function (Shapes) {
    class GameObject extends Shapes.Component {
        constructor() {
            super();
            this.components = {};
            //this.name = _name;
            this.transform = new Shapes.Transform();
            this.addComponent(this.transform);
        }
        addComponent(_c) {
            if (this.components[_c.getClassname()] == undefined)
                this.components[_c.getClassname()] = [_c];
            else if (_c.singleton)
                return false;
            else
                this.components[_c.getClassname()].push(_c);
            _c.parent = this;
            return true;
        }
        getComponents(_type) {
            let key = _type.name;
            return this.components[key];
        }
        getComponentsExtending(_type) {
            let components = [];
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
        render(_c) {
            _c.save();
            this.transform.apply(_c);
            let s = this.getComponents(Shapes.Shape)[0];
            s.createPath(_c);
            s.draw(_c);
            let children = this.getComponents(GameObject);
            if (children)
                for (let i = 0; i < children.length; i++)
                    children[i].render(_c);
            _c.restore();
        }
    }
    Shapes.GameObject = GameObject;
})(Shapes || (Shapes = {}));
//# sourceMappingURL=GameObject.js.map