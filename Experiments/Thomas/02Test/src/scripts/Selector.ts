let audioContext:AudioContext = null;
let volume:number = 50;
let url:string;


function PlaySong():void {

    SetSong();

    //Close AC if already openend
    if (audioContext != null) {
        audioContext.close();
    }


    // Create AudioContext instance
    audioContext = new (window["AudioContext"] || window["webkitAudioContext"])();
    // Create a buffer for the incoming sound content
    const source:AudioBufferSourceNode = audioContext.createBufferSource();

    // Create XHR to get the audio contents
    const request:XMLHttpRequest = new XMLHttpRequest();

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
                function(e:Error) {
                    console.log('Audio error', e);
                });
        }
        // Send the request which kicks off 
    request.send();
}


function SetSong():void {
    const ele:HTMLElement = document.getElementById("songs");
    const song:HTMLElement = document.getElementById("songSelection");
    let selected:string = ele.options[ele.selectedIndex].value;
    
    song.innerHTML = ele.options[ele.selectedIndex].innerHTML;

    switch (selected) {
        case 'songone':
            url = 'sounds/mario_piano.mp3'
            break;
        case 'songtwo':
            url = 'sounds/mario_piano.mp3'
            break;
        case 'songthree':
            url = 'sounds/mario_piano.mp3'
            break;
        default:
            console.log('error')
    }
}

function SetVolume(vol:number):void {
    volume = vol;
    document.getElementById('output').innerHTML = volume;
    console.log(volume);
}