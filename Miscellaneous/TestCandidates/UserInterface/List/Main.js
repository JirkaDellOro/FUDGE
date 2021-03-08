var ListControl;
(function (ListControl) {
    // import ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    let list = new ƒUi.DetailsArray("Vectors", ListControl.data);
    document.body.appendChild(list);
    ƒUi.Controller.updateUserInterface(list.mutable, list);
})(ListControl || (ListControl = {}));
//# sourceMappingURL=Main.js.map