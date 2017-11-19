"use strict";

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