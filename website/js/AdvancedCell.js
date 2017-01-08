class AdvancedCell extends Cell {
	constructor(id) {
		super(id);

		this.potentialOptions = [];
		this.invalidOptions = [];

		return this;
	}

	hasPotentialOptions() {
		return (this.potentialOptions.length > 0);
	}

	hasInvalidOptions() {
		return (this.invalidOptions.length > 0);
	}

	resetOptionArrays() {
		this.potentialOptions = [];
		this.invalidOptions = [];

		return this;
	}
}