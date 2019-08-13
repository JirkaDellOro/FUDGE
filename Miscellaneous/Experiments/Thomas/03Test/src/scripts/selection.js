var aC0, aC1, aC2;
var selectedSong;
var volume1, volume2, volume3 = 50;
var url;


function PlaySong(num) {

    var request = new XMLHttpRequest();

    console.log(num);

    switch (num) {
        case 0:
            url = 'sounds/mario_piano.mp3'
            aC0 = new(window.AudioContext || window.webkitAudioContext)();
            var source = aC0.createBufferSource();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
                aC0.decodeAudioData(
                    request.response,
                    function(buffer) {
                        source.buffer = buffer;
                        source.connect(aC0.destination);
                        source.loop = true;
                        source.start(0);
                    },
                    function(e) {
                        console.log('Audio error', e);
                    });
            }
            request.send();
            break;
        case 1:
            url = 'sounds/hypnotic.mp3'
            aC1 = new(window.AudioContext || window.webkitAudioContext)();
            var source = aC1.createBufferSource();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
                aC1.decodeAudioData(
                    request.response,
                    function(buffer) {
                        source.buffer = buffer;
                        source.connect(aC1.destination);
                        source.loop = true;
                        source.start(0);
                    },
                    function(e) {
                        console.log('Audio error', e);
                    });
            }
            request.send();
            break;
        case 2:
            url = 'sounds/trancyvania.mp3'
            aC2 = new(window.AudioContext || window.webkitAudioContext)();
            var source = aC2.createBufferSource();
            request.open('GET', url, true);
            request.responseType = 'arraybuffer';
            request.onload = function() {
                aC2.decodeAudioData(
                    request.response,
                    function(buffer) {
                        source.buffer = buffer;
                        source.connect(aC2.destination);
                        source.loop = true;
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



function SetVolume(vol, index) {

    var volumeMaster = vol;

    switch (index) {
        case 0:
            volume1 = volumeMaster;
            document.getElementById('output1').innerHTML = volumeMaster;
            break;
        case 1:
            volume2 = volumeMaster;
            document.getElementById('output2').innerHTML = volumeMaster;
            break;
        case 2:
            volume3 = volumeMaster;
            document.getElementById('output3').innerHTML = volumeMaster;
            break;
        default:
            console.log("error");
    }


    console.log(volumeMaster + "volume: " + index);
}