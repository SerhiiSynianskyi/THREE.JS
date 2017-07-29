// "use strict";

window.onload = function() {
    let scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000),

        renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias - сглаживаем ребра

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0xFFFFFF);
    document.body.appendChild(renderer.domElement);

    camera.position.z = 190;

    let light = new THREE.DirectionalLight( 0xfff7e8, 1);
	scene.add(light); 


    let amColor = '#faffe3',
   		amLight = new THREE.AmbientLight(amColor);
    scene.add(amLight);
	
    /////////////////////////////////////////////////////

    let manager = new THREE.LoadingManager(),
        loader = new THREE.ImageLoader(manager);

    let textureBody = new THREE.Texture(),
        textureHead = new THREE.Texture();

    loader.load('model/Body diff MAP.jpg', function(image) {
        textureBody.image = image;
        textureBody.needsUpdate = true;
    });
    loader.load('model/Head diff MAP.jpg', function(image) {
        textureHead.image = image;
        textureHead.needsUpdate = true;
    });

    let meshes = [],
        objLoader = new THREE.OBJLoader();    
    objLoader.load('model/bb8.obj', function(object) {
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                meshes.push(child);
            }
        });

        let head = meshes[0],
    	body = meshes[1];
	 
	    head.position.y = -80;
	    body.position.y = -80;

	    scene.add(head);
	    scene.add(body);

	    // head.material = new THREE.MeshNormalMaterial();
	    head.material = new THREE.MeshNormalMaterial()
	    body.material = new THREE.MeshNormalMaterial();
    });

    	
    //////////////////////////////////////////////////////

    let controls = new THREE.TrackballControls(camera);

    let rendering = function() {
        requestAnimationFrame(rendering);
        controls.update();
        renderer.render(scene, camera);
    };

    rendering();
};