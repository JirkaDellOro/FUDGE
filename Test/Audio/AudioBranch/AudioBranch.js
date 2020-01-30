/// <reference types="../../../Core/Build/FudgeCore"/>
var AudioBranch;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (AudioBranch) {
    var ƒ = FudgeCore;
    window.addEventListener("click", start);
    window.addEventListener("keydown", handleKeydown);
    let branch;
    let nodeControlled;
    async function start(_event) {
        let audioMario = await ƒ.Audio.load("Sound/mario_piano.mp3");
        let audioTrancy = await ƒ.Audio.load("Sound/trancyvania.mp3");
        let audioHypno = await ƒ.Audio.load("Sound/hypnotic.mp3");
        // cmpAudio = new ƒ.ComponentAudio(audio);
        // cmpAudio.play(true);
        // cmpAudio.activate(false);
        // log();
        branch = new ƒ.Node("branch");
        let node1 = new ƒ.Node("node1");
        let node2 = new ƒ.Node("node2");
        let child1 = new ƒ.Node("child1");
        let child2 = new ƒ.Node("child2");
        branch.appendChild(node1);
        branch.appendChild(node2);
        node1.appendChild(child1);
        node2.appendChild(child2);
        child1.addComponent(new ƒ.ComponentAudio(audioHypno, true, true));
        child2.addComponent(new ƒ.ComponentAudio(audioTrancy, true, true));
        nodeControlled = child1;
        log();
        await ƒ.Time.game.delay(2000);
        ƒ.AudioManager.default.listenTo(branch);
        log();
    }
    function log() {
        for (let node of branch.branch) {
            let cmpAudio = node.getComponent(ƒ.ComponentAudio);
            if (cmpAudio) {
                ƒ.Debug.log(`node: ${node.name}, active: ${cmpAudio.isActive}, branched: ${cmpAudio.isListened}, attached: ${cmpAudio.isAttached}`);
            }
        }
    }
    function handleKeydown(_event) {
        let cmpAudio = nodeControlled.getComponent(ƒ.ComponentAudio);
        switch (_event.code) {
            case ƒ.KEYBOARD_CODE.A:
                cmpAudio.activate(!cmpAudio.isActive);
                ƒ.Debug.log("Toggle active");
                break;
            case ƒ.KEYBOARD_CODE.B:
                if (nodeControlled.getParent())
                    nodeControlled.getParent().removeChild(nodeControlled);
                else
                    branch.appendChild(nodeControlled);
                break;
            case ƒ.KEYBOARD_CODE.C:
                nodeControlled.removeComponent(cmpAudio);
                break;
        }
        log();
    }
})(AudioBranch || (AudioBranch = {}));
//# sourceMappingURL=AudioBranch.js.map