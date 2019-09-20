namespace MutatorTypes {
    import ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        Scenes.createMiniScene();
        console.log(Scenes.node);
        let cmpCamera: ƒ.ComponentCamera = new ƒ.ComponentCamera();
        Scenes.node.addComponent(cmpCamera);

        let components: ƒ.Component[] = Scenes.node.getAllComponents();
        for (let component of components) {
            console.group(component.type);
            let mutator: ƒ.Mutator = component.getMutator();
            let types: ƒ.MutatorAttributeTypes = component.getMutatorAttributeTypes(mutator);
            console.log(component);
            console.log(mutator);
            console.log(types);
            console.groupEnd();
        }
        // Test push to development branch and merge to master
    }
}