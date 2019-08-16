namespace FudgeCore {
    /**
     * Describes the [[Audio]] class in which all Audio Data is stored.
     * Audio will be given to the [[ComponentAudio]] for further usage.
     * @authors Thomas Dorner, HFU, 2019
     */
    export class Audio {

        public url: string;

        public audioBuffer: AudioBuffer;
        public bufferSource: AudioBufferSourceNode;

        public localGain: GainNode;
        public localGainValue: number;

        public isLooping: boolean;

        /**
         * Constructor for the [[Audio]] Class
         * @param _audioContext from [[AudioSettings]]
         * @param _gainValue 0 for muted | 1 for max volume
         */
        constructor(_audioContext: AudioContext, _audioSessionData: AudioSessionData, _url: string, _gainValue: number, _loop: boolean) {
            this.init(_audioContext, _audioSessionData, _url, _gainValue, _loop);
        }

        public async init(_audioContext: AudioContext, _audioSessionData: AudioSessionData, _url: string, _gainValue: number, _loop: boolean): Promise<void> {
            // Do everything in constructor
            // Add url to Audio
            this.url = _url;
            console.log("Audio url " + this.url);
            // Get AudioBuffer
            const bufferProm: Promise<AudioBuffer> = _audioSessionData.urlToBuffer(_audioContext, _url);
            while (!bufferProm) {
                console.log("waiting...");
            }
            await bufferProm.then(val => {
                this.audioBuffer = val;
                console.log("valBuffer " + val);
            });
            console.log("Audio audiobuffer " + this.audioBuffer);
            // // Add local Gain for Audio  and connect 
            this.localGain = await _audioContext.createGain();
            this.localGainValue = await _gainValue;
            //create Audio
            await this.createAudio(_audioContext, this.audioBuffer);
        }

        /**
         * initBufferSource
         */
        public initBufferSource(_audioContext: AudioContext): void {
            this.bufferSource = _audioContext.createBufferSource();
            this.bufferSource.buffer = this.audioBuffer;
            console.log("bS = " + this.bufferSource);
            this.bufferSource.connect(_audioContext.destination);

            this.setLoop();
            this.addLocalGain();
            console.log("BufferSource.buffer: " + this.bufferSource.buffer);
            console.log("AudioBuffer: " + this.audioBuffer);
        }

        //#region Getter/Setter LocalGainValue
        public setLocalGainValue(_localGainValue: number): void {
            this.localGainValue = _localGainValue;
        }

        public getLocalGainValue(): number {
            return this.localGainValue;
        }
        //#endregion Getter/Setter LocalGainValue

        public setBufferSource(_buffer: AudioBuffer): void {
            this.bufferSource.buffer = _buffer;
        }

        /**
         * createAudio builds an [[Audio]] to use with the [[ComponentAudio]]
         * @param _audioContext from [[AudioSettings]]
         * @param _audioBuffer from [[AudioSessionData]]
         */
        private createAudio(_audioContext: AudioContext, _audioBuffer: AudioBuffer): AudioBuffer {
            console.log("createAudio() " + " | " + " AudioContext: " + _audioContext);
            this.audioBuffer = _audioBuffer;
            console.log("aB = " + this.audioBuffer);
            // AudioBuffersourceNode Setup
            this.initBufferSource(_audioContext);
            return this.audioBuffer;
        }

        private setLoop(): void {
            this.bufferSource.loop = this.isLooping;
        }

        private addLocalGain(): void {
            this.bufferSource.connect(this.localGain);
        }
    }
}