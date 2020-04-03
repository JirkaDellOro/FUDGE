var TreeControl;
(function (TreeControl) {
    /**
     * Subclass this to create a broker between your data and a [[Tree]] to display and manipulate it.
     * The [[Tree]] doesn't know how your data is structured and how to handle it, the broker implements the methods needed
     * // TODO: check if this could be achieved more elegantly using decorators
     */
    class TreeBroker {
        constructor() {
            this.selection = [];
            this.dragDrop = { source: [], target: null };
        }
    }
    TreeControl.TreeBroker = TreeBroker;
})(TreeControl || (TreeControl = {}));
//# sourceMappingURL=TreeBroker.js.map