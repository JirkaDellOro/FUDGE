namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  const enum ID {
    NAME = "name",
    FUNCTION = "function",
    VALUE = "value",
    TRANSFORMATION = "transformation"
  }

  export class ControllerTreeParticleSystem extends ƒui.CustomTreeController<ƒ.ParticleData.Recursive> {
    public childToParent: Map<ƒ.ParticleData.Recursive, ƒ.ParticleData.Recursive> = new Map();
    private data: ƒ.ParticleData.System;
    private view: ViewParticleSystem;

    constructor(_data: ƒ.ParticleData.System, _view: ViewParticleSystem) {
      super();
      this.data = _data;
      this.view = _view;
    }

    public createContent(_data: ƒ.ParticleData.Recursive): HTMLFormElement {
      let content: HTMLFormElement = document.createElement("form");
      let parentData: ƒ.ParticleData.Recursive = this.childToParent.get(_data);
      let key: string = this.getKey(_data);
      
      if (!ƒ.ParticleData.isExpression(_data) && !ƒ.ParticleData.isTransformation(_data)) {
        let spanName: HTMLSpanElement = document.createElement("span");
        spanName.innerText = parentData ? key : ƒ.ParticleSystem.name;
        content.appendChild(spanName);
      }

      if (parentData == this.data.variables) {
        let input: HTMLInputElement = document.createElement("input");
        input.type = "text";
        input.disabled = true;
        input.value = this.data.variableNames[key];
        input.id = ID.NAME;
        content.appendChild(input);
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
          if (ƒ.ParticleData.isCode(_data)) {
            input.value = _data.code;
          } else {
            input.value = _data.value.toString();
            input.setAttribute("list", "variables");
          }
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
      if (ƒ.ParticleData.isFunction(_data))
        attributes.push(_data.function);
      if (_data == this.data.color)
        attributes.push("color");
      if (ƒ.ParticleData.isTransformation(_data)) 
        attributes.push("transformation");
      if (ƒ.ParticleData.isCode(_data))
        attributes.push("code");

      return attributes.join(" ");
    }
    
    public rename(_data: ƒ.ParticleData.Recursive, _id: string, _new: string): boolean {
      let inputAsNumber: number = Number.parseFloat(_new);

      if (_id == ID.NAME && ƒ.ParticleData.isExpression(_data)) {
        let errors: string[] = [];
        if (this.data.variableNames.includes(_new))
          errors.push(`variable "${_new}" already exists`);
        if (ƒ.ParticleData.PREDEFINED_VARIABLES[_new])
          errors.push(`variable "${_new}" is a predefined variable and can not be redeclared. Predefined variables: [${Object.keys(ƒ.ParticleData.PREDEFINED_VARIABLES).join(", ")}]`);
        if (errors.length > 0) {
          ƒui.Warning.display(errors, "Unable to rename", "Please resolve the errors and try again" );
          return false;
        }
        
        let index: number = this.data.variables.indexOf(_data);
        let name: string = this.data.variableNames[index];
        this.data.variableNames[index] = _new;
        this.renameVariable(name, _new);
        return true;
      }

      if (_id == ID.FUNCTION && ƒ.ParticleData.isFunction(_data)) {
        _data.function = <ƒ.ParticleData.FUNCTION>_new;
        return true;
      }

      if (_id == ID.TRANSFORMATION && ƒ.ParticleData.isTransformation(_data)) {
        _data.transformation = <ƒ.ParticleData.Transformation["transformation"]>_new;
        return true;
      }

      if (_id == ID.VALUE && (ƒ.ParticleData.isVariable(_data) || ƒ.ParticleData.isConstant(_data))) {
        let input: string | number = Number.isNaN(inputAsNumber) ? _new : inputAsNumber;
        if (typeof input == "string" && !ƒ.ParticleData.PREDEFINED_VARIABLES[input] && this.data.variableNames && !this.data.variableNames.includes(input)) 
          return false;
        _data.value = input;

        return true;
      }

      if (_id == ID.VALUE && (ƒ.ParticleData.isCode(_data))) {
        _data.code = _new;
        return true;
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
      let data: Object = ƒ.ParticleData.isFunction(_data) || ƒ.ParticleData.isTransformation(_data) ? _data.parameters : _data;
      let keys: string[] = Object.keys(data);

      if (data == this.data)
        keys = ViewParticleSystem.PROPERTY_KEYS.filter(_key => keys.includes(_key));

      keys.forEach(_key => {
        let child: ƒ.ParticleData.Recursive = data[_key];
        if (ƒ.ParticleData.isExpression(child) || typeof child == "object") {
          children.push(child);
          this.childToParent.set(data[_key], _data);
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
      let move: ƒ.ParticleData.Recursive[] = [];
      let container: ƒ.ParticleData.Recursive[];

      if ((ƒ.ParticleData.isFunction(_target) || ƒ.ParticleData.isTransformation(_target)) && _children.every(_data => ƒ.ParticleData.isExpression(_data)))
        container = _target.parameters;
      else if ((_target == this.data.mtxLocal || _target == this.data.mtxWorld) && _children.every(_data => ƒ.ParticleData.isTransformation(_data)))
        container = <ƒ.ParticleData.Transformation[]>_target;
      else if ((_target == this.data.variables || _target == this.data.color) && _children.every(_data => ƒ.ParticleData.isExpression(_data)))
        container = <ƒ.ParticleData.Expression[]>_target;

      if (!container) 
        return move;

      if (Array.isArray(container))
        for (let data of _children) {
          let index: number = container.indexOf(data); // _at needs to be corrected if we are moving within same parent
          let hasParent: boolean = this.childToParent.has(data);
          let name: string = this.data.variableNames[index];

          if (hasParent && !this.deleteData(data)) 
            continue;

          if (!hasParent)
            data = JSON.parse(JSON.stringify(data));

          move.push(data);
          this.childToParent.set(data, _target);
          if (index > -1 && _at > index)
            _at -= 1;

          if (_at == null) {
            container.push(data);
            if (container == this.data.variables)
              this.data.variableNames.push(name || this.generateNewVariableName());
          } else {
            container.splice(_at + _children.indexOf(data), 0, data);
            if (container == this.data.variables)
              this.data.variableNames.splice(_at + _children.indexOf(data), 0, name);
          }
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

    public generateNewVariableName(): string {
      let name: string = "newVariable";
      let count: number = 1;
      while (this.data.variableNames.includes(name)) {
        name = "newVariable" + count
        count++;
      }
      return name;
    }

    private getKey(_data: ƒ.ParticleData.Recursive): string { 
      let parent: ƒ.ParticleData.Recursive = this.childToParent.get(_data) || {};
      if (ƒ.ParticleData.isFunction(parent) || ƒ.ParticleData.isTransformation(parent))
        parent = parent.parameters;

      return Object.entries(parent).find(entry => entry[1] == _data)?.shift();
    }

    private deleteData(_data: ƒ.ParticleData.Recursive): boolean {
      if (_data == this.data)
        return false;

      let parent: ƒ.ParticleData.Recursive = this.childToParent.get(_data);
      let key: string = this.getKey(_data);

      if (ƒ.ParticleData.isFunction(parent) || ƒ.ParticleData.isTransformation(parent))
        parent = parent.parameters;

      if (Array.isArray(parent)) {
        let index: number = Number.parseInt(key);
        parent.splice(index, 1);
        if (parent == this.data.variables)
          this.data.variableNames.splice(index, 1);
      } else {
        delete parent[key];
      }
      
      this.childToParent.delete(_data);
      return true;
    }

    private renameVariable(_name: string, _new: string, _data: ƒ.ParticleData.Recursive = this.data): void {
      if (ƒ.ParticleData.isVariable(_data) && _data.value == _name) {
        _data.value = _new;
        this.view.dispatch(EVENT_EDITOR.MODIFY, { detail: { data: _data } })
      }

      for (const subData of Object.values("parameters" in _data ? _data.parameters : _data))
        if (typeof subData == "object")
          this.renameVariable(_name, _new, subData);
    }
  }
}