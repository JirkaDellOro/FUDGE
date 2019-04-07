var Events;
(function (Events) {
    window.addEventListener("DOMContentLoaded", init);
    let mutator;
    let angle = 0;
    function init() {
        Scenes.createMiniScene();
        let node = Scenes.node;
        let child = node.getChildren()[0];
        console.log(child);
        node.addEventListener("test", handleBubbleAndTarget);
        node.addEventListener("test", handleCapture, true);
        child.addEventListener("test", handleBubbleAndTarget);
        child.addEventListener("test", handleCapture, true);
        let bubble = new Event("test", { bubbles: true });
        let nonbubble = new Event("test", { bubbles: false });
        console.group("Parent dispatches bubbling");
        node.dispatchEvent(bubble);
        console.groupEnd();
        console.group("Parent dispatches non bubbling");
        node.dispatchEvent(nonbubble);
        console.groupEnd();
        console.group("Parent broadcasts bubbling");
        node.broadcastEvent(bubble);
        console.groupEnd();
        console.group("Parent broadcasts non bubbling");
        node.broadcastEvent(nonbubble);
        console.groupEnd();
        console.group("Child dispatches bubbling");
        child.dispatchEvent(bubble);
        console.groupEnd();
        console.group("Child dispatches non bubbling");
        child.dispatchEvent(nonbubble);
        console.groupEnd();
        console.group("Child broadcast bubbling");
        child.broadcastEvent(bubble);
        console.groupEnd();
        console.group("Child broadcast non bubbling");
        child.broadcastEvent(nonbubble);
        console.groupEnd();
    }
    function handle(_event, _handlername) {
        console.log(_event);
        let target = _event.target.name;
        let currentTarget = _event.currentTarget.name;
        console.log("%s | phase: %s | target: %s | currentTarget: %s}", _handlername, _event.eventPhase, target, currentTarget);
    }
    function handleBubbleAndTarget(_event) {
        handle(_event, "handleBubbleAndTarget");
    }
    function handleCapture(_event) {
        handle(_event, "handleCapture");
    }
    /*
        mutator = Scenes.node.cmpTransform.getMutatorForAnimation();
        console.log("Mutator: ", mutator);
        let serialization: ƒ.Serialization = Scenes.node.cmpTransform.serialize();
        console.log("Serialization: ", serialization);
 
        animate();
    }
 
    function animate(): void {
        window.requestAnimationFrame(animate);
        angle += 0.03;
        (mutator.matrix as ƒ.Matrix4x4).data[12] = 50 * Math.sin(angle);
        (mutator.matrix as ƒ.Matrix4x4).data[5] = Math.cos(1.7 * angle);
        Scenes.viewPort.drawScene();
    }
    */
})(Events || (Events = {}));
//# sourceMappingURL=Events.js.map