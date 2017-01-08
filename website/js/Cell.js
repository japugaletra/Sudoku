class Cell {
	constructor(id) {
		this.id = id;
		this.enabled = false;
		this.$element = $(`#${this.id}`);
		this.value = '';

		let idAsInt = parseInt(String.prototype.substr(id,1),10);

		//Box numbered 0-8
		this.box = Math.floor(idAsInt/10);

		//Cell also numbered 0-8
		this.cellId = idAsInt % 10;

		/**
		*	CellId % 3 to deal with cells being numbered 0-8 left-right, top-bottom
		*	this.box % 3 for similar reasons to above
		*	3*(this.box % 3) to deal with columns greater than 4.
		*	EG: For the top-right cell in the middle square: c42
		*	    We would expect column = 5
		*	    2 % 3 = 2
		*	    4 % 3 = 1
		*	    2 + 3*(1) = 5

		*	Row logic is similar with slight differences
		**/
		this.column = this.cellId % 3 + 3*(this.box % 3);
		this.row = Math.floor(this.cellId/3) + 3*Math.floor(this.box/3);

		return this;
	}

	setValue(val = '') {
		this.value = val;
		$('#'+this.id + ' .penBlock').html(this.value);
		return this;
	}

	click() {
		return this;
	}

	enable() {
		this.enabled = true;
		this.$element.css({
			cursor: 'pointer',
			color: 'rgb(80,80,80)',
		});

		return this;
	}
}