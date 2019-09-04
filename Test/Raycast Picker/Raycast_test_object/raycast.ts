import { Raycaster } from './core/Raycaster';
import { Vector2} from './src/math/Vector2';
import * as THREE from "./Build/three";
import { Camera } from './src/cameras/Camera';



    export class raycast{

    
    
    

  //  init();
   // animate();

    

    /*function animate() {

        renderer.render( scene, camera );
        requestAnimationFrame( animate );

    }*/
   public constructor(mouseVector:Vector2, camera:Camera){
       
   }
    
                    

   /* let selectedObject = null;
    let isDown = false;

    let raycaster: Raycaster;
    let mouseVector: Vector2;
*/
public hitTest(){
    let selectedObject = null;
    var intersects = this.getIntersects( screenX, screenY );
    if ( intersects.length > 0 ) {

        var res = intersects.filter( function ( res ) {

            return res && res.object;

        } )[ 0 ];
        //if selected now
        if ( res && res.object ) {

            selectedObject = res.object;
            console.log(selectedObject);
            
            
        
        }
    }
}
    
   

    /*public static get selectedObject(){
        return selectedObject;
    }*/


    public getIntersects( x, y ) {
        let mouseVector:Vector2;
        let raycaster:Raycaster;
        let objects;
        let camera;

        x = ( x / window.innerWidth ) * 2 - 1;
        y = - ( y / window.innerHeight ) * 2 + 1;

        mouseVector.set( x, y);
        raycaster.setFromCamera( mouseVector,camera );

        return raycaster.intersectObject(objects , true );

    }
 }


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

   






