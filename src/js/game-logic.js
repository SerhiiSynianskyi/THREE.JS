"use strict";

export {enemyLogic, enemyAnimation, targetAnimation, targetLogic, animateUserRobot, moveViaKeyboard, checkCollapse}
import {setTargetColor, showScores, getRandomInt, removeObjects, createOrbitControl, createBackgroundSound, parseMaps } from './additional-functions.js'

/////////////////////////////////////////// ENEMY
function enemyLogic(enemies,getRandomInt) {
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

function animateUserRobot(userBallBody, userRobot, rigidBodies, radians, distance, controlOffset, linearVector, angularVector) {
	linearVector.setX(Math.sin(radians + controlOffset) * distance * 7);
	linearVector.setZ(Math.cos(radians + controlOffset) * distance * 7);
	angularVector.setX(Math.cos(radians + controlOffset) * distance / 16);
	angularVector.setZ(Math.sin(radians + controlOffset) * (-distance / 16));
	userBallBody.setLinearVelocity(linearVector);
	userBallBody.setAngularVelocity(angularVector);
	// console.log(rigidBodies)
	// userBallBody.setLinearVelocity(linearVector.setValue(Math.sin(radians + controlOffset) * distance * 7, 0, Math.cos(radians + controlOffset) * distance * 7));
	// userBallBody.setAngularVelocity(angularVector.setValue(Math.cos(radians + controlOffset) * distance / 16, 0, Math.sin(radians + controlOffset) * (-distance / 16)));
	userRobot.position.x = rigidBodies[0].position.x;
	userRobot.position.z = rigidBodies[0].position.z;
}

function moveViaKeyboard(program, userBallBody, userRobot, rigidBodies,linearVector, angularVector) {
	// 90deg = 1.5708rad
	// console.log(123)
	switch (program) {
		case 'up':
			animateUserRobot(userBallBody, userRobot, rigidBodies, 3.14159, 80, 0,linearVector, angularVector);
			break;
		case 'down':
			animateUserRobot(userBallBody, userRobot, rigidBodies, 6.28319, 80, 0,linearVector, angularVector);
			break;
		case 'left':
			animateUserRobot(userBallBody, userRobot, rigidBodies, 4.71239, 80, 0,linearVector, angularVector);
			break;
		case 'right':
			animateUserRobot(userBallBody, userRobot, rigidBodies, 1.5708, 80, 0,linearVector, angularVector);
			break;
		case 'special':
			break;
		default:
			break;
	}
};

/////////////////////////////////////////// COLLAPSE

function checkCollapse(userRobot, enemyRobots, target, robotParams, enemyParams, targetParams, sceneSize, scene, userData, scoresData, endGame, creationLogic) { // A lot of parametrs
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