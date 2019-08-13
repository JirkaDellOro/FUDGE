var audioContext = null;
var volume = 50;
var url;


function PlaySong() {

    SetSong();

    //Close AC if already openend
    if (audioContext != null) {
        audioContext.close();
    }


    // Create AudioContext instance, check Browser
    audioContext = new(window.AudioContext || window.webkitAudioContext)();
    // Create a buffer for the incoming sound content
    var source = audioContext.createBufferSource();
    // Create Gain Node to control volume
    var gainNode = audioContext.createGain();
    // Create XHR to get the audio contents
    var request = new XMLHttpRequest();

    // Set the audio file src here
    request.open('GET', url, true);
    // Setting the responseType to arraybuffer sets up audio decoding
    request.responseType = 'arraybuffer';
    request.onload = function() {
            // Decode the audio once the require is complete
            audioContext.decodeAudioData(
                request.response,
                function(buffer) {
                    source.buffer = buffer;
                    // Connect the audio to source (multiple audio buffers can be connected!)
                    source.connect(audioContext.destination);
                    // Simple setting for the buffer
                    source.loop = true;
                    //Volume setting ( 0.1 = 10% )
                    gainNode.gain.value = -.5 + (volume / 100);
                    // Link gainNode to AC
                    gainNode.connect(audioContext.destination);
                    source.connect(gainNode);
                    // Play the sound!
                    source.start(0);
                },
                function(e) {
                    console.log('Audio error', e);
                });
        }
        // Send the request which kicks off 
    request.send();
}


function SetSong() {
    var ele = document.getElementById("songs");
    var selected = ele.options[ele.selectedIndex].value;
    var song = document.getElementById("songSelection");

    song.innerHTML = ele.options[ele.selectedIndex].innerHTML;

    switch (selected) {
        case 'songone':
            url = 'sounds/mario_piano.mp3'
            break;
        case 'songtwo':
            url = 'sounds/hypnotic.mp3'
            break;
        case 'songthree':
            url = 'sounds/trancyvania.mp3'
            break;
        default:
            console.log('error')
    }
}

function SetVolume(vol) {
    // Set Volume for next Sound
    volume = vol;
    document.getElementById('output').innerHTML = volume;
    console.log(volume);
}