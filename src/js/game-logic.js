"use strict";

import {rotateAroundWorldAxis} from "./scene-functions";

import {
	setTargetColor,
	showScores,
	getRandomInt,
	removeObjects,
	createOrbitControl
} from './additional-functions.js'

/////////////////////////////////////////// ENEMY
export function enemyLogic(enemies, getRandomInt) {
	let randomInterval = 2500;
	enemies.forEach(function (item) {
		randomInterval = randomInterval - 300;
		let startMovingCoordinate = item.movingCoordinate;
		setInterval(function () {
			if (!item.colapsed) {
				item.movingCoordinate = getRandomInt(0, 3);
				if (item.movingCoordinate === startMovingCoordinate) {
					item.movingCoordinate = getRandomInt(0, 3);
				}
			}
		}, randomInterval);
	});
}

export function enemyAnimation(enemy, _sceneSize) {
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

export function targetAnimation(object, params) {
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

export function targetLogic(state, scene, object, targetParams) {
	let _scene = scene;
	switch (state) { ////////////// - TODO better to use onserver
		case 0:
			object.position.set((getRandomInt(-40, 40) * 10), 50, (getRandomInt(-40, 40) * 10));
			let targetType = getRandomInt(0, 10);
			if (targetType === 0) {
				setTargetColor(object, [0, 0, 1]);
				targetParams.targetType = 0;
			} else if (targetType >= 1 && targetType <= 3) {
				setTargetColor(object, [0.1, 1, 1]);
				targetParams.targetType = 1;
			} else {
				setTargetColor(object, [0.1, 1, 0.2]);
				targetParams.targetType = 2;
			}
			scene.add(object);
			targetParams.targetState = 1;
			break;
		case 1:
			break;
		case 2:
			targetParams.targetState = 2;
			setTimeout(function () {
				targetParams.targetState = 0;
				targetLogic(0, _scene, object, targetParams);
			}, 750);
			break;
		default:
			break;
	}
}

function _limitMovement(userRobotPosition, axis, value, maxSceneLimit, minSceneLimit) {
	if (((userRobotPosition.position[axis] <= maxSceneLimit) && (userRobotPosition.position[axis] >= minSceneLimit)) || ((userRobotPosition.position[axis] >= maxSceneLimit) && (value < 0)) || ((userRobotPosition.position[axis] <= minSceneLimit) && (value > 0))) {
		userRobotPosition.position[axis] += value;
	}
}

export function moveUserRobot(userRobot, controlData) {
	let worldXAxis = new THREE.Vector3(Math.cos(controlData.angle.radian) / 10, 0, -Math.sin(controlData.angle.radian) / 10);
	let xAxis = Math.cos(controlData.angle.radian),
		yAxis = -Math.sin(controlData.angle.radian);
	let axisRotation = (new THREE.Quaternion).setFromEuler(
		new THREE.Euler(xAxis, 0, yAxis)
	);
	_limitMovement(userRobot, 'z', Math.cos(controlData.angle.radian) * (controlData.distance / 10), 445, -445);
	_limitMovement(userRobot, 'x', Math.sin(controlData.angle.radian) * (controlData.distance / 10), 445, -445);
	userRobot.children[0].quaternion.multiply(axisRotation);
	rotateAroundWorldAxis(userRobot.children[0], worldXAxis, controlData.distance / 700)
}

export function moveViaKeyboard(program, userBallBody, userRobot, userSphereData) {
	// 90deg = 1.5708rad
	let radians = 1.5708;
	userSphereData = {
		distance: 200,
		angle: {}
	};
	switch (program) {
		case 'up':
			userSphereData.angle.radian = radians;
			moveUserRobot(userRobot, userSphereData);
			break;
		case 'down':
			userSphereData.angle.radian = radians * 3;
			moveUserRobot(userRobot, userSphereData);
			break;
		case 'left':
			userSphereData.angle.radian = radians * 2;
			moveUserRobot(userRobot, userSphereData);
			break;
		case 'right':
			userSphereData.angle.radian = radians * 4;
			moveUserRobot(userRobot, userSphereData);
			break;
		case 'top-left':
			userSphereData.angle.radian = radians * 1.5;
			moveUserRobot(userRobot, userSphereData);
			break;
		case 'top-right':
			userSphereData.angle.radian = radians * 0.5;
			moveUserRobot(userRobot, userSphereData);
			break;
		case 'bottom-left':
			userSphereData.angle.radian = radians * 2.5;
			moveUserRobot(userRobot, userSphereData);
			break;
		case 'bottom-right':
			userSphereData.angle.radian = radians * 3.5;
			moveUserRobot(userRobot, userSphereData);
			break;
		case 'special':
			break;
		default:
			break;
	}
}

/////////////////////////////////////////// COLLAPSE

export function checkCollapse(userRobot, enemyRobots, target, robotParams, enemyParams, targetParams, sceneSize, scene, userData, scoresData, endGame, creationLogic) { // A lot of parametrs
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
			userData.scores += targetParams.values[targetParams.targetType];
			showScores(scoresData, userData);
			creationLogic(enemyParams);
		}
	}

	enemyRobots.forEach(function (item, i, arr) {
		let subArray = arr.map(function (subItem) {
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
				targetLogic(2, scene, target, targetParams);
			}

		}
		///////////////////////////////////////////// - enemies collapse
		subArray.forEach(function (subItem, subI, subArr) {
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