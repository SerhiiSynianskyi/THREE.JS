"use strict";

export {setTargetColor, showScores, getRandomInt, createBackgroundSound, parseMaps, createSnow, renderSnow, buildScores}

function setTargetColor(target, arr) {
	target.material.color.b = arr[0];
	target.material.color.g = arr[1];
	target.material.color.r = arr[2];
}

function showScores(_scoresData, _userData) {
	_scoresData.value = _userData.scores;
}

function getRandomInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function createBackgroundSound() {
	let audio = new Audio(require('../media/Mega Drive - Converter.mp3'));
	audio.play();
	audio.loop = true;
}

function parseMaps(maps, parentElement) {
	let mapsSubWrapper = document.createDocumentFragment();
	let mapsNames = Object.keys(maps);
	mapsNames.forEach(function (item) {
		let mapWrapper = document.createElement('div'),
			mapImage = document.createElement('img'),
			mapName = document.createElement('p');
		mapWrapper.classList.add('map-wrapper');
		mapWrapper.dataset.mapType = item;
		mapImage.classList.add('map-image');
		mapImage.src = maps[item].imagePath;
		mapName.innerText = maps[item].name;
		mapWrapper.appendChild(mapName);
		mapWrapper.appendChild(mapImage);
		mapsSubWrapper.appendChild(mapWrapper);
	});
	parentElement.appendChild(mapsSubWrapper);
}

function buildScores(users, scoresTable) {
	let sortedData = users.map(function (num) {
		return num;
	});
	sortedData.sort(function (a, b) {
		return b.scores - a.scores;
	});
	let tableBody = document.createElement('tbody');
	sortedData.forEach(function (item, index) {
		let tableRow = document.createElement('tr');
		tableRow.innerHTML = `<th>${index + 1}</th><td>${item.scores}</td><td>${item.name}</td>`;
		tableBody.appendChild(tableRow);
	});
	scoresTable.innerHTML = '';
	scoresTable.appendChild(tableBody);
}


function createSnow() {
	let snowGeom = new THREE.Geometry(),
		snowMesh = new THREE.Group(),
		materials = [];
	snowMesh.isSnowObject = true;
	for (let i = 0; i < 10000; i++) {
		let vertex = new THREE.Vector3();
		vertex.x = Math.random() * 2000 - 1000;
		vertex.y = Math.random() * 2000 - 1000;
		vertex.z = Math.random() * 2000 - 1000;
		snowGeom.vertices.push(vertex);
	}
	let parameters = [
		[
			[1, 1, 0.5], 6
		],
		[
			[1, 1, 0.5], 5
		],
		[
			[1, 1, 0.5], 4
		],
		[
			[1, 1, 0.5], 3
		],
		[
			[1, 1, 0.5], 2
		]
	];
	for (let i = 0; i < parameters.length; i++) {
		let color = parameters[i][0],
			size = parameters[i][1];
		materials[i] = new THREE.PointsMaterial({
			size: size,
			color: 0xFFFFFF,
			map: new THREE.TextureLoader().load(
				"images/particle.png"
			),
			blending: THREE.AdditiveBlending,
			transparent: true
		});
		let particles = new THREE.Points(snowGeom, materials[i]);
		particles.rotation.x = Math.random() * 6;
		particles.rotation.y = Math.random() * 6;
		particles.rotation.z = Math.random() * 6;
		snowMesh.add(particles)
	}
	return snowMesh;
}

function renderSnow(time, scene) {
	for (let j = 0; j < scene.children.length; j++) {
		let object = scene.children[j];
		if (object.hasOwnProperty('isSnowObject')) {
			for (let i = 0; i < object.children.length; i++) {
				object.children[i].rotation.z = time / 2 * (i < 8 ? i + 1 : (i + 2));
				// object.rotation.y += (i < 8 ? i + 1 : (i + 2))/800;
				// object.rotation.z += (i < 8 ? i + 1 : (i + 2))/2000;
			}
		}
	}
}