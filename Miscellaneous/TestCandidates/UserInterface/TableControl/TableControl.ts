namespace TableControl {
  import ƒui = FudgeUserInterface;

  export class TableControlData extends ƒui.TableController<DATA> {
    private static head: ƒui.TABLE[] = TableControlData.getHead();

    private static getHead(): ƒui.TABLE[] {
      let head: ƒui.TABLE[] = [];
      head.push({ label: "Name", key: "name", sortable: true, editable: true });
      head.push({ label: "Type", key: "type", sortable: true, editable: false });
      head.push({ label: "Id", key: "id", sortable: false, editable: true });
      return head;
    }

    public getHead(): ƒui.TABLE[] {
        return TableControlData.head;
    }

    public getLabel(_object: DATA): string { return ""; }
    public rename(_object: DATA, _new: string): boolean { return false; }
    public delete(_focussed: DATA[]): DATA[] { return null; }
    public copy(_originals: DATA[]): Promise<DATA[]> { return null; }


    public sort(_data: DATA[], _key: string, _direction: number): void {
      function compare(_a: DATA, _b: DATA): number {
        return _direction * (_a[_key] == _b[_key] ? 0 : (_a[_key] > _b[_key] ? 1 : -1));
      }

      _data.sort(compare);
    }
  }
}