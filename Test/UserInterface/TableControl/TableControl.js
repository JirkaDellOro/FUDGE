var TableControl;
(function (TableControl) {
    var ƒui = FudgeUserInterface;
    class TableControlData extends ƒui.TableController {
        getLabel(_object) { return ""; }
        rename(_object, _new) { return false; }
        delete(_focussed) { return null; }
        copy(_originals) { return null; }
        getHead() {
            let head = [];
            head.push({ label: "Name", key: "name", sortable: true, editable: true });
            head.push({ label: "Type", key: "type", sortable: true, editable: false });
            head.push({ label: "Id", key: "id", sortable: false, editable: false });
            return head;
        }
        sort(_data, _key, _direction) {
            function compare(_a, _b) {
                return _direction * (_a[_key] == _b[_key] ? 0 : (_a[_key] > _b[_key] ? 1 : -1));
            }
            _data.sort(compare);
        }
    }
    TableControl.TableControlData = TableControlData;
})(TableControl || (TableControl = {}));
//# sourceMappingURL=TableControl.js.map