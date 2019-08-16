namespace Events {
    import ƒ = FudgeCore;
    window.addEventListener("DOMContentLoaded", init);

    function init(): void {
        Scenes.createMiniScene();
        let node: ƒ.Node = Scenes.node;
        let child: ƒ.Node = node.getChildren()[0];
        console.log(child);
        node.addEventListener("test", handleBubbleAndTarget);
        node.addEventListener("test", handleCapture, true);
        child.addEventListener("test", handleBubbleAndTarget);
        child.addEventListener("test", handleCapture, true);
        let bubble: Event = new Event("test", { bubbles: true });
        let nonbubble: Event = new Event("test", { bubbles: false });
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

    function handle(_event: Event, _handlername?: string): void {
        console.log(_event);
        let target: string = (<ƒ.Node>_event.target).name;
        let currentTarget: string = (<ƒ.Node>_event.currentTarget).name;
        console.log("%s | phase: %s | target: %s | currentTarget: %s}", _handlername, _event.eventPhase, target, currentTarget);
    }
    function handleBubbleAndTarget(_event: Event): void {
        handle(_event, "handleBubbleAndTarget");
    }
    function handleCapture(_event: Event): void {
        handle(_event, "handleCapture");
    }
}