/* Global Variables */
function CellController () {
	this.board = [];

	for(var box = 0; box < 9; box++) {
		this.board[box] = [];
		for(var cell = 0; cell < 9; cell++) {
			this.board[box][cell] = new Cell('c'+box.toString()+cell.toString(), this.board);
		}
	}

	this.GenerateBoard = () => {
		this.ConvertAllCellTypes('CreationCell');

		var counter = 0;
		while(counter < 81) {
			var box = Math.floor(counter/9);
			var cellId = counter % 9;
			var currentCell = this.board[box][cellId];

			//Check if Cell has been generated yet
			if (!currentCell.HasInvalidOptions() && !currentCell.HasPotentialOptions()) {
				currentCell.CalculatePotentialOptions();
			//Otherwise Check if its been backtracked to
			} else if (currentCell.value != '') {
				currentCell.InvalidateAndResetValue();
			}

			if (currentCell.HasPotentialOptions()) {
				currentCell.SelectRandomOption();
				counter++;
			} else {
				currentCell.ResetOptionArrays();
				counter--;
			}
		}

		this.ConvertAllCellTypes('Cell');
	}

	this.CreateBlanks = () => {
		var scrambledArray = this.board.To1D().shuffle();

		for(var i = 0; i < scrambledArray.length; i++) {
			var box = scrambledArray[i].box;
			var cellId = scrambledArray[i].cellId;
			lastValue = allCells[box][cellId].value;

			allCells[box][cellId].clearValue();
			if(CountSolutions(allCells) > 1) {
				allCells[box][cellId].setValue(lastValue);
			} else {
				allCells[box][cellId].enable();
			}
		}
	}

	

	// function CountSolutions(allCells) {
	// 	ConvertAllCells(allCells,'solutioncell');
	// 	var solutionCells = allCells.To1D();
	// 	var clearedCells = [];

	// 	for(var i = 0; i < solutionCells.length; i++) {
	// 		var box = solutionCells[i].box;
	// 		var cellId = solutionCells[i].cellId;
	// 		allCells[box][cellId].CalculatePotentialOptions();

	// 		if(allCells[box][cellId].value == '') {
	// 			clearedCells.push(allCells[box][cellId]);
	// 		}
	// 	}

	// 	return LoopSolutions(solutionCells, clearedCells);
	// }

	// function LoopSolutions(solutionCells, clearedCells) {
	// 	while(clearedCells.length > 0) {
	// 		for(var i = 0; i < clearedCells.length; i++) {
	// 			var box = clearedCells[i].box;
	// 			var cellId = clearedCells[i].cellId;

	// 			if(allCells[box][cellId].potentialOptions.length == 1) {
	// 				var solutionId = box*9+cellId;
	// 				solutionCells[solutionId].solutionValue = allCells[box][cellId].potentialOptions[0];
	// 				solutionCells[solutionId].RecalculateRelatedSolutions();
	// 				clearedCells.splice(i,1);
	// 				i = clearedCells.length;
	// 			}

	// 			if(i == clearedCells.length - 1) {
	// 				return 2;
	// 			}
	// 		}
			
	// 	}
	// 	return 1;
	// }

	this.ConvertAllCellTypes = (newCellType) => {
		newCellType = newCellType || '';
		for(var box = 0; box < 9; box++) {
			for(var cell = 0; cell < 9; cell++) {
				switch(newCellType.toLowerCase()) {
					case 'creationcell':
						this.board[box][cell] = this.board[box][cell].ToCreationCell();
						break;
					case 'solutioncell':
						this.board[box][cell] = this.board[box][cell].ToSolutionCell();
						break;
					default:
						this.board[box][cell] = this.board[box][cell].ToCell();
						break;
				}
			}
		}
	}
}

allCells = [];

