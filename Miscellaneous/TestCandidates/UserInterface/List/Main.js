var ListControl;
(function (ListControl) {
    // import ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    let details = ƒUi.Generator.createDetailsFromMutable(ListControl.data, "Vectors");
    let cntDetails = new ƒUi.Controller(ListControl.data, details);
    document.body.appendChild(details);
    ƒUi.Controller.updateUserInterface(ListControl.data, details);
    details.addEventListener("input" /* INPUT */, hndInput);
    function hndInput(_event) {
        let mutator = details.getMutator();
        ListControl.data.mutate(mutator);
        cntDetails.updateUserInterface();
        console.log(ListControl.data);
    }
})(ListControl || (ListControl = {}));
//# sourceMappingURL=Main.js.map