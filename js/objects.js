function createPlane() {
    let planeTexture = new THREE.Texture(),
        planeLoader = new THREE.ImageLoader(),
        planeBump = new THREE.TextureLoader().load('textures/floorBumpMap.jpg');

    planeLoader.load("textures/floorTexture.jpg", function(e) {
        planeTexture.image = e;
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
        loader = new THREE.ImageLoader()
    loader.load("textures/edgeTexture.jpg", function(e) {
        cubeTexture.image = e; // событие загрузки
        cubeTexture.needsUpdate = true;
    });
    cubeGenerator = function(obj) {
        let that = this;
        this.cubeGeom = new THREE.CubeGeometry(obj.w, obj.h, obj.d, 7, 7, 7);
        this.cubeMat = new THREE.MeshStandardMaterial({
            map: cubeTexture,
            overdraw: true,
            emissive: 0.6,
            metalness: 0.9,
            roughness: 0.5
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


function createTargetObject() {
    let giftGeom = new THREE.OctahedronGeometry(40, 0);
    let giftBump = new THREE.TextureLoader().load('textures/text.jpg');
    let giftMat = new THREE.MeshStandardMaterial({
        color: 0x2Dff27,
        aoMapIntensity: 1,
        roughness: 0.4,
        metalness: 0.5,
        opacity: 0.85,
        bumpMap: giftBump,
        overdraw: true,
        displacementScale: 0.5,
        transparent: true
    });
    let giftMesh = new THREE.Mesh(giftGeom, giftMat);
    giftMesh.castShadow = true; 
    giftMesh.receiveShadow = true; 
    giftMesh.position.set(-300, 50, 300)

    return giftMesh;
}

function createEnemyRobot(scene) {
    let laserGeo, shaderMat, uniforms, buffGeo, laserMesh;
    laserGeom = new THREE.TorusGeometry(44, 9, 40, 40);
    buffGeom = new THREE.BufferGeometry().fromGeometry(laserGeom);
    let imgTexture = new Image;
    imgTexture.src = "textures/laserTexture.jpg";
    imgTexture.crossOrigin = "Anonymous";
    THREE.ImageUtils.crossOrigin = '';
    //Shader Material Loader
    shaderMat = new THREE.ShaderMaterial({

        uniforms: {
            tShine: { type: "t", value: THREE.ImageUtils.loadTexture(imgTexture.src) },
            time: { type: "f", value: 0 },
            weight: { type: "f", value: 0 }
        },

        vertexShader: xVertex,
        fragmentShader: xFragment

    });

    shaderMat.uniforms.tShine.wrapS = THREE.Repeat;
    shaderMat.uniforms.tShine.wrapT = THREE.Repeat;

    laserMesh = new THREE.Mesh(laserGeom, shaderMat);
    laserMesh.doubleSided = true;
    laserMesh.position.set(200, 60, -100);
    laserMesh.rotateX(Math.PI / 2);
    laserMesh.rotateZ(Math.PI);
    laserMesh.castShadow = true;
    laserMesh.receiveShadow = true;

    scene.add(laserMesh);

    let enemyBodyTexture = new THREE.TextureLoader().load('textures/enemyTexture.jpg');
    let enemyBodyBump = new THREE.TextureLoader().load('textures/enemyBumpMap.jpg');
    let enemyBodyGeom = new THREE.SphereGeometry(50, 40, 40);
    let enemyBodyMat = new THREE.MeshStandardMaterial({
        map: enemyBodyTexture,
        roughness: 0.3,
        metalness: 0.8,
        emissive: 0.8,
        color: 0x121212,
        bumpMap: enemyBodyBump,
        overdraw: true
    });
    let enemyBodyMesh = new THREE.Mesh(enemyBodyGeom, enemyBodyMat);
    enemyBodyMesh.castShadow = true;
    enemyBodyMesh.receiveShadow = true;
    enemyBodyMesh.position.set(200, 60, -100);
    scene.add(enemyBodyMesh);
    return shaderMat;
}