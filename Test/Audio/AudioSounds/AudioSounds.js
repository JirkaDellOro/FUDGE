/// <reference types="../../../Core/Build/FudgeCore"/>
var AudioSounds;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (AudioSounds) {
    var ƒ = FudgeCore;
    window.addEventListener("click", start);
    window.addEventListener("keydown", handleKeydown);
    let cmpAudio;
    let distortion = ƒ.AudioManager.default.createWaveShaper();
    async function start(_event) {
        let audioBeep = await ƒ.Audio.load("Sound/Beep.mp3");
        cmpAudio = new ƒ.ComponentAudio(audioBeep, false, false);
        cmpAudio.connect(true);
        cmpAudio.volume = 30;
        function makeDistortionCurve(amount = 50) {
            let samples = 44100;
            let curve = new Float32Array(samples);
            let deg = Math.PI / 180;
            let x;
            for (let i = 0; i < samples; ++i) {
                x = i * 2 / samples - 1;
                curve[i] = (3 + amount) * x * 20 * deg / (Math.PI + amount * Math.abs(x));
            }
            return curve;
        }
        distortion.curve = makeDistortionCurve(400);
        distortion.oversample = "4x";
    }
    function handleKeydown(_event) {
        switch (_event.code) {
            case ƒ.KEYBOARD_CODE.ENTER:
                ƒ.Debug.log("Hit");
                cmpAudio.play(true);
                break;
            case ƒ.KEYBOARD_CODE.ARROW_UP:
                cmpAudio.insertAudioNodes(distortion, distortion);
                break;
            case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                cmpAudio.insertAudioNodes(null, null);
                break;
        }
    }
})(AudioSounds || (AudioSounds = {}));
//# sourceMappingURL=AudioSounds.js.map