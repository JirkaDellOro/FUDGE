namespace FudgeCore {

    /**
     * Add an [[AudioDelay]] to an [[Audio]]
     * @authors Thomas Dorner, HFU, 2019
     */
    export class AudioDelay {

        public audioDelay: DelayNode;
        private delay: number;
        
        constructor(_audioSettings: AudioSettings, _delay: number) {
            this.audioDelay = _audioSettings.getAudioContext().createDelay(_delay);
            this.setDelay(_audioSettings, _delay);
        }

        public setDelay(_audioSettings: AudioSettings, _delay: number): void {
            this.delay = _delay;
            this.audioDelay.delayTime.setValueAtTime(this.delay, _audioSettings.getAudioContext().currentTime);
        }

        public getDelay(): number {
            return this.delay;
        }
    }
}