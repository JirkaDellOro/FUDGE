/// <reference types="../../../Core/Build/FudgeCore"/>
var AudioGraph;
/// <reference types="../../../Core/Build/FudgeCore"/>
(function (AudioGraph) {
    var ƒ = FudgeCore;
    window.addEventListener("click", start);
    let nodes = [];
    let nodeControlled;
    async function start(_event) {
        window.removeEventListener("click", start);
        window.addEventListener("keydown", handleKeydown);
        let audioMario = new ƒ.Audio("Sound/mario_piano.mp3");
        let audioTrancy = new ƒ.Audio("Sound/trancyvania.mp3");
        let audioHypno = new ƒ.Audio("Sound/hypnotic.mp3");
        // await audioHypno.asyncLoad("Sound/hypnotic.mp3");
        for (let i = 0; i < 10; i++)
            nodes.push(new ƒ.Node("Node" + i));
        let cmpAudio = new ƒ.ComponentAudio(audioHypno, true, true);
        cmpAudio.mtxPivot.translateX(2);
        nodes[0].addComponent(cmpAudio);
        cmpAudio = new ƒ.ComponentAudio(audioTrancy, true, true);
        cmpAudio.mtxPivot.translateX(-2);
        nodes[1].addComponent(cmpAudio);
        cmpAudio = new ƒ.ComponentAudio(audioMario, true, true);
        cmpAudio.mtxPivot.translateX(0);
        nodes[2].addComponent(cmpAudio);
        nodeControlled = nodes[0];
        ƒ.AudioManager.default.listenTo(nodes[0]);
        log();
    }
    function log() {
        ƒ.Debug.group(`Listening to ${ƒ.AudioManager.default.getGraphListeningTo().name}, controlling ${nodeControlled.name}`);
        for (let node of nodes) {
            let out = `node: ${node.name}`;
            if (node.getParent())
                out += ` [child of ${node.getParent().name}]`;
            let cmpAudioList = node.getComponents(ƒ.ComponentAudio);
            for (let cmpAudio of cmpAudioList)
                out += ` | ComponentAudio is active: ${cmpAudio.isActive}, listened: ${cmpAudio.isListened}, attached: ${cmpAudio.isAttached}`;
            ƒ.Debug.log(out);
        }
        ƒ.Debug.groupEnd();
    }
    function handleKeydown(_event) {
        let cmpAudio = nodeControlled.getComponent(ƒ.ComponentAudio);
        if (_event.code >= ƒ.KEYBOARD_CODE.ZERO && _event.code <= ƒ.KEYBOARD_CODE.NINE)
            nodeControlled = nodes[_event.keyCode - 48];
        switch (_event.code) {
            case ƒ.KEYBOARD_CODE.A:
                if (cmpAudio) {
                    cmpAudio.activate(!cmpAudio.isActive);
                    // cmpAudio.play(cmpAudio.isActive);
                }
                break;
            case ƒ.KEYBOARD_CODE.P:
                let parent = parseInt(prompt("Enter the number of the node that will become the parent", "0"));
                if (parent < 0 || parent > 9)
                    throw (new Error("Index out of bounds"));
                nodes[parent].addChild(nodeControlled);
                break;
            case ƒ.KEYBOARD_CODE.C:
                if (!cmpAudio)
                    throw (new Error("No ComponentAudio attached"));
                let container = parseInt(prompt("Enter the number of the node the component attaches to", "0"));
                if (container < 0 || container > 9)
                    throw (new Error("Index out of bounds"));
                nodes[container].addComponent(cmpAudio);
                break;
            case ƒ.KEYBOARD_CODE.L:
                ƒ.AudioManager.default.listenTo(nodeControlled);
                break;
            case ƒ.KEYBOARD_CODE.U:
                ƒ.AudioManager.default.update();
                break;
        }
        log();
    }
})(AudioGraph || (AudioGraph = {}));
//# sourceMappingURL=BranchMix.js.map