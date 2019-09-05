"use strict";
exports.__esModule = true;
var raycast = /** @class */ (function () {
    //  init();
    // animate();
    /*function animate() {

        renderer.render( scene, camera );
        requestAnimationFrame( animate );

    }*/
    function raycast(mouseVector, camera) {
    }
    /* let selectedObject = null;
     let isDown = false;
 
     let raycaster: Raycaster;
     let mouseVector: Vector2;
 */
    raycast.prototype.hitTest = function () {
        var selectedObject = null;
        var intersects = this.getIntersects(screenX, screenY);
        if (intersects.length > 0) {
            var res = intersects.filter(function (res) {
                return res && res.object;
            })[0];
            //if selected now
            if (res && res.object) {
                selectedObject = res.object;
                console.log(selectedObject);
            }
        }
    };
    /*public static get selectedObject(){
        return selectedObject;
    }*/
    raycast.prototype.getIntersects = function (x, y) {
        var mouseVector;
        var raycaster;
        var objects;
        var camera;
        x = (x / window.innerWidth) * 2 - 1;
        y = -(y / window.innerHeight) * 2 + 1;
        mouseVector.set(x, y);
        raycaster.setFromCamera(mouseVector, camera);
        return raycaster.intersectObject(objects, true);
    };
    return raycast;
}());
exports.raycast = raycast;
/* function onDocumentMouseMove( event ) {

     event.preventDefault();
     //if selected once but not anymore
     if ( selectedObject ) {

         selectedObject.material.color.set( '#69f' );
         selectedObject = null;

     }

     var intersects = getIntersects( event.layerX, event.layerY );
     if ( intersects.length > 0 ) {

         var res = intersects.filter( function ( res ) {

             return res && res.object;

         } )[ 0 ];
         //if selected now
         if ( res && res.object ) {

             selectedObject = res.object;
             selectedObject.material.color.set( '#f00' );

             if(isDown){

             
             
             //selectedObject.position.set(8,5,8);

             }

         }

     }

 }*/
/*function onDocumentMouseUp(event){
    isDown = false;
    if(onDocumentMouseDown){
        selectedObject = null;
    
    }
    

}*/
