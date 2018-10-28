var Shapes;
(function (Shapes) {
    class GameObject extends Shapes.Component {
        constructor(_name) {
            super("GameObject", false);
            this.components = {};
            this.name = _name;
            this.transform = new Shapes.Transform();
            this.addComponent(this.transform);
        }
        addComponent(_c) {
            if (this.components[_c.type] == undefined)
                this.components[_c.type] = [_c];
            else if (_c.singleton)
                return false;
            else
                this.components[_c.type].push(_c);
            _c.parent = this;
            return true;
        }
        getComponentsByType(_type) {
            return this.components[_type];
        }
        find(_name) {
            let children = this.components["GameObject"];
            if (children)
                for (let i = 0; i < children.length; i++) {
                    let child = children[i];
                    if (child.name == _name)
                        return child;
                    else
                        child.find(_name);
                }
            return null;
        }
        getScript(_class) {
            let script;
            for (script of this.components["Script"])
                if (script instanceof _class)
                    return script;
            return null;
        }
        render(_c) {
            _c.save();
            this.transform.apply(_c);
            let s = this.components["Shape"][0];
            s.createPath(_c);
            s.draw(_c);
            let children = this.components["GameObject"];
            if (children)
                for (let i = 0; i < children.length; i++)
                    children[i].render(_c);
            _c.restore();
        }
    }
    Shapes.GameObject = GameObject;
})(Shapes || (Shapes = {}));
//# sourceMappingURL=GameObject.js.map