// "use strict";

window.onload = function() {
    let scene, camera, renderer, light, sphere, headMesh;
    scene = new THREE.Scene();

    function init() {
        camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000);
        renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias - сглаживаем ребра
        camera.position.set(0, 615, 700);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
        renderer.setClearColor(0x000000);
        document.body.appendChild(renderer.domElement);
    }

    function resize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
        camera.updateProjectionMatrix()
    }
    init();
    addLights();
    /////////////////////////////////////////////////////////////////
    function addLights() {
        light;
        let d = 900;
        light = new THREE.DirectionalLight(0xdfebff, 1.1);
        light.position.set(100, 500, -250);
        light.position.multiplyScalar(1.3);
        light.castShadow = true;
        light.shadow.mapSize.width = 1024;
        light.shadow.mapSize.height = 1024;
        light.shadow.camera.left = -d;
        light.shadow.camera.right = d;
        light.shadow.camera.top = d;
        light.shadow.camera.bottom = -d;
        light.shadow.camera.far = 2000;
        scene.add(new THREE.AmbientLight(0xffffff, 0.2));
        scene.add(light);
    }

    function createEdges() {
        let boxes = [{
            w: 26,
            h: 100,
            d: 1000,
            x: -495,
            y: 0,
            z: 0
        }, {
            w: 26,
            h: 100,
            d: 1000,
            x: 495,
            y: 0,
            z: 0
        }, {
            w: 1015,
            h: 100,
            d: 26,
            x: 0,
            y: 0,
            z: -510
        }, {
            w: 1015,
            h: 100,
            d: 26,
            x: 0,
            y: 0,
            z: 510
        }]
        let cubeTexture = new THREE.Texture(),
            loader = new THREE.ImageLoader(),
            boxBump = new THREE.TextureLoader().load('2.jpg');
        loader.load("metal.jpg", function(e) {
            cubeTexture.image = e; // событие загрузки
            cubeTexture.needsUpdate = true;
        });
        cubeGenerator = function(obj) {
            let that = this;
            this.cubeGeom = new THREE.CubeGeometry(obj.w, obj.h, obj.d, 7, 7, 7);
            this.cubeMat = new THREE.MeshStandardMaterial({
                map: cubeTexture,
                overdraw: true,
                emissive: 0.2,
                metalness: 0.8,
                roughness: 0.4,
                bumpMap: boxBump
            });
            this.cubeMesh = new THREE.Mesh(this.cubeGeom, this.cubeMat);
            this.cubeMesh.position.set(obj.x, obj.y, obj.z)
            this.cubeMesh.castShadow = true; //default is false
            this.cubeMesh.receiveShadow = true; //defaul
            scene.add(this.cubeMesh);
        }

        let box1 = new cubeGenerator(boxes[0]),
            box2 = new cubeGenerator(boxes[1]),
            box3 = new cubeGenerator(boxes[2]),
            box4 = new cubeGenerator(boxes[3]);
    }

    ////////////////////////////////////////////////// - plane
    function createPlane() {
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
    }

    function createRobot() { //            TODO REFACTOR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        let manager = new THREE.LoadingManager(),
            loader = new THREE.ImageLoader(manager);

        let textureHead = new THREE.Texture();

        loader.load('model/Head diff MAP.jpg', function(image) {
            textureHead.image = image;
            textureHead.needsUpdate = true;
        });
        let bodyBump = new THREE.TextureLoader().load('model/body-bump-map.jpg');
        let meshes = [],
            objLoader = new THREE.OBJLoader();
        objLoader.load('model/bb8.obj', function(object) {
            object.traverse(function(child) {
                if (child instanceof THREE.Mesh) {
                    meshes.push(child);
                }
            });
            let sphere_geometry = new THREE.SphereGeometry(50, 40, 40);
            let sphere_texture = new THREE.Texture(),
                sphere_loader = new THREE.ImageLoader();
            sphere_loader.load("model/Body-diff-map.jpg", function(e) {
                sphere_texture.image = e; // событие загрузки
                sphere_texture.needsUpdate = true;
            });
            let sphereMat = new THREE.MeshStandardMaterial({
                map: sphere_texture,
                overdraw: true,
                specular: 0xfff7e8,
                roughness: 0.1,
                metalness: 0.2,
                specular: 0xffffff,
                bumpMap: bodyBump
            });
            sphere = new THREE.Mesh(sphere_geometry, sphereMat);
            sphere.position.x = 0;
            sphere.position.y = 50;
            sphere.position.z = 0;
            scene.add(sphere);

            headMesh = meshes[0],
                body = meshes[1];

            headMesh.position.y = 0;
            headMesh.position.x = 10;
            sphere.castShadow = true; //default is false
            sphere.receiveShadow = true; //defaul

            let bumpMapHead = new THREE.TextureLoader().load('model/HEAD bump MAP.jpg');

            scene.add(headMesh);
            headMesh.castShadow = true;
            headMesh.receiveShadow = true;

            headMesh.material = new THREE.MeshStandardMaterial({
                map: textureHead,
                bumpMap: bumpMapHead,
                bumpScale: 1,
                specular: 0xfff7e8,
                roughness: 0.1,
                metalness: 0.2,
                specular: 0xffffff

            });
        });
    }




    //////////////////////////////////////////////////////

    let controls = new THREE.TrackballControls(camera);

    function rendering() {
        requestAnimationFrame(rendering);
        controls.update();
        renderer.render(scene, camera);
        if (mode){
			animation(type);
        }
        // if (mode) {
        //     scene.rotation.y += 90 / Math.PI * 0.0001;
        // }
        if (camera.position.y >= 800) {
            camera.position.y = 800;
        }
        else if (camera.position.y <= 50) {
            camera.position.y = 50;
        }
        if (camera.position.z >= 800) {
            camera.position.z = 800;
        }
        else if (camera.position.z <= -800) {
            camera.position.z = -800;
        }
        if (camera.position.x >= 800) {
            camera.position.x = 800;
        }
        else if (camera.position.x <= -800) {
            camera.position.x = -800;
        }
    };

    let angle = 0,
        radius = 5;

    function animation(program) {
        // console.log(666);
        console.log(program);
        switch (program) {
            case 'up':
                if (sphere.position.z >= -430) {
                    headMesh.position.z += -10;
                    sphere.position.z += -10;
                }
                sphere.rotation.x -= 180 / Math.PI * 0.002;
                break;
            case 'down':
                if (sphere.position.z <= 430) {
                    headMesh.position.z += 10;
                    sphere.position.z += 10;
                }
                sphere.rotation.x += 180 / Math.PI * 0.002;
                break;
            case 'left':
                if (sphere.position.x >= -420) {
                    headMesh.position.x += -10;
                    sphere.position.x += -10;
                }
                sphere.rotation.z += 180 / Math.PI * 0.002;
                sphere.rotation.x = 0;
                break;
            case 'right':
                if (sphere.position.x <= 420) {
                    headMesh.position.x += 10;
                    sphere.position.x += 10;
                }
                sphere.rotation.z -= 180 / Math.PI * 0.002;
                sphere.rotation.x = 0;
                break;
            case 'special':
                // headMesh.position.z += 4 * Math.sin(angle);
                // headMesh.position.x += 4 * Math.cos(angle);
                // sphere.position.z += 4 * Math.sin(angle);
                // sphere.position.x += 4 * Math.cos(angle);
                // sphere.rotation.y -= 180 / Math.PI * 0.002;
                // sphere.rotation.x += 180 / Math.PI * 0.002;
                // angle += Math.PI / 180 * 2; // 2 - degree
                // head.position.z += -10;
                // sphere.position.z += -10;
                // sphere.rotation.x -= 180 / Math.PI * 0.002;
                // head.position.x += -10;
                // sphere.position.x += -10;
                // sphere.rotation.z -= 180 / Math.PI * 0.002;
                break;
            default:
                break;
                /*sphere.position.z += 8 * Math.sin(angle);
        sphere.position.x += radius * Math.cos(angle);
        angle += Math.PI / 180 * 2; // 2 - degree  */
        }
    };
    let controlsWrapper = document.getElementById('control-wrapper');
    let mode = false,
        type = 'undefined';
    controlsWrapper.addEventListener('touchstart', function(e) {
        if (e.target.classList.contains('control')){
			mode = true;
            console.log(1);
			console.log(e.target.classList[1]);
			type = e.target.classList[1]
			animation(type);
        }
    });
	document.addEventListener('touchend', function(e) {
		mode = false;
		console.log(2);
	});
	window.addEventListener('touchmove', function(e) {
		mode = false;
		console.log(555);
	});
    document.addEventListener('keydown', function(e) {
        let moveType = 'notype';
        switch (e.key) {
            case '8':
                moveType = 'up';
                break;
            case '2':
                moveType = 'down';
                break;
            case '4':
                moveType = 'left';
                break;
            case '6':
                moveType = 'right';
                break;
            case '7':
                moveType = 'special';
                break;    
            default:
                moveType = 'notype';
                break;
        }
        if (moveType !== 'notype') {
            animation(moveType);
        }
    });
    window.addEventListener('resize', function(e) {
        resize();
    });

    // let helper = new THREE.DirectionalLightHelper(light,5);
    // scene.add(helper);
    rendering();
    createEdges();
    createPlane();
    createRobot();
};