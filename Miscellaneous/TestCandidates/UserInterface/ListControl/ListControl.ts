namespace ListControl {
  import ƒui = FudgeUserInterface;

  export class ListController extends ƒui.Controller {
    private static head: ƒui.TABLE[] = ListControlData.getHead();

    private static getHead(): ƒui.TABLE[] {
      let head: ƒui.TABLE[] = [];
      head.push({ label: "Name", key: "name", sortable: true, editable: true });
      head.push({ label: "Type", key: "type", sortable: true, editable: false });
      head.push({ label: "Id", key: "id", sortable: false, editable: true });
      return head;
    }

    public getHead(): ƒui.TABLE[] {
        return ListControlData.head;
    }

    public getLabel(_object: ƒ.Mutable): string { return ""; }
    public rename(_object: ƒ.Mutable, _new: string): boolean { return false; }
    public delete(_focussed: ƒ.Mutable[]): ƒ.Mutable[] { return null; }
    public copy(_originals: ƒ.Mutable[]): Promise<ƒ.Mutable[]> { return null; }


    public sort(_data: ƒ.Mutable[], _key: string, _direction: number): void {
      function compare(_a: ƒ.Mutable, _b: ƒ.Mutable): number {
        return _direction * (_a[_key] == _b[_key] ? 0 : (_a[_key] > _b[_key] ? 1 : -1));
      }

      _data.sort(compare);
    }
  }
}