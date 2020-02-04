/// <reference types="../../../Core/Build/FudgeCore"/>
var AudioSounds;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (AudioSounds) {
    var ƒ = FudgeCore;
    window.addEventListener("click", start);
    window.addEventListener("keydown", handleKeydown);
    // let nodes: ƒ.Node[] = [];
    // let node: ƒ.Node;
    let cmpAudio;
    async function start(_event) {
        let audioBeep = await ƒ.Audio.load("Sound/Beep.mp3");
        cmpAudio = new ƒ.ComponentAudio(audioBeep, false, false);
        cmpAudio.connect(true);
        //ƒ.AudioManager.default.listenTo(nodes[0]);
        // log();
    }
    // function log(): void {
    //   ƒ.Debug.group(`Listening to ${ƒ.AudioManager.default.getBranchListeningTo().name}, controlling ${nodeControlled.name}`);
    //   for (let node of nodes) {
    //     let out: string = `node: ${node.name}`;
    //     if (node.getParent())
    //       out += ` [->${node.getParent().name}]`;
    //     let cmpAudioList: ƒ.ComponentAudio[] = node.getComponents(ƒ.ComponentAudio);
    //     for (let cmpAudio of cmpAudioList)
    //       out += ` | active: ${cmpAudio.isActive}, branched: ${cmpAudio.isListened}, attached: ${cmpAudio.isAttached}`;
    //     ƒ.Debug.log(out);
    //   }
    //   ƒ.Debug.groupEnd();
    // }
    function handleKeydown(_event) {
        ƒ.Debug.log("Hit");
        cmpAudio.play(true);
    }
})(AudioSounds || (AudioSounds = {}));
//# sourceMappingURL=AudioSounds.js.map