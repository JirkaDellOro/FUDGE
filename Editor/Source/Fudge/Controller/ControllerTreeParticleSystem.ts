namespace Fudge {
  import ƒ = FudgeCore;
  import ƒui = FudgeUserInterface;

  const enum ID {
    KEY = "key",
    FUNCTION = "function",
    VALUE = "value",
    TRANSFORMATION = "transformation"
  }

  export class ControllerTreeParticleSystem extends ƒui.CustomTreeController<ƒ.ParticleData.EffectRecursive> {
    public childToParent: Map<ƒ.ParticleData.EffectRecursive, ƒ.ParticleData.EffectRecursive> = new Map();
    private particleEffect: ƒ.ParticleData.Effect;

    constructor(_particleEffect: ƒ.ParticleData.Effect) {
      super();
      this.particleEffect = _particleEffect;
    }

    public createContent(_effect: ƒ.ParticleData.EffectRecursive): HTMLFormElement {
      let content: HTMLFormElement = document.createElement("form");

      let parentData: ƒ.ParticleData.EffectRecursive = this.childToParent.get(_effect);
      let key: string = this.getKey(_effect, parentData);
      if (parentData == this.particleEffect.variables) {
        let input: HTMLInputElement = document.createElement("input");
        input.type = "text";
        input.disabled = true;
        input.value = key;
        input.id = ID.KEY;
        content.appendChild(input);
      }

      if (!ƒ.ParticleData.isExpression(_effect) && !ƒ.ParticleData.isTransformation(_effect)) {
        let spanName: HTMLSpanElement = document.createElement("span");
        spanName.innerText = parentData ? key : ƒ.ParticleSystem.name;
        content.appendChild(spanName);
      }

      if (ƒ.ParticleData.isExpression(_effect) && parentData != this.particleEffect.variables) {
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

      if (ƒ.ParticleData.isExpression(_effect)) {
        if (ƒ.ParticleData.isFunction(_effect)) {
          let select: HTMLSelectElement = document.createElement("select");
          select.id = ID.FUNCTION;
          for (let name of Object.values(ƒ.ParticleData.FUNCTION)) {
            let entry: HTMLOptionElement = document.createElement("option");
            entry.text = name;
            entry.value = name;
            select.add(entry);
          }
          select.value = _effect.function;
          content.appendChild(select);
        } else {
          let input: HTMLInputElement = document.createElement("input");
          input.type = "text";
          input.disabled = true;
          input.id = ID.VALUE;
          input.setAttribute("list", "variables");
          input.value = _effect.value.toString();
          content.appendChild(input);
        } 
      } else if (ƒ.ParticleData.isTransformation(_effect)) {
        let select: HTMLSelectElement = document.createElement("select");
        select.id = ID.TRANSFORMATION;
        for (let key of [ƒ.Matrix4x4.prototype.translate.name, ƒ.Matrix4x4.prototype.rotate.name, ƒ.Matrix4x4.prototype.scale.name]) {
          let entry: HTMLOptionElement = document.createElement("option");
          entry.text = key;
          entry.value = key;
          select.add(entry);
        }
        select.value = _effect.transformation;
        content.appendChild(select);
      }

      return content;
    }

    public getAttributes(_effect: ƒ.ParticleData.EffectRecursive): string {
      let attributes: string[] = [];
      if (ƒ.ParticleData.isVariable(_effect) || this.childToParent.get(_effect) == this.particleEffect.variables) 
        attributes.push("variable");

      return attributes.join(" ");
    }
    
    public rename(_effect: ƒ.ParticleData.EffectRecursive, _id: string, _new: string): void {
      let inputAsNumber: number = Number.parseFloat(_new);

      if (_id == ID.KEY && ƒ.ParticleData.isExpression(_effect)) {
        let parentData: ƒ.ParticleData.EffectRecursive = this.childToParent.get(_effect);
        let key: string = this.getKey(_effect, parentData);
        let target: Object = ƒ.ParticleData.isFunction(parentData) ? parentData.parameters : parentData;
        
        if (parentData == this.particleEffect.variables) {
          let errors: string[] = [];
          if (this.isReferenced(key))
            errors.push(`variable "${key}" is still referenced`);
          if (this.particleEffect.variables[_new])
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
        target[_new] = _effect;

        return;
      }

      if (_id == ID.FUNCTION && ƒ.ParticleData.isFunction(_effect)) {
        _effect.function = <ƒ.ParticleData.FUNCTION>_new;
        return;
      }

      if (_id == ID.TRANSFORMATION && ƒ.ParticleData.isTransformation(_effect)) {
        _effect.transformation = <ƒ.ParticleData.Transformation["transformation"]>_new;
        return;
      }

      if (_id == ID.VALUE && (ƒ.ParticleData.isVariable(_effect) || ƒ.ParticleData.isConstant(_effect))) {
        let input: string | number = Number.isNaN(inputAsNumber) ? _new : inputAsNumber;
        if (typeof input == "string" && !this.particleEffect.variables[input] && !ƒ.ParticleData.PREDEFINED_VARIABLES[input]) 
          return;
        _effect.value = input;

        return;
      }
    }

    public hasChildren(_effect: ƒ.ParticleData.EffectRecursive): boolean {
      let length: number = 0;
      if (!ƒ.ParticleData.isVariable(_effect) && !ƒ.ParticleData.isConstant(_effect))
        length = ƒ.ParticleData.isFunction(_effect) ? _effect.parameters.length : Object.keys(_effect).length;

      return length > 0;
    }

    public getChildren(_effect: ƒ.ParticleData.EffectRecursive): (ƒ.ParticleData.EffectRecursive)[] {
      let children: (ƒ.ParticleData.EffectRecursive)[] = [];
      if (!ƒ.ParticleData.isVariable(_effect) && !ƒ.ParticleData.isConstant(_effect)) {
        let subData: Object = ƒ.ParticleData.isFunction(_effect) ? _effect.parameters : _effect;
        let subKeys: string[] = Object.keys(subData);

        // sort keys for color and vector e.g. ("r", "g", "b", "a")
        if (ƒ.ParticleData.isTransformation(_effect))
          subKeys = ViewParticleSystem.TRANSFORMATION_KEYS.filter(_key => subKeys.includes(_key));
        if (_effect == this.particleEffect.color)
          subKeys = ViewParticleSystem.COLOR_KEYS.filter(_key => subKeys.includes(_key));

        subKeys.forEach(_key => {
          let child: ƒ.ParticleData.EffectRecursive = subData[_key];
          if (ƒ.ParticleData.isExpression(child) || typeof child == "object") {
            children.push(child);
            this.childToParent.set(subData[_key], _effect);
          }
        });
      }

      return children;
    }

    public delete(_focused: (ƒ.ParticleData.EffectRecursive)[]): (ƒ.ParticleData.EffectRecursive)[] {
      // delete selection independend of focussed item
      let deleted: (ƒ.ParticleData.EffectRecursive)[] = [];
      let expend: (ƒ.ParticleData.EffectRecursive)[] = this.selection.length > 0 ? this.selection : _focused;
      for (let effect of expend) {
        if (this.deleteEffect(effect))
          deleted.push(effect);
      }
      this.selection.splice(0);
      return deleted;
    }

    public addChildren(_children: ƒ.ParticleData.EffectRecursive[], _target: ƒ.ParticleData.EffectRecursive, _at?: number): ƒ.ParticleData.EffectRecursive[] {
      let move: ƒ.ParticleData.Expression[] = [];
      let container: Object;
      if (ƒ.ParticleData.isFunction(_target) && _children.every(_effect => ƒ.ParticleData.isExpression(_effect)))
        container = _target.parameters;
      else if (Array.isArray(_target) && _children.every(_effect => ƒ.ParticleData.isTransformation(_effect)))
        container = _target;
      else if ((ƒ.ParticleData.isTransformation(_target) || _target == this.particleEffect.color || _target == this.particleEffect.variables) && _children.every(_effect => ƒ.ParticleData.isExpression(_effect)))
        container = _target;

      if (!container) 
        return move;

      if (Array.isArray(container)) 
        for (let effect of (<ƒ.ParticleData.Expression[]>_children)) {
          let index: number = container.indexOf(effect); // _at needs to be corrected if we are moving within same parent
          let hasParent: boolean = this.childToParent.has(effect);
          if (hasParent && !this.deleteEffect(effect)) continue;
          if (!hasParent)
            effect = JSON.parse(JSON.stringify(effect));

          move.push(effect);
          this.childToParent.set(effect, _target);
          if (index > -1 && _at > index)
            _at -= 1;
          if (_at == null) 
            container.push(effect);
          else 
            container.splice(_at + _children.indexOf(effect), 0, effect);
        } 
      else
        for (let effect of (<ƒ.ParticleData.Expression[]>_children)) {
          let usedKeys: string[] = Object.keys(_target);
          let newKey: string;
          if (ƒ.ParticleData.isTransformation(_target))
            newKey = ViewParticleSystem.TRANSFORMATION_KEYS.filter(_key => !usedKeys.includes(_key)).shift();
          else if (_target == this.particleEffect.color)
            newKey = ViewParticleSystem.COLOR_KEYS.filter(_key => !usedKeys.includes(_key)).shift();
          else if (_target == this.particleEffect.variables && this.getKey(effect, _target) == null) 
            newKey = `variable${usedKeys.length}`;
          if (newKey == null) 
            continue;

          let hasParent: boolean = this.childToParent.has(effect);
          if (hasParent && !this.deleteEffect(effect)) 
            continue;
          if (!hasParent)
            effect = JSON.parse(JSON.stringify(effect));

          _target[newKey] = effect;
          move.push(effect);
          this.childToParent.set(effect, _target);
        }
      return move;
    }

    public async copy(_originals: ƒ.ParticleData.EffectRecursive[]): Promise<ƒ.ParticleData.EffectRecursive[]> {
      let copies: (ƒ.ParticleData.EffectRecursive)[] = [];
      if (_originals.every(_original => ƒ.ParticleData.isExpression(_original)) || _originals.every(_original => ƒ.ParticleData.isTransformation(_original)))
        _originals.forEach(_original => copies.push(JSON.parse(JSON.stringify(_original))));

      return copies;
    }

    public override draggable(_target: ƒ.ParticleData.EffectRecursive): boolean {
      return ƒ.ParticleData.isExpression(_target) || ƒ.ParticleData.isTransformation(_target);
    }

    private getKey(_effect: ƒ.ParticleData.EffectRecursive, _parentData: ƒ.ParticleData.EffectRecursive): string {
      let key: string;
      if (!_parentData) return null;
      if (ƒ.ParticleData.isExpression(_effect) && ƒ.ParticleData.isFunction(_parentData)) {
        key = _parentData.parameters.indexOf(_effect).toString();
      } else {
        key = Object.entries(_parentData).find(entry => entry[1] == _effect)?.shift();
      }
      return key;
    }

    private deleteEffect(_effect: ƒ.ParticleData.EffectRecursive): boolean {
      if (!ƒ.ParticleData.isExpression(_effect) && !ƒ.ParticleData.isTransformation(_effect)) 
        return false;

      let parentData: ƒ.ParticleData.EffectRecursive = this.childToParent.get(_effect);
      let key: string = this.getKey(_effect, parentData);
      let index: number = Number.parseInt(key);

      if (parentData == this.particleEffect.variables && this.isReferenced(key)) {
        ƒui.Warning.display([`variable "${key}" is still referenced`], "Unable to delete", "Please resolve the errors and try again");
        return false;
      }

      if (ƒ.ParticleData.isFunction(parentData)) 
        parentData.parameters.splice(index, 1);
      else if (Array.isArray(parentData)) 
        parentData.splice(index, 1);
      else 
        delete parentData[key];
      
      this.childToParent.delete(_effect);
      return true;
    }

    private isReferenced(_name: string, _effect: ƒ.ParticleData.EffectRecursive = this.particleEffect): boolean {
      if (ƒ.ParticleData.isVariable(_effect) && _effect.value == _name) 
        return true;
      for (const subData of Object.values(ƒ.ParticleData.isFunction(_effect) ? _effect.parameters : _effect)) 
        if (typeof subData == "object" && this.isReferenced(_name, subData))
          return true;
        
      return false;
    }
  }
}