namespace TableControl {
  import ƒui = FudgeUserInterface;

  export class TableControlData extends ƒui.TableController<DATA> {
    public getLabel(_object: DATA): string { return ""; }
    public rename(_object: DATA, _new: string): boolean { return false; }
    public delete(_focussed: DATA[]): DATA[] { return null; }
    public copy(_originals: DATA[]): Promise<DATA[]> { return null; }

    public getHead(): ƒui.TABLE[] {
      let head: ƒui.TABLE[] = [];
      head.push({ label: "Name", key: "name", sortable: true, editable: true });
      head.push({ label: "Type", key: "type", sortable: true, editable: false });
      head.push({ label: "Id", key: "id", sortable: false, editable: false });
      return head;
    }

    public sort(_data: DATA[], _key: string, _direction: boolean): void {
      
    }
  }
}