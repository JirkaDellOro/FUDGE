namespace AudioSelector {
    let bufferSource: AudioBufferSourceNode;
    let audioContext: AudioContext;
    let masterGain: GainNode;
    let audio: AudioBuffer;
    let volume: number = 0.5;
    let url: string;
    window.addEventListener("load", init);

    function init(_event: Event): void {
        document.querySelector("button").addEventListener("click", playSong);
        document.querySelector("input").addEventListener("input", setVolume);
    }

    function playSong(): void {
        if (audioContext != null) {
            audioContext.close();
        }
        setSong();

        audioContext = new AudioContext({ latencyHint: "interactive", sampleRate: 44100 });
        bufferSource = audioContext.createBufferSource();
        masterGain = audioContext.createGain();

        //useXHR();

       fetchAudio(audioContext);
    }

    function fetchAudio(_audioContext: AudioContext){
        // let requiredHeader = new Headers();
        // let initObject = {
        //     method: 'GET',
        //     headers: requiredHeader,
        // };

        console.log("fetching Audio");
        window.fetch(url)
            .then(data => data.arrayBuffer())
            .then(arrayBuffer => _audioContext.decodeAudioData(arrayBuffer))
            .then(decodedAudio => {
                audio = decodedAudio;
            })
            .then(playBuffer)
            .catch(logError)
    }

    // # https://gist.github.com/revolunet/e620e2c532b7144c62768a36b8b96da2


    // function useXHR(){
    //     const request: XMLHttpRequest = new XMLHttpRequest();
    //     request.open("GET", url, true);
    //     request.responseType = "arraybuffer";
    //     request.addEventListener("load", decode);
    //     request.send();
    // }

    // function decode(_event: Event): void {
    //     let xhr: XMLHttpRequest = <XMLHttpRequest>event.target;
    //     console.log("decode");
    //     audioContext.decodeAudioData(xhr.response, playBuffer, logError);
    // }


    function playBuffer(): void {
        console.log("playBuffer");
        bufferSource.buffer = audio;
        bufferSource.connect(audioContext.destination);
        // bufferSource.loop = true;
        console.log(volume);
        // 0.0 oder anderer Wert sonst Fehler
        masterGain.gain.value = 0.0 + volume;
        masterGain.connect(audioContext.destination);
        bufferSource.connect(masterGain);
        bufferSource.start(0);
    }

    function logError(e: Error): void {
        console.log("Audio error", e);
    }

    function setSong(): void {
        const soundOptions: HTMLSelectElement = <HTMLSelectElement>document.getElementById("soundOptions");
        const soundSelection: HTMLElement = document.getElementById("soundSelectionField");
        let selectedSound: string = soundOptions.value;
        // console.log(soundOptions);
        soundSelection.innerHTML = soundOptions.options[soundOptions.selectedIndex].innerHTML;

        switch (selectedSound) {
            case "mario":
                console.log("mario selected");
                url = "sounds/mario_piano.mp3";
                break;
            case "hypnotic":
                console.log("hypnoticc selected");
                url = "sounds/hypnotic.mp3";
                break;
            case "trancyvenia":
                console.log("trancyvania selected");
                url = "sounds/trancyvania.mp3";
                break;
            default:
                console.log("error");
        }
    }

    function setVolume(_event: Event): void {
        let input: HTMLInputElement = <HTMLInputElement>event.target;
        document.getElementById("volumeOutput").innerHTML = input.value;
        volume = input.valueAsNumber;
        console.log(volume);
    }
}