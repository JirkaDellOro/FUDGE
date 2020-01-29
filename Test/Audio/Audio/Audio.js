/// <reference types="../../../Core/Build/FudgeCore"/>
var AudioTest;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (AudioTest) {
    var ƒ = FudgeCore;
    window.addEventListener("click", start);
    async function start() {
        let audio = await ƒ.Audio.load("mario_piano.mp3");
        ƒ.Debug.log(audio);
        let cmpAudio = new ƒ.ComponentAudio(audio);
        ƒ.Debug.log(cmpAudio);
        cmpAudio.play(true);
    }
})(AudioTest || (AudioTest = {}));
//# sourceMappingURL=Audio.js.map