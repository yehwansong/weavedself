
import { HandLandmarker, FilesetResolver } from "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0";
const demosSection = document.getElementById("demos");
let handLandmarker = undefined;
let runningMode = "IMAGE";
let enableWebcamButton;
let webcamRunning = false;
var rotationangle = 0
var gltf_scene


const createHandLandmarker = async () => {
    const vision = await FilesetResolver.forVisionTasks("https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm");
    handLandmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
            delegate: "GPU"
        },
        runningMode: runningMode,
        numHands: 1
    });
    demosSection.classList.remove("invisible");
    enableCam()
};
createHandLandmarker();
/********************************************************************
// Webcam
********************************************************************/
const video = document.getElementById("webcam");
const hasGetUserMedia = () => { var _a; return !!((_a = navigator.mediaDevices) === null || _a === void 0 ? void 0 : _a.getUserMedia); };

if (hasGetUserMedia()) {
}
else {
    console.warn("getUserMedia() is not supported by your browser");
}
// Enable the live webcam view and start detection.
function enableCam(event) {
    if (!handLandmarker) {
        console.log("Wait! objectDetector not loaded yet.");
        return;
    }
    if (webcamRunning === true) {
        webcamRunning = false;
        // enableWebcamButton.innerText = "ENABLE PREDICTIONS";
    }
    else {
        webcamRunning = true;
        // enableWebcamButton.innerText = "DISABLE PREDICTIONS";
    }
    // getUsermedia parameters.
    const constraints = {
        video: {
            facingMode: {
              exact: "environment"
            }
        }
    };
    // Activate the webcam stream.
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        video.srcObject = stream;
        video.addEventListener("loadeddata", predictWebcam);
    });
}
let lastVideoTime = -1;
let results = undefined;
var ratio = video.videoWidth/video.videoHeight
    var side = 'undefined'
    var text_array = [
        'Hey',
        'Follow me',
        'I’m living',
        'in "Provisional Stage"',
        'More and more people', 
        'are moving',
        'to this "stage". ',
        'Together,',
        'we construct or dismantle',
        'the "Stone tower".',
        'To collectively build',
        'the future improvisionality.',
        'And I’m inviting you',
        'to this collective movement.',
        'Follow me.'
        ]

async function predictWebcam() {
    if (runningMode === "IMAGE") {
        runningMode = "VIDEO";
        await handLandmarker.setOptions({ runningMode: "VIDEO" });
    }
    let startTimeMs = performance.now();
    if (lastVideoTime !== video.currentTime) {
        lastVideoTime = video.currentTime;
        results = handLandmarker.detectForVideo(video, startTimeMs);
    }
    if(results.handednesses[0]){
        if(side === 'undefined'){
                side = results.handednesses[0][0].categoryName
            }
    }else{
        side = 'undefined'
    }
    console.log(results.landmarks.length)
    if(results.landmarks.length==0){
        if(gltf_scene){
                                                $('.showhand').fadeIn(100)
            var value = lerp(gltf_scene.scale.x,0,0.6)
            gltf_scene.scale.set(value,value,value)
        }
    }
    if (results.landmarks) {
        for (const landmarks of results.landmarks) {
            landmarks.forEach((dotPosition, index) => {
            updateDotMovementHistory(index, dotPosition);
            });
            if(landmarks){
                                if( compareDistance(8,7,6,5,landmarks) &&
                                    compareDistance(12,11,10,9,landmarks) &&
                                    compareDistance(16,15,14,13,landmarks) &&
                                    compareDistance(20,19,18,17,landmarks)
                                     ){
                                    if((side === 'Right'&&landmarks[0].x<landmarks[17].x)||
                                        side === 'Left'&&landmarks[0].x>landmarks[17].x){
                                        if((findDotsWithMaxZDistance(landmarks)+3600)%360<190 && (findDotsWithMaxZDistance(landmarks)+3600)%360>90){
                                            
                                            if(gltf_scene){
                                                counter++
                                                $('.showhand').fadeOut(100)
                                                var value = lerp(gltf_scene.scale.x,0.5,0.4)
                                                gltf_scene.scale.set(value,value,value)
                                                gltf_scene.rotation.y = degToRad(counter*2+180)
                                                gltf_scene.rotation.z = degToRad(12)
                                                gltf_scene.position.y = Math.sin(counter/5)/5
                                                $('.textbox').css({'opacity':1})
                                                $('.textbox').html(text_array[Math.floor(counter/30)%text_array.length])
                                            }
                                            wrap.rotation.x = degToRad((findDotsWithMaxZDistance(landmarks)+3600)%360-180)
                                            //fadein
                                            wrap.position.x = map((landmarks[5].x+landmarks[17].x+landmarks[0].x)/3, 0.35,0.75, 1, -1) 
                                            wrap.position.y = map((landmarks[5].y+landmarks[17].y+landmarks[0].y)/3, 0.1,0.75, 2, -2) 
                                        }else{
                                            if(gltf_scene){
                                                $('.showhand').fadeIn(100)
                                                var value = lerp(gltf_scene.scale.x,0,0.6)
                                                gltf_scene.scale.set(value,value,value)
                                                counter = 0
                                                $('.textbox').css({'opacity':0})
                                            }
                                        }
                                    }else{
                                            if(gltf_scene){
                                                $('.showhand').fadeIn(100)
                                                var value = lerp(gltf_scene.scale.x,0,0.6)
                                                gltf_scene.scale.set(value,value,value)
                                                counter = 0
                                                $('.textbox').css({'opacity':0})
                                            }
                                    }
                                }
        }else{
            if(gltf_scene){
                                                $('.showhand').fadeIn(100)
                var value = lerp(gltf_scene.scale.x,0,0.6)
                gltf_scene.scale.set(value,value,value)
                counter = 0
                $('.textbox').css({'opacity':0})
            }
        }
    }
}
    // canvasCtx.restore();
    if (webcamRunning === true) {
        window.requestAnimationFrame(predictWebcam);
    }
}
function map(value, start1, stop1, start2, stop2) {
    return start2 + (stop2 - start2) * ((value - start1) / (stop1 - start1));
}


