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

    public getLabel(_object: ƒ.SerializableResource): string { return ""; }
    public rename(_object: ƒ.SerializableResource, _new: string): boolean { return false; }
    public copy(_originals: ƒ.SerializableResource[]): Promise<ƒ.SerializableResource[]> { return null; }
    public delete(_focussed: ƒ.SerializableResource[]): ƒ.SerializableResource[] { 
      return null; 
    }


    public sort(_data: ƒ.SerializableResource[], _key: string, _direction: number): void {
      function compare(_a: ƒ.SerializableResource, _b: ƒ.SerializableResource): number {
        return _direction * (_a[_key] == _b[_key] ? 0 : (_a[_key] > _b[_key] ? 1 : -1));
      }

      _data.sort(compare);
    }
  }
}