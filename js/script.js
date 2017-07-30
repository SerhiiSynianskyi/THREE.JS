// "use strict";

window.onload = function() {
    let scene = new THREE.Scene(),
        camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000),
        renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias - сглаживаем ребра

    renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
    renderer.setClearColor(0x000000);
    document.body.appendChild(renderer.domElement);

    camera.position.x = 300;
    camera.position.y = 800;
    camera.position.z = 800;
    /////////////////////////////////////////////////////////////////
    let light = new THREE.DirectionalLight(0xfff7e8, 0.9);
    scene.add(light);

    let light1 = new THREE.SpotLight(0xffffff);
    light1.position.set(300, 200, 200);
    light1.castShadow = true;
    light1.shadow.mapSize.width = 500; // default
    light1.shadow.mapSize.height = 500; // default
    light1.shadow.camera.near = 0.1; // default
    light1.shadow.camera.far = 300 // default
    scene.add(light1);

    let amColor = '#faffe3',
        amLight = new THREE.AmbientLight(amColor);
    scene.add(amLight);

    ////////////////////////////////////////////////// - plane

    let plane_texture = new THREE.Texture(),
        plane_loader = new THREE.ImageLoader();

    plane_loader.load("asphalt_texture.jpg", function(e) {
        plane_texture.image = e; // событие загрузки
        plane_texture.needsUpdate = true;
    });

    let geometry = new THREE.PlaneGeometry(window.innerWidth, window.innerHeight); // 2д форма для поверхности
    geometry.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    // let material = new THREE.MeshStandardMaterial({ color: 0x838383 });
    let material = new THREE.MeshStandardMaterial({ map: plane_texture, overdraw: true }),
        plane = new THREE.Mesh(geometry, material);
    plane.receiveShadow = true;
    scene.add(plane);

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
        objLoader = new THREE.OBJLoader(),
        body,
        head,
        sphere;
    objLoader.load('model/bb8.obj', function(object) {
        object.traverse(function(child) {
            if (child instanceof THREE.Mesh) {
                meshes.push(child);
            }
        });
        let sphere_geometry = new THREE.SphereGeometry(50, 40, 40);
        let sphere_texture = new THREE.Texture(),
            sphere_loader = new THREE.ImageLoader();
        sphere_loader.load("model/Body diff MAP.jpg", function(e) {
            sphere_texture.image = e; // событие загрузки
            sphere_texture.needsUpdate = true;
        });
        let sphere_material = new THREE.MeshStandardMaterial({ map: sphere_texture, overdraw: true });
        sphere = new THREE.Mesh(sphere_geometry, sphere_material);
        sphere.position.x = 0;
        sphere.position.y = 50;
        sphere.position.z = 0;
        scene.add(sphere);

        head = meshes[0],
            body = meshes[1];

        head.position.y = 0;
        head.position.x = 10;
        // body.position.y = 0;
        // body.castShadow = true; //default is false
        // body.receiveShadow = true; //defaul

        // let bumpMapBody = new THREE.TextureLoader().load('model/BODY bump MAP.jpg');
        let bumpMapHead = new THREE.TextureLoader().load('model/HEAD bump MAP.jpg');

        scene.add(head);
        // scene.add(body);

        head.material = new THREE.MeshPhongMaterial({
            map: textureHead,
            bumpMap: bumpMapHead,
            bumpScale: 1,
            specular: 0xfff7e8 // блик
        });
        // body.material = new THREE.MeshPhongMaterial({
        //     map: textureBody,
        //     bumpMap: bumpMapBody,
        //     bumpScale: 1,
        //     specular: 0xfff7e8
        // });
    });


    //////////////////////////////////////////////////////

    let controls = new THREE.TrackballControls(camera);

    function rendering() {
        requestAnimationFrame(rendering);
        controls.update();
        renderer.render(scene, camera);
    };

    let angle = 0,
        radius = 5;
    function animation(program) {
        switch (program) {
            case '8':
                head.position.z += -10;
                sphere.position.z += -10;
                sphere.rotation.x -= 180 / Math.PI * 0.002;
                break;
            case '2':
                head.position.z += 10;
                sphere.position.z += 10;
                sphere.rotation.x += 180 / Math.PI * 0.002;
                break;
            case '4':
                head.position.x += -10;
                sphere.position.x += -10;
                sphere.rotation.z += 180 / Math.PI * 0.002;
                break;
            case '6':
                head.position.x += 10;
                sphere.position.x += 10;
                sphere.rotation.z -= 180 / Math.PI * 0.002;
                break;
            case '7':
            	head.position.z += 4 * Math.sin(angle);
		        head.position.x += 4 * Math.cos(angle);
	            sphere.position.z += 4 * Math.sin(angle);
		        sphere.position.x += 4 * Math.cos(angle);
		        sphere.rotation.y -= 180 / Math.PI * 0.002;
		        // sphere.rotation.x += 180 / Math.PI * 0.002;
		        angle += Math.PI / 180 * 2; // 2 - degree
                // head.position.z += -10;
                // sphere.position.z += -10;
                // sphere.rotation.x -= 180 / Math.PI * 0.002;
                // head.position.x += -10;
                // sphere.position.x += -10;
                // sphere.rotation.z -= 180 / Math.PI * 0.002;
                break;    
            /*sphere.position.z += 8 * Math.sin(angle);
        sphere.position.x += radius * Math.cos(angle);
        angle += Math.PI / 180 * 2; // 2 - degree  */  
        }

    };

    document.addEventListener('keydown', function(e) {
    	console.log(e.key)
        animation(e.key);
    });

    // var helper = new THREE.CameraHelper(light1.shadow.camera);
    // scene.add(helper);
    rendering();
};