namespace Fudge {
    /**
     * Interface to generate Data Pairs of URL and AudioBuffer
     */
    interface AudioData {
        url: string;
        buffer: AudioBuffer;
        counter: number;
    }

    /**
     * Describes Data Handler for all Audio Sources
     * @authors Thomas Dorner, HFU, 2019
     */
    export class AudioSessionData {
        public dataArray: AudioData[];
        private bufferCounter: number;
        //TODO obsolete holder when array working / maybe use as helper var
        private audioBufferHolder: AudioData;

        /**
         * constructor of the [[AudioSessionData]] class
         */
        constructor() {
            this.dataArray = new Array();
            this.bufferCounter = 0;
        }

        /**
         * getBufferCounter returns [bufferCounter] to keep track of number of different used sounds
         */
        public getBufferCounter(): number {
            return this.bufferCounter;
        }

        /**
         * Decoding Audio Data 
         * Asynchronous Function to permit the loading of multiple Data Sources at the same time
         * @param _url URL as String for Data fetching
         */
        public async urlToBuffer(_audioContext: AudioContext, _url: string): Promise<AudioBuffer> {
            console.log("inside urlToBuffer");
            
            let initObject: RequestInit = {
                method: "GET",
                mode: "same-origin", //default -> same-origin
                cache: "no-cache", //default -> default 
                headers: {
                    "Content-Type": "audio/mpeg3"
                },
                redirect: "follow" // default -> follow
            };
            // Check for existing URL in DataArray, if no data inside add new AudioData
            //this.pushDataArray(_url, null);
            console.log("length" + this.dataArray.length);
            if (this.dataArray.length == 0) {
                try {
                    // need window to fetch?
                    const response: Response = await window.fetch(_url, initObject);
                    const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
                    const decodedAudio: AudioBuffer = await _audioContext.decodeAudioData(arrayBuffer);
                    this.pushDataArray(_url, decodedAudio);
                    //this.dataArray[this.dataArray.length].buffer = decodedAudio;
                    console.log("length " + this.dataArray.length);
                    return decodedAudio;
                } catch (e) {
                    this.logErrorFetch(e);
                    return null;
                }
            } else {
                // If needed URL is inside Array, 
                // iterate through all existing Data to get needed values
                for (let x: number = 0; x < this.dataArray.length; x++) {
                    console.log("what is happening");
                    if (this.dataArray[x].url == _url) {
                        console.log("found existing url");
                        return this.dataArray[x].buffer;
                    } 
                }
                return null;
            }
        }


        /**
         * pushTuple Source and Decoded Audio Data gets saved for later use
         * @param _url URL from used Data
         * @param _audioBuffer AudioBuffer generated from URL
         */
        public pushDataArray(_url: string, _audioBuffer: AudioBuffer): AudioData {
            let data: AudioData;
            data = { url: _url, buffer: _audioBuffer, counter: this.bufferCounter };
            this.dataArray.push(data);
            console.log("array: " + this.dataArray);

            //TODO audioBufferHolder obsolete if array working
            this.setAudioBufferHolder(data);
            console.log("dataPair " + data.url + " " + data.buffer + " " + data.counter);
            this.bufferCounter += 1;
            return this.audioBufferHolder;
        }

        /**
         * iterateArray
         * Look at saved Data Count
         */
        public countDataInArray(): void {
            console.log("DataArray Length: " + this.dataArray.length);
        }

        /**
         * showDataInArray
         * Show all Data in Array
         */
        public showDataInArray(): void {
            for (let x: number = 0; x < this.dataArray.length; x++) {
                console.log("Array Data: " + this.dataArray[x].url + this.dataArray[x].buffer);
            }
        }

        /**
         * getAudioBuffer
         */
        public getAudioBufferHolder(): AudioData {
            return this.audioBufferHolder;
        }

        /**
         * setAudioBuffer
         */
        public setAudioBufferHolder(_audioData: AudioData): void {
            this.audioBufferHolder = _audioData;
        }

        /**
         * Error Message for Data Fetching
         * @param e Error
         */
        private logErrorFetch(e: Error): void {
            console.log("Audio error", e);
        }
    }
}