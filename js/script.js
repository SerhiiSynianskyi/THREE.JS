// "use strict";

window.onload = function() {
    let scene, camera, renderer
    scene = new THREE.Scene();

    function init() {
        camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000);
        renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias - сглаживаем ребра
        camera.position.set(300, 800, 800);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
        renderer.setClearColor(0x000000);
        document.body.appendChild(renderer.domElement);
    }
    function resize(){
        camera.aspect = window.innerWidth / window.innerHeight;
        renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
        camera.updateProjectionMatrix ()
    }
    


    /////////////////////////////////////////////////////////////////
    let light, d = 500;
    // scene.add(new THREE.AmbientLight(0x666666));
    light = new THREE.DirectionalLight(0xdfebff, 1.2);
    light.position.set(0, 100, 0);
    light.position.multiplyScalar(1.3);
    light.castShadow = true;
    light.shadow.mapSize.width = 1024;
    light.shadow.mapSize.height = 1024;
    light.shadow.camera.left = -d;
    light.shadow.camera.right = d;
    light.shadow.camera.top = d;
    light.shadow.camera.bottom = -d;
    light.shadow.camera.far = 2000;
    scene.add(light);

    ////////////////////////////////////////////////// - plane

    let planeTexture = new THREE.Texture(),
        planeLoader = new THREE.ImageLoader(),
        planeBump = new THREE.TextureLoader().load('bump-metal.jpg');

    planeLoader.load("floor.jpg", function(e) {
        planeTexture.image = e; // событие загрузки
        planeTexture.needsUpdate = true;
    });

    let planeGeom = new THREE.PlaneGeometry(1000, 1000); // 2д форма для поверхности
    planeGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    let planeMat = new THREE.MeshStandardMaterial({ map: planeTexture, overdraw: true, bumpMap: planeBump }),
        planeMesh = new THREE.Mesh(planeGeom, planeMat);
    planeMesh.receiveShadow = true;
    scene.add(planeMesh);

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
        sphere.castShadow = true; //default is false
        sphere.receiveShadow = true; //defaul
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
                head.position.z += -15;
                sphere.position.z += -15;
                sphere.rotation.x -= 180 / Math.PI * 0.003;
                break;
            case '2':
                head.position.z += 15;
                sphere.position.z += 15;
                sphere.rotation.x += 180 / Math.PI * 0.003;
                break;
            case '4':
                head.position.x += -15;
                sphere.position.x += -15;
                sphere.rotation.z += 180 / Math.PI * 0.003;
                break;
            case '6':
                head.position.x += 15;
                sphere.position.x += 15;
                sphere.rotation.z -= 180 / Math.PI * 0.003;
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
    window.addEventListener('resize', function(e) {
        resize();
    });

    // var helper = new THREE.CameraHelper(light1.shadow.camera);
    // scene.add(helper);
    init();
    rendering();
};