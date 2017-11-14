// "use strict";

window.onload = function() {
	console.time('userTime');
	let mainWrapper = document.getElementsByClassName('main-wrapper')[0];
	let scene, camera, renderer, light, targetObject, enemyRobot, userRobot,
		gameStart = false,
		cameraMode = 1,
		start = Date.now(),
		perNoizeWeight = 20.0,
		robotParams = {
			bodySize: 50
		},
		enemyParams = {
			bodySize: 50,
			movingCoordinate: 0
		},
		enemies = [];

	sceneSize = {
		maxZ: 500,
		mixZ: -500,
		maxX: 500,
		minX: -500
	};

	scene = new THREE.Scene();

	function init() {
		camera = new THREE.PerspectiveCamera(65, window.innerWidth / window.innerHeight, 0.1, 10000);
		renderer = new THREE.WebGLRenderer({ antialias: true }); // antialias - сглаживаем ребра
		camera.position.set(0, 615, 700);
		camera.rotation.set(-0.72, 0, 0);
		renderer.shadowMap.enabled = true;
		renderer.shadowMap.type = THREE.PCFSoftShadowMap;
		renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
		renderer.gammaInput = renderer.gammaOutput = true;
		renderer.toneMapping = THREE.LinearToneMapping;
		// renderer.toneMappingExposure = 1;
		renderer.setClearColor(0x000000);
		document.body.appendChild(renderer.domElement);
	}

	function resize() {
		camera.aspect = window.innerWidth / window.innerHeight;
		renderer.setSize(window.innerWidth - 5, window.innerHeight - 5);
		camera.updateProjectionMatrix()
	}
	init();
	addLights();
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
		if (mode) {
			animation(type);
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

	function enemyLogic(params) {
		setInterval(
			function() {
				params.movingCoordinate = Math.floor(Math.random() * 4)
			}, 1000);
	};

	function moveEnemy(params) {
		switch (params.movingCoordinate) {
			case 0:
				if (enemyRobot.totalBody.position.z >= sceneSize.mixZ + 60) {
					enemyRobot.totalBody.position.z += -6;
				}
				break;
			case 1:
				if (enemyRobot.totalBody.position.z <= sceneSize.maxZ - 60) {
					enemyRobot.totalBody.position.z += 6;
				}
				break;
			case 2:
				if (enemyRobot.totalBody.position.x >= sceneSize.minX + 60) {
					enemyRobot.totalBody.position.x += -6;
				}
				break;
			case 3:
				if (enemyRobot.totalBody.position.x <= sceneSize.maxX - 60) {
					enemyRobot.totalBody.position.x += 6;
				}
				break;
		}
	}

	function checkCollapse(userRobot, enemyRobot) {
		let enemyBodyX,
			enemyBodyZ,
			userX,
			userZ,
			delta = 10;
		if (userRobot && enemyRobot){
			enemyBodyX = enemyRobot.totalBody.position.x;
			enemyBodyZ = enemyRobot.totalBody.position.z;
			userX = userRobot.position.x;
			userZ = userRobot.position.z;
		}    

		// console.log((userRobot.position.x + robotParams.bodySize) + '!!!!!!!!!' + (enemyRobot.body.position.x - enemyParams.bodySize))
		// console.log(enemyRobot);
		if ((userX + robotParams.bodySize >= enemyBodyX - enemyParams.bodySize + delta) && (userX - robotParams.bodySize <= enemyBodyX + enemyParams.bodySize - delta) && (userZ + robotParams.bodySize >= enemyBodyZ - enemyParams.bodySize + delta) && (userZ - robotParams.bodySize <= enemyBodyZ + enemyParams.bodySize - delta)) {
			console.log('X COLAPSE!!!!!')
		}
		moveEnemy(enemyParams);
	}
	//////////////////////////////////////////////////////

	let controls = new THREE.OrbitControls(camera);
	controls.enabled = false;
	controls.enableKeys = false;
	let stats = new Stats();
	window.fps.appendChild(stats.dom);

	function rendering() {
		requestAnimationFrame(rendering);

		renderer.render(scene, camera);

		stats.update();

		enemyRobot.shader.uniforms['time'].value = .005 * (Date.now() - start);
		enemyRobot.shader.uniforms['weight'].value = perNoizeWeight * 0.05;
		setSceneLimits();
		checkCollapse(userRobot, enemyRobot);
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

	function animation(program) {
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

	function moveCameraTo(from, to) {

	}

	///////// LISTENERS

	let controlsWrapper = document.getElementById('control-wrapper');
	let mode = false,
		type = '';

	controlsWrapper.addEventListener('touchstart', function(e) {
		if (e.target.classList.contains('control')) {
			mode = true;
			type = e.target.classList[1]
			animation(type);
		}
	});

	window.addEventListener('touchend', function(e) {
		mode = false;
	});
	window.addEventListener('touchmove', function(e) {
		mode = false;
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
			animation(moveType);
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

	let modesWrapper = document.getElementsByClassName('camera-modes')[0],
		trackBallWrap = document.getElementsByClassName('track-ball')[0];
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

	let mainMenu = document.getElementsByClassName('menu-icon')[0];
	mainMenu.addEventListener('click', function(){
		console.log(123);
		console.log(mainWrapper);
		mainWrapper.classList.toggle('open-menu');
		gameStart = false;
	});
	// window.addEventListener(deviceorientation, function() {
	//  let orientation = Math.abs(window.orientation) == 90 ? 'landscape' : 'portrait';
	//        console.log(orientation);
	// }, false);


	///////// FUNCTIONS CALL

	// let helper = new THREE.DirectionalLightHelper(light,5);
	// scene.add(helper);
	function buildObjects(){
		scene.add(createSpaceScene());
		createEdges(scene);
		targetObject = createTargetObject(),
		scene.add(targetObject);
		scene.add(createPlane());
		userRobot = createRobot(scene,robotParams);
		scene.add(userRobot);
		enemyRobot = createEnemyRobot(scene, enemyParams);
		enemyLogic(enemyParams);
		enemyRobot.totalBody.position.set(100, 60, -100);
	}
	
	// createBackgroundSound();

	console.timeEnd('userTime');

	
	// enemyRobot.body.position.set(100, 60, -100);
	// enemyRobot.laser.position.set(100, 60, -100);

	setTimeout(function() {
		gameStart = true;
		buildObjects();
		rendering();
	}, 2000);
};