function Cell (id, allCells) {
	this.id = id;
	this.allCells = allCells;
	this.enabled = false;
	
	this.element = $("#"+this.id);


	this.value = '';
	var idAsInt = parseInt(String.substr(id,1));
	//Box numbered 0-8
	this.box = Math.floor(idAsInt/10);
	//Cell also numbered 0-8
	this.cellId = idAsInt % 10;
	/*
		CellId % 3 to deal with cells being numbered 0-8 left-right, top-bottom
		this.box % 3 for similar reasons to above
		3*(this.box % 3) to deal with columns greater than 4.
		EG: For the top-right cell in the middle square: c42
		    We would expect column = 5
		    2 % 3 = 2
		    4 % 3 = 1
		    2 + 3*(1) = 5

		Row logic is similar with slight differences
	*/
	this.column = this.cellId % 3 + 3*(this.box % 3);
	this.row = Math.floor(this.cellId/3) + 3*Math.floor(this.box/3);

	this.setValue = (val) => {
		this.value = val;
		this.element.html(this.value);
	}

	this.clearValue = () => {
		this.value = '';
		this.element.html(this.value);
	}

	this.click = () => {

	}

	this.enable = () => {
		this.element.css({
			"cursor":'pointer'
		});

		this.element.click(this.click);
	}

	this.ToCell = () => {
		var returnCell = new Cell(this.id, this.allCells);
		returnCell.setValue(this.value);

		return returnCell;
	}

	this.ToCreationCell = () => {
		var returnCell = new CreationCell(this.id, this.allCells);
		returnCell.setValue(this.value);

		return returnCell;
	}

	this.ToSolutionCell = () => {
		var returnCell = new SolutionCell(this.id, this.allCells);
		returnCell.setValue(this.value);

		return returnCell;
	}
}

function AdvancedCell (id, allCells) {
	Cell.call(this, id, allCells);

	this.potentialOptions = [];
	this.invalidOptions = [];

	this.HasPotentialOptions = () => {
		if(this.potentialOptions.length > 0)
			return true;
		return false;
	}

	this.HasInvalidOptions = () => {
		if(this.invalidOptions.length > 0)
			return true;
		return false;
	}

	this.CalculatePotentialOptions = () => {
		for(var val = 1; val <= 9; val++) {
			if(this.CheckIfOptionIsValid(val)) {
				this.potentialOptions.push(val);
			} else {
				this.invalidOptions.push(val);
			}
		}
	};

	this.CheckIfOptionIsValid = (val) => {
		//Check Current Box for validity
		for(var cell = 0; cell < 9; cell++) {
			if(cell != this.cellId) {
				if(this.allCells[this.box][cell].value == val) {
					return false;
				}
			}
		}

		//Check Current Column for validity
		for(var cell = 0; cell < 9; cell++) {
			/*
				3*(floor(cell/3)) calculates which row the box is in (0,1 or 2)
				floor(this.column/3) calculates which column the box is in
				EG:
					For the top-right cell in the middle square: c42 (column = 5)
					We would expect cell Box to be 1, 4 and 7.
					For cell = 8
					floor(8/3) = 2, 3*2 = 6 + floor(5/3)
					floor(5/3) = 1, 6 + 1 = 7
			*/
			var checkCellBox = 3*(Math.floor(cell/3)) + Math.floor(this.column/3);
			/*
				cell % 3 because the counters reset every new box, and 3 to a box
				3*(cell % 3) to calculate the row's start
				this.column % 3 for the horizontal adjustment based on current column.
				EG:
				For the top-right cell in the middle square: c42 (column = 5)
					For cell = 7
					We would expect checkCellId to be 5
					7 % 3 = 1 * 3 = 3
					5 % 3 = 2 + 3 = 5
			*/
			var checkCellId = 3*(cell % 3) + this.column % 3;
			if(checkCellId != this.cellId || checkCellBox != this.box) {
				if(this.allCells[checkCellBox][checkCellId].value == val) {
					return false;
				}
			}
		}

		//Check Current Row for validity
		for(var cell = 0; cell < 9; cell++) {
			//checkCellBox is similar to previous with small changes
			var checkCellBox = Math.floor(cell/3) + 3*(Math.floor(this.row/3));
			//checkCellId is similar to previous with small changes
			var checkCellId = (cell % 3) + 3*(this.row % 3);
			if(checkCellId != this.cellId || checkCellBox != this.box) {
				if(this.allCells[checkCellBox][checkCellId].value == val) {
					return false;
				}
			}
		}
		//All validity confirmed
		return true;
	};

	this.InvalidateAndResetValue = () => {
		var currentIndex = this.potentialOptions.indexOf(this.value);

		if(currentIndex != -1) {
			this.potentialOptions.splice(currentIndex,1);
		}

		this.value = '';
	}

	this.ResetOptionArrays = () => {
		this.invalidOptions = [];
		this.potentialOptions = [];
	}
}

