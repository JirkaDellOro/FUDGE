window.AudioContext = window.AudioContext || window.webkitAudioContext;

var audioContext = new AudioContext();
var mixGain = audioContext.createGain();
var filterGain = audioContext.createGain();
var mixButton = document.querySelector('#mixButton');

//SOUNDS

function kick() {

    var osc = audioContext.createOscillator();
    var osc2 = audioContext.createOscillator();
    var gainOsc = audioContext.createGain();
    var gainOsc2 = audioContext.createGain();

    osc.type = "triangle";
    osc2.type = "sine";

    gainOsc.gain.setValueAtTime(1, audioContext.currentTime);
    gainOsc.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);


    gainOsc2.gain.setValueAtTime(1, audioContext.currentTime);
    gainOsc2.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);


    osc.frequency.setValueAtTime(120, audioContext.currentTime);
    osc.frequency.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    osc2.frequency.setValueAtTime(50, audioContext.currentTime);
    osc2.frequency.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.5);

    osc.connect(gainOsc);
    osc2.connect(gainOsc2);
    gainOsc2.connect(mixGain);
    gainOsc.connect(mixGain);
    gainOsc.connect(audioContext.destination);
    gainOsc2.connect(audioContext.destination);

    mixGain.gain.value = 1;

    osc.start(audioContext.currentTime);
    osc2.start(audioContext.currentTime);

    osc.stop(audioContext.currentTime + 0.5);
    osc2.stop(audioContext.currentTime + 0.5);

};

function snare() {

    var osc3 = audioContext.createOscillator();
    var gainOsc3 = audioContext.createGain();

    filterGain.gain.setValueAtTime(1, audioContext.currentTime);
    filterGain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

    osc3.type = "triangle";
    osc3.frequency.value = 100;
    gainOsc3.gain.value = 0;

    gainOsc3.gain.setValueAtTime(0, audioContext.currentTime);
    gainOsc3.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    osc3.connect(gainOsc3);
    gainOsc3.connect(mixGain);

    mixGain.gain.value = 1;

    osc3.start(audioContext.currentTime);
    osc3.stop(audioContext.currentTime + 0.2);

    var node = audioContext.createBufferSource(),
        buffer = audioContext.createBuffer(1, 4096, audioContext.sampleRate),
        data = buffer.getChannelData(0);

    var filter = audioContext.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(100, audioContext.currentTime);
    filter.frequency.linearRampToValueAtTime(1000, audioContext.currentTime + 0.2);


    for (var i = 0; i < 4096; i++) {
        data[i] = Math.random();
    }
    node.buffer = buffer;
    node.loop = true;
    node.connect(filter);
    filter.connect(filterGain);
    filterGain.connect(mixGain);
    node.start(audioContext.currentTime);
    node.stop(audioContext.currentTime + 0.2);
};


function hihat() {

    var gainOsc4 = audioContext.createGain();
    var fundamental = 40;
    var ratios = [2, 3, 4.16, 5.43, 6.79, 8.21];

    var bandpass = audioContext.createBiquadFilter();
    bandpass.type = "bandpass";
    bandpass.frequency.value = 10000;

    var highpass = audioContext.createBiquadFilter();
    highpass.type = "highpass";
    highpass.frequency.value = 7000;


    ratios.forEach(function(ratio) {

        var osc4 = audioContext.createOscillator();
        osc4.type = "square";
        osc4.frequency.value = fundamental * ratio;
        osc4.connect(bandpass);

        osc4.start(audioContext.currentTime);
        osc4.stop(audioContext.currentTime + 0.05);

    });

    gainOsc4.gain.setValueAtTime(1, audioContext.currentTime);
    gainOsc4.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.05);

    bandpass.connect(highpass);
    highpass.connect(gainOsc4);
    gainOsc4.connect(mixGain);

    mixGain.gain.value = 1;

};

//PLAY AROUND WITH INTERVAL VALUES TO CHANGE BEATS

function Init() {
    interval(
        kick(),
        600,
        10);
    interval(
        snare(),
        1200,
        5);
    interval(
        hihat(),
        200,
        30);
}


function interval(func, wait, times) {
    var interv = function(w, t) {
        return function() {
            if (typeof t === "undefined" || t-- > 0) {
                setTimeout(interv, w);
                try {
                    func.call(null);
                } catch (e) {
                    t = 0;
                    throw e.toString();
                }
            }
        };
    }(wait, times);

    setTimeout(interv, wait);
};

mixGain.connect(audioContext.destination);
mixGain.gain.value = 0;
filterGain.gain.value = 0;