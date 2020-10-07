namespace Fudge {
  import ƒui = FudgeUserInterface;

  export class ScriptInfo {
    public name: string;
    public namespace: string;
    public superClass: string;
    public script: Function;

    public constructor(_name: string, _namespace: string, _script: Function, _superClass: string) {
      this.name = _name;
      this.namespace = _namespace;
      this.superClass = _superClass;
      this.script = _script;
    }
  }

  export class ControllerTableScript extends ƒui.TableController<ScriptInfo> {
    private static head: ƒui.TABLE[] = ControllerTableScript.getHead();

    private static getHead(): ƒui.TABLE[] {
      let head: ƒui.TABLE[] = [];
      head.push({ label: "Name", key: "name", sortable: true, editable: false });
      head.push({ label: "Super", key: "superClass", sortable: true, editable: false });
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