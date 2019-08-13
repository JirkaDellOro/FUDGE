//Variable Choices
let songchoice: string;


//Variables
let ac:AudioContext;
//let audio:Audio



//Add Init() to loading Event
window.addEventListener('load', Init, false)

function Init():void{

    

    //Load Song of Choice into AC


}



//FORM Handling//
//Song Choice Submit Button
function SongSelection(choice:string):void{

    //Close Existing AudioContext
    ac.close();

    //Open AudioContext
    ac = new AudioContext();

    //let volume =

}

//Adding Effect to Existing AC
function AddEffect(choice:string):void{

    //
    
}



function Play():void{

    //Play Song
    //ac.
}

function Pause():void{

    //Pause Song
    ac.suspend();
}

function UpdateVolume():void{

    //Pause
    //ac.
}