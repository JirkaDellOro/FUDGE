/// <reference types="../../../Core/Build/FudgeCore"/>
var AudioSounds;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (AudioSounds) {
    var ƒ = FudgeCore;
    window.addEventListener("load", start);
    let cmpAudio;
    let distortion = ƒ.AudioManager.default.createWaveShaper();
    let audioBeep;
    let audioUfo;
    async function start(_event) {
        window.addEventListener("keydown", handleKeydown);
        audioBeep = new ƒ.Audio("Sound/Beep.mp3");
        // await audioBeep.asyncLoad("Sound/Beep.mp3")
        audioUfo = new ƒ.Audio("Sound/Beat.mp3");
        // await audioUfo.asyncLoad("Sound/Beat.mp3")
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
                ƒ.Debug.log("Play");
                cmpAudio.play(true);
                break;
            case ƒ.KEYBOARD_CODE.ARROW_UP:
                ƒ.Debug.log("Insert");
                cmpAudio.insertAudioNodes(distortion, distortion);
                break;
            case ƒ.KEYBOARD_CODE.ARROW_DOWN:
                ƒ.Debug.log("Remove");
                cmpAudio.insertAudioNodes(null, null);
                break;
            case ƒ.KEYBOARD_CODE.ARROW_LEFT:
                ƒ.Debug.log("Beep");
                cmpAudio.setAudio(audioBeep);
                break;
            case ƒ.KEYBOARD_CODE.ARROW_RIGHT:
                ƒ.Debug.log("Ufo");
                cmpAudio.setAudio(audioUfo);
                break;
        }
    }
})(AudioSounds || (AudioSounds = {}));
//# sourceMappingURL=Insertion.js.map