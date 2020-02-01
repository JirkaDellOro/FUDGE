/// <reference types="../../../Core/Build/FudgeCore"/>
var AudioComponent;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (AudioComponent) {
    var ƒ = FudgeCore;
    window.addEventListener("click", start);
    window.addEventListener("keydown", handleKeydown);
    let cmpAudio;
    let attached = false;
    let branched = false;
    async function start(_event) {
        let audio = await ƒ.Audio.load("mario_piano.mp3");
        ƒ.Debug.log(audio);
        cmpAudio = new ƒ.ComponentAudio(audio);
        cmpAudio.play(true);
        cmpAudio.activate(false);
        log();
    }
    function log() {
        ƒ.Debug.log(`active: ${cmpAudio.isActive}, branched: ${branched}, attached: ${attached}`);
    }
    function handleKeydown(_event) {
        switch (_event.code) {
            case ƒ.KEYBOARD_CODE.A:
                cmpAudio.activate(!cmpAudio.isActive);
                ƒ.Debug.log("Toggle active");
                break;
            case ƒ.KEYBOARD_CODE.B:
                if (branched)
                    cmpAudio.dispatchEvent(new Event("childRemoveFromAudioBranch" /* CHILD_REMOVE */));
                else
                    cmpAudio.dispatchEvent(new Event("childAppendToAudioBranch" /* CHILD_APPEND */));
                branched = !branched;
                break;
            case ƒ.KEYBOARD_CODE.C:
                if (attached)
                    cmpAudio.dispatchEvent(new Event("componentRemove" /* COMPONENT_REMOVE */));
                else
                    cmpAudio.dispatchEvent(new Event("componentAdd" /* COMPONENT_ADD */));
                attached = !attached;
                break;
        }
        log();
    }
})(AudioComponent || (AudioComponent = {}));
//# sourceMappingURL=AudioComponent.js.map