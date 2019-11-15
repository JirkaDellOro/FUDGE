// <reference path="../../../Core/src/Transfer/Serializer.ts"/>
// <reference path="../../../Core/Build/Fudge.d.ts"/>
// / <reference types="../../@types/golden-layout"/>
// / <reference types="../../../Core/Build/FudgeCore"/>
// / <reference types="../../../UserInterface/Build/FudgeUI"/>
// /<reference path="../../Scenes/Scenes.ts"/>



namespace UI_Minimal {
    import ƒ = FudgeCore;
    import ƒui = FudgeUserInterface;

    window.addEventListener("load", hndLoad);

    function hndLoad(_event: Event): void {
        let root: HTMLFormElement = document.createElement("form");
        let camera: ƒ.ComponentCamera = new ƒ.ComponentCamera();

        ƒui.UIGenerator.createFromMutable(camera, root);
        // this.root.addEventListener("input", this.mutateOnInput);
        document.body.appendChild(root);
    }
}