function CreationCell (id, allCells) {
	//Inherents from Cell
	AdvancedCell.call(this, id, allCells);

	this.SelectRandomOption = () => {
		/*
			Generates a random number between 1 and 9:
			random*9 gives double between 0 and 9 (exclusive), floored to be 0-8 inclusive + 1
		*/
		if(this.potentialOptions.length > 0) {
			var randIndex = Math.floor(this.potentialOptions.length*Math.random());
			this.setValue(this.potentialOptions[randIndex]);
		} else {
			this.clearValue();
		}
	}
}

function SolutionCell (id, allCells) {
	AdvancedCell.call(this, id, allCells);
	this.solutionValue = this.value;
	//Nothing here yet

	this.RecalculateRelatedSolutions = () => {
		//Check Current Box for validity
		for(var cell = 0; cell < 9; cell++) {
			if(cell == this.cellId) continue;

			if(this.allCells[this.box][cell].potentialOptions.indexOf(this.solutionValue) != -1) {
				var idx = this.allCells[this.box][cell].potentialOptions.indexOf(this.solutionValue);
				this.allCells[this.box][cell].potentialOptions.splice(idx,1);
				this.allCells[this.box][cell].invalidOptions.push(this.solutionValue);
			}
		}

		//Check Current Column for validity
		for(var cell = 0; cell < 9; cell++) {
			/*
				3*(floor(cell/3)) calculates which row the box is in (0,1 or 2)
				floor(this.column/3) calculates which column the box is in
				EG:
					For the top-right cell in the middle square: c42 (column = 5)
					We would expect cell Box to be 1, 4 and 7.
					For cell = 8
					floor(8/3) = 2, 3*2 = 6 + floor(5/3)
					floor(5/3) = 1, 6 + 1 = 7
			*/
			var checkCellBox = 3*(Math.floor(cell/3)) + Math.floor(this.column/3);
			/*
				cell % 3 because the counters reset every new box, and 3 to a box
				3*(cell % 3) to calculate the row's start
				this.column % 3 for the horizontal adjustment based on current column.
				EG:
				For the top-right cell in the middle square: c42 (column = 5)
					For cell = 7
					We would expect checkCellId to be 5
					7 % 3 = 1 * 3 = 3
					5 % 3 = 2 + 3 = 5
			*/
			var checkCellId = 3*(cell % 3) + this.column % 3;
			if(checkCellId != this.cellId || checkCellBox != this.box) {
				if(this.allCells[checkCellBox][checkCellId].potentialOptions.indexOf(this.solutionValue) != -1) {
					var idx = this.allCells[checkCellBox][checkCellId].potentialOptions.indexOf(this.solutionValue);
					this.allCells[checkCellBox][checkCellId].potentialOptions.splice(idx,1);
					this.allCells[checkCellBox][checkCellId].invalidOptions.push(this.solutionValue);
				}
			}
		}

		//Check Current Row for validity
		for(var cell = 0; cell < 9; cell++) {
			//checkCellBox is similar to previous with small changes
			var checkCellBox = Math.floor(cell/3) + 3*(Math.floor(this.row/3));
			//checkCellId is similar to previous with small changes
			var checkCellId = (cell % 3) + 3*(this.row % 3);
			if(checkCellId != this.cellId || checkCellBox != this.box) {
				if(this.allCells[checkCellBox][checkCellId].potentialOptions.indexOf(this.solutionValue) != -1) {
					var idx = this.allCells[checkCellBox][checkCellId].potentialOptions.indexOf(this.solutionValue);
					this.allCells[checkCellBox][checkCellId].potentialOptions.splice(idx,1);
					this.allCells[checkCellBox][checkCellId].invalidOptions.push(this.solutionValue);
				}
			}
		}
	}
}

