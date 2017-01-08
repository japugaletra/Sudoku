// TODO: cookies to remember times
// TODO: main menu
// TODO: improve board creation
// TODO: Created solver object
// TODO: Loading Screen
class Board {
	constructor(difficulty = 'harder') {
		const TOTALBOXES = 9;
		const TOTALSQUARES = 9;
		this.disabled = false;
		this.paused = false;
		this.started = false;

		this.constants = {
			maxCounterEasy: 35,
			maxCounterMedium: 45,
		}

		this.settings = {
			difficulty,
			onlyShowValidPositions: false,
			automaticallyRemovePencil: true,

			highlighting: {
				highlightNumbers: true,
				highlightRelated: true,
				showErrors: true,
			},

			nextNumber: {
				automaticallyProgessNumbers: true,
				skipCompletedNumbers: true,
			},			
		};

		this.writeWithPencil = false;
		this.showingMarkings = false;

		// Should be either type: number or type: cell
		this.currentSelection = null;
		this.cells = [];

		for(let box = 0; box < TOTALBOXES; box++) {
			this.cells[box] = [];
			for(let cell = 0; cell < TOTALSQUARES; cell++) {
				const id = 'c' + String(box) + String(cell);
				this.cells[box][cell] = new Cell(id);
			}
		}

		this.CellSubsetter = new CellSubsetter();
		this.BoardUIManager = new BoardUIManager(this,this.CellSubsetter);
		this.Timer = new Timer();
		this.Solver = new Solver();

		this.generate();
	}

	countNumberOccurancesPerBox(num) {
		const cellsWithNum = this.CellSubsetter.getCellsWithValue(this.cells, num);
		const occurancesPerBox = zerosArray(9);

		cellsWithNum.forEach((cell) => {
			occurancesPerBox[cell.box] += 1;
		});

		return occurancesPerBox;
	}

	checkIfNumberExistsInEachBox(num) {
		const boxCountArray = this.countNumberOccurancesPerBox(num);

		for(let boxIndex in boxCountArray) {
			if(boxCountArray[boxIndex] === 0) return false;
		}

		return true;
	}

	checkCompletedNumbers() {
		const completedNumbers = [];
		for(let num = 1; num <= 9; num++) {
			if(this.checkIfNumberExistsInEachBox(num)) {
				completedNumbers.push(num);
			}
		}
		return completedNumbers;
	}

	pause() {
		$('.cell div').hide();
		this.paused = true;
		this.BoardUIManager.onPause();
		this.Timer.stop();
		return this;
	}

	unpause() {
		$('.cell div').show();
		this.paused = false;
		this.BoardUIManager.onUnpause();
		this.styleCurrentSelection();
		this.Timer.start();
		return this;
	}

	checkIfWon() {
		if(this.CellSubsetter.getEmptyCells(this.cells).length == 0) {
			const allCells = convertArrayTo1D(this.cells);

			for(let index in allCells) {
				const cell = allCells[index];
				if(!this.isValueAllowedInCell(cell, cell.value)) return false;
			}

			return true;
		}
	}

	finishGame() {
		this.styleCurrentSelection();
		this.Timer.stop();
		this.disabled = true;

		window.setTimeout(() => {
			alert('You won! Your time was '+$('#timer').html());
			this.currentSelection = {
				type: 'number',
				number: ''
			};

			// Turn of grey setting for better visual
			for(let i = 0; i < 10; i++) {
				window.setTimeout(() => {
					this.currentSelection.number = i + 1;
					if(i === 10) this.currentSelection = null;
					this.styleCurrentSelection();
				},i*250);
			}	
		},250);
		


	}

	removePencilNumberFromCells(cells, number) {
		convertArrayTo1D(cells).forEach((cell) => {
			cell.removePencil(number);
		});
		return this;
	}

