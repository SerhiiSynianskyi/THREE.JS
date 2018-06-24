"use strict";

export {setTargetColor, showScores, getRandomInt, removeObjects, createOrbitControl, createBackgroundSound, parseMaps }

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
	let audio = new Audio(require('../media/Mega Drive - Converter.mp3'));
	// audio.play();
	audio.loop = true;
};

function parseMaps(maps, parentElement) {
	let mapsSubWrapper = document.createDocumentFragment();
	maps.forEach(function(item) {
		let mapWrapper = document.createElement('div'),
			mapImage = document.createElement('img'),
			mapName = document.createElement('p');
		mapWrapper.classList.add('map-wrapper');
		mapWrapper.dataset.mapType = item.mapType;
		mapImage.classList.add('map-image');
		mapImage.src = item.imagePath;
		mapName.innerText = item.name;
		mapWrapper.appendChild(mapName);
		mapWrapper.appendChild(mapImage);
		mapsSubWrapper.appendChild(mapWrapper);
	});
	parentElement.appendChild(mapsSubWrapper);
}