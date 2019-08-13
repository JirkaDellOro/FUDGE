// Create AudioContext instance
var audioContext = new(window.AudioContext || window.webkitAudioContext)();
// Create a buffer for the incoming sound content
var source = audioContext.createBufferSource();

// Create XHR to get the audio contents
var request = new XMLHttpRequest();
// Create URL to sound library
var url = 'sounds/mario_piano.mp3';

// Set the audio file src here
request.open('GET', url, true);
// Setting the responseType to arraybuffer sets up audio decoding
request.responseType = 'arraybuffer';
request.onload = function() {
        // Decode the audio once the require is complete
        audioContext.decodeAudioData(
            request.response,
            function(buffer) {
                // Connect Buffer Output to 
                source.buffer = buffer;
                // Connect the audio to source (multiple audio buffers can be connected!)
                source.connect(audioContext.destination);
                // Simple setting for the buffer
                source.loop = true;
                // Play the sound!
                source.start(0);
            },
            function(e) {
                console.log('Audio error', e);
            });
    }
    // Send the request which kicks off 
request.send();