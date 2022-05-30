namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  export interface ParticleEffectDataAndPath {
    data: Object | ƒ.FunctionData | string | number;
    path: string[];
  }

  const enum IDS {
    KEY = "key",
    VALUE = "value",
    FUNCTION = "function"
  }

  export class ControllerTreeParticleSystem extends ƒui.CustomTreeController<ParticleEffectDataAndPath> {
    private particleEffectRoot: ƒ.Serialization;

    constructor(_particleEffectData: ƒ.Serialization) {
      super();
      this.particleEffectRoot = _particleEffectData;
    }

    public createContent(_dataAndPath: ParticleEffectDataAndPath): HTMLFormElement {
      let path: string[] = _dataAndPath.path;
      let data: Object | ƒ.FunctionData | string | number = _dataAndPath.data;

      let content: HTMLFormElement = document.createElement("form");
      let labelKey: HTMLInputElement = document.createElement("input");
      labelKey.type = "text";
      labelKey.disabled = true;
      labelKey.value = path[path.length - 1];
      labelKey.id = IDS.KEY;
      content.appendChild(labelKey);

      if (ƒ.ParticleEffect.isClosureData(data)) {
        if (ƒ.ParticleEffect.isFunctionData(data)) {
          let select: HTMLSelectElement = document.createElement("select");
          select.id = IDS.FUNCTION;
          for (let key in ƒ.ParticleClosureFactory.closures) {
            let entry: HTMLOptionElement = document.createElement("option");
            entry.text = key;
            entry.value = key;
            select.add(entry);
          }
          select.value = data.function;
          content.appendChild(select);
        } else {
          let input: HTMLInputElement = document.createElement("input");
          input.type = "sel";
          input.disabled = true;
          input.id = IDS.VALUE;
          input.value = data.toString();
          content.appendChild(input);
        }
      }

      return content;
    }

    public getLabel(_key: string, _dataAndPath: ParticleEffectDataAndPath): string {
      return _dataAndPath[_key];
    }

    public getAttributes(_dataAndPath: ParticleEffectDataAndPath): string {
      let attributes: string[] = [];
      let data: Object | ƒ.FunctionData | string | number = _dataAndPath.data;
      if (_dataAndPath.path.includes("storage") && ƒ.ParticleEffect.isFunctionData(data)) 
        attributes.push("function");
      if (typeof data == "string") 
        attributes.push(typeof data);

      return attributes.join(" ");
    }
    
    public rename(_dataAndPath: ParticleEffectDataAndPath, _key: string, _new: string): void {
      let inputAsNumber: number = Number.parseFloat(_new);
      let path: string[] = _dataAndPath.path;
      let data: Object | ƒ.FunctionData | string | number = _dataAndPath.data;

      if (_key == IDS.KEY && Number.isNaN(inputAsNumber) && ƒ.ParticleEffect.isClosureData(data)) {
        let parentData: Object | ƒ.FunctionData = this.getDataAtPath(path.slice(0, path.length - 1));
        if (!ƒ.ParticleEffect.isFunctionData(parentData)) {
          let key: string = path[path.length - 1];
          if (parentData[_new]) {
            parentData[key] = parentData[_new];
          } else {
            delete parentData[key];
          }
          parentData[_new] = data;
        }

        path[path.length - 1] = _new;
        return;
      }

      if (_key == IDS.VALUE) {
        let parentData: Object | ƒ.FunctionData = this.getDataAtPath(path.slice(0, path.length - 1));
        let input: string | number = Number.isNaN(inputAsNumber) ? _new : inputAsNumber;
        parentData = ƒ.ParticleEffect.isFunctionData(parentData) ? parentData.parameters : parentData;
        parentData[path[path.length - 1]] = input;
        return;
      }

      if (_key == IDS.FUNCTION && ƒ.ParticleEffect.isFunctionData(data) && Number.isNaN(inputAsNumber)) {
        data.function = _new;
        return;
      }
    }

    public hasChildren(_dataAndPath: ParticleEffectDataAndPath): boolean {
      let data: Object | ƒ.FunctionData | string | number = _dataAndPath.data;
      let length: number = 0;
      if (typeof data != "string" && typeof data != "number")
        length = ƒ.ParticleEffect.isFunctionData(data) ? data.parameters.length : Object.keys(data).length;
      return length > 0;
    }

    public getChildren(_dataAndPath: ParticleEffectDataAndPath): ParticleEffectDataAndPath[] {
      let data: Object | ƒ.FunctionData | string | number = _dataAndPath.data;
      let children: ParticleEffectDataAndPath[] = [];

      if (typeof data != "string" && typeof data != "number") {
        let subData: Object = ƒ.ParticleEffect.isFunctionData(data) ? data.parameters : data;
        for (const key in subData) {
          children.push({ data: subData[key], path: _dataAndPath.path.concat(key) });
        }
      }

      return children;
    }

    public delete(_focused: ParticleEffectDataAndPath[]): ParticleEffectDataAndPath[] {
      // delete selection independend of focussed item
      let deleted: ParticleEffectDataAndPath[] = [];
      let expend: ParticleEffectDataAndPath[] = this.selection.length > 0 ? this.selection : _focused;
      for (let pathAndData of expend) {
        this.deleteDataAtPath(pathAndData.path);
        deleted.push(pathAndData);
      }
      this.selection.splice(0);
      return deleted;
    }

    public addChildren(_children: ParticleEffectDataAndPath[], _target: ParticleEffectDataAndPath): ParticleEffectDataAndPath[] {
      let move: ParticleEffectDataAndPath[] = [];
      let targetData: Object | ƒ.FunctionData | string | number = _target.data;

      if (!_children.every(_dataAndPath => ƒ.ParticleEffect.isClosureData(_dataAndPath.data))) return;

      if (ƒ.ParticleEffect.isFunctionData(targetData)) {
        for (let pathAndData of _children) {
          if (!pathAndData.path.every(_key => _target.path.includes(_key)))
            move.push(pathAndData);
        }
        
        for (let pathAndData of move) {
          let moveData: ƒ.FunctionData | string | number = pathAndData.data as ƒ.FunctionData | string | number;
          if (ƒ.ParticleEffect.isClosureData(moveData)) {
            this.deleteDataAtPath(pathAndData.path);
            targetData.parameters.push(moveData);
          }
        }
      }
      
      return move;
    }

    public async copy(_originalData: ParticleEffectDataAndPath[]): Promise<ParticleEffectDataAndPath[]> {
      let copies: ParticleEffectDataAndPath[] = [];
      for (let pathAndData of _originalData) {
        let data: string | number | Object | ƒ.FunctionData = JSON.parse(JSON.stringify(pathAndData.data));
        copies.push({ data: data, path: [""] });
      }

      return copies;
    }

    public equals(_a: ParticleEffectDataAndPath, _b: ParticleEffectDataAndPath): boolean {
      return _a.data == _b.data;
    }

    private getDataAtPath(_path: string[]): Object | ƒ.FunctionData | string | number {
      let found: ƒ.General = this.particleEffectRoot;
      
      for (let i: number = 0; i < _path.length; i++) {
        found = ƒ.ParticleEffect.isFunctionData(found) ? found.parameters[_path[i]] : found[_path[i]];
      }

      return found;
    }

    private deleteDataAtPath(_path: string[]): void {
      let parentData: Object | ƒ.FunctionData = this.getDataAtPath(_path.slice(0, _path.length - 1));
      let key: string = _path[_path.length - 1];
      if (ƒ.ParticleEffect.isFunctionData(parentData)) {
        let index: number = Number.parseInt(key);
        parentData.parameters.splice(index, 1);
      } else {
        delete parentData[key];
      }
    }
  }
}