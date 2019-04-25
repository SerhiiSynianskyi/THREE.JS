"use strict"

export function createRigidBody(threeObject, physicsShape, pos, scene, texture, bumpMap) {
	let textureLoader,
		bumpLoader;
	threeObject.position.copy(pos);
	if (texture) {
		textureLoader = new THREE.TextureLoader().load(texture, function(texture) {
			threeObject.material.map = texture;
			threeObject.material.needsUpdate = true;
		});
	}
	if (bumpMap) {
		bumpLoader = new THREE.TextureLoader().load(bumpMap, function(bumpMap) {
			threeObject.material.bumpMap = bumpMap;
			threeObject.material.needsUpdate = true;
		});
	}
	return threeObject;
}

export function createPlane(scene) {
	let pos = new THREE.Vector3().set(0, -25, 0),
		planeMesh = new THREE.Mesh(new THREE.BoxGeometry(1010, 50, 1010, 1, 1, 1), new THREE.MeshStandardMaterial());
	let fullPlaneMesh = createRigidBody(planeMesh, planeMesh, pos, scene, "images/textures/floorTexture.jpg", "images/textures/floorBumpMap.jpg");
	scene.add(fullPlaneMesh);
	planeMesh.castShadow = true;
	planeMesh.receiveShadow = true;
	return planeMesh;
}