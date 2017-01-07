class CreationCell extends AdvancedCell {
	selectRandomPotentialOption() {
		if(this.hasPotentialOptions()) {
			this.setValue(getRandomValueFromArray(this.potentialOptions));
		} else {
			this.clearValue();
		}

		return this;
	}

	invalidateAndResetCurrentValue() {
		let currentIndex = this.potentialOptions.indexOf(this.value);

		if(currentIndex !== -1) {
			this.potentialOptions.splice(currentIndex,1);
		}

		this.value = '';

		return this;
	}
}