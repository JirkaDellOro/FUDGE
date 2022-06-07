namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  const enum IDS {
    KEY = "key",
    VALUE = "value",
    FUNCTION = "function"
  }

  export class ControllerTreeParticleSystem extends ƒui.CustomTreeController<Object | ƒ.ClosureData> {
    private parentMap: Map<Object, Object> = new Map();
    // private particleEffectRoot: ƒ.Serialization;

    constructor(_particleEffectData: ƒ.Serialization) {
      super();
      // this.particleEffectRoot = _particleEffectData;
    }

    public createContent(_data: Object | ƒ.ClosureData): HTMLFormElement {
      // let path: string[] = _dataAndPath.path;

      let content: HTMLFormElement = document.createElement("form");
      let labelKey: HTMLInputElement = document.createElement("input");
      labelKey.type = "text";
      labelKey.disabled = true;
      labelKey.value = this.parentMap.has(_data) ? this.getKey(_data, this.parentMap.get(_data)) : "root";
      labelKey.id = IDS.KEY;
      content.appendChild(labelKey);

      if (ƒ.ParticleEffect.isClosureData(_data)) {
        if (ƒ.ParticleEffect.isFunctionData(_data)) {
          let select: HTMLSelectElement = document.createElement("select");
          select.id = IDS.FUNCTION;
          for (let key in ƒ.ParticleClosureFactory.closures) {
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
          input.value = _data.value.toString();
          content.appendChild(input);
        }
      }

      return content;
    }

    public getAttributes(_data: Object | ƒ.ClosureData): string {
      let attributes: string[] = [];
      if (ƒ.ParticleEffect.isFunctionData(_data) && this.getPath(_data).includes("storage")) 
        attributes.push("function");
      if (ƒ.ParticleEffect.isVariableData(_data)) 
        attributes.push("variable");

      return attributes.join(" ");
    }
    
    public rename(_data: Object | ƒ.ClosureData, _id: string, _new: string): void {
      let inputAsNumber: number = Number.parseFloat(_new);

      if (_id == IDS.KEY && Number.isNaN(inputAsNumber) && ƒ.ParticleEffect.isClosureData(_data)) {
        let parentData: Object | ƒ.FunctionData = this.parentMap.get(_data);
        if (!ƒ.ParticleEffect.isFunctionData(parentData)) {
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

      if (_id == IDS.VALUE && ƒ.ParticleEffect.isVariableData(_data) || ƒ.ParticleEffect.isConstantData(_data)) {
        let input: string | number = Number.isNaN(inputAsNumber) ? _new : inputAsNumber;
        _data.type = typeof input == "string" ? "variable" : "constant";
        _data.value = input;
        return;
      }

      if (_id == IDS.FUNCTION && ƒ.ParticleEffect.isFunctionData(_data) && Number.isNaN(inputAsNumber)) {
        _data.function = _new;
        return;
      }
    }

    public hasChildren(_data: Object | ƒ.ClosureData): boolean {
      let length: number = 0;
      if (!ƒ.ParticleEffect.isVariableData(_data) && !ƒ.ParticleEffect.isConstantData(_data))
        length = ƒ.ParticleEffect.isFunctionData(_data) ? _data.parameters.length : Object.keys(_data).length;
      return length > 0;
    }

    public getChildren(_data: Object | ƒ.ClosureData): (Object | ƒ.ClosureData)[] {
      let children: (Object | ƒ.ClosureData)[] = [];

      if (!ƒ.ParticleEffect.isVariableData(_data) && !ƒ.ParticleEffect.isConstantData(_data)) {
        let subData: Object = ƒ.ParticleEffect.isFunctionData(_data) ? _data.parameters : _data;
        for (const key in subData) {
          let child: Object | ƒ.ClosureData = subData[key];
          children.push(child);
          this.parentMap.set(subData[key], _data);
        }
      }

      return children;
    }

    public delete(_focused: (Object | ƒ.ClosureData)[]): (Object | ƒ.ClosureData)[] {
      // delete selection independend of focussed item
      let deleted: (Object | ƒ.ClosureData)[] = [];
      let expend: (Object | ƒ.ClosureData)[] = this.selection.length > 0 ? this.selection : _focused;
      for (let data of expend) {
        this.deleteData(data);
        deleted.push(data);
      }
      this.selection.splice(0);
      return deleted;
    }

    public addChildren(_children: (Object | ƒ.ClosureData)[], _target: Object | ƒ.ClosureData): (Object | ƒ.ClosureData)[] {
      let move: (Object | ƒ.ClosureData)[] = [];
      let tagetPath: string[] = this.getPath(_target);

      if (!_children.every(_data => ƒ.ParticleEffect.isClosureData(_data))) return;

      if (ƒ.ParticleEffect.isFunctionData(_target)) {
        for (let data of _children) {
          if (!this.getPath(data).every(_key => tagetPath.includes(_key)))
            move.push(data);
        }
        
        for (let data of move) {
          let moveData: ƒ.ClosureData = data as ƒ.ClosureData;
          if (ƒ.ParticleEffect.isClosureData(moveData)) {
            this.deleteData(data);
            _target.parameters.push(moveData);
          }
        }
      }
      
      return move;
    }

    public async copy(_originalData: (Object | ƒ.ClosureData)[]): Promise<(Object | ƒ.ClosureData)[]> {
      let copies: (Object | ƒ.ClosureData)[] = [];
      for (let data of _originalData) {
        let newData: Object | ƒ.ClosureData = JSON.parse(JSON.stringify(data));
        copies.push({ data: newData, path: [""] });
      }

      return copies;
    }

    public getPath(_data:  Object | ƒ.ClosureData): string[] {
      let path: string[] = [];
      let parent: Object | ƒ.ClosureData;
      while (this.parentMap.has(_data)) {
        parent = this.parentMap.get(_data);
        path.unshift(this.getKey(_data, parent));
        _data = parent;
      }
      return path;
    }

    private getKey(_data: Object | ƒ.ClosureData, _parentData: Object | ƒ.ClosureData): string {
      let key: string;
      if (ƒ.ParticleEffect.isClosureData(_data) && ƒ.ParticleEffect.isFunctionData(_parentData)) {
        key = _parentData.parameters.indexOf(_data).toString();
      } else {
        key = Object.entries(_parentData).find(entry => entry[1] == _data)[0];
      }
      return key;
    }

    private deleteData(_data: Object | ƒ.FunctionData): void {
      let parentData: Object | ƒ.FunctionData = this.parentMap.get(_data);
      let key: string = this.getKey(_data, parentData);
      if (ƒ.ParticleEffect.isFunctionData(parentData)) {
        parentData.parameters.splice(Number.parseInt(key), 1);
      } else {
        delete parentData[key];
      }
      this.parentMap.delete(_data);
    }

    // TODO: maybe remove path methods these if path becomes unnecessary
    // private getDataAtPath(_path: string[]): Object | ƒ.ClosureData {
    //   let found: ƒ.General = this.particleEffectRoot;
      
    //   for (let i: number = 0; i < _path.length; i++) {
    //     found = ƒ.ParticleEffect.isFunctionData(found) ? found.parameters[_path[i]] : found[_path[i]];
    //   }

    //   return found;
    // }

    // private deleteDataAtPath(_path: string[]): void {
    //   let parentData: Object | ƒ.FunctionData = this.getDataAtPath(_path.slice(0, _path.length - 1));
    //   let key: string = _path[_path.length - 1];
    //   if (ƒ.ParticleEffect.isFunctionData(parentData)) {
    //     let index: number = Number.parseInt(key);
    //     parentData.parameters.splice(index, 1);
    //   } else {
    //     delete parentData[key];
    //   }
    // }
  }
}