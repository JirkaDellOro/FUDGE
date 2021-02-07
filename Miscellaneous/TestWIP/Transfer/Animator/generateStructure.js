var genStruct;
(function (genStruct) {
    document.addEventListener("DOMContentLoaded", init);
    let crc;
    let mutator;
    let listUlElement;
    let propertiesMap = new Map();
    function init() {
        listUlElement = document.getElementById("propertiesContainerList");
        let canvas = document.getElementsByTagName("canvas")[0];
        crc = canvas.getContext("2d");
        crc.strokeStyle = "#000";
        crc.lineWidth = 2;
        Scenes.createMiniScene();
        mutator = Scenes.node.cmpTransform.getMutatorForAnimation();
        Scenes.node.cmpTransform.getMutatorAttributeTypes(mutator);
        // makeHTMLStructure(mutator, listUlElement);
        makeHTMLStructure({ people: [{ name: "Lukas", age: 24 }, { name: "Jirka", age: 54 }], cars: [{ brand: "Audi", km: 20000, new: false }, { brand: "VW", km: 100000, new: true }] }, listUlElement);
        updateCanvas();
    }
    function makeHTMLStructure(_obj, _parent) {
        for (let key in _obj) {
            let value = _obj[key];
            let li = document.createElement("li");
            li.innerHTML = key;
            _parent.appendChild(li);
            if (value instanceof Object) {
                li.classList.add("parent");
                li.addEventListener("click", toggleListObj);
                let ul = document.createElement("ul");
                _parent.appendChild(ul);
                makeHTMLStructure(value, ul);
            }
            else {
                let valueInput;
                console.log(typeof value);
                switch (typeof value) {
                    case "number":
                        valueInput = document.createElement("input");
                        valueInput.value = value;
                        break;
                    case "boolean":
                        valueInput = document.createElement("input");
                        valueInput.type = "checkbox";
                        valueInput.checked = value;
                        break;
                    case "string":
                        valueInput = document.createElement("input");
                        valueInput.value = value;
                        break;
                    default:
                        valueInput = document.createElement("a");
                        break;
                }
                li.appendChild(valueInput);
                propertiesMap.set(li, value);
            }
        }
    }
    function toggleListObj(_event) {
        _event.preventDefault();
        if (_event.target != _event.currentTarget)
            return;
        let target = _event.target;
        let child = target.nextSibling;
        let childNowVisible = child.style.display == "none" ? true : false;
        child.style.display = childNowVisible ? "block" : "none";
        childNowVisible ? target.classList.remove("folded") : target.classList.add("folded");
        updateCanvas();
        // console.log(propertiesMap.get(target));
    }
    function updateCanvas() {
        crc.clearRect(0, 0, crc.canvas.width, crc.canvas.height);
        let path = new Path2D();
        for (let p of propertiesMap.keys()) {
            if (p.offsetTop <= 0)
                continue;
            // console.log(p.offsetTop);
            path.rect(10, p.offsetTop + 5, 10, 10);
        }
        crc.stroke(path);
    }
    function generateRandomID() {
        return Math.round((Math.random() * 1000000)).toString();
    }
})(genStruct || (genStruct = {}));
//# sourceMappingURL=generateStructure.js.map