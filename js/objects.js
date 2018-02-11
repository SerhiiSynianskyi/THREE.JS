"use strict";

function createSceneBackground(currentMap) {
	let cubeGeometry = new THREE.CubeGeometry(6000, 6000, 6000);
	let cubeMat = setSceneTexture(currentMap);
	let cubeMaterial = new THREE.MeshFaceMaterial(cubeMat);
	let cubeMesh = new THREE.Mesh(cubeGeometry, cubeMaterial);
	cubeMesh.rotation.set(0, 0.95, 0);
	return cubeMesh;
}

function setSceneTexture(sceneType) {
	let cubeScene;
	switch (sceneType) {
		case 1:
			cubeScene = [
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/dark_dust/sleepyhollow_ft.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/dark_dust/sleepyhollow_bk.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/dark_dust/sleepyhollow_up.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/dark_dust/sleepyhollow_dn.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/dark_dust/sleepyhollow_rt.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/dark_dust/sleepyhollow_lf.jpg'), side: THREE.DoubleSide })
			];
			break;
		case 2:
			cubeScene = [
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/snow_dust/sleepyhollow_ft.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/snow_dust/sleepyhollow_bk.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/snow_dust/sleepyhollow_up.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/snow_dust/sleepyhollow_dn.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/snow_dust/sleepyhollow_rt.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/snow_dust/sleepyhollow_lf.jpg'), side: THREE.DoubleSide })
			];
			break;
		case 3:
			cubeScene = [
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/space/2.png'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/space/4.png'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/space/5.png'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/space/6.png'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/space/3.png'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/space/1.png'), side: THREE.DoubleSide })
			];
			break;
		default:
			cubeScene = [
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/dark_dust/sleepyhollow_ft.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/dark_dust/sleepyhollow_bk.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/dark_dust/sleepyhollow_up.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/dark_dust/sleepyhollow_dn.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/dark_dust/sleepyhollow_rt.jpg'), side: THREE.DoubleSide }),
				new THREE.MeshBasicMaterial({ map: new THREE.TextureLoader().load('images/skybox/dark_dust/sleepyhollow_lf.jpg'), side: THREE.DoubleSide })
			];
			break;
	}
	return cubeScene;
}

function cubeGenerator(obj, scene, rigidBodies, physicsWorld, cubeTexture) {
	let pos = new THREE.Vector3().set(obj.x, obj.y, obj.z),
		quat = new THREE.Quaternion().set(0, 0, 0, 1);
	this.cubeGeom = new THREE.CubeGeometry(obj.w, obj.h, obj.d, 10, 15, 10);
	this.cubeMat = new THREE.MeshStandardMaterial({
		map: cubeTexture,
		overdraw: true,
		emissive: 0.6,
		metalness: 0.9,
		roughness: 0.5
	});
	let randSign = function() { return (Math.random() > 0.4) ? 1 : -1; };
	// for (let vertIndex = 0; vertIndex < this.cubeGeom.vertices.length; vertIndex++) {
	//     this.cubeGeom.vertices[vertIndex].x += Math.random() / 0.1 * randSign();
	//     this.cubeGeom.vertices[vertIndex].y += Math.random() / 0.1 * randSign();
	//     this.cubeGeom.vertices[vertIndex].z += Math.random() / 0.1 * randSign();
	// }

	// this.cubeGeom.dynamic = true;
	// this.cubeGeom.computeFaceNormals();
	// this.cubeGeom.computeVertexNormals();
	// this.cubeGeom.normalsNeedUpdate = true;
	this.cubeMesh = new THREE.Mesh(this.cubeGeom, this.cubeMat);
	this.cubeMesh.position.set(obj.x, obj.y, obj.z)
	this.cubeMesh.castShadow = true;
	this.cubeMesh.receiveShadow = true;
	let cubeShape = new Ammo.btBoxShape(new Ammo.btVector3(obj.w * 0.5, obj.h * 0.5, obj.d * 0.5));
	createRigidBody(physicsWorld, this.cubeMesh, cubeShape, 0, pos, quat, rigidBodies, scene);
	// return this.cubeMesh; // TODO
}

function createEdges(scene, rigidBodies, physicsWorld) {
	let boxes = [{
			w: 25,
			h: 100,
			d: 1005,
			x: -515,
			y: 0,
			z: 0
		}, {
			w: 25,
			h: 100,
			d: 1005,
			x: 515,
			y: 0,
			z: 0
		}, {
			w: 1055,
			h: 100,
			d: 25,
			x: 0,
			y: 0,
			z: -515
		}, {
			w: 1055,
			h: 100,
			d: 25,
			x: 0,
			y: 0,
			z: 515
		}],
		createEdges = new THREE.Group();
	let cubeTexture = new THREE.Texture(),
		loader = new THREE.ImageLoader()
	loader.load("images/textures/edgeTexture.jpg", function(e) {
		cubeTexture.image = e; // событие загрузки
		cubeTexture.needsUpdate = true;
	});
	boxes.forEach(function(item) {
		let box = new cubeGenerator(item, scene, rigidBodies, physicsWorld, cubeTexture)
	});
}


