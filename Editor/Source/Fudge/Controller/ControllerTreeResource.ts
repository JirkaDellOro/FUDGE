namespace Fudge {
  import ƒui = FudgeUserInterface;

  export type ResourceNode = ƒ.SerializableResource | ResourceFolder;

  export class ResourceFolder implements ƒ.Serializable {
    public name: string = "New Folder";
    public children: ResourceNode[] = [];

    public serialize(): ƒ.Serialization {
      let serialization: ƒ.Serialization = { name: this.name, children: [] };
      for (let child of this.children) {
        if (child instanceof ResourceFolder)
          serialization.children.push(child.serialize());
        else
          serialization.children.push({ idResource: child.idResource });
      }
      return serialization;
    }

    public async deserialize(_serialization: ƒ.Serialization): Promise<ƒ.Serializable> {
      this.name = _serialization.name;
      for (let childSerialization of _serialization.children) {
        if ("idResource" in childSerialization)
          this.children.push(await ƒ.Project.getResource(childSerialization.idResource));
        else
          this.children.push(<ResourceFolder>await ƒ.Serializer.deserialize(childSerialization));
      }
      return this;
    }
  }

  export class ControllerTreeResource extends ƒui.CustomTreeController<ResourceNode> {
    #mapNodeToParent: Map<ResourceNode, ResourceFolder> = new Map();

    public createContent(_object: ResourceNode): HTMLFieldSetElement {
      let content: HTMLFieldSetElement = document.createElement("fieldset");
      let name: HTMLInputElement = document.createElement("input");
      if (!(_object instanceof ResourceFolder)) {
        content.setAttribute("icon", _object.type);
      }
      name.value = _object.name;
      content.appendChild(name);
      return content;
    }

    public getAttributes(_object: ResourceNode): string {
      return "";
    }

    public rename(_object: ResourceNode, _id: string, _new: string): boolean {
      _object.name = _new;
      return true;
    }

    public hasChildren(_object: ResourceNode): boolean {
      return _object instanceof ResourceFolder && _object.children.length > 0;
    }

    public getChildren(_object: ResourceNode): ResourceNode[] {
      return _object instanceof ResourceFolder ? _object.children : [];
    }

    public addChildren(_sources: ResourceNode[], _target: ResourceNode, _at?: number): ResourceNode[] {
      if (!(_target instanceof ResourceFolder))
        return [];

      let move: ResourceNode[] = [];
      for (let source of _sources) {
        let index: number = _target.children.indexOf(source); // _at needs to be corrected if we are moving within same parent
        let hasParent: boolean = this.#mapNodeToParent.has(source);

        if (hasParent) {
          let parent: ResourceFolder = this.#mapNodeToParent.get(source);
          let index: number = parent.children.indexOf(source);
          parent.children.splice(index, 1);
        }

        move.push(source);
        this.#mapNodeToParent.set(source, _target);

        if (index > -1 && _at > index)
          _at -= 1;

        if (_at == null)
          _target.children.push(source);
        else
          _target.children.splice(_at + _sources.indexOf(source), 0, source);

      }

      // _target.children.splice(_at, 0, ..._sources);

      // for (let source of _sources)
      //   this.#mapNodeToParent.set(source, _target);

      return move;
    }

    public delete(_focussed: ResourceNode[]): ResourceNode[] {
      let deleted: ResourceNode[] = [];
      for (let node of _focussed) {
        let parent: ResourceFolder = this.#mapNodeToParent.get(node);
        let index: number = parent.children.indexOf(node);
        parent.children.splice(index, 1);
        deleted.push(node);
      }
      return deleted;
    }

    public copy(_originals: ResourceNode[]): Promise<ResourceNode[]> {
      throw new Error("Method not implemented.");
    }


    // private static head: ƒui.TABLE[] = ControllerTableResource.getHead();

    // private static getHead(): ƒui.TABLE[] {
    //   let head: ƒui.TABLE[] = [];
    //   head.push({ label: "Name", key: "name", sortable: true, editable: true });
    //   head.push({ label: "Type", key: "type", sortable: true, editable: false });
    //   head.push({ label: "Id", key: "idResource", sortable: false, editable: false });
    //   return head;
    // }

    // public getHead(): ƒui.TABLE[] {
    //   return ControllerTableResource.head;
    // }

    // public getLabel(_object: ƒ.SerializableResource): string {
    //   return "";
    // }

    // public async rename(_object: ƒ.SerializableResource, _new: string): Promise<boolean> {
    //   // console.log("Check rename", _object.name, _new);
    //   let rename: boolean = _object.name != _new;
    //   if (rename) {
    //     _object.name = _new; // must rename before loading, TODO: WHY is it that the renaming is supposed to be handled by the actual table???
    //     await (<ƒ.SerializableResourceExternal>_object).load?.();
    //   }

    //   return rename;
    // }

    // public copy(_originals: ƒ.SerializableResource[]): Promise<ƒ.SerializableResource[]> { return null; }

    // public async delete(_focussed: ƒ.SerializableResource[]): Promise<ƒ.SerializableResource[]> {
    //   console.log(_focussed, this.selection);
    //   // this.selection = [];
    //   let expendables: ƒ.SerializableResource[] = this.selection.concat([]); //_focussed);
    //   let serializations: ƒ.SerializationOfResources = ƒ.Project.serialize();
    //   let serializationStrings: Map<ƒ.SerializableResource, string> = new Map();
    //   let usages: ƒ.Mutator = {};
    //   for (let idResource in serializations)
    //     serializationStrings.set(ƒ.Project.resources[idResource], JSON.stringify(serializations[idResource]));

    //   for (let expendable of expendables) {
    //     usages[expendable.idResource] = [];
    //     for (let resource of serializationStrings.keys())
    //       if (resource.idResource != expendable.idResource)
    //         if (serializationStrings.get(resource).indexOf(expendable.idResource) > -1)
    //           usages[expendable.idResource].push(resource.name + " " + resource.type);
    //   }

    //   if (await openDialog()) {
    //     let deleted: ƒ.SerializableResource[] = [];
    //     for (let usage in usages)
    //       if (usages[usage].length == 0) { // delete only unused
    //         deleted.push(ƒ.Project.resources[usage]);
    //         ƒ.Project.deregister(ƒ.Project.resources[usage]);
    //       }
    //     return deleted;
    //   }

    //   async function openDialog(): Promise<boolean> {
    //     let promise: Promise<boolean> = ƒui.Dialog.prompt(usages, true, "Review references, delete dependend resources first if applicable", "To delete unused resources, press OK", "OK", "Cancel");

    //     if (await promise) {
    //       return true;
    //     } else
    //       return false;
    //   }
    //   return [];
    // }


    // public sort(_data: ƒ.SerializableResource[], _key: string, _direction: number): void {
    //   function compare(_a: ƒ.SerializableResource, _b: ƒ.SerializableResource): number {
    //     return _direction * (_a[_key] == _b[_key] ? 0 : (_a[_key] > _b[_key] ? 1 : -1));
    //   }

    //   _data.sort(compare);
    // }
  }
}