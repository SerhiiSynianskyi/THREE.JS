"use strict";
import {animateSpleshScene, buildSplashScreen } from './splash-scene.js'
import {initPhysics, createRigidBody, createPlane, createRobotPhysics, updatePhysics } from './physics.js'
import {createSceneBackground, cubeGenerator, createEdges, createTargetObject, createEnemyRobot, createRobot, setSceneTexture} from './objects.js'
import {setTargetColor, showScores, getRandomInt, removeObjects, createOrbitControl, createBackgroundSound, parseMaps } from './additional-functions.js'
import {enemyLogic, enemyAnimation, targetAnimation, targetLogic, animateUserRobot, moveViaKeyboard, checkCollapse} from './game-logic.js'
import * as xVertex from "./shaders/enemy-x-vertex.js"
import * as xFragment from "./shaders/enemy-x-fragment.js"
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

	let camera, renderer, light, targetObject, enemyRobot1, userRobot, touchType, stats, controls, sceneBackground, snowParticlesMesh,
		touchMode = false,
		gameStart = false,
		gameState = 0,
		smokeParticles = [],
		materials = [],
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
		maps = [{
				name: 'Dark dust',
				mapType: 1,
				imagePath: 'images/maps/map_dust.jpg',
				rotation: false,
				hasSnow: false
			},
			{
				name: 'Show',
				mapType: 2,
				imagePath: 'images/maps/map_snow.jpg',
				rotation: false,
				hasSnow: true
			},
			{
				name: 'Space',
				mapType: 3,
				imagePath: 'images/maps/map_space.jpg',
				rotation: true,
				hasSnow: false
			},
			{
				name: 'Ocean',
				mapType: 4,
				imagePath: 'images/maps/map_snow.jpg',
				rotation: false,
				hasSnow: false
			}
		],
		maxDistance = 1200,
		minDistance = 160,
		clock = new THREE.Clock(),
		delta = clock.getDelta(),
		controlOffset = 90 * (Math.PI / 180),
		linearVector = new Ammo.btVector3(),
		angularVector = new Ammo.btVector3();

	let nippleOptions = {
			zone: document.getElementById('nipple-wrapper'),
			color: 'white',
			size: 170,
			fadeTime: 500,
			restOpacity: 0,
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
		// camera.position.set(0, 615, 700);
		camera.position.set(0, 0, 1530);
		camera.rotation.set(-0.72, 0, 0);
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

	function resize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
		camera.updateProjectionMatrix()
	}

	/////////////////////////////////////////////////////////////////
	function addLights() {
		light;
		let d = 900;
		light = new THREE.DirectionalLight(0xdfebff, 1.1);
		light.position.set(100, 500, -650);
		// light.position.multiplyScalar(1.3);
		light.castShadow = true;
		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 1024;
		light.shadow.camera.left = -d;
		light.shadow.camera.right = d;
		light.shadow.camera.top = d;
		light.shadow.camera.bottom = -d;
		light.shadow.camera.far = 1800;
		scene.add(new THREE.AmbientLight(0xffffff, 0.2));
		scene.add(light);
	}

	//////////////////////////////////////////////////////

	function creationLogic(params) {
		if (userData.scores > difficulty.values[params.count] && params.count === 1) {
			params.count = 2;
			createEnemies(enemyParams)
		} else if (userData.scores > difficulty.values[params.count] && params.count === 2) {
			params.count = 3;
			createEnemies(enemyParams)
		} else if (userData.scores > difficulty.values[params.count] && params.count === 3) {
			params.count = 4;
			createEnemies(enemyParams)
		} else if (userData.scores > difficulty.values[params.count] && params.count === 4) {
			params.count = 5;
			createEnemies(enemyParams)
		} else if (userData.scores > difficulty.values[params.count] && params.count === 5) {
			params.count = 6;
			createEnemies(enemyParams)
		}
	}

	function createEnemies(params) { // TODO -refaactor this fu.....
		switch (params.count) {
			case 1:
				enemyRobot1 = createEnemyRobot(scene, enemyParams);
				enemyRobot1.totalBody.movingCoordinate = 0;
				enemyRobot1.totalBody.robot = true;
				enemies.push(enemyRobot1.totalBody);
				scene.add(enemyRobot1.totalBody);
				enemyRobot1.totalBody.position.set(-400, 60, -400);
				enemyLogic(enemies,getRandomInt);
				break;
			case 2:
				let enemyRobot2 = enemyRobot1.totalBody.clone();
				enemies.push(enemyRobot2);
				enemyRobot2.position.set(-400, 60, 400);
				enemyRobot2.robot = true;
				scene.add(enemyRobot2);
				enemyLogic(enemies,getRandomInt);
				break;
			case 3:
				let enemyRobot3 = enemyRobot1.totalBody.clone();
				enemies.push(enemyRobot3);
				enemyRobot3.position.set(-400, 60, -400);
				enemyRobot3.robot = true;
				scene.add(enemyRobot3);
				enemyLogic(enemies,getRandomInt);
				break;
			case 4:
				let enemyRobot4 = enemyRobot1.totalBody.clone();
				enemies.push(enemyRobot4);
				enemyRobot4.position.set(-400, 60, 400);
				enemyRobot4.robot = true;
				scene.add(enemyRobot4);
				enemyLogic(enemies,getRandomInt);
				break;
			case 5:
				let enemyRobot5 = enemyRobot1.totalBody.clone();
				enemies.push(enemyRobot5);
				enemyRobot5.position.set(-400, 60, -400);
				enemyRobot5.robot = true;
				scene.add(enemyRobot5);
				enemyLogic(enemies,getRandomInt);
				break;
			case 6:
				let enemyRobot6 = enemyRobot1.totalBody.clone();
				enemies.push(enemyRobot6);
				enemyRobot6.position.set(-400, 60, 400);
				enemyRobot6.robot = true;
				scene.add(enemyRobot6);
				enemyLogic(enemies,getRandomInt);
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

	//////////////////////////////////////////////////////

	controls = createOrbitControl(camera, maxDistance, minDistance);
	stats = new Stats();
	// window.fps.appendChild(stats.dom);

	function rendering() {
		if (gameStart) {
			requestAnimationFrame(rendering);
		}
		renderer.render(scene, camera);
		if (stats) {
			stats.update();
		}
		if (enemyRobot1) {
			enemyRobot1.shader.uniforms['time'].value = .005 * (Date.now() - startDate);
			enemyRobot1.shader.uniforms['weight'].value = perNoizeWeight * 0.05;
		}
		if (gameState > 2) {
			checkCollapse(userRobot, enemies, targetObject, robotParams, enemyParams, targetParams, sceneSize, scene, userData, scoresData, endGame, creationLogic); // A lot of parametrs
			targetAnimation(targetObject, targetParams)
			// scene.rotation.y += 90 / Math.PI * 0.0001;
			// if (cameraMode === 3) {
			//     camera.lookAt(headMesh.position);
			// }
			targetObject.rotation.y += 0.03;
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
		updatePhysics(deltaTime, physicsWorld, rigidBodies, transformAux1);
		if (!moveUserSphere && userSphereData.distance >= 0) {
			userSphereData.distance -= 1;
		}
		if (userSphereData.distance && userBallBody) {
			animateUserRobot(userBallBody, userRobot, rigidBodies, userSphereData.angle.radian, userSphereData.distance, controlOffset, linearVector, angularVector)
		}
		let time = Date.now() * 0.00005;
		if (currentMap.hasSnow) {
			renderSnow(time);
		}
	};

	function buildScores() {
		let sortedData = users.map(function(num) {
			return num;
		});
		sortedData.sort(function(a, b) {
			return b.scores - a.scores;
		});
		let tableBody = document.createElement('tbody');
		sortedData.forEach(function(item, index) {
			let tableRow = document.createElement('tr');
			tableRow.innerHTML = `<th>${index + 1}</th><td>${item.scores}</td><td>${item.name}</td>`;
			tableBody.appendChild(tableRow);
		});
		scoresTable.innerHTML = '';
		scoresTable.appendChild(tableBody);
	}

	function moveCameraTo(from, to) {

	}


	function menuInteraction(type) {
		switch (type) {
			case 'continue':
				mainWrapper.classList.remove('open-menu');
				mainMenu.className = '';
				menuSubwrapper.className = '';
				setTimeout(function() {
					gameStart = true;
					rendering();
				}, 500)
				break;
			case 'maps':
				break;
			case 'scores':
				buildScores();
				break;
			case 'settings':
				break;
			case 'credits':
				break;
			case 'exit':
				break;

			default:
				break;
		}
	}

	function createSnow() {
		let snowGeom = new THREE.Geometry(),
			snowMesh = new THREE.Group();
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

	function renderSnow(time) {
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
	///////// FUNCTIONS CALL

	// let helper = new THREE.DirectionalLightHelper(light,5);
	// scene.add(helper);

	function buildObjects() {
		let userRobotData;
		sceneBackground = createSceneBackground(currentMap.mapType)
		scene.add(sceneBackground);
		createEdges(scene, rigidBodies, physicsWorld);
		userRobot = createRobot(scene, robotParams, rigidBodies, physicsWorld);
		scene.add(userRobot);
		setTimeout(function() { // REFACTOR!!!!!!!!!!!!!!!!!!!!!!!!!!! TODO
			userBallBody = createRobotPhysics(scene, rigidBodies, physicsWorld, userRobot.children[0]);
		}, 2000);
	}

	function init() {
		if (JSON.parse(localStorage.getItem('starWarsGameUsers', users))) {
			users = JSON.parse(localStorage.getItem('starWarsGameUsers', users));
		}
		if (userRobot && rigidBodies[0]) {
			userRobot.position.set(0, 0, 0);
			// rigidBodies[0].setOrigin(new Ammo.btVector3(0, 0, 0));
			console.log(userBallBody);
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
		enemyLogic(enemies,getRandomInt);

	}

	function buildSplashAnimation(scene, props) {
		mainWrapper.classList.add('game-previev-ready');
		removeObjects(scene, props);
		camera.position.set(0, 615, 700);
		camera.rotation.set(-0.72, 0, 0);
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
		scene.add(new THREE.AmbientLight(0xffffff, 0.2));
		buildSplashScreen(scene, smokeParticles);
		physicsWorld = initPhysics();
		createPlane(scene, rigidBodies, physicsWorld)
		preBuild();
	}

	function preBuild() {
		addLights();
		gameStart = true;
		mainWrapper.classList.remove('stop-game');
		rendering();
		parseMaps(maps, mapsWrapper);
		snowParticlesMesh = createSnow();
	}

	function changeMap() {
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
		let moveType = 'notype';
		switch (e.key) {
			case '8':
				moveType = 'up';
				break;
			case '2':
				moveType = 'down';
				break;
			case '4':
				moveType = 'left';
				break;
			case '6':
				moveType = 'right';
				break;
			case '7':
				moveType = 'special';
				break;
			case 'ArrowUp':
				moveType = 'up';
				break;
			case 'ArrowDown':
				moveType = 'down';
				break;
			case 'ArrowLeft':
				moveType = 'left';
				break;
			case 'ArrowRight':
				moveType = 'right';
				break;
			default:
				moveType = 'notype';
				break;
		}
		if (moveType !== 'notype') {
			moveViaKeyboard(moveType, userBallBody, userRobot, rigidBodies);
		}
	});
	window.addEventListener('resize', function(e) {
		resize();
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
				camera.position.set(0, 615, 700);
				camera.rotation.set(-0.72, 0, 0);
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
			menuInteraction(e.target.dataset.menu);
		}
	});
	restartGame.addEventListener('click', function(e) {
		init();
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
		}
	});
	console.timeEnd('userTime');
	window.addEventListener('click', function(e) {
		createBackgroundSound();
	});
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
				changeMap();
			}
		};
	});
};