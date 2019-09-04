import * as THREE from "./Build/three";
import { Vector2 } from "./src/math/Vector2";
import { raycast } from "./raycast";
//// <reference path="Build/three"/>


let renderer, scene;
let group, camera;
let mouseVector : Vector2;    
let sprite;   
		init();
		animate();


		

		
		
		
		function init() {

           
			

			// init renderer
			renderer = new THREE.WebGLRenderer( { antialias: true } );
			renderer.setPixelRatio( window.devicePixelRatio );
			renderer.setSize( window.innerWidth, window.innerHeight );
			document.body.appendChild( renderer.domElement );

			// init scene
			scene = new THREE.Scene();
			scene.background = THREE.Color( 0xffffff );

			// init camera
			camera = new THREE.PerspectiveCamera( 50, window.innerWidth / window.innerHeight, 1, 1000 );
			camera.position.set( 15, 15, 15 );
            camera.lookAt( scene.position );

			group = new THREE.Group();
			scene.add( group );

			

          /*  var radius = 6;
            var height = 8;
            var segments = 16;
            var geometry = new THREE.ConeBufferGeometry(radius, height, segments);
           // geometry.position.set(15,15,15);
            group.add( geometry );
            */
        	sprite = new THREE.Sprite( new THREE.SpriteMaterial( { color: '#69f' } ) );
			sprite.position.set( 6, 5, 5 );
			sprite.scale.set( 2, 5, 1 );
			sprite.center;
            
            group.add( sprite );
            

			window.addEventListener( 'resize', this.onWindowResize, false );			
           // window.addEventListener( "mousemove", onDocumentMouseMove, false );
			window.addEventListener( "mousedown", this.onDocumentMouseDown, false);
          //  window.addEventListener("mouseup", onDocumentMouseUp, false);
        
            }
        
     
		

		function animate() {

			renderer.render( scene, camera );
			requestAnimationFrame( animate );

		}

		function onWindowResize() {

			camera.aspect = window.innerWidth / window.innerHeight;
			camera.updateProjectionMatrix();

			renderer.setSize( window.innerWidth, window.innerHeight );

		}

		

		function onDocumentMouseDown(event)
		{
			let raycastObject = new raycast(mouseVector, this.camera);
			console.log(raycastObject.getIntersects);
			
		}