function createTargetObject() {
	let giftGeom = new THREE.OctahedronBufferGeometry(40, 0);
	let giftBump = new THREE.TextureLoader().load('images/textures/text.jpg');
	let giftMat = new THREE.MeshStandardMaterial({
		color: 0x2Dff27,
		aoMapIntensity: 1,
		roughness: 0.4,
		metalness: 0.5,
		opacity: 0.75,
		bumpMap: giftBump,
		overdraw: true,
		displacementScale: 0.5,
		transparent: true
	});
	let giftMesh = new THREE.Mesh(giftGeom, giftMat);
	giftMesh.scale.set(0.3, 0.3, 0.3);
	giftMesh.castShadow = true;
	giftMesh.receiveShadow = true;
	giftMesh.giftDetected = true;
	return giftMesh;
}

function createEnemyRobot(scene, robotParams) {
	let laserGeo, shaderMat, uniforms, buffGeo, laserMesh,
		enemyBody = {},
		laserGeom = new THREE.TorusGeometry(48, 9, 40, 40),
		buffGeom = new THREE.BufferGeometry().fromGeometry(laserGeom);
	let imgTexture = new Image;
	imgTexture.src = "images/textures/laserTexture.jpg";
	imgTexture.crossOrigin = "Anonymous";
	THREE.ImageUtils.crossOrigin = '';
	//Shader Material Loader
	shaderMat = new THREE.ShaderMaterial({

		uniforms: {
			tShine: { type: "t", value: new THREE.TextureLoader().load(imgTexture.src) },
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
	laserMesh.rotateX(Math.PI / 2);
	laserMesh.rotateZ(Math.PI);
	laserMesh.castShadow = true;
	laserMesh.receiveShadow = true;


	let enemyBodyTexture = new THREE.TextureLoader().load('images/textures/enemyTexture.jpg');
	let enemyBodyBump = new THREE.TextureLoader().load('images/textures/enemyBumpMap.jpg');
	let enemyBodyGeom = new THREE.SphereBufferGeometry(robotParams.bodySize, 40, 40);
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
	// scene.add(enemyBodyMesh);
	let totalBody = new THREE.Group();
	totalBody.add(enemyBodyMesh);
	totalBody.add(laserMesh);
	enemyBody.shader = shaderMat;
	enemyBody.totalBody = totalBody;
	enemyBody.totalBody.enemyDetected = true;
	return enemyBody;
}


function createRobot(scene, robotParams, rigidBodies, physicsWorld) { //            TODO REFACTOR!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
	let manager = new THREE.LoadingManager(),
		loader = new THREE.ImageLoader(manager),
		totalBody = new THREE.Group(),
		textureHead = new THREE.Texture(),
		headMesh, bodyMesh, userBallBody, userRobot;

	loader.load('model/headTexture.jpg', function(image) {
		textureHead.image = image;
		textureHead.needsUpdate = true;
	});
	let bodyBump = new THREE.TextureLoader().load('model/bodyBumpMap.jpg');
	let meshes = [],
		objLoader = new THREE.OBJLoader();
	objLoader.load('model/bb8.obj', function(object) {
		object.traverse(function(child) {
			if (child instanceof THREE.Mesh) {
				meshes.push(child);
			}
		});
		let sphereGeometry = new THREE.SphereBufferGeometry(robotParams.bodySize, 40, 40);
		let sphereTexture = new THREE.Texture(),
			sphereLoader = new THREE.ImageLoader();
		sphereLoader.load("model/bodyTexture.jpg", function(e) {
			sphereTexture.image = e;
			sphereTexture.needsUpdate = true;
		});
		let sphereMat = new THREE.MeshStandardMaterial({
			map: sphereTexture,
			overdraw: true,
			roughness: 0.1,
			metalness: 0.2,
			bumpMap: bodyBump
		});
		bodyMesh = new THREE.Mesh(sphereGeometry, sphereMat);
		bodyMesh.position.x = 0;
		bodyMesh.position.y = 50;
		bodyMesh.position.z = 0;

		headMesh = meshes[0];
		// bodyMehh = meshes[1];
		headMesh.position.y = 0;
		headMesh.position.x = 10;
		bodyMesh.castShadow = true; //default is false
		bodyMesh.receiveShadow = true; //defaul

		let bumpMapHead = new THREE.TextureLoader().load('model/headBumpMap.jpg');

		headMesh.castShadow = true;
		headMesh.receiveShadow = true;
		headMesh.material = new THREE.MeshStandardMaterial({
			map: textureHead,
			bumpMap: bumpMapHead,
			bumpScale: 1,
			roughness: 0.1,
			metalness: 0.2
		});
		// headMesh.material[5] = new THREE.MeshStandardMaterial({ //TODO
		//     map: new THREE.TextureLoader().load('model/head top diff MAP.jpg'),
		//     bumpScale: 1,
		//     roughness: 0.1,
		//     metalness: 0.2,
		//     overdraw: true
		// });
		totalBody.add(bodyMesh);
		totalBody.add(headMesh);
	});
	return totalBody;
}