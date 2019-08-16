namespace FudgeCore {
    /**
     * Describes Global Audio Settings.
     * Is meant to be used as a Menu option.
     * @authors Thomas Dorner, HFU, 2019
     */
    export class AudioSettings {
        
        //public audioSessionData: AudioSessionData;

        //TODO Add masterGain
        public masterGain: GainNode;
        public masterGainValue: number;

        // const? or private with getter?
        private globalAudioContext: AudioContext;

        //
        /**
         * Constructor for master Volume
         * @param _gainValue 
         */
        constructor(_gainValue: number) {
            this.setAudioContext(new AudioContext({ latencyHint: "interactive", sampleRate: 44100 }));
            
            //this.globalAudioContext.resume();
            console.log("GlobalAudioContext: " + this.globalAudioContext);
            this.masterGain = this.globalAudioContext.createGain();
            this.masterGainValue = _gainValue;

            //this.audioSessionData = new AudioSessionData();
        }

        public setMasterGainValue(_masterGainValue: number): void {
            this.masterGainValue = _masterGainValue;
        }

        public getMasterGainValue(): number {
            return this.masterGainValue;
        }

        public getAudioContext(): AudioContext {
            return this.globalAudioContext;
        }

        public setAudioContext(_audioContext: AudioContext): void {
            this.globalAudioContext = _audioContext;
        }

        //TODO add suspend/resume functions for AudioContext controls
    }
}