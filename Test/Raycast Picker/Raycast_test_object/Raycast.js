"use strict";


class Raycast {
    constructor() {
    }
    hitTest() {

        var selectedObject = null;
        var intersects = getIntersects(screenX, screenY);
        if (intersects.length > 0) {
            var res = intersects.filter(function (res) {
                return res && res.object;
            })[0];
            //if selected now
            if (res && res.object) {
                selectedObject = res.object;
                //console.log(selectedObject);
                return selectedObject;
            }
        }
    }
}

function getIntersects() {
    var raycaster = new THREE.Raycaster;
    var mouseVector = new THREE.Vector2;
    var x = (x / window.innerWidth) * 2 - 1;
    var y = - (y / window.innerHeight) * 2 + 1;

    mouseVector.set((event.layerX / window.innerWidth) * 2 - 1, -(event.layerY / window.innerHeight) * 2 + 1 /* ,0.5 */);
    console.log(mouseVector);
    raycaster.setFromCamera(mouseVector, camera);
    return raycaster.intersectObject(getObjects(), true);
}


