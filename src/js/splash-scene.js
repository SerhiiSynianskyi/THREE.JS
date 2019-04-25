export function animateSpleshScene(clock, gameState, camera, smokeParticles) {
	let newDelta = clock.getDelta();
	evolveSmoke(smokeParticles, newDelta);
	if (gameState === 1) {
		camera.position.z -= 10.7;
		camera.rotation.z += 0.01;
	}
}

export function buildSplashScreen(scene, smokeParticles) {
	let splashSubSceneGeom = new THREE.CubeGeometry(1010, 1300, 1100),
		splashSubSceneMat = new THREE.MeshPhongMaterial({ color: 0x000000, side: THREE.DoubleSide }),
		splashSubSceneMesh = new THREE.Mesh(splashSubSceneGeom, splashSubSceneMat);
	splashSubSceneMesh.position.set(0, 0, 1300);
	let textGeom = new THREE.PlaneGeometry(300, 300);
	THREE.ImageUtils.crossOrigin = '';
	let textTexture = new THREE.TextureLoader().load('images/quick-text.png');
	let textMat = new THREE.MeshLambertMaterial({ color: 0xf2f2f2, opacity: 1, map: textTexture, transparent: true, blending: THREE.AdditiveBlending })
	let textMesh = new THREE.Mesh(textGeom, textMat);
	textMesh.position.z = 1350;


	let smokeTexture = new THREE.TextureLoader().load('images/smoke-element.png');
	let smokeMaterial = new THREE.MeshLambertMaterial({ color: 0x425662, map: smokeTexture, transparent: true });
	let smokeGeo = new THREE.PlaneGeometry(300, 300);
	let particlesGroup = new THREE.Group();
	for (let p = 0; p < 100; p++) {
		let particle = new THREE.Mesh(smokeGeo, smokeMaterial);
		particle.position.set(Math.random() * 500 - 250, Math.random() * 500 - 250, Math.random() * 500 + 900);
		particle.rotation.z = Math.random() * 180;
		particlesGroup.add(particle);
		smokeParticles.push(particle);
	}
	let splashSubSceneGroup = new THREE.Group();
	splashSubSceneGroup.add(particlesGroup);
	splashSubSceneGroup.add(textMesh);
	splashSubSceneGroup.add(splashSubSceneMesh);
	splashSubSceneGroup.splashSubSceneDetect = true;
	scene.add(splashSubSceneGroup);
}

function evolveSmoke(smokeParticles, delta) {
	let sp = smokeParticles.length;
	while (sp--) {
		smokeParticles[sp].rotation.z += (delta * 0.15);
	}
}