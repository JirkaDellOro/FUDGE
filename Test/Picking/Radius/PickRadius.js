var PickRadius;
(function (PickRadius) {
    var ƒ = FudgeCore;
    var ƒAid = FudgeAid;
    document.addEventListener("interactiveViewportStarted", start);
    function start(_event) {
        let viewport = _event.detail;
        let root = viewport.getBranch();
        let zoo = root.getChildrenByName("Zoo")[0];
        let meshShpere = new ƒ.MeshSphere("BoundingSphere", 40, 40);
        let material = new ƒ.Material("Transparent", ƒ.ShaderUniColor, new ƒ.CoatColored(ƒ.Color.CSS("white", 0.5)));
        for (let child of zoo.getChildren()) {
            if (child.nChildren)
                continue;
            ƒ.Debug.fudge(child.radius);
            let sphere = new ƒAid.Node("BoundingSphere", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2)), material, meshShpere);
            sphere.mtxLocal.scale(ƒ.Vector3.ONE(child.radius));
            let cmpMesh = child.getComponent(ƒ.ComponentMesh);
            sphere.mtxLocal.translation = cmpMesh.mtxWorld.translation;
            root.appendChild(sphere);
        }
        let sphere = new ƒAid.Node("BoundingSphere", ƒ.Matrix4x4.SCALING(ƒ.Vector3.ONE(2)), material, meshShpere);
        sphere.mtxLocal.scale(ƒ.Vector3.ONE(zoo.radius));
        root.appendChild(sphere);
        ƒ.Debug.branch(root);
    }
})(PickRadius || (PickRadius = {}));
//# sourceMappingURL=PickRadius.js.map