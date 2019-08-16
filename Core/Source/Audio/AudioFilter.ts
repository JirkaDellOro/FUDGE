namespace FudgeCore {
    /**
     * Add an [[AudioFilter]] to an [[Audio]]
     * @authors Thomas Dorner, HFU, 2019
     */
    enum FILTER_TYPE {
        LOWPASS = "LOWPASS",
        HIGHPASS = "HIGHPASS",
        BANDPASS = "BANDPASS",
        LOWSHELF = "LOWSHELF",
        HIGHSHELF = "HIGHSHELF",
        PEAKING = "PEAKING",
        NOTCH = "NOTCH",
        ALLPASS = "ALLPASS"
    }

    export class AudioFilter {

        public useFilter: boolean;
        public filterType: FILTER_TYPE;
        
        constructor(_useFilter: boolean, _filterType: FILTER_TYPE) {
            this.useFilter = _useFilter;
            this.filterType = _filterType;
        }

        /**
         * addFilterTo
         */
        public addFilterToAudio(_audioBuffer: AudioBuffer, _filterType: FILTER_TYPE): void {
            console.log("do nothing for now");
        }

    }
}