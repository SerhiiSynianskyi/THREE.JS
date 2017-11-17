"use strict";
window.onload = function() {
	console.time('userTime');
	let mainWrapper = document.getElementsByClassName('main-wrapper')[0],
		scoresData = document.getElementsByClassName('scores')[0],
		endGameScored = document.getElementsByClassName('end-game-scores')[0],
		controlsWrapper = document.getElementById('control-wrapper'),
		modesWrapper = document.getElementsByClassName('camera-modes')[0],
		trackBallWrap = document.getElementsByClassName('track-ball')[0],
		menuIcon = document.getElementsByClassName('menu-icon')[0],
		mainMenu = document.getElementsByClassName('main-menu')[0],
		userForm = document.getElementById('user-form'),
		inputUserName = userForm.getElementsByClassName('user-name')[0];

	let scene, camera, renderer, light, targetObject, enemyRobot1, userRobot, touchType,
		touchMode = false,
		gameStart = false,
		targetParams = {
			bodySize: 40,
			targetState: 0,
			targetType: 0,
			values: [500, 300, 100]
		},
		difficulty = {
			currentDiff: 0,
			values: [1000, 2000]
		},
		cameraMode = 1,
		startDate = Date.now(),
		perNoizeWeight = 20.0,
		robotParams = {
			bodySize: 50
		},
		enemyParams = {
			bodySize: 50
		},
		userData = {
			name: '',
			scores: 0
		},
		users = [],
		enemies = [],
		stateChange = new Event('newState'),
		sceneSize = {
			maxZ: 500,
			mixZ: -500,
			maxX: 500,
			minX: -500
		};

	scene = new THREE.Scene();
	init();

	function initScene() {
		camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000);
		renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias - сглаживаем ребра
		camera.position.set(0, 615, 700);
		camera.rotation.set(-0.72, 0, 0);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.gammaInput = renderer.gammaOutput = true;
		renderer.toneMapping = THREE.LinearToneMapping;
		// renderer.toneMappingExposure = 1;
		renderer.setClearColor(0x000000);
		mainWrapper.appendChild(renderer.domElement);
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
		light.position.multiplyScalar(1.3);
		light.castShadow = true;
		light.shadow.mapSize.width = 1024;
		light.shadow.mapSize.height = 1024;
		light.shadow.camera.left = -d;
		light.shadow.camera.right = d;
		light.shadow.camera.top = d;
		light.shadow.camera.bottom = -d;
		light.shadow.camera.far = 2000;
		scene.add(new THREE.AmbientLight(0xffffff, 0.2));
		scene.add(light);
	}

	function setSceneLimits() {
		if (touchMode) {
			userAnimation(touchType);
		}
		controls.maxDistance = 1200;
		controls.minDistance = 150;
	}
	//////////////////////////////////////////////////////
	function createBackgroundSound() {
		let audio = new Audio('sound.mp3');
		audio.play();
		audio.loop = true;
	};

	function getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	function createEnemies() {
		enemyRobot1 = createEnemyRobot(scene, enemyParams);
		enemyRobot1.totalBody.movingCoordinate = 0;
		let enemyRobot2 = enemyRobot1.totalBody.clone();
		let enemyRobot3 = enemyRobot1.totalBody.clone();
		let enemyRobot4 = enemyRobot1.totalBody.clone();
		let enemyRobot5 = enemyRobot1.totalBody.clone();
		let enemyRobot6 = enemyRobot1.totalBody.clone();
		enemies.push(enemyRobot1.totalBody);
		enemies.push(enemyRobot2);
		enemies.push(enemyRobot3);
		enemies.push(enemyRobot4);
		enemies.push(enemyRobot5);
		enemies.push(enemyRobot6);
		scene.add(enemyRobot2);
		scene.add(enemyRobot3);
		scene.add(enemyRobot4);
		scene.add(enemyRobot5);
		scene.add(enemyRobot6);
		scene.add(enemyRobot1.totalBody);
		enemyRobot1.totalBody.position.set(-200, 60, -100);
		enemyRobot2.position.set(200, 60, -100);
		enemyRobot3.position.set(-200, 60, 100);
		enemyRobot4.position.set(-300, 60, 200);
		enemyRobot5.position.set(-400, 60, -200);
		enemyRobot6.position.set(-100, 60, -500);
	}

	function enemyLogic(enemies) {
		let randomInterval = 2500;
		enemies.forEach(function(item) {
			randomInterval = randomInterval - 300;
			let startMovingCoordinate = item.movingCoordinate
			setInterval(function() {
				if (!item.colapsed) {
					item.movingCoordinate = getRandomInt(0, 3);
					if (item.movingCoordinate === startMovingCoordinate) {
						item.movingCoordinate = getRandomInt(0, 3);
					}
				}
			}, randomInterval);
		});
	};

	function showScores() {
		scoresData.value = userData.scores;;
	}

	function enemyAnimation(enemy) {
		switch (enemy.movingCoordinate) {
			case 0:
				if (enemy.position.z >= sceneSize.mixZ + 60) {
					enemy.position.z += -6;
				}
				break;
			case 1:
				if (enemy.position.z <= sceneSize.maxZ - 60) {
					enemy.position.z += 6;
				}
				break;
			case 2:
				if (enemy.position.x >= sceneSize.minX + 60) {
					enemy.position.x += -6;
				}
				break;
			case 3:
				if (enemy.position.x <= sceneSize.maxX - 60) {
					enemy.position.x += 6;
				}
				break;
		}
	}

	function checkCollapse(userRobot, enemyRobots, target) {
		let enemyBodyX,
			enemyBodyZ,
			userX = userRobot.position.x,
			userZ = userRobot.position.z,
			targetSize = target.geometry.parameters.radius,
			targetX = target.position.x,
			targetZ = target.position.z,
			delta = 10,
			fullEnemyBodySize = enemyParams.bodySize + 5;

		///////////////////////////////////////////// - target collapse
		if ((userX + robotParams.bodySize >= targetX - targetSize + delta) && (userX - robotParams.bodySize <= targetX + targetSize - delta) && (userZ + robotParams.bodySize >= targetZ - targetSize + delta) && (userZ - robotParams.bodySize <= targetZ + targetSize - delta)) {
			if (targetParams.targetState !== 2) {
				targetLogic(2);
				userData.scores += targetParams.values[targetParams.targetType];
				showScores();
			}
		}

		enemyRobots.forEach(function(item, i, arr) {
			let subArray = arr.map(function(subItem) {
				return subItem;
			});
			subArray.splice(subArray.indexOf(item), 1);

			if (item) {
				enemyBodyX = item.position.x;
				enemyBodyZ = item.position.z;
			}
			///////////////////////////////////////////// - user collapse
			if ((userX + robotParams.bodySize >= enemyBodyX - enemyParams.bodySize + delta) && (userX - robotParams.bodySize <= enemyBodyX + enemyParams.bodySize - delta) && (userZ + robotParams.bodySize >= enemyBodyZ - enemyParams.bodySize + delta) && (userZ - robotParams.bodySize <= enemyBodyZ + enemyParams.bodySize - delta)) {
				endGame();
			}
			///////////////////////////////////////////// - enemy and target collapse
			if ((enemyBodyX + fullEnemyBodySize >= targetX - targetSize) && (enemyBodyX - fullEnemyBodySize <= targetX + targetSize) && (enemyBodyZ + fullEnemyBodySize >= targetZ - targetSize) && (enemyBodyZ - fullEnemyBodySize <= targetZ + targetSize)) {
				if (targetParams.targetState !== 2) {
					targetLogic(2);
				}

			}
			///////////////////////////////////////////// - enemies collapse
			subArray.forEach(function(subItem, subI, subArr) {
				let basicRobot = item.movingCoordinate,
					comparableRobot = subItem.movingCoordinate,
					comparableRobotX = subItem.position.x,
					comparableRobotZ = subItem.position.z,
					collapsed;

				if ((enemyBodyX + fullEnemyBodySize >= comparableRobotX - fullEnemyBodySize) && (enemyBodyX - fullEnemyBodySize <= comparableRobotX + fullEnemyBodySize) && (enemyBodyZ + fullEnemyBodySize >= comparableRobotZ - fullEnemyBodySize) && (enemyBodyZ - fullEnemyBodySize <= comparableRobotZ + fullEnemyBodySize)) {
					collapsed = true;
					item.movingCoordinate = Math.abs(3 - basicRobot);
					subItem.movingCoordinate = Math.abs(1 - basicRobot);
					item.collapsed = true;
				} else {
					collapsed = false;
					item.collapsed = false;
				}


			});
			enemyAnimation(item);
		})
	}

	function targetAnimation(object, params) {
		if (params.targetState === 1) {
			if (object.scale.x <= 1) {
				object.scale.x += 0.03;
			}
			if (object.scale.y <= 1.3) {
				object.scale.y += 0.03;
			}
			if (object.scale.z <= 1) {
				object.scale.z += 0.03;
			}
		}
		if (params.targetState === 2) {
			if (object.scale.x >= 0.1) {
				object.scale.x -= 0.03;
			}
			if (object.scale.y >= 0.1) {
				object.scale.y -= 0.03;
			}
			if (object.scale.z >= 0.1) {
				object.scale.z -= 0.03;
			}
		}
	}

	function endGame() {
		// endGameScored.value = userData.scores;
		// gameStart = false;
		// mainWrapper.classList.add('stop-game');
	}

	function setTargetColor(target, arr) {
		target.material.color.b = arr[0];
		target.material.color.g = arr[1];
		target.material.color.r = arr[2];
	}

	function targetLogic(state) {
		switch (state) { ////////////// - TODO better to use onserver
			case 0:
				targetObject.position.set((getRandomInt(-40, 40) * 10), 50, (getRandomInt(-40, 40) * 10));
				let targetType = getRandomInt(0, 10);
				if (targetType === 0) {
					setTargetColor(targetObject, [0, 0, 1])
					targetParams.targetType = 0;
				} else if (targetType >= 1 && targetType <= 3) {
					setTargetColor(targetObject, [0.1, 1, 1])
					targetParams.targetType = 1;
				} else {
					setTargetColor(targetObject, [0.1, 1, 0.2])
					targetParams.targetType = 2;
				}
				scene.add(targetObject);
				targetParams.targetState = 1;
				break;
			case 1:
				break;
			case 2:
				targetParams.targetState = 2;
				setTimeout(function() {
					targetParams.targetState = 0;
					targetLogic(0);
				}, 750)
				break;
			default:
				break;
		}
	}

	//////////////////////////////////////////////////////

	let controls = new THREE.OrbitControls(camera);
	controls.enabled = false;
	controls.enableKeys = false;
	let stats = new Stats();
	window.fps.appendChild(stats.dom);

	function rendering() {
		if (gameStart) {
			requestAnimationFrame(rendering);
		}

		renderer.render(scene, camera);

		stats.update();

		enemyRobot1.shader.uniforms['time'].value = .005 * (Date.now() - startDate);
		enemyRobot1.shader.uniforms['weight'].value = perNoizeWeight * 0.05;
		setSceneLimits();
		checkCollapse(userRobot, enemies, targetObject);
		targetAnimation(targetObject, targetParams)
		// console.log(camera.position);
		// console.log(camera.rotation);
		// scene.rotation.y += 90 / Math.PI * 0.0001;
		// if (cameraMode === 3) {
		//     camera.lookAt(headMesh.position);
		// }
		targetObject.rotation.y += 0.03;
		if (cameraMode === 2) {
			scene.rotation.y += 90 / Math.PI * 0.0001;
		}
	};

	let angle = 0,
		radius = 5;

	function userAnimation(program) {
		switch (program) {
			case 'up':
				if (userRobot.position.z >= sceneSize.mixZ + robotParams.bodySize + 10) {
					userRobot.position.z += -11;
				}
				userRobot.children[0].rotation.x -= 180 / Math.PI * 0.002;
				break;
			case 'down':
				if (userRobot.position.z <= sceneSize.maxZ - robotParams.bodySize - 10) {
					userRobot.position.z += 11;
				}
				userRobot.children[0].rotation.x += 180 / Math.PI * 0.002;
				break;
			case 'left':
				if (userRobot.position.x >= sceneSize.minX + robotParams.bodySize + 10) {
					userRobot.position.x += -11;
				}
				userRobot.children[0].rotation.z += 180 / Math.PI * 0.002;
				userRobot.children[0].rotation.x = 0;
				break;
			case 'right':
				if (userRobot.position.x <= sceneSize.maxX - robotParams.bodySize - 10) {
					userRobot.position.x += 11;
				}
				userRobot.children[0].rotation.z -= 180 / Math.PI * 0.002;
				userRobot.children[0].rotation.x = 0;
				break;
			case 'special':
				// headMesh.position.z += 4 * Math.sin(angle);
				// headMesh.position.x += 4 * Math.cos(angle);
				// sphere.position.z += 4 * Math.sin(angle);
				// sphere.position.x += 4 * Math.cos(angle);
				// sphere.rotation.y -= 180 / Math.PI * 0.002;
				// sphere.rotation.x += 180 / Math.PI * 0.002;
				// angle += Math.PI / 180 * 2; // 2 - degree
				// head.position.z += -10;
				// sphere.position.z += -10;
				// sphere.rotation.x -= 180 / Math.PI * 0.002;
				// head.position.x += -10;
				// sphere.position.x += -10;
				// sphere.rotation.z -= 180 / Math.PI * 0.002;
				break;
			default:
				break;
				/*sphere.position.z += 8 * Math.sin(angle);
		sphere.position.x += radius * Math.cos(angle);
		angle += Math.PI / 180 * 2; // 2 - degree  */
		}
	};

	function menuInteraction(type) {
		switch (type) {
			case 'play':
				mainWrapper.classList.remove('open-menu');
				setTimeout(function() {
					gameStart = true;
					rendering();
				}, 500)
				break;
			default:
				break;
		}
	}

	function moveCameraTo(from, to) {

	}
	///////// FUNCTIONS CALL

	// let helper = new THREE.DirectionalLightHelper(light,5);
	// scene.add(helper);

	function buildObjects() {
		scene.add(createSpaceScene());
		createEdges(scene);
		targetObject = createTargetObject(),

			scene.add(createPlane());
		userRobot = createRobot(scene, robotParams);
		scene.add(userRobot);
		createEnemies();
		enemyLogic(enemies);
		targetLogic(0);
	}

	function init() {
		initScene();
		addLights();
		if (JSON.parse(localStorage.getItem('starWarsGameUsers', users))) {
			users = JSON.parse(localStorage.getItem('starWarsGameUsers', users));
		}

	}
	// createBackgroundSound();

	console.timeEnd('userTime');

	setTimeout(function() {
		gameStart = true;
		buildObjects();
		rendering();
		// endGame();
	}, 2000);

	///////// LISTENERS

	controlsWrapper.addEventListener('touchstart', function(e) {
		if (e.target.classList.contains('control')) {
			touchMode = true;
			touchType = e.target.classList[1];
			userAnimation(touchType);
		}
	});

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
			userAnimation(moveType);
		}
	});
	window.addEventListener('resize', function(e) {
		resize();
	});

	let data1 = document.getElementById('data1');
	let data2 = document.getElementById('data2');
	let data3 = document.getElementById('data3');
	if (window.DeviceOrientationEvent) {
		window.addEventListener('deviceorientation', function(e) {
			data1.innerHTML = Math.ceil(event.alpha);
			data2.innerHTML = Math.ceil(event.beta);
			data3.innerHTML = Math.ceil(event.gamma);
		});
	}

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
		gameStart = false;
	});

	mainMenu.addEventListener('click', function(e) {
		if (e.target.dataset.menu) {
			menuInteraction(e.target.dataset.menu);
		}
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
		let data = localStorage.getItem('starWarsGameUsers', users);
	});
};