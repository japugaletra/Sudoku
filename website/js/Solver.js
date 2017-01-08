class Solver {
	constructor(parent) {
		this.parent = parent;
	}

	hasMultipleSolutions(cellsArray) {
		const clearedCells = [];

		convertArrayTo1D(this.cells).forEach((cell) => {
			if(cell.value === '') {
				clearedCells.push(cell);
				this.calculateCellPotentials(cell);
			}
		});

		return this.checkMultipleSolutions(clearedCells);
	}

	calculateCellPotentials(referenceCell) {
		// Reset Arrays
		referenceCell.resetOptionArrays();

		// Check numbers 1-9 (allowed inputs)
		for(let val = 1; val <= 9; val++) {

			// If Value is allowed, add to potentialOptions, otherwise add to invalidOptions
			if(this.parent.isValueAllowedInCell(referenceCell, val)) {
				referenceCell.potentialOptions.push(val);
			} else {
				referenceCell.invalidOptions.push(val);
			}
		}

		return this;
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

	recalculateRelatedCellPotentials(referenceCell) {
		//cellGroups: Box, Column and Row of referenceCell
		const cellGroupsToCheck = this.parent.getAllRelatedCells(referenceCell);

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
}