function findDotsWithMaxZDistance(landmarks) {
var dots = [landmarks[5],landmarks[9],landmarks[13],landmarks[17],landmarks[0]]
    let maxDistance = -Infinity;
    let dot1, dot2, dot0;

    for (let i = 0; i < dots.length; i++) {
    for (let j = i + 1; j < dots.length; j++) {
      const distance = Math.abs(dots[i].z - dots[j].z);

      if (distance > maxDistance) {
        maxDistance = distance;
        dot1 = dots[i];
        dot2 = dots[j];
        dot0 = [dot1.y,dot2.y]
      }
    }
    }
  return calculateAngle_z(dot1,dot2);
}
function calculateAngle_z(dot1, dot2) {
  const [x1, y1] = [dot1.z,dot1.y];
  const [x2, y2] = [dot2.z,dot2.y];

  const dotProduct = x1 * x2 + y1 * y2;
  const magnitude1 = Math.sqrt(x1 * x1 + y1 * y1);
  const magnitude2 = Math.sqrt(x2 * x2 + y2 * y2);

  const cosTheta = dotProduct / (magnitude1 * magnitude2);
  const radians = Math.acos(cosTheta);

  // Convert angle to degrees
  const degrees =  Math.atan2(dot2.y - dot1.y, dot2.z - dot1.z) * (180 / Math.PI);

  return degrees;
}
















    ////////////////////////////////////////////////////////////
    // 3d award
    ////////////////////////////////////////////////////////////
    var scene = new THREE.Scene();      
    var wrap = new THREE.Group();

    var camera = new THREE.PerspectiveCamera( 25, window.innerWidth / window.innerHeight, 1, 1000 );
    scene.add(camera);
    camera.position.z = -10
    camera.lookAt(0,0,0)
    
    const light = new THREE.AmbientLight( 0x404040 ); // soft white light
    scene.add( light );

    const clock = new THREE.Clock();


        import { EffectComposer } from "/Provisional/js/postprocessing/EffectComposer.js";
        import { RenderPass } from "/Provisional/js/postprocessing/RenderPass.js";
        import { UnrealBloomPass } from "/Provisional/js/postprocessing/UnrealBloomPass.js";
        import { ShaderPass } from '/Provisional/js/postprocessing/ShaderPass.js';
        import { OutputPass } from '/Provisional/js/postprocessing/OutputPass.js';
        import { GLTFLoader } from '/Provisional/js/GLTFLoader.js';
        import { OrbitControls } from '/Provisional/js/OrbitControls.js';



            const BLOOM_SCENE = 1;

            const bloomLayer = new THREE.Layers();
            bloomLayer.set( BLOOM_SCENE );

            const darkMaterial = new THREE.MeshBasicMaterial( { color: 'black' } );
            const materials = {};

            var plane_array = []
            var counter = 0
            var mixer



            var renderer = new THREE.WebGLRenderer( {antialias:true, alpha: true} );
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.gammaFactor = 2.2
            document.body.appendChild(renderer.domElement);
            var controls = new OrbitControls(camera, renderer.domElement);


            //bloom renderer
            const renderScene = new RenderPass(scene, camera);
            const bloomPass = new UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                1.5,
                0.4,
                0.85
            );
            bloomPass.threshold = 0;
            bloomPass.strength = 2.5; //intensity of glow
            bloomPass.radius = 1;


            const bloomComposer = new EffectComposer(renderer);
            bloomComposer.setSize(window.innerWidth, window.innerHeight);
                        bloomComposer.renderToScreen = false;
            bloomComposer.addPass(renderScene);
            bloomComposer.addPass(bloomPass);



            const mixPass = new ShaderPass(
                new THREE.ShaderMaterial( {
                    uniforms: {
                        baseTexture: { value: null },
                        bloomTexture: { value: bloomComposer.renderTarget2.texture }
                    },
                    vertexShader: document.getElementById( 'vertexshader' ).textContent,
                    fragmentShader: document.getElementById( 'fragmentshader' ).textContent,
                    defines: {}
                } ), 'baseTexture'
            );
            mixPass.needsSwap = true;



            const outputPass = new OutputPass( THREE.ReinhardToneMapping );

            const finalComposer = new EffectComposer( renderer );
            finalComposer.addPass( renderScene );
            finalComposer.addPass( mixPass );
            // finalComposer.addPass( outputPass );


