"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const phonegap_class_1 = require("./phonegap/phonegap.class");
/* CROSS WINDOW EVENTS */
let pg = new phonegap_class_1.PhoneGap();
const openedProject = document.querySelector("#opened-project");
const createdProject = document.querySelector("#created-project");
const loading = document.querySelector("#loading");
electron_1.ipcRenderer.on("opened-pg-project", (event, data) => {
    pg = new phonegap_class_1.PhoneGap("", "", data);
    openedProject.querySelector("span.project-name").innerHTML = pg.getAppName();
    if (!openedProject.classList.contains("show")) {
        openedProject.classList.add("show");
    }
    showPgProjectBtns();
});
electron_1.ipcRenderer.on("created-pg-project", (event, data) => {
    pg = new phonegap_class_1.PhoneGap("", "", data);
    createdProject.querySelector("span.project-name").innerHTML = pg.getAppName();
    if (!createdProject.classList.contains("show")) {
        createdProject.classList.add("show");
    }
    showPgProjectBtns();
});
function showPgProjectBtns() {
    const projectBtnContainer = document.querySelector("#project-btn-container");
    if (projectBtnContainer.classList.contains("hide")) {
        projectBtnContainer.classList.remove("hide");
    }
}
/* RENDERER EVENTS */
const servePortInput = document.querySelector("#serve-port");
const serveProjectBtn = document.querySelector("#serve-project");
const killServeProjectBtn = document.querySelector("#kill-serve-project");
const buildProjectBtn = document.querySelector("#build-project");
const installProjectBtn = document.querySelector("#install-project");
const runProjectBtn = document.querySelector("#run-project");
const terminal = document.querySelector("#terminal");
const resultContainer = document.querySelector("#result");
const clearTerminalBtn = document.querySelector("#clear-terminal");
serveProjectBtn.addEventListener("click", (event) => {
    let port = servePortInput.valueAsNumber ? servePortInput.valueAsNumber : 1234;
    pg.serveProject(port, terminal).then((msg) => {
        if (msg.getResult()) {
            killServeProjectBtn.classList.remove("hide");
        }
        resultContainer.innerHTML = msg.getMessage();
    });
});
killServeProjectBtn.addEventListener("click", (event) => {
    pg.killServeProcess()
        .then((msg) => {
        resultContainer.innerHTML = msg.getMessage();
        if (msg.getResult()) {
            killServeProjectBtn.classList.add("hide");
        }
        if (resultContainer.classList.contains("hide")) {
            resultContainer.classList.remove("hide");
        }
    })
        .catch((error) => {
        resultContainer.innerHTML = error.getMessage();
        if (resultContainer.classList.contains("hide")) {
            resultContainer.classList.remove("hide");
        }
    });
});
buildProjectBtn.addEventListener("click", (event) => {
    loading.classList.remove("hide");
    pg.buildProjectForAndroid(terminal)
        .then((msg) => {
        console.log("build", msg);
        resultContainer.innerHTML = msg.getMessage();
        if (resultContainer.classList.contains("hide")) {
            resultContainer.classList.remove("hide");
        }
    })
        .catch((error) => {
        resultContainer.innerHTML = error.getMessage();
        if (resultContainer.classList.contains("hide")) {
            resultContainer.classList.remove("hide");
        }
    });
});
installProjectBtn.addEventListener("click", (event) => {
    loading.classList.remove("hide");
    pg.installProjectOnAndroid(terminal)
        .then((msg) => {
        resultContainer.innerHTML = msg.getMessage();
        if (resultContainer.classList.contains("hide")) {
            resultContainer.classList.remove("hide");
        }
    })
        .catch((error) => {
        resultContainer.innerHTML = error.getMessage();
        if (resultContainer.classList.contains("hide")) {
            resultContainer.classList.remove("hide");
        }
    });
});
runProjectBtn.addEventListener("click", (event) => {
    loading.classList.remove("hide");
    pg.runProjectOnAndroid(terminal)
        .then((msg) => {
        console.log("run", msg);
        resultContainer.innerHTML = msg.getMessage();
        if (resultContainer.classList.contains("hide")) {
            resultContainer.classList.remove("hide");
        }
    })
        .catch((error) => {
        resultContainer.innerHTML = error.getMessage();
        if (resultContainer.classList.contains("hide")) {
            resultContainer.classList.remove("hide");
        }
    });
});
clearTerminalBtn.addEventListener("click", (event) => {
    terminal.innerHTML = "";
});
terminal.addEventListener("process-data", (event) => {
    let child = document.createElement("div");
    child.classList.add("process-data");
    child.innerHTML = event.detail.data;
    terminal.appendChild(child);
    if (terminal.classList.contains("hide")) {
        terminal.classList.remove("hide");
    }
});
terminal.addEventListener("process-end", (event) => {
    let child = document.createElement("div");
    child.classList.add("process-data");
    if (event.detail.data == 0) {
        child.innerHTML = "Exit code " + event.detail.data + ": build successful";
    }
    else {
        child.innerHTML = "Exit code " + event.detail.data + ": something went wrong";
    }
    terminal.appendChild(child);
    loading.classList.add("hide");
    if (terminal.classList.contains("hide")) {
        terminal.classList.remove("hide");
    }
});
//# sourceMappingURL=index.renderer.js.map