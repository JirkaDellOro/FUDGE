namespace Fudge {
  import ƒui = FudgeUserInterface;

  export interface ScriptInfo {
    name: string;
    namespace: string;
    super: string;
    script: Function;
  }

  export class ControllerTableScript extends ƒui.TableController<ScriptInfo> {
    private static head: ƒui.TABLE[] = ControllerTableScript.getHead();

    private static getHead(): ƒui.TABLE[] {
      let head: ƒui.TABLE[] = [];
      head.push({ label: "Name", key: "name", sortable: true, editable: false });
      head.push({ label: "Super", key: "super", sortable: true, editable: false });
      head.push({ label: "Namespace", key: "namespace", sortable: true, editable: false });
      return head;
    }

    public getHead(): ƒui.TABLE[] {
      return ControllerTableScript.head;
    }

    public getLabel(_object: ScriptInfo): string { return ""; }
    public rename(_object: ScriptInfo, _new: string): boolean { return false; }
    public delete(_focussed: ScriptInfo[]): ScriptInfo[] { return null; }
    public copy(_originals: ScriptInfo[]): Promise<ScriptInfo[]> { return null; }


    public sort(_data: ScriptInfo[], _key: string, _direction: number): void {
      function compare(_a: ScriptInfo, _b: ScriptInfo): number {
        return _direction * (_a[_key] == _b[_key] ? 0 : (_a[_key] > _b[_key] ? 1 : -1));
      }

      _data.sort(compare);
    }
  }
}