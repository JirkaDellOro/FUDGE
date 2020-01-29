/// <reference types="../../../Core/Build/FudgeCore"/>
var AudioTest;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (AudioTest) {
    var ƒ = FudgeCore;
    window.addEventListener("click", start);
    window.addEventListener("keydown", toggle);
    let cmpAudio;
    let toggled = false;
    async function start(_event) {
        let audio = await ƒ.Audio.load("mario_piano.mp3");
        ƒ.Debug.log(audio);
        cmpAudio = new ƒ.ComponentAudio(audio);
        ƒ.Debug.log(cmpAudio);
        cmpAudio.play(true);
    }
    function toggle(_event) {
        ƒ.Debug.log("Toggle");
        if (toggled)
            cmpAudio.dispatchEvent(new Event("componentRemove" /* COMPONENT_REMOVE */));
        else
            cmpAudio.dispatchEvent(new Event("componentAdd" /* COMPONENT_ADD */));
    }
})(AudioTest || (AudioTest = {}));
//# sourceMappingURL=Audio.js.map