function generate () {
	allCells = [];
	for(var box = 0; box < 9; box++) {
		allCells[box] = [];

		for(var cell = 0; cell < 9; cell++) {
			allCells[box][cell] = new CreationCell('c'+box.toString()+cell.toString(), allCells);
		}
	}

	var counter = 0;
	while(counter < 81) {
		var box = Math.floor(counter/9);
		var cellId = counter % 9;
		var currentCell = allCells[box][cellId];

		if (currentCell.invalidOptions.length == 0 && !currentCell.HasPotentialOptions()) {
			currentCell.CalculatePotentialOptions();
		} else if (currentCell.value != '') {
			currentCell.InvalidateAndResetValue();
		}

		if (currentCell.HasPotentialOptions()) {
			currentCell.SelectRandomOption();
			counter++;
		} else {
			currentCell.ResetOptionArrays();
			counter--;
		}
	}

	ConvertAllCells(allCells);

	var lastValue = '';

	var scrambledArray = allCells.To1D().shuffle();

	for(var i = 0; i < scrambledArray.length; i++) {
		var box = scrambledArray[i].box;
		var cellId = scrambledArray[i].cellId;
		lastValue = allCells[box][cellId].value;

		allCells[box][cellId].clearValue();
		if(CountSolutions(allCells) > 1) {
			allCells[box][cellId].setValue(lastValue);
		} else {
			allCells[box][cellId].enable();
		}
	}

	ConvertAllCells(allCells);
}

// function CountSolutions() {
// 	var clearedCells = [];
// 	for(var box = 0; box < 9; box++) {
// 		for(var cell = 0; cell < 9; cell++) {
// 			if(allCells[box][cell].value == '') {
// 				clearedCells.push(allCells[box][cell]);
// 			}
// 		}
// 	}
// 	for(var i = 0; i < clearedCells.length; i++) {
// 		clearedCells[i] = new CreationCell(clearedCells[i].id, allCells);
// 	}

// 	return CheckForSolutions(clearedCells);
// }

// function CheckForSolutions(clearedCells) {
// 	var solutions = 0;
// 	clearedCells[0].CalculatePotentialOptions();

// 	if(clearedCells.length == 1) return clearedCells[0].potentialOptions.length;

// 	for(var i = 0; i < clearedCells[0].potentialOptions.length; i++) {
// 		clearedCells[0].value = clearedCells[0].potentialOptions[i];
// 		solutions += CheckForSolutions(clearedCells.slice(1));
// 		if(solutions > 1) {
// 			break;
// 		}
// 	}
// 	return solutions;
// }

function CountSolutions(allCells) {
	ConvertAllCells(allCells,'solutioncell');
	var solutionCells = allCells.To1D();
	var clearedCells = [];

	for(var i = 0; i < solutionCells.length; i++) {
		var box = solutionCells[i].box;
		var cellId = solutionCells[i].cellId;
		allCells[box][cellId].CalculatePotentialOptions();

		if(allCells[box][cellId].value == '') {
			clearedCells.push(allCells[box][cellId]);
		}
	}

	return LoopSolutions(solutionCells, clearedCells);
}

function LoopSolutions(solutionCells, clearedCells) {
	while(clearedCells.length > 0) {
		for(var i = 0; i < clearedCells.length; i++) {
			var box = clearedCells[i].box;
			var cellId = clearedCells[i].cellId;

			if(allCells[box][cellId].potentialOptions.length == 1) {
				var solutionId = box*9+cellId;
				solutionCells[solutionId].solutionValue = allCells[box][cellId].potentialOptions[0];
				solutionCells[solutionId].RecalculateRelatedSolutions();
				clearedCells.splice(i,1);
				i = clearedCells.length;
			}

			if(i == clearedCells.length - 1) {
				return 2;
			}
		}
		
	}
	return 1;
}

function ConvertAllCells(allCells, cellType) {
	cellType = cellType || '';
	for(var box = 0; box < 9; box++) {
		for(var cell = 0; cell < 9; cell++) {
			switch(cellType.toLowerCase()) {
				case 'creationcell':
					allCells[box][cell] = allCells[box][cell].ToCreationCell();
					break;
				case 'solutioncell':
					allCells[box][cell] = allCells[box][cell].ToSolutionCell();
					break;
				default:
					allCells[box][cell] = allCells[box][cell].ToCell();
					break;
			}
		}
	}
}
