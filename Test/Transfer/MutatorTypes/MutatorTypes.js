var MutatorTypes;
(function (MutatorTypes) {
    var ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);
    function init() {
        Scenes.createMiniScene();
        console.log(Scenes.node);
        let cmpCamera = new ƒ.ComponentCamera();
        Scenes.node.addComponent(cmpCamera);
        let components = Scenes.node.getAllComponents();
        for (let component of components) {
            console.group(component.type);
            let mutator = component.getMutator();
            let types = component.getMutatorAttributeTypes(mutator);
            console.log(component);
            console.log(mutator);
            console.log(types);
            console.groupEnd();
        }
        // Test branch protection
    }
})(MutatorTypes || (MutatorTypes = {}));
//# sourceMappingURL=MutatorTypes.js.map