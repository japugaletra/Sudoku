class Timer {
	constructor() {
		this.$timer = $('#timer');
		this.startTime = new Date();

		this.interval = window.setInterval(() => {
			this.updateTimer();
		},1000);
	}

	stop() {
		window.clearInterval(this.interval);
		this.stopTime = new Date();
		this.timeElapsed = this.stopTime.valueOf() - this.startTime.valueOf();
	}

	start() {
		this.startTime.setTime(Date.now() - this.timeElapsed);
		this.interval = window.setInterval(() => {
			this.updateTimer();
		},1000);
	}

	updateTimer() {
		const timeDifference = new Date(Date.now() - this.startTime.valueOf());
		let seconds = timeDifference.getSeconds();
		let minutes = timeDifference.getMinutes();
		if(seconds < 10) seconds = '0' + String(seconds);
		if(minutes < 10) minutes = '0' + String(minutes);
		this.$timer.html(minutes+':'+seconds);
	}
}