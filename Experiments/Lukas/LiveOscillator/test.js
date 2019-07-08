// create web audio api context
var audioCtx = new AudioContext();

// create Oscillator node
var oscillator = audioCtx.createOscillator();
// let freq = 200;
let slider = document.getElementById("slider");
let output = document.getElementById("output");
slider.addEventListener("change",changeSlider);

oscillator.type = 'square';
oscillator.frequency.setValueAtTime(440, audioCtx.currentTime); // value in hertz
oscillator.connect(audioCtx.destination);
oscillator.start();

// window.setInterval(higherFreq, 1000);

// function higherFreq() {
// 	freq += 100;
// 	oscillator.frequency.setValueAtTime(freq, audioCtx.currentTime); // value in hertz
// }

function changeSlider(){
	oscillator.frequency.setValueAtTime(slider.value, audioCtx.currentTime);
	output.innerHTML = slider.value;
}