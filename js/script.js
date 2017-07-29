// "use strict";

window.onload = function() {
    let scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000),

        renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias - сглаживаем ребра

    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(0x000000);
    document.body.appendChild(renderer.domElement);

    camera.position.z = 190;

    let light = new THREE.DirectionalLight( 0xfff7e8, 0.9);
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
        console.log(meshes);
        let head = meshes[0],
    	body = meshes[1];
	 
	    head.position.y = -80;
	    body.position.y = -80;

	    let bumpMapBody = new THREE.TextureLoader().load('model/BODY bump MAP.jpg');
	    let bumpMapHead = new THREE.TextureLoader().load('model/HEAD bump MAP.jpg');

	    scene.add(head);
	    scene.add(body);

	    // head.material = new THREE.MeshNormalMaterial();
	    head.material = new THREE.MeshPhongMaterial({
	    	map: textureHead,
	    	bumpMap: bumpMapHead,
	    	bumpScale: 1,
	    	specular: 0xfff7e8// блик
	    });
	    body.material = new THREE.MeshPhongMaterial({
	    	map: textureBody,
	    	bumpMap: bumpMapBody,
	    	bumpScale: 1,
	    	specular: 0xfff7e8
	    });
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