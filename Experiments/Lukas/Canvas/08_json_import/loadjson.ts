let jsonUrl: string = "./example.json";

function loadJsonWithFetch() {
	fetch(jsonUrl).then(response => {
		return response.json();
	}).then(data => {
		console.log("fetch", data);
	});

}

loadJsonWithFetch();

let xmlhttp: XMLHttpRequest = new XMLHttpRequest();
function loadJsonWithXMLRequest() {
	xmlhttp.addEventListener("readystatechange", stateChange);
	xmlhttp.open("GET", jsonUrl);
	xmlhttp.send();
}

function stateChange(_request: any) {
	if (xmlhttp.status == 200 && xmlhttp.readyState == 4)
		console.log("xml",JSON.parse(xmlhttp.responseText));
}

loadJsonWithXMLRequest();

async function loadJsonWithFetchAwait(){
	let obj = await fetch(jsonUrl).then(response => {
		return response.json();
	});
	console.log("fetchawait",obj);
}

loadJsonWithFetchAwait();