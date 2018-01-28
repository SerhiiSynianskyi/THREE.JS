"use strict";

function setTargetColor(target, arr) {
	target.material.color.b = arr[0];
	target.material.color.g = arr[1];
	target.material.color.r = arr[2];
}

function showScores(_scoresData, _userData) {
	_scoresData.value = _userData.scores;;
}


function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function removeObjects(scene, props) {
	scene.children.forEach(function(item, index, array) {
		props.forEach(function(innerItem) {
			if (item[innerItem]) {
				scene.remove(item)
			}

		})
	})
}

function createOrbitControl(camera, maxDistance, minDistance) {
	let controls = new THREE.OrbitControls(camera);
	controls.enabled = false;
	controls.enableKeys = false;
	controls.maxDistance = maxDistance;
	controls.minDistance = minDistance;
	return controls;
}

function createBackgroundSound() {
	let audio = new Audio('media/Mega Drive - Converter.mp3');
	audio.loop = true;
};