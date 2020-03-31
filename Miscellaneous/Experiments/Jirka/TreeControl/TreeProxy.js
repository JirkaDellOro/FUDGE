// /<reference path="../../../../Core/Build/FudgeCore.d.ts"/>
var TreeControl;
(function (TreeControl) {
    // import ƒ = FudgeCore;
    class TreeProxy {
        constructor() {
            this.selection = [];
            // TODO: stuff sources and target into one dragDrop-Object
            this.dragSource = [];
            this.dropTarget = [];
        }
    }
    TreeControl.TreeProxy = TreeProxy;
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=TreeProxy.js.map