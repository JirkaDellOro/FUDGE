"use strict";

class Raycast {
    
    constructor() {

    }

    
    getRaycast() {
        var selectedObject = null;
        var intersects = getIntersects(screenX, screenY);
        if (intersects.length > 0) {
            var raycastHit = intersects.filter(function (raycastHit) {
                return raycastHit;
            })[0];
            //if selected now
            if (raycastHit) {
                selectedObject = raycastHit.object;
                return selectedObject;
            }
        }
    }
}

function getIntersects() {
    var raycaster = new THREE.Raycaster;
    var mouseVector = new THREE.Vector2;
 
    mouseVector.set((event.layerX / window.innerWidth) * 2 - 1, -(event.layerY / window.innerHeight) * 2 + 1);
    //console.log(mouseVector);
    raycaster.setFromCamera(mouseVector, camera);
    return raycaster.intersectObject(getObjects(), true);
}


