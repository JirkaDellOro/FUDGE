namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  // interface PathAndData {
  //   path: string;
  //   data: Object | ƒ.FunctionData | string | number;
  // }

  const enum KEYS {
    KEY = "key",
    VALUE = "value",
    FUNCTION = "function"
  }

  export class ControllerTreeParticleSystem extends ƒui.CustomTreeController<string[]> {
    private particleEffectData: ƒ.Serialization;

    constructor(_particleEffectData: ƒ.Serialization) {
      super();
      this.particleEffectData = _particleEffectData;
    }

    public createContent(_path: string[]): HTMLElement {
      let data: Object | ƒ.FunctionData | string | number = this.getDataAtPath(_path);

      let content: HTMLElement = document.createElement("span");
      let labelKey: HTMLInputElement = document.createElement("input");
      labelKey.type = "text";
      labelKey.disabled = true;
      labelKey.value = _path[_path.length - 1];
      labelKey.setAttribute("key", KEYS.KEY);
      content.appendChild(labelKey);

      if (ƒ.ParticleEffect.isClosureData(data)) {
        let labelValue: HTMLInputElement = document.createElement("input");
        labelValue.type = "text";
        labelValue.disabled = true;
        if (ƒ.ParticleEffect.isFunctionData(data)) {
          labelValue.setAttribute("key", KEYS.FUNCTION);
          labelValue.value = data.function;
        } else {
          labelValue.setAttribute("key", KEYS.VALUE);
          labelValue.value = data.toString();
        }
        content.appendChild(labelValue);
      }

      return content;
    }

    public getLabel(_key: string, _path: string[]): string {
      return _path[_key];
    }

    public getAttributes(_path: string[]): string {
      let attributes: string[] = [];
      let data: Object | ƒ.FunctionData | string | number = this.getDataAtPath(_path);
      if (_path.includes("storage") && ƒ.ParticleEffect.isFunctionData(data)) 
        attributes.push("function");
      if (typeof data == "string") 
        attributes.push(typeof data);

      return attributes.join(" ");
    }
    
    public rename(_path: string[], _key: string, _new: string): void {
      let inputAsNumber: number = Number.parseFloat(_new);
      let data: Object | ƒ.FunctionData | string | number = this.getDataAtPath(_path);

      if (_key == KEYS.KEY && Number.isNaN(inputAsNumber) && ƒ.ParticleEffect.isClosureData(data)) {
        let parentData: Object | ƒ.FunctionData = this.getDataAtPath(_path.slice(0, _path.length - 1));
        if (!ƒ.ParticleEffect.isFunctionData(parentData)) {
          let key: string = _path[_path.length - 1];
          if (parentData[_new]) {
            parentData[key] = parentData[_new];
          } else {
            delete parentData[key];
          }
          parentData[_new] = data;
        }

        _path[_path.length - 1] = _new;
        return;
      }

      if (_key == KEYS.VALUE) {
        let parentData: Object | ƒ.FunctionData = this.getDataAtPath(_path.slice(0, _path.length - 1));
        let input: string | number = Number.isNaN(inputAsNumber) ? _new : inputAsNumber;
        parentData = ƒ.ParticleEffect.isFunctionData(parentData) ? parentData.parameters : parentData;
        parentData[_path[_path.length - 1]] = input;
        return;
      }

      if (_key == KEYS.FUNCTION && ƒ.ParticleEffect.isFunctionData(data) && Number.isNaN(inputAsNumber)) {
        data.function = _new;
        return;
      }
    }

    public hasChildren(_path: string[]): boolean {
      let data: Object | ƒ.FunctionData | string | number = this.getDataAtPath(_path);
      let length: number = 0;
      if (typeof data != "string" && typeof data != "number")
        length = ƒ.ParticleEffect.isFunctionData(data) ? data.parameters.length : Object.keys(data).length;
      return length > 0;
    }

    public getChildren(_path: string[]): string[][] {
      let data: Object | ƒ.FunctionData | string | number = this.getDataAtPath(_path);
      let childPaths: string[][] = [];

      if (typeof data != "string" && typeof data != "number") {
        let children: Object = ƒ.ParticleEffect.isFunctionData(data) ? data.parameters : data;
        for (const key in children) {
          childPaths.push(_path.concat(key));
        }
      }
      return childPaths;
    }

    public delete(_focused: string[][]): string[][] {
      // delete selection independend of focussed item
      let deleted: string[][] = [];
      let expend: string[][] = this.selection.length > 0 ? this.selection : _focused;
      for (let path of expend) {
        this.deleteDataAtPath(path);
        deleted.push(path);
      }
      this.selection.splice(0);
      return deleted;
    }

    public addChildren(_childPaths: string[][], _targetPath: string[]): string[][] {
      let move: string[][] = [];
      let targetData: Object | ƒ.FunctionData | string | number = this.getDataAtPath(_targetPath);

      if (!_childPaths.map(_path => this.getDataAtPath(_path)).every(_data => _data)) return;

      if (ƒ.ParticleEffect.isFunctionData(targetData)) {
        for (let path of _childPaths) {
          if (!path.every(_key => _targetPath.includes(_key)))
            move.push(path);
        }
        
        for (let path of move) {
          let moveData: ƒ.FunctionData | string | number = this.getDataAtPath(path) as ƒ.FunctionData | string | number;
          if (ƒ.ParticleEffect.isClosureData(moveData)) {
            this.deleteDataAtPath(path);
            targetData.parameters.push(moveData);
          }
        }
      }
      
      return move;
    }

    public async copy(_originalPaths: string[][]): Promise<string[][]> {
      // try to create copies and return them for paste operation
      let copies: string[][];
      for (let originalPath of _originalPaths) {
        // let serialization: ƒ.Serialization = ƒ.Serializer.serialize(original);
        // let copy: ParticleEffectNode = <ParticleEffectNode>await ƒ.Serializer.deserialize(serialization);
        // copies.push(copy);
      }
      return copies;
    }

    private getDataAtPath(_path: string[]): Object | ƒ.FunctionData | string | number {
      let found: ƒ.General = this.particleEffectData;
      
      for (let i: number = 0; i < _path.length; i++) {
        found = ƒ.ParticleEffect.isFunctionData(found) ? found.parameters[_path[i]] : found[_path[i]];
      }

      return found;
    }

    private deleteDataAtPath(_path: string[]): void {
      let parentData: Object | ƒ.FunctionData = this.getDataAtPath(_path.slice(0, _path.length - 1));
      let key: string = _path[_path.length - 1];
      if (ƒ.ParticleEffect.isFunctionData(parentData)) {
// TODO: find a way to fix paths after splice, code is duplicated with delete
        let index: number = Number.parseInt(key);
        parentData.parameters.splice(index, index + 1);
      } else {
        delete parentData[key];
      }
    }

    private isClosureData(_data: Object | ƒ.FunctionData | string | number): boolean {
      return ƒ.ParticleEffect.isFunctionData(_data) || typeof _data == "string" || typeof _data == "number";
    }
  }
}