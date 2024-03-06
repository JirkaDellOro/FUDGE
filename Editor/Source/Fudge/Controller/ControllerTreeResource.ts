namespace Fudge {
  import ƒui = FudgeUserInterface;

  export type ResourceNode = ResourceFile | ResourceFolder;

  export interface ResourceFile extends ƒ.SerializableResource {
    resourceParent?: ResourceFolder; // dangerous as a SerializableResource must not have a property with this name itself
  }

  export class ResourceFolder implements ƒ.Serializable {
    public name: string;
    public resourceParent: ResourceFolder;
    public children: ResourceNode[] = [];

    public constructor(_name: string = "New Folder") {
      this.name = _name;
    }

    /**
     * Returns true if this or any of its descendants contain the given resource.
     */
    public contains(_resource: ƒ.SerializableResource): boolean {
      for (let child of this.children) 
        if (child == _resource || child instanceof ResourceFolder && child.contains(_resource))
          return true;
      
      return false;
    }

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
        let child: ResourceNode;
        if ("idResource" in childSerialization)
          child = await ƒ.Project.getResource(childSerialization.idResource);
        else
          child = <ResourceFolder>await new ResourceFolder().deserialize(childSerialization);

        if (child) {
          this.children.push(child);
          child.resourceParent = this;
        }
      }
      return this;
    }

    public *[Symbol.iterator](): IterableIterator<ResourceNode> {
      yield this;
      for (let child of this.children) {
        if (child instanceof ResourceFolder)
          yield* child;
        else
          yield child;
      }
    }
  }

  export class ControllerTreeResource extends ƒui.CustomTreeController<ResourceNode> {
    public createContent(_object: ResourceNode): HTMLFieldSetElement {
      let content: HTMLFieldSetElement = document.createElement("fieldset");
      let name: HTMLInputElement = document.createElement("input");

      name.value = _object.name;
      content.appendChild(name);


      if (!(_object instanceof ResourceFolder)) {
        content.setAttribute("icon", _object.type);

        if ((<ƒ.SerializableResourceExternal>_object).status == ƒ.RESOURCE_STATUS.ERROR) {
          content.classList.add("error");
          content.title = "Failed to load resource from file. Check the console for details.";
        }
      }

      return content;
    }

    public getAttributes(_object: ResourceNode): string {
      return "";
    }

    public async rename(_object: ResourceNode, _id: string, _new: string): Promise<boolean> {
      let rename: boolean = _object.name != _new;
      if (rename) {
        _object.name = _new;
        await (<ƒ.SerializableResourceExternal>_object).load?.();
      }

      return rename;
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
        if (index > -1 && _at > index)
          _at -= 1;

        this.remove(source);
        source.resourceParent = _target;
        move.push(source);

        if (_at == null)
          _target.children.push(source);
        else
          _target.children.splice(_at + _sources.indexOf(source), 0, source);
      }
      return move;
    }

    public async delete(_focussed: ResourceNode[]): Promise<ResourceNode[]> {
      // TODO: add delete selection isntead of _focussed? Why doesn't the Tree class handle this?
      let iRoot: number = _focussed.indexOf(project.resources);
      if (iRoot > -1)
        _focussed.splice(iRoot, 1);

      let serializations: ƒ.SerializationOfResources = ƒ.Project.serialize();
      let serializationStrings: Map<ƒ.SerializableResource, string> = new Map();
      let usages: ƒ.Mutator = {};
      for (let idResource in serializations)
        serializationStrings.set(ƒ.Project.resources[idResource], JSON.stringify(serializations[idResource]));

      for (let expendable of _focussed) {
        if (expendable instanceof ResourceFolder) {
          let usage: string[] = [];
          for (const child of expendable.children)
            usage.push(child.name);

          usages[_focussed.indexOf(expendable) + " " + expendable.name] = usage;
        } else {
          usages[expendable.idResource] = [];
          for (let resource of serializationStrings.keys())
            if (resource.idResource != expendable.idResource)
              if (serializationStrings.get(resource).indexOf(expendable.idResource) > -1)
                usages[expendable.idResource].push(resource.name + " " + resource.type);
        }
      }

      if (_focussed.length > 0 && await openDialog()) {
        let deleted: ResourceNode[] = [];

        for (const selected of _focussed) {
          let key: string = selected instanceof ResourceFolder ? this.selection.indexOf(selected) + " " + selected.name : selected.idResource;
          if (usages[key].length == 0)  // delete only unused
            deleted.push(selected);
        }

        for (let resource of deleted) {
          if (!(resource instanceof ResourceFolder))
            ƒ.Project.deregister(resource);

          this.remove(resource);
          this.selection.splice(this.selection.indexOf(resource), 1);
        }

        return deleted;
      }

      return [];

      async function openDialog(): Promise<boolean> {
        let promise: Promise<boolean> = ƒui.Dialog.prompt(usages, true, "Review references, delete dependend resources first if applicable", "To delete unused resources, press OK", "OK", "Cancel");

        if (await promise) {
          return true;
        } else
          return false;
      }
    }

    public async copy(_originals: ResourceNode[]): Promise<ResourceNode[]> {
      return [];
    }

    public getPath(_resource: ResourceNode): ResourceNode[] {
      let path: ResourceNode[] = [];
      let current: ResourceNode = _resource;
      while (current) {
        path.unshift(current);
        current = current.resourceParent;
      }
      return path;
    }

    public remove(_resource: ResourceNode): void {
      let parent: ResourceFolder = _resource.resourceParent;
      if (!parent)
        return;

      let index: number = parent.children.indexOf(_resource);
      parent.children.splice(index, 1);
    }
  }
}