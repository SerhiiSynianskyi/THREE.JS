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
        scoresTable = document.getElementsByClassName('scores-table')[0],
        restartGame = document.getElementsByClassName('restart-game')[0],
        mainMenu = document.getElementById('main-menu'),
        userForm = document.getElementById('user-form'),
        menuSubwrapper = document.getElementById('menu-subwrappers'),
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
            bodySize: 50,
            count: 1;
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
            userAnimation(touchType, userRobot, sceneSize, robotParams);
        }
        controls.maxDistance = 1200;
        controls.minDistance = 150;
    }
    //////////////////////////////////////////////////////

    function createEnemies(params) { // TOFO -refaactor this fu.....
    	switch (params.enemyCount) {
            case '1':
                break;
            case '2':
                break;
            case '3':
                buildScores();
                break;
            case '4':
                break;
            case '5':
                break;
            case '6':
                break;
            default:
                break;
        }

        enemyRobot1 = createEnemyRobot(scene, enemyParams);
        // enemyRobot1.totalBody.movingCoordinate = 0;
        // let enemyRobot2 = enemyRobot1.totalBody.clone();
        // let enemyRobot3 = enemyRobot1.totalBody.clone();
        // let enemyRobot4 = enemyRobot1.totalBody.clone();
        // let enemyRobot5 = enemyRobot1.totalBody.clone();
        // let enemyRobot6 = enemyRobot1.totalBody.clone();
        enemies.push(enemyRobot1.totalBody);
        // enemies.push(enemyRobot2);
        // enemies.push(enemyRobot3);
        // enemies.push(enemyRobot4);
        // enemies.push(enemyRobot5);
        // enemies.push(enemyRobot6);
        // scene.add(enemyRobot2);
        // scene.add(enemyRobot3);
        // scene.add(enemyRobot4);
        // scene.add(enemyRobot5);
        // scene.add(enemyRobot6);
        scene.add(enemyRobot1.totalBody);
        enemyRobot1.totalBody.position.set(-200, 60, -100);
        // enemyRobot2.position.set(200, 60, -100);
        // enemyRobot3.position.set(-200, 60, 100);
        // enemyRobot4.position.set(-300, 60, 200);
        // enemyRobot5.position.set(-400, 60, -200);
        // enemyRobot6.position.set(-100, 60, -500);
    }

    function endGame() {
        endGameScored.value = userData.scores;
        gameStart = false;
        mainWrapper.classList.add('stop-game');
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
        checkCollapse(userRobot, enemies, targetObject, robotParams, enemyParams, targetParams, sceneSize, scene, userData, scoresData, endGame); // A lot of parametrs
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
            tableRow.innerHTML = `<th>${index+1}</th><td>${item.scores}</td><td>${item.name}</td>`;
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
        createEnemies(enemyParams);
        enemyLogic(enemies);
        targetLogic(0, scene, targetObject, targetParams);
    }

    function init() {
        initScene();
        addLights();
        if (JSON.parse(localStorage.getItem('starWarsGameUsers', users))) {
            users = JSON.parse(localStorage.getItem('starWarsGameUsers', users));
        }

    }
    // createBackgroundSound();

    setTimeout(function() {
        gameStart = true;
        buildObjects();
        rendering();
    }, 2000);

    ///////// LISTENERS

    controlsWrapper.addEventListener('touchstart', function(e) {
        if (e.target.classList.contains('control')) {
            touchMode = true;
            touchType = e.target.classList[1];
            userAnimation(touchType, userRobot, sceneSize, robotParams);
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
            userAnimation(moveType, userRobot, sceneSize, robotParams);
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
    	console.log(999);
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
    console.timeEnd('userTime');

};