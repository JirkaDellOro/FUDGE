/// <reference types="../../../core/build/fudgecore" />
/// <reference types="../../build/fudge" />
declare namespace Fudge {
    class ViewAnimation extends Fudge.View {
        node: FudgeCore.Node;
        animation: FudgeCore.Animation;
        playbackTime: number;
        private canvas;
        private crc;
        private sheet;
        private toolbar;
        constructor(_parent: Panel);
        openAnimation(): void;
        fillContent(): void;
        installListeners(): void;
        deconstruct(): void;
        mouseClick(_e: MouseEvent): void;
        mouseDown(_e: MouseEvent): void;
        mouseMove(_e: MouseEvent): void;
        mouseUp(_e: MouseEvent): void;
        private fillToolbar;
        private toolbarClick;
        private toolbarChange;
    }
}
declare namespace Fudge {
    interface ViewAnimationKey {
        path2D: Path2D;
        animationKey: FudgeCore.AnimationKey;
        sequence: ViewAnimationSequence;
    }
    interface ViewAnimationSequence {
        sequence: FudgeCore.AnimationSequence;
        element: HTMLElement;
    }
    interface ViewAnimationEvent {
        path2D: Path2D;
        event: string;
    }
    interface ViewAnimationLabel {
        path2D: Path2D;
        label: string;
    }
}
declare namespace Fudge {
    abstract class ViewAnimationSheet {
        view: ViewAnimation;
        seq: FudgeCore.AnimationSequence[];
        crc2: CanvasRenderingContext2D;
        scale: FudgeCore.Vector2;
        protected position: FudgeCore.Vector2;
        protected savedImage: ImageData;
        protected keys: ViewAnimationKey[];
        protected sequences: ViewAnimationSequence[];
        protected labels: ViewAnimationLabel[];
        protected events: ViewAnimationEvent[];
        constructor(_view: ViewAnimation, _crc: CanvasRenderingContext2D, _seq: FudgeCore.AnimationSequence[], _scale?: FudgeCore.Vector2, _pos?: FudgeCore.Vector2);
        moveTo(_time: number, _value?: number): void;
        translate(): void;
        redraw(): void;
        clear(): void;
        drawTimeline(): void;
        drawCursor(_time: number): void;
        initAnimation(): void;
        getObjectAtPoint(_x: number, _y: number): ViewAnimationLabel | ViewAnimationKey | ViewAnimationEvent;
        private drawEventsAndLabels;
        private calculateDisplay;
    }
}
declare namespace Fudge {
    class ViewAnimationSheetCurve extends ViewAnimationSheet {
        redraw(): void;
    }
}
declare namespace Fudge {
    class ViewAnimationSheetDope extends ViewAnimationSheet {
        redraw(): void;
    }
}
declare namespace Fudge {
    class ViewAnimationTemplate extends PanelTemplate {
        constructor();
    }
}
