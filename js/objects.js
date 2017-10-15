function createPlane() {
    let planeTexture = new THREE.Texture(),
        planeLoader = new THREE.ImageLoader(),
        planeBump = new THREE.TextureLoader().load('bump-metal.jpg');

    planeLoader.load("floor.jpg", function(e) {
        planeTexture.image = e; // событие загрузки
        planeTexture.needsUpdate = true;
    });

    let planeGeom = new THREE.CubeGeometry(1000, 50, 1000); // 2д форма для поверхности
    //planeGeom.applyMatrix(new THREE.Matrix4().makeRotationX(-Math.PI / 2));
    let planeMat = new THREE.MeshStandardMaterial({ map: planeTexture, overdraw: true, bumpMap: planeBump }),
        planeMesh = new THREE.Mesh(planeGeom, planeMat);
    planeMesh.receiveShadow = true;
    planeMesh.position.set(0, -25, 0);
    return planeMesh;
}

function createSpaceScene() {
    let cubeGeometry = new THREE.CubeGeometry(6000, 6000, 6000);
    let cubeMaterialsSpace = [
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('skybox/space/2.png'), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('skybox/space/4.png'), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('skybox/space/5.png'), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('skybox/space/6.png'), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('skybox/space/3.png'), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('skybox/space/1.png'), side: THREE.DoubleSide })
    ];
    let cubeMaterialsDust = [
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('skybox/dark_dust/sleepyhollow_ft.jpg'), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('skybox/dark_dust/sleepyhollow_bk.jpg'), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('skybox/dark_dust/sleepyhollow_up.jpg'), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('skybox/dark_dust/sleepyhollow_dn.jpg'), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('skybox/dark_dust/sleepyhollow_rt.jpg'), side: THREE.DoubleSide }),
        new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('skybox/dark_dust/sleepyhollow_lf.jpg'), side: THREE.DoubleSide })
    ];
    let cubeMaterial = new THREE.MeshFaceMaterial(cubeMaterialsDust);
    let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cubeMesh.rotation.set(0, 0.95, 0);
    return cubeMesh;
}

function createEdges(scene) {
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
        scene.add(this.cubeMesh); // TODO
    }

    let box1 = new cubeGenerator(boxes[0]),
        box2 = new cubeGenerator(boxes[1]),
        box3 = new cubeGenerator(boxes[2]),
        box4 = new cubeGenerator(boxes[3]);
}

function createRobot(scene) { //            TODO REFACTOR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
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