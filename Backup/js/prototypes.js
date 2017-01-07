Array.prototype.shuffle = function() {
	var currentIndex = this.length; //last index + 1
	var randomIndex;
	var tempVal;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random()*currentIndex);

		currentIndex -= 1; //First time, this is now last index.

		tempVal = this[currentIndex];
		this[currentIndex] = this[randomIndex];
		this[randomIndex] = tempVal;
	}

	return this;
}
//[[1,[2,3],4],5]
Array.prototype.To1D = function() {
	var OneDArr = [];
	for(var i = 0; i < this.length; i++) {
		if(this[i].constructor === Array) {
			OneDArr = OneDArr.concat(this[i].To1D());
		} else {
			OneDArr.push(this[i]);
		}
	}
	return OneDArr;
}