var ListControl;
(function (ListControl) {
    // import ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    let list = new ListControl.ExpendableList("Vectors", ListControl.data);
    document.body.appendChild(list);
    ƒUi.Controller.updateUserInterface(list.mutable, list);
    let details = document.createElement("details");
    document.body.appendChild(details);
    details.innerHTML = "<ol><li>this</li><li>is a</li><li>list</li></ol><summary>ABC</summary><h1>Test</h1>";
    details.open = true;
})(ListControl || (ListControl = {}));
//# sourceMappingURL=Main.js.map