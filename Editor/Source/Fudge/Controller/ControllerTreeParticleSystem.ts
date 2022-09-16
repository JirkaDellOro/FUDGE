namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  const enum ID {
    KEY = "key",
    FUNCTION = "function",
    VALUE = "value",
    TRANSFORMATION = "transformation"
  }

  export class ControllerTreeParticleSystem extends ƒui.CustomTreeController<ƒ.ParticleData.Recursive> {
    public childToParent: Map<ƒ.ParticleData.Recursive, ƒ.ParticleData.Recursive> = new Map();
    private data: ƒ.ParticleData.System;

    constructor(_data: ƒ.ParticleData.System) {
      super();
      this.data = _data;
    }

    public createContent(_data: ƒ.ParticleData.Recursive): HTMLFormElement {
      let content: HTMLFormElement = document.createElement("form");
      let parentData: ƒ.ParticleData.Recursive = this.childToParent.get(_data);
      let key: string = this.getKey(_data, parentData);
      
      if (parentData && parentData == this.data.variables) {
        let input: HTMLInputElement = document.createElement("input");
        input.type = "text";
        input.disabled = true;
        input.value = key;
        input.id = ID.KEY;
        content.appendChild(input);
      }

      if (!ƒ.ParticleData.isExpression(_data) && !ƒ.ParticleData.isTransformation(_data)) {
        let spanName: HTMLSpanElement = document.createElement("span");
        spanName.innerText = parentData ? key : ƒ.ParticleSystem.name;
        content.appendChild(spanName);
      }

      if (ƒ.ParticleData.isExpression(_data) && parentData != this.data.variables) {
        let seperator: HTMLSpanElement = document.createElement("span");
        seperator.innerText = ": ";
        if (ƒ.ParticleData.isFunction(parentData)) {
          let names: string[] = ƒ.ParticleData.FUNCTION_PARAMETER_NAMES[parentData.function];
          if (names) {
            let name: HTMLSpanElement = document.createElement("span");
            name.innerText = names[key] != null ? names[key] : key;
            content.appendChild(name);
            content.appendChild(seperator);
          }
        } else {
          let options: string[] = ƒ.ParticleData.isTransformation(parentData) ? ViewParticleSystem.TRANSFORMATION_KEYS : ViewParticleSystem.COLOR_KEYS;
          let select: HTMLSelectElement = document.createElement("select");
          options.forEach((_option, _index) => {
            let entry: HTMLOptionElement = document.createElement("option");
            entry.text = _option;
            entry.value = _option;
            select.add(entry);
          });
          select.value = key;
          select.id = ID.KEY;
          content.appendChild(select);
          content.appendChild(seperator);
        }
      }

      if (ƒ.ParticleData.isExpression(_data)) {
        if (ƒ.ParticleData.isFunction(_data)) {
          let select: HTMLSelectElement = document.createElement("select");
          select.id = ID.FUNCTION;
          for (let name of Object.values(ƒ.ParticleData.FUNCTION)) {
            let entry: HTMLOptionElement = document.createElement("option");
            entry.text = name;
            entry.value = name;
            select.add(entry);
          }
          select.value = _data.function;
          content.appendChild(select);
        } else {
          let input: HTMLInputElement = document.createElement("input");
          input.type = "text";
          input.disabled = true;
          input.id = ID.VALUE;
          input.setAttribute("list", "variables");
          input.value = _data.value.toString();
          content.appendChild(input);
        } 
      } else if (ƒ.ParticleData.isTransformation(_data)) {
        let select: HTMLSelectElement = document.createElement("select");
        select.id = ID.TRANSFORMATION;
        for (let key of [ƒ.Matrix4x4.prototype.translate.name, ƒ.Matrix4x4.prototype.rotate.name, ƒ.Matrix4x4.prototype.scale.name]) {
          let entry: HTMLOptionElement = document.createElement("option");
          entry.text = key;
          entry.value = key;
          select.add(entry);
        }
        select.value = _data.transformation;
        content.appendChild(select);
      }

      return content;
    }

    public getAttributes(_data: ƒ.ParticleData.Recursive): string {
      let attributes: string[] = [];
      if (ƒ.ParticleData.isVariable(_data) || this.childToParent.get(_data) == this.data.variables) 
        attributes.push("variable");

      return attributes.join(" ");
    }
    
    public rename(_data: ƒ.ParticleData.Recursive, _id: string, _new: string): void {
      let inputAsNumber: number = Number.parseFloat(_new);

      if (_id == ID.KEY && ƒ.ParticleData.isExpression(_data)) {
        let parentData: ƒ.ParticleData.Recursive = this.childToParent.get(_data);
        let key: string = this.getKey(_data, parentData);
        let target: Object = ƒ.ParticleData.isFunction(parentData) ? parentData.parameters : parentData;
        
        if (parentData == this.data.variables) {
          let errors: string[] = [];
          if (this.isReferenced(key))
            errors.push(`variable "${key}" is still referenced`);
          if (this.data.variables[_new])
            errors.push(`variable "${_new}" already exists`);
          if (ƒ.ParticleData.PREDEFINED_VARIABLES[_new])
            errors.push(`variable "${_new}" is a predefined variable and can not be redeclared. Predefined variables: [${Object.keys(ƒ.ParticleData.PREDEFINED_VARIABLES).join(", ")}]`);
          if (errors.length > 0) {
            ƒui.Warning.display(errors, "Unable to rename", "Please resolve the errors and try again" );
            return;
          }
        }

        if (target[_new])
          target[key] = target[_new];
        else 
          delete target[key];
        target[_new] = _data;

        return;
      }

      if (_id == ID.FUNCTION && ƒ.ParticleData.isFunction(_data)) {
        _data.function = <ƒ.ParticleData.FUNCTION>_new;
        return;
      }

      if (_id == ID.TRANSFORMATION && ƒ.ParticleData.isTransformation(_data)) {
        _data.transformation = <ƒ.ParticleData.Transformation["transformation"]>_new;
        return;
      }

      if (_id == ID.VALUE && (ƒ.ParticleData.isVariable(_data) || ƒ.ParticleData.isConstant(_data))) {
        let input: string | number = Number.isNaN(inputAsNumber) ? _new : inputAsNumber;
        if (typeof input == "string" && !ƒ.ParticleData.PREDEFINED_VARIABLES[input] && (this.data.variables && !this.data.variables[input])) 
          return;
        _data.value = input;

        return;
      }
    }

    public hasChildren(_data: ƒ.ParticleData.Recursive): boolean {
      if (ƒ.ParticleData.isConstant(_data) || ƒ.ParticleData.isVariable(_data))
        return false;
      return this.getChildren(_data).length > 0;
    }

    public getChildren(_data: ƒ.ParticleData.Recursive): ƒ.ParticleData.Recursive[] {
      if (ƒ.ParticleData.isConstant(_data) || ƒ.ParticleData.isVariable(_data))
        return [];

      let children: ƒ.ParticleData.Recursive[] = [];
      let subData: Object = ƒ.ParticleData.isFunction(_data) ? _data.parameters : _data;
      let subKeys: string[] = Object.keys(subData);

      // sort keys for root, color and vector e.g. ("r", "g", "b", "a")
      if (_data == this.data)
        subKeys = ViewParticleSystem.PROPERTY_KEYS.filter(_key => subKeys.includes(_key));
      if (ƒ.ParticleData.isTransformation(_data))
        subKeys = ViewParticleSystem.TRANSFORMATION_KEYS.filter(_key => subKeys.includes(_key));
      if (_data == this.data.color)
        subKeys = ViewParticleSystem.COLOR_KEYS.filter(_key => subKeys.includes(_key));

      subKeys.forEach(_key => {
        let child: ƒ.ParticleData.Recursive = subData[_key];
        if (ƒ.ParticleData.isExpression(child) || typeof child == "object") {
          children.push(child);
          this.childToParent.set(subData[_key], _data);
        }
      });

      return children;
    }

    public delete(_focused: (ƒ.ParticleData.Recursive)[]): (ƒ.ParticleData.Recursive)[] {
      // delete selection independend of focussed item
      let deleted: (ƒ.ParticleData.Recursive)[] = [];
      let expend: (ƒ.ParticleData.Recursive)[] = this.selection.length > 0 ? this.selection : _focused;
      for (let data of expend) {
        if (this.deleteData(data))
          deleted.push(data);
      }
      this.selection.splice(0);
      return deleted;
    }

    public addChildren(_children: ƒ.ParticleData.Recursive[], _target: ƒ.ParticleData.Recursive, _at?: number): ƒ.ParticleData.Recursive[] {
      let move: ƒ.ParticleData.Expression[] = [];
      let container: Object;
      if (ƒ.ParticleData.isFunction(_target) && _children.every(_data => ƒ.ParticleData.isExpression(_data)))
        container = _target.parameters;
      else if (Array.isArray(_target) && _children.every(_data => ƒ.ParticleData.isTransformation(_data)))
        container = _target;
      else if ((ƒ.ParticleData.isTransformation(_target) || _target == this.data.color || _target == this.data.variables) && _children.every(_data => ƒ.ParticleData.isExpression(_data)))
        container = _target;

      if (!container) 
        return move;

      if (Array.isArray(container)) 
        for (let data of (<ƒ.ParticleData.Expression[]>_children)) {
          let index: number = container.indexOf(data); // _at needs to be corrected if we are moving within same parent
          let hasParent: boolean = this.childToParent.has(data);
          if (hasParent && !this.deleteData(data)) continue;
          if (!hasParent)
            data = JSON.parse(JSON.stringify(data));

          move.push(data);
          this.childToParent.set(data, _target);
          if (index > -1 && _at > index)
            _at -= 1;
          if (_at == null) 
            container.push(data);
          else 
            container.splice(_at + _children.indexOf(data), 0, data);
        } 
      else
        for (let data of (<ƒ.ParticleData.Expression[]>_children)) {
          let usedKeys: string[] = Object.keys(_target);
          let newKey: string;
          if (ƒ.ParticleData.isTransformation(_target))
            newKey = ViewParticleSystem.TRANSFORMATION_KEYS.filter(_key => !usedKeys.includes(_key)).shift();
          else if (_target == this.data.color)
            newKey = ViewParticleSystem.COLOR_KEYS.filter(_key => !usedKeys.includes(_key)).shift();
          else if (_target == this.data.variables && this.getKey(data, _target) == null) 
            newKey = `variable${usedKeys.length}`;
          if (newKey == null) 
            continue;

          let hasParent: boolean = this.childToParent.has(data);
          if (hasParent && !this.deleteData(data)) 
            continue;
          if (!hasParent)
            data = JSON.parse(JSON.stringify(data));

          _target[newKey] = data;
          move.push(data);
          this.childToParent.set(data, _target);
        }
      return move;
    }

    public async copy(_originals: ƒ.ParticleData.Recursive[]): Promise<ƒ.ParticleData.Recursive[]> {
      let copies: (ƒ.ParticleData.Recursive)[] = [];
      if (_originals.every(_original => ƒ.ParticleData.isExpression(_original)) || _originals.every(_original => ƒ.ParticleData.isTransformation(_original)))
        _originals.forEach(_original => copies.push(JSON.parse(JSON.stringify(_original))));

      return copies;
    }

    public override draggable(_target: ƒ.ParticleData.Recursive): boolean {
      return ƒ.ParticleData.isExpression(_target) || ƒ.ParticleData.isTransformation(_target);
    }

    private getKey(_data: ƒ.ParticleData.Recursive, _parentData: ƒ.ParticleData.Recursive): string {
      let key: string;
      if (!_parentData) return null;
      if (ƒ.ParticleData.isExpression(_data) && ƒ.ParticleData.isFunction(_parentData)) {
        key = _parentData.parameters.indexOf(_data).toString();
      } else {
        key = Object.entries(_parentData).find(entry => entry[1] == _data)?.shift();
      }
      return key;
    }

    private deleteData(_data: ƒ.ParticleData.Recursive): boolean {
      if (_data == this.data)
        return false;

      let parentData: ƒ.ParticleData.Recursive = this.childToParent.get(_data);
      let key: string = this.getKey(_data, parentData);
      let index: number = Number.parseInt(key);

      if (parentData == this.data && Object.keys(_data).length > 0) {
        ƒui.Warning.display([`property "${key}" still has children`], "Unable to delete", "Please resolve the errors and try again");
        return false;
      }

      if (parentData == this.data.variables && this.isReferenced(key)) {
        ƒui.Warning.display([`variable "${key}" is still referenced`], "Unable to delete", "Please resolve the errors and try again");
        return false;
      }

      if (ƒ.ParticleData.isFunction(parentData)) 
        parentData.parameters.splice(index, 1);
      else if (Array.isArray(parentData)) 
        parentData.splice(index, 1);
      else 
        delete parentData[key];
      
      this.childToParent.delete(_data);
      return true;
    }

    private isReferenced(_name: string, _data: ƒ.ParticleData.Recursive = this.data): boolean {
      if (ƒ.ParticleData.isVariable(_data) && _data.value == _name) 
        return true;
      for (const subData of Object.values(ƒ.ParticleData.isFunction(_data) ? _data.parameters : _data)) 
        if (typeof subData == "object" && this.isReferenced(_name, subData))
          return true;
        
      return false;
    }
  }
}