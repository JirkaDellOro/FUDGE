/// <reference types="../../../Core/Build/FudgeCore"/>

namespace FudgeUserInterface {
    import ƒ = FudgeCore;
    export const enum UIEVENT {
        SELECTION = "nodeSelect"
    }

    export class NodeSelectionEvent extends Event {
        public targetNode: ƒ.Node;

        constructor(_type: string, _event: NodeSelectionEvent) {
            super(_type, _event);
            this.targetNode = <ƒ.Node>_event.target;
        }
    }
}