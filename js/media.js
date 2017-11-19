"use strict";

function createBackgroundSound() {
	let audio = new Audio('sound.mp3');
	audio.play();
	audio.loop = true;
};