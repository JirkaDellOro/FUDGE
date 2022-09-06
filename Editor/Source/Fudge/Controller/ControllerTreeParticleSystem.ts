namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  const enum IDS {
    KEY = "key",
    FUNCTION = "function",
    VALUE = "value",
    TRANSFORMATION = "transformation"
  }

  export class ControllerTreeParticleSystem extends ƒui.CustomTreeController<Object | ƒ.ParticleData.Expression> {
    private parentMap: Map<Object, Object> = new Map();

    public createContent(_data: Object | ƒ.ParticleData.Expression): HTMLFormElement {
      let content: HTMLFormElement = document.createElement("form");
      let labelKey: HTMLInputElement = document.createElement("input");
      labelKey.type = "text";
      labelKey.disabled = true;
      labelKey.value = this.parentMap.has(_data) ? this.getKey(_data, this.parentMap.get(_data)) : "root";
      labelKey.id = IDS.KEY;
      content.appendChild(labelKey);

      if (ƒ.ParticleData.isExpression(_data)) {
        if (ƒ.ParticleData.isFunction(_data)) {
          let select: HTMLSelectElement = document.createElement("select");
          select.id = IDS.FUNCTION;
          for (let key in ƒ.RenderInjectorShaderParticleSystem.FUNCTIONS) {
            let entry: HTMLOptionElement = document.createElement("option");
            entry.text = key;
            entry.value = key;
            select.add(entry);
          }
          select.value = _data.function;
          content.appendChild(select);
        } else {
          let input: HTMLInputElement = document.createElement("input");
          input.type = "text";
          input.disabled = true;
          input.id = IDS.VALUE;
          if (ƒ.ParticleData.isVariable(_data)) {  
            input.value = _data.name;
          } else if (ƒ.ParticleData.isConstant(_data)) {
            input.value = _data.value.toString();
          }
          content.appendChild(input);
        } 
      } else if (ƒ.ParticleData.isTransformation(_data)) {
        let select: HTMLSelectElement = document.createElement("select");
        select.id = IDS.TRANSFORMATION;
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

    public getAttributes(_data: Object | ƒ.ParticleData.Expression): string {
      let attributes: string[] = [];
      if (ƒ.ParticleData.isFunction(_data) && this.getPath(_data).includes("variables")) 
        attributes.push("function");
      if (ƒ.ParticleData.isVariable(_data)) 
        attributes.push("variable");

      return attributes.join(" ");
    }
    
    public rename(_data: Object | ƒ.ParticleData.Expression, _id: string, _new: string): void {
      let inputAsNumber: number = Number.parseFloat(_new);

      if (_id == IDS.KEY && Number.isNaN(inputAsNumber) && ƒ.ParticleData.isExpression(_data)) {
        let parentData: Object | ƒ.ParticleData.Function = this.parentMap.get(_data);
        if (!ƒ.ParticleData.isFunction(parentData)) {
          let key: string = this.getKey(_data, parentData); // Object.entries(parentData).find(entry => entry[1] == data)[0];
          if (parentData[_new]) {
            parentData[key] = parentData[_new];
          } else {
            delete parentData[key];
          }
          parentData[_new] = _data;
        }

        return;
      }
      
      if (_id == IDS.FUNCTION && ƒ.ParticleData.isFunction(_data) && Number.isNaN(inputAsNumber)) {
        _data.function = _new;
        return;
      }

      if (_id == IDS.VALUE && ƒ.ParticleData.isVariable(_data) || ƒ.ParticleData.isConstant(_data)) {
        let input: string | number = Number.isNaN(inputAsNumber) ? _new : inputAsNumber;
        _data.type = typeof input == "string" ? "variable" : "constant";
        if (ƒ.ParticleData.isVariable(_data))
          _data.name = input as string;
        else if (ƒ.ParticleData.isConstant(_data))
          _data.value = input as number;
        return;
      }
    }

    public hasChildren(_data: Object | ƒ.ParticleData.Expression): boolean {
      let length: number = 0;
      if (!ƒ.ParticleData.isVariable(_data) && !ƒ.ParticleData.isConstant(_data))
        length = ƒ.ParticleData.isFunction(_data) ? _data.parameters.length : Object.keys(_data).length;

      return length > 0;
    }

    public getChildren(_data: Object | ƒ.ParticleData.Expression): (Object | ƒ.ParticleData.Expression)[] {
      let children: (Object | ƒ.ParticleData.Expression)[] = [];
      if (!ƒ.ParticleData.isVariable(_data) && !ƒ.ParticleData.isConstant(_data)) {
        let subData: Object = ƒ.ParticleData.isFunction(_data) ? _data.parameters : _data;
        let subKeys: string[] = Object.keys(subData);
        if (ƒ.ParticleData.isTransformation(_data))
          subKeys = ViewParticleSystem.TRANSFORMATION_KEYS.filter(_key => subKeys.includes(_key));
        if (this.getPath(_data).includes("color"))
          subKeys = ViewParticleSystem.COLOR_KEYS.filter(_key => subKeys.includes(_key));
        subKeys.forEach(_key => {
          let child: Object | ƒ.ParticleData.Expression = subData[_key];
          if (ƒ.ParticleData.isExpression(child) || typeof child == "object") {
            children.push(child);
            this.parentMap.set(subData[_key], _data);
          }
        });
      }

      return children;
    }

    public delete(_focused: (Object | ƒ.ParticleData.Expression)[]): (Object | ƒ.ParticleData.Expression)[] {
      // delete selection independend of focussed item
      let deleted: (Object | ƒ.ParticleData.Expression)[] = [];
      let expend: (Object | ƒ.ParticleData.Expression)[] = this.selection.length > 0 ? this.selection : _focused;
      for (let data of expend) {
        this.deleteData(data);
        deleted.push(data);
      }
      this.selection.splice(0);
      return deleted;
    }

    public addChildren(_children: (Object | ƒ.ParticleData.Expression)[], _target: Object | ƒ.ParticleData.Expression): (Object | ƒ.ParticleData.Expression)[] {
      let move: (Object | ƒ.ParticleData.Expression)[] = [];
      let tagetPath: string[] = this.getPath(_target);

      if (!_children.every(_data => ƒ.ParticleData.isExpression(_data))) return;

      if (ƒ.ParticleData.isFunction(_target)) {
        // for (let data of _children) {
        //   if (!this.getPath(data).every(_key => tagetPath.includes(_key)))
        //     move.push(data);
        // }
        
        for (let moveData of _children) {
          if (ƒ.ParticleData.isExpression(moveData)) {
            this.deleteData(moveData);
            _target.parameters.push(moveData);
          }
        }
      }
      
      return move;
    }

    public async copy(_originalData: (Object | ƒ.ParticleData.Expression)[]): Promise<(Object | ƒ.ParticleData.Expression)[]> {
      let copies: (Object | ƒ.ParticleData.Expression)[] = [];
      for (let data of _originalData) {
        let newData: Object | ƒ.ParticleData.Expression = JSON.parse(JSON.stringify(data));
        copies.push({ data: newData, path: [""] });
      }

      return copies;
    }

    public getPath(_data:  Object | ƒ.ParticleData.Expression): string[] {
      let path: string[] = [];
      let parent: Object | ƒ.ParticleData.Expression;
      while (this.parentMap.has(_data)) {
        parent = this.parentMap.get(_data);
        path.unshift(this.getKey(_data, parent));
        _data = parent;
      }
      return path;
    }

    private getKey(_data: Object | ƒ.ParticleData.Expression, _parentData: Object | ƒ.ParticleData.Expression): string {
      let key: string;
      if (ƒ.ParticleData.isExpression(_data) && ƒ.ParticleData.isFunction(_parentData)) {
        key = _parentData.parameters.indexOf(_data).toString();
      } else {
        key = Object.entries(_parentData).find(entry => entry[1] == _data)[0];
      }
      return key;
    }

    private deleteData(_data: Object | ƒ.ParticleData.Function): void {
      let parentData: Object | ƒ.ParticleData.Function = this.parentMap.get(_data);
      let key: string = this.getKey(_data, parentData);
      if (ƒ.ParticleData.isFunction(parentData)) {
        parentData.parameters.splice(Number.parseInt(key), 1);
      } else {
        delete parentData[key];
      }
      this.parentMap.delete(_data);
    }

    // TODO: maybe remove path methods these if path becomes unnecessary
    // private getDataAtPath(_path: string[]): Object | ƒ.ParticleData.Expression {
    //   let found: ƒ.General = this.particleEffectRoot;
      
    //   for (let i: number = 0; i < _path.length; i++) {
    //     found = ƒ.ParticleData.isFunction(found) ? found.parameters[_path[i]] : found[_path[i]];
    //   }

    //   return found;
    // }

    // private deleteDataAtPath(_path: string[]): void {
    //   let parentData: Object | ƒ.ParticleData.Function = this.getDataAtPath(_path.slice(0, _path.length - 1));
    //   let key: string = _path[_path.length - 1];
    //   if (ƒ.ParticleData.isFunction(parentData)) {
    //     let index: number = Number.parseInt(key);
    //     parentData.parameters.splice(index, 1);
    //   } else {
    //     delete parentData[key];
    //   }
    // }
  }
}