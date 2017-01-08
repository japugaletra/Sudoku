class CellSubsetter {
	constructor() {
	
	}

	getColumn(allCells, columnNumber) {
		const columnArray = [];

		for(let cell = 0; cell < 9; cell++) {
			/**
			*	3*(floor(cell/3)) calculates which row the box is in (0,1 or 2)
			*	floor(this.column/3) calculates which column the box is in
			*	EG:
			*		For the top-right cell in the middle square: c42 (column = 5)
			*		We would expect cell Box to be 1, 4 and 7.
			*		For cell = 8
			*		floor(8/3) = 2, 3*2 = 6 + floor(5/3)
			*		floor(5/3) = 1, 6 + 1 = 7
			**/
			const cellBox = 3*(Math.floor(cell/3)) + Math.floor(columnNumber/3);
			/**
			*	cell % 3 because the counters reset every new box, and 3 to a box
			*	3*(cell % 3) to calculate the row's start
			*	this.column % 3 for the horizontal adjustment based on current column.
			*	EG:
			*	For the top-right cell in the middle square: c42 (column = 5)
			*		For cell = 7
			*		We would expect checkCellId to be 5
			*		7 % 3 = 1 * 3 = 3
			*		5 % 3 = 2 + 3 = 5
			**/
			const cellId = 3*(cell % 3) + columnNumber % 3;

			columnArray.push(allCells[cellBox][cellId]);
		}

		return columnArray;
	}

	getRow(allCells, rowNumber) {
		const rowArray = [];

		for(let cell = 0; cell < 9; cell++) {
			/**
			*	Logic similar to getAllColumns.
			*	Differences are that the row is multiplied by 3 instead of the cell
			**/
			const cellBox = Math.floor(cell/3) + 3*(Math.floor(rowNumber/3));
			/**
			*	Logic similar to getAllColumns.
			*	Differences are that the row is multiplied by 3 instead of the cell
			**/
			const cellId = (cell % 3) + 3*(rowNumber % 3);

			rowArray.push(allCells[cellBox][cellId]);
		}

		return rowArray;
	}

	getAllColumns(allCells) {
		const columnsArray = [];

		// For each of the 9 columns
		for(let col = 0; col < 9; col++) {
			columnsArray.push(this.getColumn(allCells,col));
		}

		return columnsArray;
	}

	getAllRows(allCells) {
		const rowsArray = [];

		// For each of the 9 rows
		for(let row = 0; row < 9; row++) {
			rowsArray.push(this.getRow(allCells, row));
		}

		return rowsArray;
	}

	getCellsWithValue(allCells, val) {
		// Check each cell if it has the value
		return convertArrayTo1D(allCells).filter((cell) => {
			if(cell.value === val) return true;
		});
	}

	getCellsWithPencilValue(allCells, val) {
		//Check each cell if it has the pencil value
		return convertArrayTo1D(allCells).filter((cell) => {
			if(cell.pencilNumbers.indexOf(val) !== -1) return true;
		});
	}

	getInvalidCellsByValue(allCells, val) {
		const cellsWithVal = this.getCellsWithValue(allCells, val);
		const invalidCells = this.getFilledCells(allCells);

		cellsWithVal.forEach((referenceCell) => {
			this.getAllRelatedCells(referenceCell).forEach((cell) => {
				if(invalidCells.indexOf(cell) === -1) invalidCells.push(cell);
			});
		});

		return invalidCells;
	}

	getAllRelatedCells(allCells, referenceCell) {
		return [
			allCells[referenceCell.box],
			this.getColumn(allCells, referenceCell.column),
			this.getRow(allCells, referenceCell.row),
		];
	}

	getEmptyCells(allCells) {
		// Check each cell if it is empty
		return convertArrayTo1D(allCells).filter((cell) => {
			if(cell.value === '') return cell;
		});
	}

	getFilledCells(allCells) {
		// Check each cell if it has a value
		return convertArrayTo1D(allCells).filter((cell) => {
			if(cell.value !== '') return cell;
		});
	}

	getErrorCells(allCells) {
		const errorCells = [];

		const groupsToCheck = [
			allCells, 						// All Boxes
			this.getAllColumns(allCells),	// All Columns
			this.getAllRows(allCells),		// All Rows
		];

		groupsToCheck.forEach((group) => {
			group.forEach((cellArray) => {
				for(let num = 1; num <= 9; num++) {
					const cellsWithNum = cellArray.filter((cell) => {
						if(cell.value === num) return true;
					});

					if(cellsWithNum.length > 1) {
						cellsWithNum.forEach((cell) => {
							if(errorCells.indexOf(cell) === -1) errorCells.push(cell);
						});
					}
				}
			});
		});

		return errorCells;
	}
}