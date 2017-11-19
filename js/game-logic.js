"use strict";
/////////////////////////////////////////// ENEMY
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

function enemyAnimation(enemy, _sceneSize) {
	switch (enemy.movingCoordinate) {
		case 0:
			if (enemy.position.z >= _sceneSize.mixZ + 60) {
				enemy.position.z += -6;
			}
			break;
		case 1:
			if (enemy.position.z <= _sceneSize.maxZ - 60) {
				enemy.position.z += 6;
			}
			break;
		case 2:
			if (enemy.position.x >= _sceneSize.minX + 60) {
				enemy.position.x += -6;
			}
			break;
		case 3:
			if (enemy.position.x <= _sceneSize.maxX - 60) {
				enemy.position.x += 6;
			}
			break;
	}
}

/////////////////////////////////////////// TARGET

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

function targetLogic(state, scene, object, targetParams) {
	let _scene = scene;
	switch (state) { ////////////// - TODO better to use onserver
		case 0:
			object.position.set((getRandomInt(-40, 40) * 10), 50, (getRandomInt(-40, 40) * 10));
			let targetType = getRandomInt(0, 10);
			if (targetType === 0) {
				setTargetColor(object, [0, 0, 1])
				targetParams.targetType = 0;
			} else if (targetType >= 1 && targetType <= 3) {
				setTargetColor(object, [0.1, 1, 1])
				targetParams.targetType = 1;
			} else {
				setTargetColor(object, [0.1, 1, 0.2])
				targetParams.targetType = 2;
			}
			scene.add(object);
			targetParams.targetState = 1;
			break;
		case 1:
			break;
		case 2:
			targetParams.targetState = 2;
			setTimeout(function() {
				targetParams.targetState = 0;
				targetLogic(0, _scene, object, targetParams);
			}, 750)
			break;
		default:
			break;
	}
}

/////////////////////////////////////////// USER

function userAnimation(program, userRobot, sceneSize, robotParams) {
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

/////////////////////////////////////////// COLLAPSE

function checkCollapse(userRobot, enemyRobots, target, robotParams, enemyParams, targetParams, sceneSize, scene, userData, scoresData, endGame) { // A lot of parametrs
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
			targetLogic(2, scene, target, targetParams);
			console.log(123);
			userData.scores += targetParams.values[targetParams.targetType];
			showScores(scoresData, userData);
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
			// endGame();
		}
		///////////////////////////////////////////// - enemy and target collapse
		if ((enemyBodyX + fullEnemyBodySize >= targetX - targetSize) && (enemyBodyX - fullEnemyBodySize <= targetX + targetSize) && (enemyBodyZ + fullEnemyBodySize >= targetZ - targetSize) && (enemyBodyZ - fullEnemyBodySize <= targetZ + targetSize)) {
			if (targetParams.targetState !== 2) {
				targetLogic(2, scene, target, targetParams);
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
		enemyAnimation(item, sceneSize);
	})
}