var mesharray = []
const textureLoader = new THREE.TextureLoader();
            var matcap6 = textureLoader.load ('texture/tex5.jpeg');
            var matCapMaterial6 = new THREE.MeshMatcapMaterial({
                  matcap: matcap6
            })
            var matcap5 = textureLoader.load ('texture/b2.jpeg');
            var matCapMaterial5 = new THREE.MeshMatcapMaterial({
                  matcap: matcap5
            })
            var matcap4 = textureLoader.load ('texture/tex3.jpeg');
            var matCapMaterial4 = new THREE.MeshMatcapMaterial({
                  matcap: matcap4
            })
            var matcap3 = textureLoader.load ('texture/tex2.jpeg');
            var matCapMaterial3 = new THREE.MeshMatcapMaterial({
                  matcap: matcap3
            })
get_obj()
function fadeout(){

                    $('.loading').fadeOut(100)
                    $('.showhand').fadeIn(100)
                }

        function get_obj(){
            const loader = new GLTFLoader();
            loader.load(
                'face.gltf',
                function ( gltf ) {
                    fadeout()
                    mixer = new THREE.AnimationMixer(gltf.scene);
                    playAnimations(gltf.animations);
                    scene.add( wrap );
                    gltf.scene.scale.set(0.5,0.5,0.5)
                    wrap.add( gltf.scene );
                    gltf_scene = gltf.scene
                    gltf_scene.rotation.y = degToRad(150)
                    gltf_scene.position.y = 0
                    gltf_scene.scale.set(0,0,0)
                    gltf.scene.traverse( function(child) {
                        if (child.name.includes('Beta_Surface_2')) {
                            child.material = new THREE.MeshBasicMaterial({map:textureLoader.load ('texture/b2_3_1.jpeg')})
                            // child.layers.enable( BLOOM_SCENE )
                        }else if(child.name.includes('Capsule')){
                            child.material = new THREE.MeshBasicMaterial({map:textureLoader.load ('texture/b1.png')})
                            child.layers.enable( BLOOM_SCENE )
                        }else if (child.name.includes('FLOR_1')&&child.name.includes('004')) {
                            child.material = matCapMaterial6
                            child.layers.enable( BLOOM_SCENE )
                        }else if (child.name.includes('FLOR')&&child.name.includes('004')) {
                            child.material = matCapMaterial5
                            // child.layers.enable( BLOOM_SCENE )
                        }else if (child.name.includes('FLOR_1')&&child.name.includes('003')) {
                            child.material = matCapMaterial4
                            child.layers.enable( BLOOM_SCENE )
                        }else if (child.name.includes('002')) {
                            child.material = matCapMaterial3
                            // child.layers.enable( BLOOM_SCENE )
                        }else if(child.name.includes('001')){
                            child.material = new THREE.MeshBasicMaterial({map:textureLoader.load ('texture/untitled6.jpeg')})
                        }
                    })
                }
            )



            
            animate();
        }
            var connect

            var matcap3 = textureLoader.load ('texture/tex3.jpeg');
            var mate3 = new THREE.ShaderMaterial( {
                side: THREE.DoubleSide,
                uniforms: { 
                    tMatCap: { type: 'v', value: matcap3} 
                },
                vertexShader: document.getElementById( 'sem-vs' ).textContent,
                fragmentShader: document.getElementById( 'sem-fs' ).textContent,
                shading: THREE.SmoothShading
            } );
            mate3.encoding = THREE.sRGBEncoding;
            mate3.flatShading = true

            var matcap2 = textureLoader.load ('texture/tex2.jpeg');
            var matCapMaterial2 = new THREE.MeshMatcapMaterial({
                  matcap: matcap2
            })
        function degToRad(degrees) {
            return degrees * Math.PI / 180;
        }
    function pivotFaceTowardOrigin(px, py, pz) {
        const directionX = -px;
        const directionY = -py;
        const directionZ = -pz;

        const azimuth = Math.atan2(directionY, directionX);

        const elevation = Math.atan2(directionZ, Math.sqrt(directionX ** 2 + directionY ** 2));

        const roll = 0; // Adjust this if desired

        return [ azimuth, elevation, roll ];
    }
    function adjustNumberInRange(number,range) {
        while (number < -1*range || number > range) {
            if (number < -1*range) {
              number += range*2;
            } else if (number > range) {
              number -= range*2;
            }
        }
        return number;
    }
        function animate() {
        // update() 
controls.update();
  const delta = clock.getDelta();
  if(mixer){mixer.update(delta);}
                requestAnimationFrame(animate);
                renderer.render(scene, camera); 

                scene.traverse( darkenNonBloomed );
                bloomComposer.render();
                scene.traverse( restoreMaterial );

                // render the entire scene, then render bloom scene on top
                finalComposer.render();
        }   
            function disposeMaterial( obj ) {

                if ( obj.material ) {

                    obj.material.dispose();

                }

            }
