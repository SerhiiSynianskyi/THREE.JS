"use strict";

export function addLights(scene, lightShadowMapSize) {
	let lightDistance = 900,
		light = new THREE.DirectionalLight(0xdfebff, 1.1);
	light.position.set(100, 600, -650);
	light.position.multiplyScalar(1.3);
	light.castShadow = true;
	light.shadow.mapSize.width = lightShadowMapSize;
	light.shadow.mapSize.height = lightShadowMapSize;
	light.shadow.camera.left = -lightDistance;
	light.shadow.camera.right = lightDistance;
	light.shadow.camera.top = lightDistance;
	light.shadow.camera.bottom = -lightDistance;
	light.shadow.camera.far = 1800;
	scene.add(new THREE.AmbientLight(0xffffff, 0.4));
	scene.add(light);
}

export function removeObjects(scene, props) {
	scene.children.forEach(function(item, index, array) {
		props.forEach(function(innerItem) {
			if (item[innerItem]) {
				scene.remove(item)
			}

		})
	})
}

export function createOrbitControl(camera, maxDistance, minDistance) {
	let controls = new THREE.OrbitControls(camera);
	controls.enabled = false;
	controls.enableKeys = false;
	controls.maxDistance = maxDistance;
	controls.minDistance = minDistance;
	return controls;
}

export function resize(camera, renderer) {
	camera.aspect = window.innerWidth / window.innerHeight;
	renderer.setSize(window.innerWidth, window.innerHeight);
	camera.updateProjectionMatrix()
}

export function rotateAroundWorldAxis(object, axis, radians) {
	let rotWorldMatrix = new THREE.Matrix4();
	rotWorldMatrix.makeRotationAxis(axis.normalize(), radians);
	rotWorldMatrix.multiply(object.matrix);
	object.matrix = rotWorldMatrix;
	object.rotation.setFromRotationMatrix(object.matrix);
}