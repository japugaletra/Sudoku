class BoardUIManager {
	constructor(parent, CellSubsetter) {
		this.parent = parent;
		this.CellSubsetter = CellSubsetter;
		this.gameContainer = $("<div id='gameContainer'></div>");

		this.variables = {
			animationTime: '0s',
		};

		this.styles = {
			defaultButtonBackground: 'rgb(230,230,230)',
			completedNumberButtonBackground: 'rgb(200,200,200)',
			buttonPressedColor: 'rgb(253,253,253)',
			defaultBorder: '1px solid black',
			defaultCellBackground: 'white',
			selectedCellBorder: '1px solid rgb(80,80,255)',
			selectedCellBackground: 'rgb(180,180,255)',
			relatedCellBorder: '1px solid rgb(80,80,255)',
			relatedCellBackground: 'rgb(220,220,240)',
			selectedNumberBorder: '1px solid rgb(80,150,80)',
			selectedNumberBackground: 'rgb(180,200,180)',
			errorBackground: 'rgb(230,200,200)',
			errorBorder: '1px solid rgb(150,80,80)',
			invalidCellBackground: 'rgb(225,225,225)',
		};

		this.defaults = JSON.parse(JSON.stringify(this.styles));

		this.generateBoard();

		this.recalculateBoardSizes({});
	}

	destroy() {
		this.gameContainer.remove();
	}

	removeEffects() {
		$('.square').css({
			border: this.styles.defaultBorder,
		});

		$('.cell').css({
			border: this.styles.defaultBorder,
			background: this.styles.defaultCellBackground,
		});

		$('.button.number').css({
			background: this.styles.defaultButtonBackground,
		});

		$('.pencilBlock').css({
			background: 'none',
		});

		$('#pencilToggle').css({
			background: this.styles.defaultButtonBackground,
		});
	}

	styleRelatedCells(cells) {
		const allCells = convertArrayTo1D(cells);

		allCells.forEach((cell) => {
			cell.$element.css({
				border: this.styles.relatedCellBorder,
				background: this.styles.relatedCellBackground,
			});
		});
	}

	styleSelectedCell(referenceCell) {
		$('#'+referenceCell.id).css({
				border: this.styles.selectedCellBorder,
				background: this.styles.selectedCellBackground,
		});
	}

	styleCompletedNumber(number) {
		$('#n'+number).css({
			background: this.styles.completedNumberButtonBackground,
		});
	}

	StyleForSelectedNumber(selectedNumber) {
		$('#n'+selectedNumber).css({
			background: this.styles.buttonPressedColor,
		});

		// If Setting to highlight all numbers is off, return here
		if(!this.parent.settings.highlighting.highlightNumbers) return;
		
		// Highlight all numbers with selected number
		this.CellSubsetter.getCellsWithValue(this.parent.cells, selectedNumber).forEach((cell) => {
			cell.$element.css({
				border: this.styles.selectedNumberBorder,
				background: this.styles.selectedNumberBackground,
			});
		});

		this.CellSubsetter.getCellsWithPencilValue(this.parent.cells, selectedNumber).forEach((cell) => {
			$('#'+cell.id + ' .p'+selectedNumber).css({
				background: this.styles.selectedNumberBackground,
			});
		});
	}

	styleInvalidPositions(cells) {
		//TODO check cells
		// for each cell, change background to be darker
		convertArrayTo1D(cells).forEach((cell) => {
			cell.$element.css({
				background: this.styles.invalidCellBackground,
			});
		});
	}

	styleForPencil() {
		$('.number').css({
			'font-style': 'italic',
		});

		$('#pencilToggle').css({
			background: this.styles.buttonPressedColor,
		});
	}

	styleForPen() {
		$('.number').css({
			'font-style': 'inherit',
		});

		$('#pencilToggle').css({
			background: this.styles.defaultButtonBackground,
		});
	}

	styleErrorCells(cells) {
		// For each cell, style background
		cells.forEach((cell) => {
			cell.$element.css({
				background: this.styles.errorBackground,
				border: this.styles.errorBorder,
			});
		});
	}

	/**
	*	Event Handlers
	**/
	onPause() {
		this.removeEffects();
		$('#pause').html('Unpause');
	}

	onUnpause() {
		$('#pause').html('Pause');
	}

	onShowMarkings() {
		$('#showMarkings').html('Unmark');
	}

	onHideMarkings() {
		$('#showMarkings').html('Mark');
	}

	recalculateBoardSizes (params) {
		// + and - 2s are for border adjustments through-out
		const animatedElements = `
				#gameContainer, 
				#SudokuBoard, 
				#buttons, 
				.button, 
				.buttonContainer, 
				.cell, 
				#gameHeader,
				.pencilBlock,
				#timer,
				#pause,
				#showMarkings
			`;
		const smallestDim = $(window).height() < $(window).width() ? $(window).height() : $(window).width();
		let buttonSize = (smallestDim)/9 - 2;
		let boardSide = $(window).height() - 3*(buttonSize+2);
		
		const buttonFontSize = parseInt(buttonSize,10)*0.7;

		if(params.transition) {
			$(animatedElements).css({transition:this.variables.animationTime+' all'});
		} else {
			$(animatedElements).css({transition:'0s all'});
		}

		buttonSize = floorToDecimal(0.8*smallestDim/9 - 2,1);

		$('#SudokuBoard').css({
			'font-size': buttonFontSize + 'px',
		});

		$('#buttons').css({
			'font-size': buttonFontSize/2 + 'px',
			'line-height': '100%',

		});

		if($(window).width() < $(window).height()) {
			let rowsOfButtons = 1;

			$('#gameContainer').css({
				width: '100%',
				height: '100%',
			});

			$('#gameHeader').css({
				height: buttonFontSize + 'px',
				'font-size': buttonFontSize + 'px',
			});

			$('#showMarkings').css({
				left: '11vw',
				height: buttonFontSize + 'px',
				'line-height': buttonFontSize + 'px',
				'font-size': buttonFontSize/2 + 'px',
			});

			$('#timer').css({
				width: '100%',
				'line-height': buttonFontSize + 'px',
			});

			$('#pause').css({
				right: '11vw',
				height: buttonFontSize + 'px',
				'line-height': buttonFontSize + 'px',
				'font-size': buttonFontSize/2 + 'px',
			});

			$('#SudokuBoard').css({
				height: '80vw',
				width: '80vw',
				float: 'none',
			});

			$('#buttons').css({
				position: 'relative',
				width: '100%',
				height: 'auto',
			});

			buttonSize = floorToDecimal(smallestDim/10 - 3,1);
			const bigButtonSize = floorToDecimal(smallestDim/5 - 2,1);

			// See if there is enough room for big buttons. +2 for borders
			if($(window).height() - 0.8*smallestDim - buttonFontSize > 2*(bigButtonSize + 2)) {
				buttonSize = bigButtonSize;
				rowsOfButtons = 2;
			}

			if($(window).height() - buttonFontSize - rowsOfButtons*buttonSize > smallestDim) {
				$('#SudokuBoard').css({
					height: '99vw',
					width: '99vw',
				});

				$('#pause').css({
					right: '1vw',
				});

				$('#showMarkings').css({
					left: '1vw',
				});
			}

			$(".buttonContainer").css({
				width: 'auto',
				display: 'inline',
			})

			$('.button').css({
				width: buttonSize+'px',
				height: buttonSize+'px',
				'font-size': buttonFontSize + 'px',
				'line-height':buttonSize+'px',
			});
		} else {
			$('#gameContainer').css({
				width: smallestDim+'px',
				height: smallestDim+'px',
			});

			$('#gameHeader').css({
				height: '10vh',
				'font-size': buttonFontSize + 'px',
			});

			$('#showMarkings').css({
				left: '1vh',
				height: buttonFontSize + 'px',
				'line-height': '10vh',
				'font-size': buttonFontSize/2 + 'px',
			});

			$('#timer').css({
				width: '80vh',
				'line-height': '10vh',
			});

			$('#pause').css({
				right: '21vh',
				height: buttonFontSize + 'px',
				'line-height': '10vh',
				'font-size': buttonFontSize/2 + 'px',
			});

			$('#SudokuBoard').css({
				height: '80vh',
				width: '80vh',
				float: 'left',
			});

			$('#buttons').css({
				position: 'relative',
				width: '20vh',
				height: '80vh',
				'line-height': '100%',
			});

			$(".buttonContainer").css({
				width: buttonSize+2+'px',
				display: 'inline-block',

			})

			$('.button').css({
				width: buttonSize+'px',
				height: buttonSize+'px',
				'font-size': buttonFontSize + 'px',
				'line-height': buttonSize+'px',
			});
		}

		// Re-enable animations after styling everything
		if(params.transition !== true) {
			window.setTimeout(() => {
				$(animatedElements).css({transition:this.variables.animationTime+' all'});
			},0);
		}
	}

	generateBoard() {
		// Set up Header Bar
		const headerBar = $("<div id='gameHeader'></div>");

		// Add Timer
		const timer = $("<div id='timer'>00:00</div>");
		headerBar.append(timer);

		// Add Pause Button
		const pauseButton = $("<div id='pause'>Pause</div>");
		pauseButton.click(() => {
			this.parent.onPauseClick();
		});
		headerBar.append(pauseButton);

		// Show potentials button
		const showMarkings = $("<div id='showMarkings'>Mark</div>");
		showMarkings.click(() => {
			this.parent.onShowMarkingsClick();
		});
		headerBar.append(showMarkings);

		// Set up main board
		const sudokuBoard = $("<div id='SudokuBoard'></div>");

		for(let square = 0; square < 9; square++) {
			const newSquare = $("<div class='square' id='s"+square.toString()+"'></div>");
			for(let cell = 0; cell < 9; cell++) {
				const id = 'c' + String(square) + String(cell);
				const newCell = $("<div class='cell' id='"+id+"'></div>");

				const pencilContainer = $("<div class='pencilContainer'></div>");

				for(let number = 1; number <= 9; number++) {
					const pencilBlock = $("<div class='pencilBlock p"+number+"'></div>");
					pencilContainer.append(pencilBlock);
				}

				const penBlock = $("<div class='penBlock'></div>");

				newCell.append(pencilContainer);
				newCell.append(penBlock);

				newCell.click(() => {
					const referenceCell = this.parent.cells[square][cell];
					this.parent.onCellClick(referenceCell);
				});

				newSquare.append(newCell);
			}
			sudokuBoard.append(newSquare);
		}

		// Set up toolbar
		const toolbar = $("<div id='buttons'></div>");

		const numberedButtonsContainer = $("<div id='numberedButtons' class='buttonContainer'></div>");
		const otherButtonsContainer = $("<div id='miscButtons' class='buttonContainer'></div>");


		for(let i = 1; i <= 9; i++) {
			const button = $("<div id='n"+i+"' class='button number'>"+i+"</div>");
			button.click(() => {
				this.parent.onNumberClick(i);
			});
			numberedButtonsContainer.append(button);
		}

		// Create Pen/Pencil Toggle
		const pencilToggle = $("<div id='pencilToggle' class='button'>N</div>");
		pencilToggle.click(() => {
			this.parent.onPencilToggleClick();
		});
		otherButtonsContainer.append(pencilToggle);

		// Finish off toolbar
		toolbar.append(numberedButtonsContainer);
		toolbar.append(otherButtonsContainer);

		// Add Everything to screen

		this.gameContainer.append(headerBar);
		this.gameContainer.append(sudokuBoard);
		this.gameContainer.append(toolbar);

		$("body").append(this.gameContainer);
	}
}