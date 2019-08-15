/// <reference path="Component.ts"/>
namespace Fudge {
    /**
     * Attaches a [[ComponentAudio]] to a [[Node]].
     * Only a single [[Audio]] can be used within a single [[ComponentAudio]]
     * @authors Thomas Dorner, HFU, 2019
     */
    export class ComponentAudio extends Component {

        public audio: Audio;
        
        public isLocalised: boolean;
        public localisation: AudioLocalisation | null;

        public isFiltered: boolean;
        public filter: AudioFilter | null;

        
        constructor(_audio: Audio) {
            super();

            this.setAudio(_audio);
        }

        public setLocalisation(_localisation: AudioLocalisation): void {
            this.localisation = _localisation;
        }

        /**
         * playAudio
         */
        public playAudio(_audioContext: AudioContext): void {
            this.audio.initBufferSource(_audioContext);
            this.audio.bufferSource.start(_audioContext.currentTime);
        }

        /**
         * Adds an [[Audio]] to the [[ComponentAudio]]
         * @param _audio Decoded Audio Data as [[Audio]]
         */
        private setAudio(_audio: Audio): void {
            this.audio = _audio;
        }
        /**
         * Final attachments for the Audio Nodes in following order
         * 1. Localisation
         * 2. Filter
         * 3. Master Gain
         * connectAudioNodes
         */
        // private connectAudioNodes(): void {
            
        // }




    }
}