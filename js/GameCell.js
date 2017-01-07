class GameCell extends AdvancedCell {
	constructor(id) {
		super(id);
		this.pencilNumbers = [];

		return this;
	}

	clearPencilNumbers() {
		this.pencilNumbers = [];
		$('#'+this.id+' .pencilBlock').html('');
	}

	pencilNumberArray(arr) {
		arr.forEach((num) => {
			this.addPencil(num);
		});
	}

	setValue(val = '') {
		this.value = val;
		$('#'+this.id + ' .penBlock').html(this.value);

		this.pencilNumbers = [];
		$('#'+this.id+' .pencilBlock').html('');

		return this;

	}

	togglePencil(number) {
		if(this.value !== '') return this;

		const indexOfNum = this.pencilNumbers.indexOf(number);
		if(indexOfNum === -1) this.addPencil(number);
		else this.removePencil(number);

		return this;
	}

	addPencil(number) {
		if(this.value !== '') return this;

		const indexOfNum = this.pencilNumbers.indexOf(number);
		if(indexOfNum === -1) {
			this.pencilNumbers.push(number);
			$('#'+this.id+' .p'+number).html(number);
		}

		return this;
	}

	removePencil(number) {
		if(this.value !== '') return this;

		const indexOfNum = this.pencilNumbers.indexOf(number);
		if(indexOfNum !== -1) {
			this.pencilNumbers.splice(indexOfNum,1);
			$('#'+this.id+' .p'+number).html('');
		}

		return this;
	}
}