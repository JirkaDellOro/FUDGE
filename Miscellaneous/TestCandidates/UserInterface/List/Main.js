var ListControl;
(function (ListControl) {
    // import ƒ = FudgeCore;
    var ƒUi = FudgeUserInterface;
    // let list: ƒUi.DetailsArray = new ƒUi.DetailsArray("Vectors");
    // document.body.appendChild(list);
    // ƒUi.Controller.updateUserInterface(data, list);
    let details = ƒUi.Generator.createDetailsFromMutable(ListControl.data, "Vectors");
    details.addEventListener("input", hndInput);
    document.body.appendChild(details);
    function hndInput(_event) {
        let mutator = details.getMutator();
        ListControl.data.mutate(mutator);
        console.log(ListControl.data);
    }
})(ListControl || (ListControl = {}));
//# sourceMappingURL=Main.js.map