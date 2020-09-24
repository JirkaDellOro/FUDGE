var TableControl;
(function (TableControl) {
    var ƒui = FudgeUserInterface;
    let controller = new TableControl.TableControlData();
    let table = new ƒui.Table(controller, TableControl.data);
    document.body.appendChild(table);
})(TableControl || (TableControl = {}));
//# sourceMappingURL=Main.js.map