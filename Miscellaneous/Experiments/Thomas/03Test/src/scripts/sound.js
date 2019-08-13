var aC = new(window.AudioContext || window.webkitAudioContext)();
var url;


function PlaySong(num) {

    var request = new XMLHttpRequest();

    console.log(num);

    switch (num) {
        case 0:
            url = 'sounds/mario_piano.mp3';
            var source = aC.createBufferSource();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
                aC.decodeAudioData(
                    request.response,
                    function(buffer) {
                        source.buffer = buffer;
                        source.connect(aC.destination);
                        //source.loop = true;
                        source.start(0);
                    },
                    function(e) {
                        console.log('Audio error', e);
                    });
            }
            request.send();
            break;
        case 1:
            url = 'sounds/hypnotic.mp3';
            var source = aC.createBufferSource();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
                aC.decodeAudioData(
                    request.response,
                    function(buffer) {
                        source.buffer = buffer;
                        source.connect(aC.destination);
                        //source.loop = true;
                        source.start(0);
                    },
                    function(e) {
                        console.log('Audio error', e);
                    });
            }
            request.send();
            break;
        case 2:
            url = 'sounds/trancyvania.mp3';
            var source = aC.createBufferSource();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
                aC.decodeAudioData(
                    request.response,
                    function(buffer) {
                        source.buffer = buffer;
                        source.connect(aC.destination);
                        //source.loop = true;
                        source.start(0);
                    },
                    function(e) {
                        console.log('Audio error', e);
                    });
            }
            request.send();
            break;
        default:
            console.log('error')
    }
}