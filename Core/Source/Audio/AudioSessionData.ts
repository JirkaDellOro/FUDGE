namespace FudgeCore {
    /**
     * Interface to generate Data Pairs of URL and AudioBuffer
     */
    interface AudioData {
        url: string;
        buffer: AudioBuffer;
    }

    /**
     * Describes Data Handler for all Audio Sources
     * @authors Thomas Dorner, HFU, 2019
     */
    export class AudioSessionData {

        public dataArray: AudioData[];

        /**
         * Constructor of the [[AudioSessionData]] Class.
         */
        constructor() {
            this.dataArray = new Array();
        }

        /**
         * Decoding Audio Data 
         * Asynchronous Function to permit the loading of multiple Data Sources at the same time
         * @param _audioContext AudioContext from AudioSettings
         * @param _url URL as String for Data fetching
         */
        public async urlToBuffer(_audioContext: AudioContext, _url: string): Promise<AudioBuffer> {
            
            let initObject: RequestInit = {
                method: "GET",
                mode: "same-origin", //default -> same-origin
                cache: "no-cache", //default -> default 
                headers: {
                    "Content-Type": "audio/mpeg3"
                },
                redirect: "follow" // default -> follow
            };

            let buffer: AudioBuffer = null;
            for (let x: number = 0; x < this.dataArray.length; x++) {
                if (this.dataArray[x].url == _url) {
                    console.log("Existing URL found");
                    if (this.dataArray[x].buffer == null) {
                        const response: Response = await window.fetch(_url, initObject);
                        const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
                        const decodedAudio: AudioBuffer = await _audioContext.decodeAudioData(arrayBuffer);
                        this.pushBufferInArray(_url, decodedAudio);
                        return decodedAudio;
                    }
                    else {
                        buffer = await this.dataArray[x].buffer;
                        return this.dataArray[x].buffer;
                    }
                }
            }
            if (buffer == null) {
                try {
                    this.pushUrlInArray(_url);
                    const response: Response = await window.fetch(_url, initObject);
                    const arrayBuffer: ArrayBuffer = await response.arrayBuffer();
                    const decodedAudio: AudioBuffer = await _audioContext.decodeAudioData(arrayBuffer);
                    this.pushBufferInArray(_url, decodedAudio);
                    return decodedAudio;
                } catch (e) {
                    this.logErrorFetch(e);
                    return null;
                }
            } 
            else {
                return null;
            }
        }


        /**
         * Push URL into Data Array to create a Placeholder in which the Buffer can be placed at a later time
         */
        /**
         * 
         * @param _url 
         * @param _audioBuffer 
         */
        public pushBufferInArray(_url: string, _audioBuffer: AudioBuffer): void {
            for (let x: number = 0; x < this.dataArray.length; x++) {
                if (this.dataArray[x].url == _url) {
                    if (this.dataArray[x].buffer == null) {
                        this.dataArray[x].buffer = _audioBuffer;
                        return;
                    }
                }
            } 
        }
        
        /**
         * Create a new log for the Data Array.
         * Uses a url and creates a placeholder for the AudioBuffer.
         * The AudioBuffer gets added as soon as it is created.
         * @param _url Add a url to a wanted resource as a string
         */
        public pushUrlInArray(_url: string): void {
            let data: AudioData;
            data = {
                url: _url,
                buffer: null
            };
            this.dataArray.push(data);
        }

        /**
         * Show all Data in Array.
         * Use this for Debugging purposes.
         */
        public showDataInArray(): void {
            for (let x: number = 0; x < this.dataArray.length; x++) {
                console.log("Array Data: " + this.dataArray[x].url + this.dataArray[x].buffer);
            }
        }

        /**
         * Error Message for Data Fetching
         * @param e Error
         */
        private logErrorFetch(_error: Error): void {
            console.log("Audio error", _error);
        }
    }
}