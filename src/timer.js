var timer = {
	countDown: 300000,//300000; //Default time is 5:00
	startTime: 0, //time when start is.
	started: 0, //Boolean to check if timer is running
	interval: 0, //The interval variable, needed to stop inverval
	timeLeft: function (){
	  if(this.started) this.countDown = this.startTime-Date.now();
		var  countDown = this.countDown;
		var timerSeconds = Math.round(countDown/1000);
		var countDownMinutes = Math.floor(timerSeconds/60);
		var countDownSeconds = timerSeconds%60;
		if(countDownSeconds===0);//vibrate
		if(countDownSeconds<10)countDownSeconds = "0"+countDownSeconds;
		
		
		//distanceToStart = dtl(lonRCB,latRCB,lonPIN,latPIN,position.lon,position.lat);
		
		if(countDown<=100) return "racing";
		else return countDownMinutes+":"+countDownSeconds;
	},
	up: function (){
		if(this.started)this.startTime += 60000;
		else this.countDown += 60000;
		this.timeLeft();
	},
	down: function(){
		if(this.started)this.startTime -= 60000;
		else this.countDown -= 60000;
		this.timeLeft();		
	},
	start: function(){
		if(this.started){
			//clearInterval(this.interval);
		}else{
			console.log("Timer Started");
			this.started = 1;
		}
		this.startTime = Date.now()+this.countDown;
	},
	sync: function(){
		var minutes = Math.round(this.countDown/1000/60);
		this.countDown = minutes*60*1000;
		this.startTime = Date.now()+this.countDown;
		
		this.start();
		this.timeLeft();
	},
	reset: function(){
		this.started = 0;
		this.countDown = 300000;
		this.timeLeft();
	},
	startRace: function (){
			
			//this.unix2Time(Date.now());//LOG START TIME 
			/*distanceToStart = dtl(lonRCB,latRCB,lonPIN,latPIN,position.lon,position.lat);;//Log distance left
			
			console.log(distanceToStart+"m DTL on start");
			if(distanceToStart<0){
				logDiv("OCS "+distanceToStart+"m");
			}else{
				logDiv("CLEAR "+distanceToStart+"m");
			}
			*/
			//timer.reset();
			//Show dashboard
	},
	unix2Time: function(timestamp){
			var date = new Date(timestamp);
		var hours = date.getHours();
		var minutes = "0" + date.getMinutes();
		var seconds = "0" + date.getSeconds();
		return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
		
	}
};

this.exports = timer;