function playAnimations(animations) {
  animations.forEach((animation) => {
    const action = mixer.clipAction(animation);
    action.play();
  });
}
            function darkenNonBloomed( obj ) {

                if ( obj.isMesh && bloomLayer.test( obj.layers ) === false ) {

                    materials[ obj.uuid ] = obj.material;
                    obj.material = darkMaterial;

                }

            }

            function restoreMaterial( obj ) {

                if ( materials[ obj.uuid ] ) {

                    obj.material = materials[ obj.uuid ];
                    delete materials[ obj.uuid ];

                }

            }          
function lerpVector3(start, end, t) {
    return [start.x + (end.x - start.x) * t,start.y + (end.y - start.y) * t,start.z + (end.z - start.z) * t]
}
function lerp (start, end, t){
  return (1-t)*start+t*end
}

            $(document).ready(function(){
                    scaleCanvasToScreen()
                    function scaleCanvasToScreen() {
                        const canvasWidth = 640;
                    const canvasHeight = 480;

                      const screenWidth = window.innerWidth;
                      const screenHeight = window.innerHeight;

                      const widthScale = screenWidth / canvasWidth;
                      const heightScale = screenHeight / canvasHeight;
                      let scale = 1;

                      if (widthScale < heightScale) {
                        scale = heightScale;
                      } else {
                        scale = widthScale;
                      }
                      // Create a style element and set its content to the CSS rules
                      var styleElement = $('<style>').prop('type', 'text/css').html('video{transform:scale('+scale+') translateX(-50%);}');
                      $('head').append(styleElement);
                    }
            })  













const dotMovementHistory = {};
const dotMovementpreHistory = {};

function calculateMovement(position1, position2) {
    const deltaX = position2.x - position1.x;
    const deltaY = position2.y - position1.y;
    const deltaZ = position2.z - position1.z;
    return Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
}

