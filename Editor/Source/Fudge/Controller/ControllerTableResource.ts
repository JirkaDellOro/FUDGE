namespace Fudge {
  import ƒui = FudgeUserInterface;

  export class ControllerTableResource extends ƒui.TableController<ƒ.SerializableResource> {
    private static head: ƒui.TABLE[] = ControllerTableResource.getHead();

    private static getHead(): ƒui.TABLE[] {
      let head: ƒui.TABLE[] = [];
      head.push({ label: "Name", key: "name", sortable: true, editable: true });
      head.push({ label: "Type", key: "type", sortable: true, editable: false });
      head.push({ label: "Id", key: "idResource", sortable: false, editable: false });
      return head;
    }

    public getHead(): ƒui.TABLE[] {
      return ControllerTableResource.head;
    }

    public getLabel(_object: ƒ.SerializableResource): string {
      return "";
    }
    public rename(_object: ƒ.SerializableResource, _new: string): boolean {
      return false;
    }
    public copy(_originals: ƒ.SerializableResource[]): Promise<ƒ.SerializableResource[]> { return null; }

    public async delete(_focussed: ƒ.SerializableResource[]): Promise<ƒ.SerializableResource[]> {
      console.log(_focussed, this.selection);
      // this.selection = [];
      let expendables: ƒ.SerializableResource[] = this.selection.concat([]); //_focussed);
      let serializations: ƒ.SerializationOfResources = ƒ.Project.serialize();
      let serializationStrings: Map<ƒ.SerializableResource, string> = new Map();
      let usages: ƒ.Mutator = {};
      for (let idResource in serializations)
        serializationStrings.set(ƒ.Project.resources[idResource], JSON.stringify(serializations[idResource]));

      for (let expendable of expendables) {
        usages[expendable.idResource] = [];
        for (let resource of serializationStrings.keys())
          if (resource.idResource != expendable.idResource)
            if (serializationStrings.get(resource).indexOf(expendable.idResource) > -1)
              usages[expendable.idResource].push(resource.name + " " + resource.type);
      }

      if (await openDialog()) {
        let deleted: ƒ.SerializableResource[] = [];
        for (let usage in usages)
          if (usages[usage].length == 0) { // delete only unused
            deleted.push(ƒ.Project.resources[usage]);
            ƒ.Project.deregister(ƒ.Project.resources[usage]);
          }
        return deleted;
      }

      async function openDialog(): Promise<boolean> {
        let promise: Promise<boolean> = ƒui.Dialog.prompt(usages, true, "Review references, delete dependend resources first if applicable", "To delete unused resources, press OK", "OK", "Cancel");

        if (await promise) {
          return true;
        } else
          return false;
      }
      return [];
    }


    public sort(_data: ƒ.SerializableResource[], _key: string, _direction: number): void {
      function compare(_a: ƒ.SerializableResource, _b: ƒ.SerializableResource): number {
        return _direction * (_a[_key] == _b[_key] ? 0 : (_a[_key] > _b[_key] ? 1 : -1));
      }

      _data.sort(compare);
    }
  }
}