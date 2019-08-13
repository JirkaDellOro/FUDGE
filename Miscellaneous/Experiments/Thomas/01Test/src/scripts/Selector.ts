// Create AudioContext instance
const audioContext: AudioContext = new (window["AudioContext"] || window["webkitAudioContext"])();
// Create a buffer for the incoming sound content
let source:AudioBufferSourceNode = audioContext.createBufferSource();

// Create XHR to get the audio contents
let request:XMLHttpRequest = new XMLHttpRequest();
// Create URL to sound library
const url:string = 'sounds/mario_piano.mp3';

// Set the audio file src here
request.open('GET', url, true);
// Setting the responseType to arraybuffer sets up audio decoding
request.responseType = 'arraybuffer';
request.onload = function():void {
        // Decode the audio once the require is complete
        audioContext.decodeAudioData(
            request.response,
            function(buffer:AudioBuffer):void {
                source.buffer = buffer;
                // Connect the audio to source (multiple audio buffers can be connected!)
                source.connect(audioContext.destination);
                // Simple setting for the buffer
                source.loop = true;
                // Play the sound!
                source.start(0);
            },
            function(e):void {
                console.log('Audio error', e);
            });
    }
    // Send the request which kicks off 
request.send();