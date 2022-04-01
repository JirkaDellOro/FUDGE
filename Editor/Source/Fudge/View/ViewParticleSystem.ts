
// import fs from "fs";

namespace Fudge {
    import ƒ = FudgeCore;
    import ƒUi = FudgeUserInterface;

    const fs: ƒ.General = require("fs");

    export class ViewParticleSystem extends View {
        constructor(_container: ComponentContainer, _state: Object) {
            super(_container, _state);
            let filename: string | string[] = remote.dialog.showOpenDialogSync(null, {
                properties: ["openFile", "promptToCreate"], title: "Select/Create a new particle system json", buttonLabel: "Save Particle System", filters: [{name: "json", extensions: ["json"]}]
            });
          
            if (!filename)
            return;
        
            let base: URL = new URL(new URL("file://" + filename[0]).toString() + "/");
            // console.log("Path", base.toString());
            this.setTitle(base.toString().match("/[A-Za-z._]*/$")[0]?.replaceAll("/", ""));

            fs.readFile(base, "utf-8", (error, data) => {
                if (error?.code === "ENOENT")
                    fs.writeFileSync(base, "{}");

                let div: HTMLDivElement = document.createElement("div");
                div.innerText = data;
                this.dom.appendChild(div);
            });


        }
    }
}