function updateDotMovementHistory(dotIndex, currentPosition) {
    if(dotMovementHistory.length>0){
        dotMovementpreHistory = dotMovementHistory
    }
    if (!(dotIndex in dotMovementHistory)) {
        dotMovementHistory[dotIndex] = {
            positions: [currentPosition],
            totalMovement: 0,
            movement: 0,
        };
        return;
    }

    const dotHistory = dotMovementHistory[dotIndex];
    const previousPosition = dotHistory.positions[dotHistory.positions.length - 1];

    const movement = calculateMovement(previousPosition, currentPosition);

    dotHistory.positions.push(currentPosition);
    dotHistory.totalMovement += movement;
    dotHistory.movement = movement;
}

function findMostActivelyMovingDots() {
    const dotIndices = Object.keys(dotMovementHistory);
    dotIndices.sort((a, b) => dotMovementHistory[b].totalMovement - dotMovementHistory[a].totalMovement);
    return dotIndices.slice(0, 4);
}
const mostActiveDots = findMostActivelyMovingDots();


function calculateDistance(dot1, dot2) {
    const deltaX = dot1.x - dot2.x;
    const deltaY = dot1.y - dot2.y;
    const deltaZ = dot1.z - dot2.z;
    return Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
}
function compareDistance(a,b,c,d,landmarks){
            if(
                calculateDistance_0(landmarks[a],landmarks)> calculateDistance_0(landmarks[b],landmarks) &&
                calculateDistance_0(landmarks[b],landmarks)> calculateDistance_0(landmarks[c],landmarks) &&
                calculateDistance_0(landmarks[c],landmarks)> calculateDistance_0(landmarks[d],landmarks)
            ){
                return true
            }else{
                return false
            }
  }      
function calculateDistance_0(dot1,landmarks) {
    const deltaX = dot1.x - landmarks[0].x;
    const deltaY = dot1.y - landmarks[0].y;
    const deltaZ = dot1.z - landmarks[0].z;
    return Math.sqrt(deltaX ** 2 + deltaY ** 2 + deltaZ ** 2);
}

function findMostFarAwayDots(dotPositions, dotIndex) {
    const referenceDot = dotPositions[dotIndex];

    const distances = dotPositions.map((dot, index) => ({
        index,
        distance: calculateDistance(referenceDot, dot),
    }));

    distances.sort((a, b) => b.distance - a.distance);

    const mostFarAwayDotIndices = distances.slice(1, 4).map((entry) => entry.index); // Exclude the reference dot (dot index 0)

    return mostFarAwayDotIndices;
}
function getMovementAmount(dotIndex) {
  if (dotIndex in dotMovementHistory) {
    return dotMovementHistory[dotIndex].movement;
  } else {
    return 0;
  }
}

function receiveMovementAmount(dotIndex) {
  const movement = getMovementAmount(dotIndex);
  return movement
}
function calculateXYZAngle(dot1, dot2) {
  const vector1 = { x: dot1.x, y: dot1.y, z: dot1.z };
  const vector2 = { x: dot2.x, y: dot2.y, z: dot2.z };
  const dotProduct = vector1.x * vector2.x + vector1.y * vector2.y + vector1.z * vector2.z;
  const magnitude1 = Math.sqrt(vector1.x * vector1.x + vector1.y * vector1.y + vector1.z * vector1.z);
  const magnitude2 = Math.sqrt(vector2.x * vector2.x + vector2.y * vector2.y + vector2.z * vector2.z);
  const cosAngle = dotProduct / (magnitude1 * magnitude2);
  const angleRadians = Math.acos(cosAngle);
  const angleDegrees = (angleRadians * 180) / Math.PI;

  return angleDegrees;
}
function calculateAngle(point1, point2) {
  // Calculate the differences in x and y coordinates
  const dx = point2.x - point1.x;
  const dy = point2.z - point1.z;

  // Calculate the angle using Math.atan2()
  const angleRadians = Math.atan2(dy, dx);

  // Convert the angle to degrees
  const angleDegrees = (angleRadians * 180) / Math.PI;

  // Ensure the angle is positive (between 0 and 360 degrees)
  const positiveAngle = (angleDegrees + 360) % 360;

  return positiveAngle;
}

