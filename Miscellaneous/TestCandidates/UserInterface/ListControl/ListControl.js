var ListControl;
(function (ListControl) {
    var ƒui = FudgeUserInterface;
    class ListController extends ƒui.Controller {
        static getHead() {
            let head = [];
            head.push({ label: "Name", key: "name", sortable: true, editable: true });
            head.push({ label: "Type", key: "type", sortable: true, editable: false });
            head.push({ label: "Id", key: "id", sortable: false, editable: true });
            return head;
        }
        getHead() {
            return ListControlData.head;
        }
        getLabel(_object) { return ""; }
        rename(_object, _new) { return false; }
        delete(_focussed) { return null; }
        copy(_originals) { return null; }
        sort(_data, _key, _direction) {
            function compare(_a, _b) {
                return _direction * (_a[_key] == _b[_key] ? 0 : (_a[_key] > _b[_key] ? 1 : -1));
            }
            _data.sort(compare);
        }
    }
    ListController.head = ListControlData.getHead();
    ListControl.ListController = ListController;
})(ListControl || (ListControl = {}));
//# sourceMappingURL=ListControl.js.map