	setValueOfCell(cell, value) {
		cell.setValue(value);

		// If removing pencil marks automatically
		if(this.settings.automaticallyRemovePencil) {
			this.removePencilNumberFromCells(
				this.CellSubsetter.getAllRelatedCells(this.cells, cell),
				value
			);
		}

		// If automatically progressing numbers
		if(
			this.currentSelection.type == 'number' &&
			this.settings.nextNumber.automaticallyProgessNumbers && 
			this.checkIfNumberExistsInEachBox(value)
		) {
			this.onNextNumberClick();
		}

		if(this.checkIfWon()) {
			this.finishGame();
		}
	}

	// Change to not replace filled in cells but reselect
	onCellClick(clickedCell) {
		// If board is disabled, do nothing
		if(this.disabled) return;
		
		// If cell Clicked is disabled
		if(!clickedCell.enabled) {
			// If Cell is being clicked again, unselect
			if(this.currentSelection && this.currentSelection.cell === clickedCell) {
				this.currentSelection = null;

			// Otherwise do a number selection with a cell
			} else {
				this.currentSelection = {
					type: 'number',
					cell: clickedCell,
					number: clickedCell.value,
				};
			}

		// If current selection is empty, select clicked Cell
		} else if(!this.currentSelection) {
			this.currentSelection = {
				type: 'cell',
				cell: clickedCell,
			};

		// If the current selection is a cell, either de-select or change selection
		} else if(this.currentSelection.type === 'cell') {
			if(this.currentSelection.cell === clickedCell) {
				this.currentSelection = null;
			} else {
				this.currentSelection.cell = clickedCell;
			}

		//If current selection is a number, select clicked cell and change it's value
		} else if(this.currentSelection.type === 'number') {

			if(this.writeWithPencil) {
				clickedCell.togglePencil(this.currentSelection.number);

			// If the number is the same as the current value, unset it
			} else if(clickedCell.value === this.currentSelection.number) {
				clickedCell.setValue('');

			// If the cell is already filled in, swap selection
			} else if(clickedCell.value !== '') {
				this.currentSelection = {
					type: 'cell',
					cell: clickedCell,
				};

			// Else set value to selected
			} else {
				this.setValueOfCell(clickedCell, this.currentSelection.number);
			}
		}

		this.styleCurrentSelection();
	}

	/**
	* Event Functions
	**/

	onNumberClick(number = '') {
		// If board is disabled, do nothing
		if(this.disabled || this.paused || this.paused) return;

		// If current selection is empty, select clicked Cell
		if(!this.currentSelection && number !== '') {
			this.currentSelection = {
				type: 'number',
				number,
			};

		// If current selection is empty and it is being cleared, do nothing
		} else if(!this.currentSelection) {

		} else if(this.currentSelection.type === 'cell') {

			// If writing with pencil, toggle the pencil for cell
			if(number == '') {
				this.currentSelection.cell.setValue('');
			} else if(this.writeWithPencil) {
				this.currentSelection.cell.togglePencil(number);

			// If the number is the same as the current value, unset it
			} else if(this.currentSelection.cell.value === number) {
				this.currentSelection.cell.setValue('');

			// Replace the value with the new number
			} else {
				this.setValueOfCell(this.currentSelection.cell, number);
			}

		//If current selection is a number, change or deselect it
		} else if(this.currentSelection.type === 'number') {
			this.currentSelection.cell = null;
			if(this.currentSelection.number === number || number === '') {
				this.currentSelection = null;
			} else {
				this.currentSelection.number = number;
			}
		}

		this.styleCurrentSelection();
	}


	onPencilToggleClick() {
		// If board is disabled, do nothing
		if(this.disabled || this.paused) return;

		this.writeWithPencil = !this.writeWithPencil;
		if(this.writeWithPencil) this.BoardUIManager.styleForPencil();
		else this.BoardUIManager.styleForPen();
	}

	onShowMarkingsClick() {
		// If board is disabled, do nothing
		if(this.disabled || this.paused) return;

		this.showingMarkings = !this.showingMarkings;
		if(this.showingMarkings) {
			this.CellSubsetter.getEmptyCells(this.cells).forEach((cell) => {
				this.calculateCellPotentials(cell);
				cell.pencilNumberArray(cell.potentialOptions);
				cell.resetOptionArrays();
			});

			this.BoardUIManager.onShowMarkings();
		} else {
			this.CellSubsetter.getEmptyCells(this.cells).forEach((cell) => {
				cell.clearPencilNumbers();
			});

			this.BoardUIManager.onHideMarkings();
		}

		this.styleCurrentSelection();
		
	}

