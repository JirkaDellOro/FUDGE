var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
let jsonUrl = "./example.json";
function loadJsonWithFetch() {
    fetch(jsonUrl).then(response => {
        return response.json();
    }).then(data => {
        console.log("fetch", data);
    });
}
loadJsonWithFetch();
let xmlhttp = new XMLHttpRequest();
function loadJsonWithXMLRequest() {
    xmlhttp.addEventListener("readystatechange", stateChange);
    xmlhttp.open("GET", jsonUrl);
    xmlhttp.send();
}
function stateChange(_request) {
    if (xmlhttp.status == 200 && xmlhttp.readyState == 4)
        console.log("xml", JSON.parse(xmlhttp.responseText));
}
loadJsonWithXMLRequest();
function loadJsonWithFetchAwait() {
    return __awaiter(this, void 0, void 0, function* () {
        let obj = yield fetch(jsonUrl).then(response => {
            return response.json();
        });
        console.log("fetchawait", obj);
    });
}
loadJsonWithFetchAwait();
//# sourceMappingURL=loadjson.js.map