var ListControl;
(function (ListControl) {
    // import ƒ = FudgeCore;
    var ƒui = FudgeUserInterface;
    let controller = new ListControl.ListControlData();
    let table = new ƒui.Table(controller, ListControl.data);
    document.body.appendChild(table);
})(ListControl || (ListControl = {}));
//# sourceMappingURL=Main.js.map