namespace AudioSelector {
    let source: AudioBufferSourceNode;
    let audioContext: AudioContext;
    let volume: number = 50;
    let url: string;
    window.addEventListener("load", init);

    function init(_event: Event): void {
        document.querySelector("button").addEventListener("click", playSong);
        document.querySelector("input").addEventListener("input", setVolume);
    }

    // ------- del: Funktions- und Methodennamen müssem mit Kleinbuchstaben beginnen
    function playSong(): void {
        // ------del: Test mit der Standard-Klasse der lib.dom.d.ts, Interface und Declaration sind dort hinterlegt
        audioContext = new AudioContext({ latencyHint: "interactive", sampleRate: 44100 });
        // Create a buffer for the incoming sound content
        source = audioContext.createBufferSource();

        setSong();

        //Close AC if already openend
        if (audioContext != null) {
            audioContext.close();
        }


        // Create XHR to get the audio contents
        // ----------- del: fetch verwenden statt XMLHttpRequest
        const request: XMLHttpRequest = new XMLHttpRequest();

        // -----------del: wir nutzen doppelte Anführungszeichen, siehe Guidelines
        // Set the audio file src here
        request.open("GET", url, true);
        // Setting the responseType to arraybuffer sets up audio decoding
        request.responseType = "arraybuffer";
        // ----------- del: keine on... installation verwenden, sondern die empfohlene addEventListener-Syntax
        request.addEventListener("load", decode);
        // Send the request which kicks off 
        request.send();
    }

    function decode(_event: Event): void {
        let xhr: XMLHttpRequest = <XMLHttpRequest>_event.target;
        console.log("decode");
        // Decode the audio once the require is complete
        audioContext.decodeAudioData(
            xhr.response,
            // -------- del: keine callback-Hölle! Anonyme Funktionen nur verwenden, wenn sie zwingend erforderlich oder besonders sinnvoll sind
            playBuffer,
            logError
        );
    }

    function playBuffer(buffer: AudioBuffer): void {
        console.log("playBuffer");
        source.buffer = buffer;
        // Connect the audio to source (multiple audio buffers can be connected!)
        source.connect(audioContext.destination);
        // Simple setting for the buffer
        source.loop = true;
        // Play the sound!
        source.start(0);
    }
    
    function logError(e: Error): void {
        console.log("Audio error", e);
    }


    function setSong(): void {
        // --------------del: Variablen bitte eher ausschreiben, also element statt ele. Aber... element sagt in dem Context gar nichts, also suche einen sinnvollen Namen!
        const element: HTMLSelectElement = <HTMLSelectElement>document.getElementById("songs");
        // -------------del: Damit man auf die Attribute der speziellen HTML-Elemente zugreifen kann, muss ihr Typ entsprechen!
        const song: HTMLElement = document.getElementById("songSelection");
        let selected: string = element.options[element.selectedIndex].value;

        song.innerHTML = element.options[element.selectedIndex].innerHTML;

        switch (selected) {
            case "songone":
                url = "sounds/mario_piano.mp3";
                break;
            case "songtwo":
                url = "sounds/mario_piano.mp3";
                break;
            case "songthree":
                url = "sounds/mario_piano.mp3";
                break;
            default:
                console.log("error");
        }
    }

    function setVolume(_event: Event): void {
        // ---------del: let verwenden! var nur, wenn man genau weiß warum, und eine Variable ganz ohne let, var oder const einzuführen ist total verboten!
        // hier stand: volume = vol , was zudem noch völlig unnötig ist
        let input: HTMLInputElement = <HTMLInputElement>event.target;

        // ------- del: da innerHTML vom Typ String ist, muss volume umgewandelt werden.
        document.getElementById("output").innerHTML = input.value;
        console.log(volume);
    }
}