var sailing = {
	smoothFactor: 3,
	tempArray: [],//Storing the speeds and headings
	tempArrayLength: 30,//30 seconds to register shifts
	TWD: -1,//True WindDirection
	referenceWind:-2, //Base for the reference
	leg: "",//Upwind and downdown
	tack: "",//Port (Bakboord), (starboard);
	upwindPort: -1, //Base value for heading of legs. Set at first table course after tack
	upwindStb: -1,
	downwindPort: -1,
	downwindStb: -1,
	steady: 0,
  racing:0,
	steadyCourseInterval: 10,
  shift: 0,
  shiftAlert: 4,
	upwindMarks: [],
	downwindMarks: [],
	layLine:999,
  alert:{title:false},
	computePosition: function(position){
  		
  	//Update the temporay array
  	var heading = position.coords.heading;
  	var speed = position.coords.speed;
  	
  	
  	//store the complete object in the tempArray and log
  	this.tempArray.unshift(position);
  	this.tempArray[0].timestamp = position.timestamp;
  	this.tempArray[0].lat = position.coords.latitude;
  	this.tempArray[0].lon = position.coords.longitude;
  	this.tempArray[0].speed = speed;
  	this.tempArray[0].heading = heading;
  	
  	var arrayLength = this.tempArray.length;
  	if(arrayLength>this.tempArrayLength){
  		this.tempArray.pop();
  		arrayLength--;
  	}
  	
  		
  	var xHeading = 0;
  	var yHeading = 0;
  	
  	//Used in loop an needed later
  	var i =0;
  	var speedSmooth = 0;
  	var speedAverage = 0;
  	var headingAverage = 0;
  	var headingSmooth = 0;
  	for(i=0;i<arrayLength;i++){
  		speed += this.tempArray[i].speed;
  		
  		xHeading += Math.cos(this.tempArray[i].heading*0.0174532);
  		yHeading += Math.sin(this.tempArray[i].heading*0.0174532);
  		
  		if(i==this.smoothFactor-1 || i==arrayLength-1){
  			speedSmooth = (speed/(i+1)*1.943).toFixed(1);
  			this.tempArray[0].speedSmooth = speedSmooth;
  			
  			headingSmooth = Math.round(Math.atan2(yHeading,xHeading)*57.295779);
  			if(headingSmooth<0)headingSmooth+=360;
  			this.tempArray[0].headingSmooth = headingSmooth;
  		}
  		
  		if(i==this.steadyCourseInterval-1 || i==arrayLength-1){
  			speedAverage = (speed/(i+1)*1.943).toFixed(1);
  			this.tempArray[0].speedAverage = speedAverage;
  			
  			headingAverage = Math.round(Math.atan2(yHeading,xHeading)*57.295779);
  			if(headingAverage<0)headingAverage+=360;
  			this.tempArray[0].headingAverage = headingAverage;
  			break;
  		}
  		
  	}
    this.tempArray[0].speedVariance = (speedSmooth - this.tempArray[arrayLength-1].speedAverage).toFixed(1);
    
  			//Are we on steadyCoursee???
    var diffHeading = 0;
  	if(this.steadyCourseInterval<arrayLength){
  
  		diffHeading = Math.abs(((this.tempArray[2].headingAverage - headingSmooth + 180 + 360 ) % 360 ) - 180);
      //var diffSpeed = speedSmooth / this.tempArray[this.steadyCourseInterval-1].speedAverage;      

      //If the course is altered or the speed drops by 30%, stop steady count.
  		if(diffHeading>8&&speedSmooth>2)this.steady = 0;
  		else this.steady++;
      this.tempArray[0].steadyCourse = this.steady;
  	}  
  		
  	//Determine angle to wind to know if we are sailing updwin, downwind, port or starboard	
    var angleToWind = 0;
    if(this.TWD<0){
      angleToWind =  ( headingSmooth - this.referenceWind + 180 + 360 ) % 360 - 180;
    }else{
    	angleToWind =  ( headingSmooth - this.TWD + 180 + 360 ) % 360 - 180;

    }
  	var tack = "";
  	if(angleToWind<0)tack = "stbd"; //wind blowing on starboard
  	else tack = "port";

    if(this.tack != tack){ 
      setTimeout(function(){this.analyseTack();},20000);
    }
    this.tack = tack;
    
  	this.tempArray[0].tack = tack;
  	
  	var leg = "";
  	if(Math.abs(angleToWind)<80)leg = "upwind";
  	else if(Math.abs(angleToWind)>100) leg = "downwind";
  	else leg = this.leg;//Same as previous;
  	//else the previous is used as well.
    this.leg = leg;
  	this.tempArray[0].leg = leg;
  	
    
    
  	//TACK DETECT
    if(sailing.racing){
    	if(leg=="upwind"&&tack=="port"&&this.steady) this.upwindPort = headingAverage; //Base value for heading of legs. Set at first table course after tack
    	if(leg=="upwind"&&tack=="stbd"&&this.steady) this.upwindStb = headingAverage;
    	if(leg=="downwind"&&tack=="port"&&this.steady)  this.downwindPort = headingAverage;
    	if(leg=="downwind"&&tack=="stbd"&&this.steady)  this.downwindStb = headingAverage;
    }
	//Upwind downwind detect plus marks
  	if(this.racing&&arrayLength==this.tempArrayLength && leg!=this.tempArray[1].leg){
  		console.log("GOING "+leg);
		this.findMark(this.tempArray[1].leg);
  		
  	}
    
  	//layline
	  if(this.racing)this.layLineDistance();
  	//Calc True Wind Direction
  	if(this.racing&&this.steady&&leg=="upwind"&&this.upwindStb>=0&&this.upwindPort>=0){
  		var diff = ( ( this.upwindPort - this.upwindStb + 180 + 360 ) % 360 ) - 180;
      var TWD = Math.round(Math.abs(360 + this.upwindStb + ( diff / 2 ) ) % 360);
  		
      if(this.TWD<0)this.referenceWind = TWD;
      this.TWD = TWD;
      this.tempArray[0].TWD = this.TWD;
  	}else{
      this.tempArray[0].TWD = this.referenceWind;
    }
    
  
  	//Calc Shifts
    var shift = 0;
  	if(diffHeading<this.shiftAlert&&this.referenceWind>=0&&this.racing&&this.TWD>=0){
  		shift = Math.round(((this.TWD - this.referenceWind + 180 + 360)%360)-180);
      if(Math.abs(shift)>=this.shiftAlert&&Math.abs(shift)>Math.abs(this.shift)){
        var alertText = "";
        if((tack=="port"&&shift<0)||(tack=="stb"&&shift>0))alertText = "Lifter";
        else alertText = "Lifter";

        this.alert.title = alertText;
        this.alert.text = shift;
        this.alert.timeout = 5000;
        this.alert.timestamp = this.tempArray[0].timestamp;

        this.tempArray[0].shift = shift;
        this.shift = shift;
      }
  	}
    
  	
  	//Speed variance
    this.tempArray[0].shift = shift;
  	return this.tempArray[0];
	},
  adjustReferenceWind: function(x){
    
    var direction = (this.referenceWind+x)%360;
    if(direction<0) direction+=360;
		this.referenceWind = direction; 
	},
  resetAngles: function(){
    this.TWD = -1;
    this.upwindPort = -1; //Base value for heading of legs. Set at first table course after tack
  	this.upwindStb = -1;
  	this.downwindPort = -1;
    this.downwindStb = -1;
    
  },
  findMark: function(mark){
	  
	  //console.log(this.tempArray);
	  //Finding marks where we steered 10 degrees downwind to average angle
	  console.log("finding mark: "+mark);
	  var j = 0;
	  if(mark=="upwind"){//find upwind mark
		  for(var j;j<this.tempArray.length;j++){
        
			  var diffStb =  Math.abs(( this.upwindStb - this.tempArray[j].headingSmooth + 180 + 360 ) % 360 - 180);
			  var diffPort =  Math.abs(( this.upwindPort - this.tempArray[j].headingSmooth + 180 + 360 ) % 360 - 180);
			  if((diffStb<10||diffPort<10)&&this.tempArray[29].leg=="upwind"){
				  //console.log(this.upwindStb+" "+this.tempArray[j].headingSmooth+" "+diffStb+" "+diffPort);
				  console.log("Upwind mark!!("+j+")"+this.tempArray[j].lat,this.tempArray[j].lon);
				  this.alert = {title:"MARK",text:"upwind",timeout:5000};
				  this.upwindMarks.unshift({lat:this.tempArray[j].lat,lon:this.tempArray[j].lon,timestamp:this.tempArray[j].timestamp});
				  break;
			  }
		  }
	  } else{
		for(var j;j<this.tempArray.length;j++){
			if(this.tempArray[j].leg=="downwind"&&this.tempArray[5].leg=="downwind"&&this.tempArray[15].leg=="downwind"&&this.tempArray[29].leg=="downwind"){
				console.log("downwind mark:  "+this.tempArray[j].lat,this.tempArray[j].lon);
				this.alert = {title:"MARK",text:"downwind",timeout:5000};
				this.downwindMarks.unshift({lat:this.tempArray[j].lat,lon:this.tempArray[j].lon,timestamp:this.tempArray[j].timestamp});
				break;
			}
		}
			  
	  } 

	  
	  //Check bearing to RCB is approx same as Wind direction???
  },
  layLineDistance: function(){
    var bearing = 0;
    var distance = 0;
    var diffHeading = 0;
    
	  if(this.leg=="upwind"&&typeof this.upwindMarks[0] != 'undefined'){
		  bearing = this.bearing(this.tempArray[0].lat,this.tempArray[0].lon,this.upwindMarks[0].lat,this.upwindMarks[0].lon);
		  distance = this.distance(this.tempArray[0].lat,this.tempArray[0].lon,this.upwindMarks[0].lat,this.upwindMarks[0].lon);
		  if(this.tack=="port"){
			  diffHeading = bearing - this.upwindStb*0.0174532;
			  this.layLine = Math.round(Math.sin(diffHeading)*distance);
		  }else{
			  diffHeading = this.upwindPort*0.0174532 -bearing;
			  this.layLine = Math.round(Math.sin(diffHeading)*distance);
		  }
		  
	  }

  	if(this.leg=="downwind"&&typeof this.downwindMarks[0] != 'undefined'){
		  bearing = this.bearing(this.tempArray[0].lat,this.tempArray[0].lon,this.downwindMarks[0].lat,this.downwindMarks[0].lon);
		  distance = this.distance(this.tempArray[0].lat,this.tempArray[0].lon,this.downwindMarks[0].lat,this.downwindMarks[0].lon);
  		if(this.tack=="port"){
  			  diffHeading = this.downwindStb*0.0174532 - bearing;
  			  this.layLine = Math.round(Math.sin(diffHeading)*distance);
  		  }else{
  			  diffHeading = bearing - this.downwindPort*0.0174532;
  			  this.layLine = Math.round(Math.sin(diffHeading)*distance);
  		  }
	  }
    
    if(this.layLine<100)this.alert = {title:"Layline",text:this.layLine+"m",timeout:5000};
  	
  },
  bearing: function(lat1,lon1,lat2,lon2){
		var startLat = lat1*0.0174532;
		var startLong = lon1*0.0174532;
		var endLat = lat2*0.0174532;
		var endLong = lon2*0.0174532;

		var dLong = endLong - startLong;

		var dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
		if (Math.abs(dLong) > Math.PI){
			if 	(dLong > 0.0)dLong = -(2.0 * Math.PI - dLong);
			else dLong = (2.0 * Math.PI + dLong);
			}

		return Math.atan2(dLong, dPhi);
	},
	distance: function(lat1,lon1,lat2,lon2){
	  var dLat = 111111*(lat2-lat1); 
	  var dLon = 111111*(lon2-lon1); 
	  return Math.round(Math.sqrt(Math.pow(dLat, 2)+Math.pow(dLon, 2)),0);
	},
  analyseTack: function(){
    
    var tackAngle = Math.abs(((this.tempArray[this.tempArrayLength-1].headingAverage - this.tempArray[0].headingAverage + 180 + 360 ) % 360 ) - 180);
    this.alert = {
      title:"TACK",
      text:tackAngle+"°",
      timeout: 5000,
      timestamp: this.tempArray[0].timestamp
    };
    //var overSteer = 0;
    //var distanceLost = 0;
    
  }
};

this.exports = sailing;