	onNextNumberClick() {
		// If board is disabled, do nothing
		if(this.disabled || this.paused) return;

		if(!this.currentSelection) {
			this.onNumberClick(1);
		} else if(this.currentSelection.type === 'number') {
			let nextNumber = (this.currentSelection.number) % 9 + 1;
			const completedNumbers = this.checkCompletedNumbers();

			// Setting is enabled and all numbers are not already filled
			if(this.settings.nextNumber.skipCompletedNumbers && completedNumbers.length !== 9) {
				while(completedNumbers.indexOf(nextNumber) !== -1) {
					nextNumber = (nextNumber) % 9 + 1;
				}
			}

			this.onNumberClick(nextNumber);
		}
	}

	onPauseClick() {
		if(this.disabled) return;

		if(this.paused) this.unpause();
		else this.pause();
	}

	/**
	* Generation Functions
	**/

	isValueAllowedInCell(referenceCell, val) {
		// cellGroups: Box, Column and Row of referenceCell
		const cellGroupsToCheck = this.CellSubsetter.getAllRelatedCells(this.cells, referenceCell);

		//If a cell with the same value is found, returns false.
		return !convertArrayTo1D(cellGroupsToCheck).find((cell) => {
			if(cell !== referenceCell && cell.value == val) return true;
		});
	}

	calculateCellPotentials(referenceCell) {
		// Reset Arrays
		referenceCell.resetOptionArrays();

		// Check numbers 1-9 (allowed inputs)
		for(let val = 1; val <= 9; val++) {

			// If Value is allowed, add to potentialOptions, otherwise add to invalidOptions
			if(this.isValueAllowedInCell(referenceCell, val)) {
				referenceCell.potentialOptions.push(val);
			} else {
				referenceCell.invalidOptions.push(val);
			}
		}

		return this;
	}

	recalculateRelatedCellPotentials(referenceCell) {
		//cellGroups: Box, Column and Row of referenceCell
		const cellGroupsToCheck = this.CellSubsetter.getAllRelatedCells(this.cells, referenceCell);

		cellGroupsToCheck.forEach((cellGroup) => {
			cellGroup.forEach((cell) => {
				if(cell !== referenceCell) {
					const index = cell.potentialOptions.indexOf(referenceCell.solutionValue);

					// Check if the potentials need to change
					if(index != -1) {

						// Move conflicting value from potentials to invalids
						cell.potentialOptions.splice(index,1);
						cell.invalidOptions.push(referenceCell.solutionValue);
					}
				}
			});
		});

		return this;
	}

	hasMultipleSolutions() {
		const clearedCells = [];

		convertArrayTo1D(this.cells).forEach((cell) => {
			if(cell.value === '') {
				clearedCells.push(cell);
				this.calculateCellPotentials(cell);
			}
		});

		return this.checkMultipleSolutions(clearedCells);
	}

	checkMultipleSolutions(clearedCells) {
		// While there still exists empty cells
		while(clearedCells.length > 0) {

			// Loop through empty cells
			for(let i = 0; i < clearedCells.length; i++) {
				const cell = clearedCells[i];

				// If cell has only one potential solution, set its solutionValue to it and restart this loop.
				if(cell.potentialOptions.length === 1) {
					cell.solutionValue = cell.potentialOptions[0];
					this.recalculateRelatedCellPotentials(cell);
					clearedCells.splice(i, 1);

					// Finish for loop to loop back to start
					i = clearedCells.length;
				}

				// No single solutions exist for any cells
				if(i == clearedCells.length - 1) {
					return true;
				}
			}
		}

		return false;
	}

