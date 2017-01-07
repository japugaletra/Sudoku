const shuffleArray = (arr) => {
	let currentIndex = arr.length; //last index + 1
	let randomIndex;
	let tempVal;

	while (0 !== currentIndex) {
		randomIndex = Math.floor(Math.random()*currentIndex);

		currentIndex -= 1; //First time, this is now last index.

		tempVal = arr[currentIndex];
		arr[currentIndex] = arr[randomIndex];
		arr[randomIndex] = tempVal;
	}

	return arr;
}

const floorToDecimal = (number, decimals) => {
	return Math.floor(number*Math.pow(10,decimals))/Math.pow(10,decimals);
}

const convertArrayTo1D = (arr) => {
	let OneDArr = [];

	arr.forEach((val, idx) => {
		if(val.constructor === Array) {
			OneDArr = OneDArr.concat(convertArrayTo1D(val));
		} else {
			OneDArr.push(val);
		}

	});

	return OneDArr;
}

const getRandomValueFromArray = (arr) => {
	let length = arr.length;
	let randomIndex = Math.floor(Math.random()*length);

	return arr[randomIndex];
}

const zerosArray = (elements) => {
	const newArray = [];
	for(let i = 0; i < elements; i++) newArray[i] = 0;
	return newArray;
}