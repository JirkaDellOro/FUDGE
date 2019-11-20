namespace FudgeCore {
    
    /**
     * All possible Filter Types of an Audio Filter
     */
    type FILTER_TYPE = "lowpass" | "highpass" | "bandpass" | "lowshelf" | "highshelf" | "peaking" | "notch" | "allpass";

    /**
     * Add an [[AudioFilter]] to an [[Audio]]
     * @authors Thomas Dorner, HFU, 2019
     */
    export class AudioFilter {

        public audioFilter: BiquadFilterNode; 
        private filterType: FILTER_TYPE;
        
        constructor(_audioSettings: AudioSettings, _filterType: FILTER_TYPE, _frequency: number, _gain: number, _quality: number) {
            this.initFilter(_audioSettings, _filterType, _frequency, _gain, _quality);
        }

        public initFilter(_audioSettings: AudioSettings, _filterType: FILTER_TYPE, _frequency: number, _gain: number, _quality: number): void {
            this.audioFilter = _audioSettings.getAudioContext().createBiquadFilter();
            this.setFilterType(_filterType);
            this.setFrequency(_audioSettings, _frequency);
            this.setGain(_audioSettings, _gain);
            this.setQuality(_quality);
        }

        public setFilterType(_filterType: FILTER_TYPE): void {
            this.filterType = _filterType;
            this.audioFilter.type = this.filterType;
        }

        public getFilterType(): FILTER_TYPE {
            return this.filterType;
        }

        public setFrequency(_audioSettings: AudioSettings, _frequency: number): void {
            this.audioFilter.frequency.setValueAtTime(_frequency, _audioSettings.getAudioContext().currentTime);
        }

        public getFrequency(): number {
            return this.audioFilter.frequency.value;
        }
        public setGain(_audioSettings: AudioSettings, _gain: number): void {
            this.audioFilter.frequency.setValueAtTime(_gain, _audioSettings.getAudioContext().currentTime);
        }

        public getGain(): number {
            return this.audioFilter.gain.value;
        }
        public setQuality(_quality: number): void {
            this.audioFilter.Q.value = _quality;
        }

        public getQuality(): number {
            return this.audioFilter.Q.value;
        }
    }
}