	generate() {
		this.convertCellsToType('creationcell');

		let counter = 0;
		while(counter < 81) {
			let box = Math.floor(counter/9);
			let cellId = counter % 9;

			if(this.settings.difficulty == 'harder') {
				box = (Math.floor(counter/3) % 3) + 3*Math.floor(counter/(9*3));
				cellId = (counter % 3 + 3*Math.floor((counter % (9*3))/9)) ;
			}
			
			const currentCell = this.cells[box][cellId];

			// Check if Cell has been generated yet
			if (!currentCell.hasPotentialOptions() && !currentCell.hasInvalidOptions()) {
				this.calculateCellPotentials(currentCell);

			// Otherwise Check if its been backtracked to
			} else if (currentCell.value != '') {
				currentCell.invalidateAndResetCurrentValue();
			}

			// If it has a potential value, set it randomly
			if (currentCell.hasPotentialOptions()) {
				currentCell.selectRandomPotentialOption();
				counter += 1;

			// Otherwise, backtrack
			} else {
				currentCell.resetOptionArrays();
				counter -= 1;
			}
		}

		this.convertCellsToType('solutioncell');

		counter = 0;
		const scrambledArray = shuffleArray(convertArrayTo1D(this.cells));
		
		scrambledArray.find((cell) => {
			if(this.settings.difficulty === 'easy' && counter > this.constants.maxCounterEasy) {
				return true;
			} else if(this.settings.difficulty === 'medium' && counter > this.constants.maxCounterMedium) {
				return true;
			}

			const lastValue = cell.value;
			cell.setValue();
			if(this.hasMultipleSolutions()) {
				cell.setValue(lastValue);
			} else {
				cell.enable();
				counter += 1;
			}

			return false;
		});

		this.convertCellsToType('gamecell');
		this.started = true;
		return this;
	}

	/**
	* Helper Functions
	**/

	styleCurrentSelection() {
		this.BoardUIManager.removeEffects();

		// darken number buttons that are completed
		this.checkCompletedNumbers().forEach((num) => {
			this.BoardUIManager.styleCompletedNumber(num);
		});

		// If nothing is selected, don't do anything (Must be checked as currentSelection might not be defined)
		if(!this.currentSelection) {

		// If selection is a cell
		} else if(this.currentSelection.type === 'cell') {
			const cell = this.currentSelection.cell;

			// Style related cells
			if(this.settings.highlighting.highlightRelated) {
				this.BoardUIManager.styleRelatedCells(this.CellSubsetter.getAllRelatedCells(this.cells, cell));
			}

			// If the selected cell has a value, also style that number
			if(cell.value !== '') {
				this.BoardUIManager.StyleForSelectedNumber(cell.value);
			}

		// If selection is a number
		} else if(this.currentSelection.type === 'number' && this.currentSelection.number !== '') {

			// grey out cells ands style for the selected number
			if(this.settings.onlyShowValidPositions && !this.disabled) {
				this.BoardUIManager.styleInvalidPositions(this.CellSubsetter.getInvalidCellsByValue(this.cells, this.currentSelection.number));
			}

			this.BoardUIManager.StyleForSelectedNumber(this.currentSelection.number);
		}

		// Highlight errors
		if(this.settings.highlighting.showErrors) {
			this.BoardUIManager.styleErrorCells(this.CellSubsetter.getErrorCells(this.cells));
		}

		// When possible, highlight selected cell
		if(this.currentSelection && this.currentSelection.hasOwnProperty('cell') && this.currentSelection.cell !== null) {
			this.BoardUIManager.styleSelectedCell(this.currentSelection.cell);
		}
	}

	convertCellsToType(newCellType = '') {
		this.cells = this.cells.map((box) => {
			return box.map((cell) => {
				const tempVal = cell.value;
				const wasEnabled = cell.enabled;

				switch(newCellType.toLowerCase()) {
					case 'creationcell': {
						cell = new CreationCell(cell.id);
						cell.setValue(tempVal);
						break;
					}
					case 'solutioncell': {
						cell = new SolutionCell(cell.id);
						cell.setValue(tempVal);
						break;
					}
					case 'gamecell': {
						cell = new GameCell(cell.id);
						cell.setValue(tempVal);
						break;
					}
					default: 
						cell = new Cell(cell.id);
						cell.setValue(tempVal);
				}

				if(wasEnabled) cell.enable();

				return cell;
			});
		});

		return this;
	}
}