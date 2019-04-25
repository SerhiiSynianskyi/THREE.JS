"use strict";

import {
	buildScores
} from './additional-functions.js'
export function checkKeyType(e) {
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
			moveType = 'top-left';
			break;
		case '9':
			moveType = 'top-right';
			break;
		case '1':
			moveType = 'bottom-left';
			break;
		case '3':
			moveType = 'bottom-right';
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
	return moveType;
}

export function menuInteraction(type, mainWrapper, mainMenu, menuSubwrapper, scene, event, users, scoresTable, nippleWrapper) {
	switch (type) {
		case 'continue':
			mainWrapper.classList.remove('open-menu');
			nippleWrapper.classList.remove('hidden');
			mainMenu.className = '';
			menuSubwrapper.className = '';
			window.dispatchEvent(event);
			break;
		case 'maps':
			break;
		case 'scores':
			buildScores(users, scoresTable);
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