"use strict";
import { animateSpleshScene, buildSplashScreen } from './splash-scene.js'
import { initPhysics, createRigidBody, createPlane } from './physics.js'
import {
	createSceneBackground,
	cubeGenerator,
	createEdges,
	createTargetObject,
	createEnemyRobot,
	createRobot,
	setSceneTexture
} from './objects.js'
import {
	setTargetColor,
	showScores,
	getRandomInt,
	createBackgroundSound,
	parseMaps,
	createSnow,
	renderSnow
} from './additional-functions.js'
import {
	addLights,
	removeObjects,
	createOrbitControl,
	resize,
	rotateAroundWorldAxis
} from './scene-functions.js'
import {
	enemyLogic,
	enemyAnimation,
	targetAnimation,
	targetLogic,
	moveViaKeyboard,
	checkCollapse
} from './game-logic.js'

import {
	checkKeyType,
	menuInteraction
} from './controls.js'

import mapsData from '../maps-config.json'

window.onload = function() {
	console.time('userTime');
	let mainWrapper = document.getElementsByClassName('main-wrapper')[0],
		scoresData = document.getElementsByClassName('scores')[0],
		endGameScored = document.getElementsByClassName('end-game-scores')[0],
		modesWrapper = document.getElementsByClassName('camera-modes')[0],
		trackBallWrap = document.getElementsByClassName('track-ball')[0],
		menuIcon = document.getElementsByClassName('menu-icon')[0],
		scoresTable = document.getElementsByClassName('scores-table')[0],
		restartGame = document.getElementsByClassName('restart-game')[0],
		mainMenu = document.getElementById('main-menu'),
		userForm = document.getElementById('user-form'),
		menuSubwrapper = document.getElementById('menu-subwrappers'),
		mapsWrapper = menuSubwrapper.getElementsByClassName('maps-wrapper')[0],
		inputUserName = userForm.getElementsByClassName('user-name')[0];

	let camera, renderer, targetObject, enemyRobotPrototype, userRobot, touchType, stats, controls, sceneBackground,
		snowParticlesMesh,
		touchMode = false,
		gameStart = false,
		gameState = 0,
		smokeParticles = [],
		maps = mapsData.maps_data,
		scene = new THREE.Scene(),
		targetParams = {
			bodySize: 40,
			targetState: 0,
			targetType: 0,
			values: [500, 300, 100]
		},
		difficulty = {
			values: [0, 500, 1200, 2500, 4500, 6000, 7000]
		},
		cameraMode = 1,
		startDate = Date.now(),
		perNoizeWeight = 20.0,
		robotParams = {
			bodySize: 50
		},
		enemyParams = {
			bodySize: 50,
			count: 1
		},
		userData = {
			name: '',
			scores: 0
		},
		users = [],
		enemies = [],
		sceneSize = {
			maxZ: 500,
			mixZ: -500,
			maxX: 500,
			minX: -500
		},
		currentMap = {
			mapType: 1
		},
		maxDistance = 1200,
		minDistance = 160,
		clock = new THREE.Clock(),
		delta = clock.getDelta(),
		controlOffset = 90 * (Math.PI / 180),
		linearVector = new Ammo.btVector3(),
		angularVector = new Ammo.btVector3(),
		startEvent = new Event('startGame');
	let nippleOptions = {
			zone: document.getElementById('nipple-wrapper'),
			color: 'white',
			size: 170,
			fadeTime: 500,
			restOpacity: 0.15,
			position: {
				right: '13%',
				bottom: '20%'
			},
			mode: 'static'
		},
		nippleManager = nipplejs.create(nippleOptions);

	let physicsWorld,
		rigidBodies = [],
		softBodies = [],
		pos = new THREE.Vector3(),
		quat = new THREE.Quaternion(),
		transformAux1 = new Ammo.btTransform(),
		margin = 0.05,
		textureLoader,
		userBallBody,
		moveUserSphere,
		userSphereData = {
			distacne: 0
		};
	preInit();

	function initScene() {
		camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000);
		renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias - сглаживаем ребра
		camera.position.set(0, 0, 1530);
		camera.rotation.set(-1.6, -0.84, -1.6);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.gammaInput = renderer.gammaOutput = true;
		renderer.toneMapping = THREE.LinearToneMapping;
		renderer.toneMappingExposure = 1;
		renderer.setClearColor(0x000000);
		mainWrapper.appendChild(renderer.domElement);
		// scene.fog = new THREE.FogExp2(0xFFFFFF, 0.0002);
	}

	function creationLogic(params) {
		if (userData.scores > difficulty.values[params.count] && params.count !== 0) {
			params.count++;
			createEnemies(enemyParams);
		}
	}

	function initEnemyRobot(enemyPrototype, scene, enemies, getRandomInt, position) {
		let enemyRobot;
		if (!enemyPrototype) {
			enemyRobotPrototype = createEnemyRobot(scene, enemyParams);
			enemyRobotPrototype.totalBody.movingCoordinate = 0;
			enemyRobot = enemyRobotPrototype.totalBody;
		} else {
			enemyRobot = enemyPrototype.totalBody.clone();
		}
		enemies.push(enemyRobot);
		enemyRobot.position.set(...position);
		enemyRobot.robot = true;
		scene.add(enemyRobot);
		enemyLogic(enemies, getRandomInt);
	}

	function createEnemies(params) {
		let position;
		switch (params.count) {
			case 1:
				position = [-400, 60, -400];
				initEnemyRobot(false, scene, enemies, getRandomInt, position);
				break;
			case 2:
				position = [-400, 60, 400];
				initEnemyRobot(enemyRobotPrototype, scene, enemies, getRandomInt, position);
				break;
			case 3:
				position = [-400, 60, -400];
				initEnemyRobot(enemyRobotPrototype, scene, enemies, getRandomInt, position);
				break;
			case 4:
				position = [-400, 60, 400];
				initEnemyRobot(enemyRobotPrototype, scene, enemies, getRandomInt, position);
				break;
			case 5:
				position = [-400, 60, -400];
				initEnemyRobot(enemyRobotPrototype, scene, enemies, getRandomInt, position);
				break;
			case 6:
				position = [-400, 60, 400];
				initEnemyRobot(enemyRobotPrototype, scene, enemies, getRandomInt, position);
				break;
			default:
				break;
		}
	}

	function endGame() {
		endGameScored.value = userData.scores;
		gameStart = false;
		mainWrapper.classList.add('stop-game');
	}

	controls = createOrbitControl(camera, maxDistance, minDistance);
	stats = new Stats();
	window.fps.appendChild(stats.domElement);

	function limitMovement(userRobotPosition, axis, value, maxSceneLimit, minSceneLimit) {
		if(((userRobotPosition.position[axis] <= maxSceneLimit)&&(userRobotPosition.position[axis] >= minSceneLimit))||((userRobotPosition.position[axis] >= maxSceneLimit)&&(value < 0))||((userRobotPosition.position[axis] <= minSceneLimit)&&(value > 0))){
			userRobotPosition.position[axis] += value;
		}
	}

	function moveUserRobot() {
		let worldXAxis = new THREE.Vector3(Math.cos(userSphereData.angle.radian) / 10, 0, -Math.sin(userSphereData.angle.radian) / 10);
		let xAxis = Math.cos(userSphereData.angle.radian),
			yAxis = -Math.sin(userSphereData.angle.radian);
		let axisRotation = (new THREE.Quaternion).setFromEuler(
			new THREE.Euler(xAxis, 0, yAxis)
		);
		limitMovement(userRobot, 'z',  Math.cos(userSphereData.angle.radian) * (userSphereData.distance / 10), 445, -445);
		limitMovement(userRobot, 'x',  Math.sin(userSphereData.angle.radian) * (userSphereData.distance / 10), 445, -445);
		userRobot.children[0].quaternion.multiply(axisRotation);
		rotateAroundWorldAxis(userRobot.children[0], worldXAxis, userSphereData.distance / 700)
	}

	function rendering() {
		if (gameStart) {
			requestAnimationFrame(rendering);
		}
		if (userSphereData.angle) {
			moveUserRobot()
		}

		renderer.render(scene, camera);
		if (stats) {
			stats.update();
		}
		if (enemyRobotPrototype) {
			enemyRobotPrototype.shader.uniforms['time'].value = .005 * (Date.now() - startDate);
			enemyRobotPrototype.shader.uniforms['weight'].value = perNoizeWeight * 0.05;
		}
		if (gameState > 2) {
			checkCollapse(userRobot, enemies, targetObject, robotParams, enemyParams, targetParams, sceneSize, scene, userData, scoresData, endGame, creationLogic); // A lot of parametrs
			targetAnimation(targetObject, targetParams)
			// scene.rotation.y += 90 / Math.PI * 0.0001;
			// if (cameraMode === 3) {
			//     camera.lookAt(headMesh.position);
			// }
			targetObject.rotation.y += 0.03;
			if (userRobot && rigidBodies[0]) {
				userRobot.position.x = rigidBodies[0].position.x;
				userRobot.position.z = rigidBodies[0].position.z;
			}

			if (cameraMode === 2) {
				scene.rotation.y += 90 / Math.PI * 0.0001;
			}
		}
		if (gameState < 2 && camera.position.z > 910) {
			animateSpleshScene(clock, gameState, camera, smokeParticles);
			if (camera.position.z <= 910) {
				gameState = 2;
				buildSplashAnimation(scene, ['splashSubSceneDetect']);
			}
		}
		//////////////////////////// PHYSICS
		let deltaTime = clock.getDelta();
		if (!moveUserSphere && userSphereData.distance > 0) {
			userSphereData.distance -= 1;
			Math.floor(userSphereData.distance);
		}
		if (!moveUserSphere && userSphereData.distance < 0) {
			userSphereData.distance = 0;
		}

		let time = Date.now() * 0.00005;
		if (currentMap.hasSnow) {
			renderSnow(time, scene);
		}
	};

	// let helper = new THREE.DirectionalLightHelper(light,5);
	// scene.add(helper);

	function buildObjects() {
		let userRobotData;
		sceneBackground = createSceneBackground(currentMap.mapType)
		scene.add(sceneBackground);
		createEdges(scene, rigidBodies, physicsWorld);
		userRobot = createRobot(scene, robotParams, rigidBodies, physicsWorld);
		scene.add(userRobot);
	}

	function init() {
		if (JSON.parse(localStorage.getItem('starWarsGameUsers', users))) {
			users = JSON.parse(localStorage.getItem('starWarsGameUsers', users));
		}
		if (userRobot && rigidBodies[0]) {
			userRobot.position.set(0, 0, 0);
		}
		userData.name = '';
		userData.scores = 0;
		if (!gameStart) {
			gameStart = true;
			rendering();
		}
		removeObjects(scene, ['giftDetected']);
		mainWrapper.classList.remove('stop-game');
		showScores(scoresData, userData);
		scene.children.forEach(function(item, index, arr) {
			if (item.robot || item.giftDetected) {
				scene.remove(item);
			}
			arr.forEach(function(subItem) {
				if (subItem.robot || subItem.giftDetected) {
					scene.remove(subItem);
				}
			});
		});
		enemies.length = 0;
		inputUserName.value = '';
		enemyParams.count = 1;
		targetObject = createTargetObject(),
			targetLogic(0, scene, targetObject, targetParams);
		createEnemies(enemyParams);
		enemyLogic(enemies, getRandomInt);

	}

	function setCameraDefault() {
		camera.position.set(-700, 600, 0);
		camera.rotation.set(-1.57, -0.86, -1.57);
	}

	function buildSplashAnimation(scene, props) {
		mainWrapper.classList.add('game-previev-ready');
		removeObjects(scene, props);
		setCameraDefault();
		setTimeout(function() {
			mainWrapper.classList.add('game-process-enabled');
			mainWrapper.classList.remove('game-previev-ready');
			init();
			buildObjects();
			gameState = 3;
		}, 200);
	}

	function preInit() {
		initScene();
		buildSplashScreen(scene, smokeParticles);
		physicsWorld = initPhysics();
		createPlane(scene, rigidBodies, physicsWorld)
		preBuild();
	}

	function preBuild() {
		addLights(scene);
		gameStart = true;
		mainWrapper.classList.remove('stop-game');
		rendering();
		parseMaps(maps, mapsWrapper);
		snowParticlesMesh = createSnow();
	}

	function changeMap(currentMap) {
		if (currentMap.hasSnow) {
			scene.add(snowParticlesMesh);
		} else {
			scene.remove(snowParticlesMesh);
		}
		let sceneTexture = setSceneTexture(maps[currentMap.mapType - 1].mapType);
		sceneBackground.material = sceneTexture;
		sceneBackground.material.needsUpdate = true
	}

	///////// LISTENERS

	window.addEventListener('touchend', function(e) {
		touchMode = false;
	});
	window.addEventListener('touchmove', function(e) {
		touchMode = false;
	});
	document.addEventListener('keydown', function(e) {
		let moveType = checkKeyType(e);
		if (moveType !== 'notype') {
			moveViaKeyboard(moveType, userBallBody, userRobot, rigidBodies, linearVector, angularVector);
		}
	});
	document.addEventListener('keyup', function(e) {
		let moveType = checkKeyType(e);
		if (moveType !== 'notype') {

		}
	});
	window.addEventListener('resize', function(e) {
		resize(camera, renderer);
	});

	// let data1 = document.getElementById('data1');
	// let data2 = document.getElementById('data2');
	// let data3 = document.getElementById('data3');
	// if (window.DeviceOrientationEvent) {
	// 	window.addEventListener('deviceorientation', function(e) {
	// 		data1.innerHTML = Math.ceil(event.alpha);
	// 		data2.innerHTML = Math.ceil(event.beta);
	// 		data3.innerHTML = Math.ceil(event.gamma);
	// 	});
	// }

	///////////////////////////////////////////////////// - camera modes
	modesWrapper.addEventListener('click', function(e) {
		if (e.target.className === 'mode') {
			Array.prototype.forEach.call(modesWrapper.children, function(item) {
				item.classList.remove('active');
			});
			e.target.classList.add('active');
			cameraMode = parseInt(e.target.dataset.mode);
			if (cameraMode === 1) {
				controls.reset();
				setCameraDefault();
				controls.enabled = false;
				scene.rotation.y = 0;
				checkTrackBall();
			}
			if (cameraMode === 2) {}
		}
	});
	trackBallWrap.addEventListener('click', function(e) {
		controls.enabled = !controls.enabled;
		checkTrackBall();
	});

	function checkTrackBall() {
		controls.enabled ? trackBallWrap.classList.add('active') : trackBallWrap.classList.remove('active');
	}

	menuIcon.addEventListener('click', function() {
		mainWrapper.classList.add('open-menu');
		mainMenu.className = ('state-continue');
		gameStart = false;
	});

	mainMenu.addEventListener('click', function(e) {
		if (e.target.dataset.menu) {
			mainMenu.className = ('state-' + e.target.dataset.menu);
			menuSubwrapper.className = ('substate-' + e.target.dataset.menu);
			menuInteraction(e.target.dataset.menu, mainWrapper, mainMenu, menuSubwrapper, scene, startEvent);

		}
	});
	restartGame.addEventListener('click', function(e) {
		init();
	});

	window.addEventListener('startGame', function(e) {
		gameStart = true;
		rendering()
	});

	// window.addEventListener(deviceorientation, function() {
	//  let orientation = Math.abs(window.orientation) == 90 ? 'landscape' : 'portrait';
	//        console.log(orientation);
	// }, false);
	window.addEventListener('submit', function(e) {
		userData.name = inputUserName.value;
		users.push(userData);
		localStorage.setItem('starWarsGameUsers', JSON.stringify(users));
		e.preventDefault();
		init();
	});
	mainWrapper.addEventListener('click', function() {
		if (gameState === 0) { // TODO refector this shit
			gameState = 1;
			createBackgroundSound();
		}
	});
	console.timeEnd('userTime');
	nippleManager.on('move', function(evt, data) {
		moveUserSphere = true;
		userSphereData = data;
	});
	nippleManager.on('end', function(evt, data) {
		moveUserSphere = false;
	});

	mapsWrapper.addEventListener('click', function(e) {
		if (e.target.dataset.mapType) {
			let selectedMapType = parseInt(e.target.dataset.mapType);
			if (currentMap.mapType !== selectedMapType) {
				currentMap = maps[selectedMapType - 1];
				changeMap(currentMap);
			}
		}
	});
};