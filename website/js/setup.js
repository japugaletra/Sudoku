var gameBoard;
let touchDebounce = false;

$(document).ready(() => {
	gameBoard = new Board();
});

$(window).resize(() => {
	gameBoard.BoardUIManager.recalculateBoardSizes({transition: true});
});

$(window).on('touchstart', (e) => {
	if(!touchDebounce && e.originalEvent.touches.length == 2) {
		touchDebounce = true;
		e.preventDefault();
		gameBoard.onNextNumberClick();

		window.setTimeout(() => {
			touchDebounce = false;
		},100);
	}
});

$(window).on('keydown',(e) => {
	let keyCode = e.which || e.keyCode;

	// Key is 1-9
	if(49 <= keyCode && keyCode <= 57) {
		// As 49 = 1, 50 = 2 etc.
		gameBoard.onNumberClick(keyCode - 48);
	}

	// On 0 Press
	if(keyCode === 48) {
		gameBoard.onNumberClick('');

	// On P Press
	} else if(keyCode === 80) {
		gameBoard.onPauseClick();

	// On M Press
	} else if(keyCode === 77) {
		gameBoard.onShowMarkingsClick();

	// On X Press
	} else if (keyCode === 78) {
		gameBoard.onPencilToggleClick();

	// On Space Press
	} else if (keyCode === 32) {
		e.preventDefault();
		gameBoard.onNextNumberClick();
	}
});

//$(window).on('keydown',(e) => {console.log(e);});