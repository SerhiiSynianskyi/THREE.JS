"use strict";

export { checkKeyType, menuInteraction }
import {
	buildScores
} from './additional-functions.js'
function checkKeyType(e) {
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
	return moveType;
}

function menuInteraction(type, mainWrapper, mainMenu, menuSubwrapper, scene, event, users, scoresTable) {
	switch (type) {
		case 'continue':
			mainWrapper.classList.remove('open-menu');
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