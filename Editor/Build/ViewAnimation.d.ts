/// <reference types="../../build/fudge" />
declare namespace Fudge {
    /**
     * Combines the key, its sequence and the visual representation of that key.
     * @author Lukas Scheuerle, HFU, 2019
     */
    interface ViewAnimationKey {
        key: FudgeCore.AnimationKey;
        path2D: Path2D;
        sequence: ViewAnimationSequence;
    }
    /**
     * Combines the Sequence, corresponding HTMLElement and color to display.
     * @author Lukas Scheuerle, HFU, 2019
     */
    interface ViewAnimationSequence {
        color: string;
        element: HTMLElement;
        sequence: FudgeCore.AnimationSequence;
    }
    /**
     * Combines the visual representation of an event and the event itself.
     * @author Lukas Scheuerle, HFU, 2019
     */
    interface ViewAnimationEvent {
        event: string;
        path2D: Path2D;
    }
    /**
     * Combines the visual representation of a label and the label itself.
     * @author Lukas Scheuerle, HFU, 2019
     */
    interface ViewAnimationLabel {
        label: string;
        path2D: Path2D;
    }
    /**
     * Creates, manipulates and administers an Animation View
     * @author Lukas Scheuerle, HFU, 2019
     */
    class ViewAnimation extends Fudge.View {
        node: FudgeCore.Node;
        animation: FudgeCore.Animation;
        cmpAnimator: FudgeCore.ComponentAnimator;
        playbackTime: number;
        controller: FudgeUserInterface.UIAnimationList;
        private canvas;
        private attributeList;
        private crc;
        private sheet;
        private sheets;
        private sheetIndex;
        private toolbar;
        private hover;
        private time;
        private playing;
        constructor(_parent: Panel);
        /**
         * Opens the Animation attached to a given Node. Creates a new Node if no Node given.
         * @param _node The node that should be animated/has an animation that should be changed
         */
        openAnimation(_node?: FudgeCore.Node): void;
        fillContent(): void;
        /**
         * adds all Listeners needed for the ViewAnimation to work.
         */
        installListeners(): void;
        deconstruct(): void;
        /**
         * Handles mouseclicks onto the canvas.
         * @param _e The MouseEvent resulting in this call.
         */
        private mouseClickOnCanvas;
        /**
         * handles mousedown events onto the canvas. Currently causes a key/label/event to be selected.
         * @param _e The MouseEvenet resulting in this call.
         */
        private mouseDownOnCanvas;
        /**
         * handles mousemove on the canvas. currently only checks for a change of the replaytime but could be expanded to handle/propagate key manipulation/dragging.
         * @param _e The MouseEvent resulting in this call
         */
        private mouseMoveOnCanvas;
        /**
         * handles mouseup events on the canvas. currently does nothing but may be needed in the future.
         * @param _e The MouseEvent resulting in this call
         */
        private mouseUpOnCanvas;
        /**
         * Fills the toolbar with all its input elements / buttons / etc.
         * @param _tb the HtmlElement to add the toolbarelements to
         */
        private fillToolbar;
        /**
         * Handles a click on the toolbar, checks which button it was and executed the corresponding code.
         * @param _e the MouseEvent reuslting in this call
         */
        private mouseClickOnToolbar;
        /**
         * Handles changes of the input elements on the toolbar and reacts accordingly.
         * @param _e The ChangeEvent on one of the input elements of the Toolbar
         */
        private changeOnToolbar;
        /**
         * Handles mouseClicks onto the attribute list. Currently only checks for the "add key" button to be clicked and adds a key.
         * @param _e the MouseEvent that resulted in this call
         */
        private mouseClickOnAttributeList;
        /**
         * Runs recursively through the given structures looking for the clicked input Element to return the corresponding AnimationSequence.
         * @param _elementIndex The Mutator structure that holds the HTML Input Elements. Needs have the same structure as _squenceIndex
         * @param _sequenceIndex The AnimationStructure of the current animation
         * @param _input the InputElement to search for
         * @returns the corresponding AnimationSequence to the given input element
         */
        private findSequenceToAddKeyTo;
        /**
         * Handle the change Event from the attributeList and apply it to the sequence in question.
         * Needed to allow for manipulation of the value of the keys inside the editor without going through ViewData.
         * @param _e ChangeEvent from the Attribute List that carries information on what was changed
         */
        private changeAttribute;
        /**
         * Updates everything to have a consistent display of the animation view
         * @param _m Mutator from the Animation to update the display with.
         */
        private updateDisplay;
        /**
         * Allows you to set the playback time. Will clamp the time between 0 and animation.totalTime.
         * @param _time the time to set the playback time to.
         * @param updateDisplay should the display also be updated? Default: true
         */
        private setTime;
        /**
         * Gets called every animation frame. If the animation is currently supposed to be playing, play it.
         */
        private playAnimation;
        /**
         * Adds the "add key" buttons to the list.
         * @param _m the Mutator containing the htmlInputElements from the attribute List.
         */
        private addKeyButtons;
        /**
         * Swaps the sheets to the next one in the list. currently there are only 2 sheets. Might be obsolete once there is a specific sheet selector.
         */
        private nextSheet;
        /**
         * A small generator that creates "attribute-animal" strings to initialize new Events and Labels with.
         */
        private randomNameGenerator;
    }
}
declare namespace Fudge {
    /**
     * baseclass for different ways of visualising animations inside the ViewAnimation.
     * @author Lukas Scheuerle, HFU, 2019
     */
    abstract class ViewAnimationSheet {
        view: ViewAnimation;
        crc2: CanvasRenderingContext2D;
        scale: FudgeCore.Vector2;
        protected position: FudgeCore.Vector2;
        protected savedImage: ImageData;
        protected keys: ViewAnimationKey[];
        protected sequences: ViewAnimationSequence[];
        protected labels: ViewAnimationLabel[];
        protected events: ViewAnimationEvent[];
        /**
         *
         * @param _view View this sheet is attached to
         * @param _crc The Canvas Rendering Context the sheet should draw onto
         * @param _scale The scale at which the sheet should render. Defaults to (1, 1)
         * @param _pos The position from which to start drawing. Defaults to (0, 0)
         * @author Lukas Scheuerle, HFU, 2019
         */
        constructor(_view: ViewAnimation, _crc: CanvasRenderingContext2D, _scale?: FudgeCore.Vector2, _pos?: FudgeCore.Vector2);
        /**
         * Sets the position of the sheet
         * @param _time the time to move to
         * @param _value the value to move to. Default: unchanged
         */
        moveTo(_time: number, _value?: number): void;
        /**
         * Redraws the entire display of the animation.
         * @param _time the time at which to draw the cursor.
         */
        redraw(_time: number): void;
        /**
         * Draws the timeline at the top of the canvas
         */
        drawTimeline(): void;
        /**
         * Get the Object that is below a certain position
         * @param _x x position
         * @param _y y position
         * @returns The object at the given position. null if there is nothing of interest.
         */
        getObjectAtPoint(_x: number, _y: number): ViewAnimationLabel | ViewAnimationKey | ViewAnimationEvent;
        /**
         * Translates and scales the canvas to the saved position and scale
         */
        protected transform(): void;
        /**
         * Traverses the animation structure to call for [drawSequence()] on the sequences inside the animation structure.
         * @param _animation the animation structure to traverse
         * @param _inputs the input strucutre to traverse. should have the same structure as _animation.
         */
        protected traverseStructures(_animation: FudgeCore.AnimationStructure, _inputs: FudgeCore.Mutator): void;
        /**
         * Draws the sequence to the canvas.
         * @param _sequence Sequence to draw the keys from
         * @param _input The corresponding input element
         */
        protected abstract drawSequence(_sequence: FudgeCore.AnimationSequence, _input: HTMLInputElement): void;
        /**
         * Draws a key as a diamond shape.
         * ```
         *   /\
         *  /  \
         *  \  /
         *   \/
         * ```
         * @param _x x position to draw the key at (center)
         * @param _y y position to draw the key at (center)
         * @param _h height to draw the key with
         * @param _w width to draw the key with
         * @param _c the color to draw the key with
         */
        protected drawKey(_x: number, _y: number, _h: number, _w: number, _c: string): Path2D;
        /**
         * Starts the traversation of the structures to redraw all sequences and subsequently all keys
         */
        protected drawKeys(): void;
        /**
         * (re)-draws all events and labels on top of the timeline
         */
        private drawEventsAndLabels;
        /**
         * resets the transform and clears the canvas.
         */
        private clear;
        /**
         * draws the cursor on top of the canvas at the given time
         * @param _time the time to draw the cursor at
         */
        private drawCursor;
        private calculateDisplay;
    }
}
declare namespace Fudge {
    /**
     * Curve View visualisation of an Animation for the Animation View.
     * @author Lukas Scheuerle, HFU, 2019
     */
    class ViewAnimationSheetCurve extends ViewAnimationSheet {
        protected drawKeys(): void;
        protected drawSequence(_sequence: FudgeCore.AnimationSequence, _input: HTMLInputElement): void;
        /**
         * draws a scale for the y axis.
         */
        private drawYScale;
        /**
         * attempts to calculate the optimal spacing and scale of the y scale visualisation
         */
        private calcScaleSize;
        /**
         * generates a random pastell-like color using hsl ([0, 360), 80%, 80%)
         */
        private randomPastellColor;
    }
}
declare namespace Fudge {
    /**
     * Dopesheet Visualisation of an Animation for the Animation Editor.
     * @author Lukas Scheuerle, HFU, 2019
     */
    class ViewAnimationSheetDope extends ViewAnimationSheet {
        protected drawSequence(_sequence: FudgeCore.AnimationSequence, _input: HTMLInputElement): void;
    }
}
declare namespace Fudge {
    /**
     * A Template to create an Animation Editor with.
     * @author Lukas Scheuerle, HFU, 2019
     */
    class ViewAnimationTemplate extends PanelTemplate {
        constructor();
    }
}
