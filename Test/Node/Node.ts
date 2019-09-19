namespace NodeTest {
    import ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);

    let node: ƒ.Node;
    let child: ƒ.Node;
    let grandchild: ƒ.Node;

    function init(): void {
        Scenes.createThreeLevelNodeHierarchy();
        console.log(Scenes.node);
        let all: ƒ.Component[] = Scenes.node.getAllComponents();
        console.log(all);
        
        let cmpMaterial: ƒ.Component[] = Scenes.node.getComponents(ƒ.ComponentMaterial);
        let cmpMesh: ƒ.Component[] = Scenes.node.getComponents(ƒ.ComponentMesh);
        
        console.log(cmpMaterial, cmpMesh);
        
        let all2: ƒ.Component[] = [];
        all2 = all2.concat(cmpMesh);
        all2 = all2.concat(cmpMaterial);
        console.log(all2);


        var array1: string[] = ["a", "b", "c"];
        var array2: string[] = ["d", "e", "f"];

        console.log(array1.concat(array2));
        // expected output: Array ["a", "b", "c", "d", "e", "f"]
    }
} 