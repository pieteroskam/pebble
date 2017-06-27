var sailing = {
	smoothFactor: 3,
	steadyCourseInterval: 10,
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
	
	upwindSpeed:0,
	upwindPoints:0,
	downwindSpeed:0,
	downwindPoints:0,
	
	steady: 0,
  racing:0,
	
  shift: 0,
  shiftAlert: 4,
	markAlert:1,
	tackAlert:1,
	laylineAlert:1,
	showShiftAlert:1,
	
	navigation:1,//If the user wants navigation for marks and laylines
	upwindMarks: [],
	downwindMarks: [],
	layLine:{distance:999,angle:0,close:0},
	
	playBackSpeed:1,
	
	distanceSailed:0,
	
	legs:[],
	
	
  alert:{title:false},
	computePosition: function(position){
  		
  	//Update the temporay array
  	var heading = position.coords.heading;
  	var speed = parseFloat(position.coords.speed);
  	
  	
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
		
		
		//Calculating total distance sailed
		//if(arrayLength>1)this.tempArray[0].distanceSailed = this.distance(this.tempArray[0],this.tempArray[1]);
  		
  	var xHeading = 0;
  	var yHeading = 0;
  	
  	//Used in loop an needed later
  	var i =0;
  	var speedSmooth = 0;
  	var headingAverage = 0;
  	var headingSmooth = 0;
		//Loop the temparray to compute average heading and speed
  	for(i=0;i<arrayLength;i++){
  		if(i<this.smoothFactor){
				speedSmooth += this.tempArray[i].speed;
			}
			
					
		if(this.tack==this.tempArray[i].tack && this.leg==this.tempArray[i].leg){
			xHeading += Math.cos(this.tempArray[i].heading*0.0174532);
			yHeading += Math.sin(this.tempArray[i].heading*0.0174532);
		}
			
  		if(i==this.smoothFactor-1){//Dont give errors when array is not long enough
  			speedSmooth = (speedSmooth/this.smoothFactor*1.943);
  			headingSmooth = Math.round(Math.atan2(yHeading,xHeading)*57.295779);
  			if(headingSmooth<0)headingSmooth+=360;  		
  		}  		
  	}
	this.tempArray[0].speedSmooth = speedSmooth;	
	this.tempArray[0].headingSmooth = headingSmooth;
   
	headingAverage = Math.round(Math.atan2(yHeading,xHeading)*57.295779);
	if(headingAverage<0)headingAverage+=360;
	this.tempArray[0].headingAverage = headingAverage;
    
  		//Are we on steadyCoursee??? so no tacks or something
    var diffHeading = 0;
		//Check if the array is long enough to determine if there was a steady line
  	if(this.steadyCourseInterval<arrayLength){
  		diffHeading = Math.abs(((this.tempArray[this.smoothFactor].headingAverage - headingSmooth + 180 + 360 ) % 360 ) - 180); 
  		if(diffHeading>8&&speedSmooth>2)this.steady = 0;
  		else this.steady++;
			
      this.tempArray[0].steady = this.steady;
  	} 
		
		//Speed variances
		
		var speedVar = 0;
		
		if(this.racing && this.steady>=5){
			if(this.leg==="upwind"){
					this.upwindSpeed = (this.upwindSpeed*this.upwindPoints+speedSmooth)/(this.upwindPoints+1);
					this.upwindPoints++;
				speedVar = speedSmooth-this.upwindSpeed;
			}else{
				this.downwindSpeed = (this.downwindSpeed*this.downwindPoints+speedSmooth)/(this.downwindPoints+1);
					this.downwindPoints++;
				speedVar = speedSmooth - this.downwindSpeed;
			}
			
		}
		this.tempArray[0].speedVariance = speedVar;
		
  		
  	//Determine angle to wind to know if we are sailing updwin, downwind, port or starboard	
    var angleToWind = 0;
		
		//referenceWind should always be ok
		angleToWind =  ( headingSmooth - this.referenceWind + 180 + 360 ) % 360 - 180;
   // if(this.TWD<0)angleToWind =  ( headingSmooth - this.referenceWind + 180 + 360 ) % 360 - 180;
    //else angleToWind =  ( headingSmooth - this.TWD + 180 + 360 ) % 360 - 180;
  	
		
		//Which tack
	var tack = "";
  	if(angleToWind<0)tack = "stbd"; //wind blowing on starboard
  	else tack = "port";
	this.tempArray[0].tack = tack;
	if(tack!=this.tack)console.log("tack change "+this.tack+">"+tack+ " angleToWind "+angleToWind+" referenceWind "+this.referenceWind);
	this.tack = tack;
		
    if(arrayLength>(this.steadyCourseInterval+this.smoothFactor) && tack == this.tempArray[this.steadyCourseInterval+this.smoothFactor-1].tack && tack != this.tempArray[this.steadyCourseInterval+this.smoothFactor].tack && this.racing){ 
      sailing.analyseTack(tack);
    }

  	
  	
		//Which leg
  	var leg = "";
  	if(Math.abs(angleToWind)<85)leg = "upwind";
  	else if(Math.abs(angleToWind)>95) leg = "downwind";
  	else leg = this.leg;//Same as previous;
  	//else the previous is used as well.
	if(leg!=this.leg)console.log("leg change "+this.leg+">"+leg+ " angleToWind "+angleToWind+" referenceWind "+this.referenceWind);
    this.leg = leg;
  	this.tempArray[0].leg = leg;
  	
    
    
  	//TACK DETECT
    if(this.racing){
    	if(leg=="upwind"&&tack=="port"&&this.steady>=this.smoothFactor) this.upwindPort = this.tempArray[this.smoothFactor].headingAverage; //Base value for heading of legs. Set at first table course after tack
    	if(leg=="upwind"&&tack=="stbd"&&this.steady>=this.smoothFactor) this.upwindStb = this.tempArray[this.smoothFactor].headingAverage;
    	if(leg=="downwind"&&tack=="port"&&this.steady>=this.smoothFactor)  this.downwindPort = this.tempArray[this.smoothFactor].headingAverage;
    	if(leg=="downwind"&&tack=="stbd"&&this.steady>=this.smoothFactor)  this.downwindStb = this.tempArray[this.smoothFactor].headingAverage;
    }
		
	//Upwind downwind detect plus marks
  	if(this.racing&&arrayLength==this.tempArrayLength && leg!=this.tempArray[5].leg && leg===this.tempArray[4].leg){
  		console.log("GOING "+leg);
		if(this.navigation)this.findMark(this.tempArray[7]);//the delay plus dus delay of smoothfactor
  		
  	}
    
  	//layline
	  if(this.racing&&this.navigation)this.layLineDistance();
		
  	//Calc True Wind Direction
  	if(this.racing&&this.steady&&leg=="upwind"&&this.upwindStb>=0&&this.upwindPort>=0){
  		var diff = ((this.upwindPort - this.upwindStb + 180 + 360 ) % 360 ) - 180;
			var TWD = this.TWD;
				TWD = Math.round(Math.abs(360 + this.upwindStb + ( diff / 2 ) ) % 360);
      
  		
			if(this.TWD<0){
				this.referenceWind = TWD;
				this.alert = {title:"WIND SET",text:TWD,timeout:5000,timestamp:position.timestamp,lat:this.tempArray[0].lat,lon:this.tempArray[0].lon};
			}
      this.TWD = TWD;
      this.tempArray[0].TWD = this.TWD;
  	}else{
      this.tempArray[0].TWD = this.referenceWind;
    }
    
  
  	//Calc Shifts
    var shift = 0;
	
  	if(this.referenceWind>=0 && this.TWD>=0 && this.racing){
  		shift = Math.round(((this.TWD - this.referenceWind + 180 + 360)%360)-180)*2;
		
		//check for alerts
      if(Math.abs(shift)>=this.shiftAlert&&Math.abs(shift)>Math.abs(this.shift)){
        var alertText = "Header";
        if((tack=="port"&&shift<0)||(tack=="stbd"&&shift>0))alertText = "Lifter";

        this.alert = {
			title: alertText,
			text: shift,
			timeout: 5000,
			timestamp: this.tempArray[0].timestamp,
			lat:this.tempArray[0].lat,
			lon:this.tempArray[0].lon
		};
      }
	  //store it
		this.shift = shift;
		this.tempArray[0].shift = shift;
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
  findMark: function(markObject){
	  console.log("finding mark");
	  	  //Finding marks where we steered 10 degrees downwind to average angle
	  if(markObject.leg=="upwind" && this.upwindPoints>60){//find upwind mark
		  for(var j=this.tempArray.length-1;j>=5;j--){
			  var diffStb =  ( this.tempArray[j].headingSmooth - this.upwindStb + 180 + 360 ) % 360 - 180;
			  if(this.tempArray[j].leg==="upwind" && diffStb<=-10){ 
				  markObject = this.tempArray[j];
				  console.log("advanced mark detection worked "+j);
				  break;
			  }	
		  }
		  this.upwindMarks.unshift(markObject);
	  } else if (this.downwindPoints>60){//downwind
			this.downwindMarks.unshift(markObject);
		}
		
		console.log(markObject.leg+" mark:  "+JSON.stringify(markObject));
		if(this.markAlert)this.alert = {title:"MARK",text:markObject.leg,timeout:10000,timestamp:markObject.timestamp,lat:markObject.lat,lon:markObject.lon};
  },
  layLineDistance: function(){
    var bearing = 0;
    var distance = 0;
    var angle = 0;
		var diffHeadingStb =0;
		var diffHeadingPort = 0;
    
	  if(this.leg=="upwind"&&typeof this.upwindMarks[0] != 'undefined'){
		distance = this.distance(this.tempArray[0],this.upwindMarks[0]);
		bearing = this.bearing(this.tempArray[0],this.upwindMarks[0]);
		diffHeadingPort = ((this.upwindPort - bearing + 180 + 360 ) % 360 ) - 180;
		diffHeadingStb = ((bearing - this.upwindStb + 180 + 360 ) % 360 ) - 180;
		angle = Math.round(Math.abs(((bearing - this.tempArray[0].headingAverage + 180 + 360 ) % 360 ) - 180));
	  } else if(this.leg=="downwind"&&typeof this.downwindMarks[0] != 'undefined'){
		bearing = this.bearing(this.tempArray[0],this.downwindMarks[0]);
		distance = this.distance(this.tempArray[0],this.downwindMarks[0]);
		diffHeadingPort = ((bearing - this.downwindPort + 180 + 360 ) % 360 ) - 180;
		diffHeadingStb = ((this.downwindStb - bearing + 180 + 360 ) % 360 ) - 180;
		angle = Math.round(Math.abs(((bearing - this.tempArray[0].headingAverage + 180 + 360 ) % 360 ) - 180));
	  }
		
		//if((this.leg=="upwind" && angle>70 && angle<110)||(this.leg=="downwind" && angle>60 && angle<110)){ //Upwind tacks are useally 90. If sailing towards the mark, diff will be low 
		if(distance>0 && angle>30){
			if(this.tack=="port")this.layLine.distance = Math.round(Math.sin(diffHeadingStb*0.0174532)*distance);
			else this.layLine.distance = Math.round(Math.sin(diffHeadingPort*0.0174532)*distance);
			this.layLine.angle = angle;
			console.log("bearing "+bearing+" distance "+distance+" layline "+this.layLine+" angle "+angle+" anglePort "+diffHeadingPort+" angleStb "+diffHeadingStb);	
			if(this.laylineAlert && ((this.layLine.distance<200 && this.layline.distance>-100) || (this.leg=="upwind" && angle>85  && angle<100) || (this.leg=="downwind" && angle>85  && angle<100))){
				sailing.layLine.close = 1;
				this.alert = {title:"Layline",text:this.layLine.distance+"m\n"+this.layLine.angle+"°",timeout:10000,timestamp:this.tempArray[0].timestamp,lat:this.tempArray[0].lat,lon:this.tempArray[0].lon};
			}else{
				sailing.layLine.close = 0;
			}
		}
		
		
		
    
      	
  },
  bearing: function(a,b){
		var startLat = a.lat*0.0174532;
		var startLong = a.lon*0.0174532;
		var endLat = b.lat*0.0174532;
		var endLong = b.lon*0.0174532;
		
		var dLong = endLong - startLong;

		var dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
		if (Math.abs(dLong) > Math.PI){
			if 	(dLong > 0.0)dLong = -(2.0 * Math.PI - dLong);
			else dLong = (2.0 * Math.PI + dLong);
		}

		return ((Math.atan2(dLong, dPhi)/0.0174532) + 360.0) % 360.0;
	},
	distance: function(a,b){
	  var dLat = 111111*(b.lat-a.lat); 
	  var dLon = 111111*(b.lon-a.lon); 
	  return Math.round(Math.sqrt(Math.pow(dLat, 2)+Math.pow(dLon, 2)),0);
	},
	analyseTack: function(tack){
		//because after 12 points the tack should still be the same.
		//if(tack!=this.tack)return;
		var tackAngle = 0;
		
		for(var j;j<this.tempArray.length-2;j++){
			if(this.tempArray[j].steady&&this.tempArray[j].tack!=tack){
				tackAngle = Math.abs(((this.tempArray[j+2].headingAverage - this.tempArray[0].headingSmooth + 180 + 360 ) % 360 ) - 180);
				console.log("TACKangle "+tackAngle+" "+this.tempArray[j+2].headingAverage+ ">"+this.tempArray[0].headingSmooth);
			}	
		}
		
		//If no steady course was found, than just go back 29 elements
		if(tackAngle===0)tackAngle = Math.abs(((this.tempArray[this.tempArrayLength-1].headingAverage - this.tempArray[0].headingSmooth + 180 + 360 ) % 360 ) - 180);
		console.log("Tackangle "+tackAngle+" "+this.tempArray[this.tempArrayLength-1].headingAverage+ ">"+this.tempArray[0].headingSmooth);
		
		if(tackAngle<60||tackAngle>120)return;//must be a wrong tack
		else if(this.tackAlert){//Check if the users wants to see tack alerts
			sailing.alert = {
				title:"TACK",
				text:tackAngle+"°",
				timeout: 5000,
				timestamp: sailing.tempArray[0].timestamp,
				lat:this.tempArray[this.steadyCourseInterval+this.smoothFactor].lat,
				lon:this.tempArray[this.steadyCourseInterval+this.smoothFactor].lon
			};
		}
    //var overSteer = 0;
    //var distanceLost = 0;
    
  },
	analyseLeg: function(tack){
		//In the future, analyse a leg
		//distance sailed,
		//Average speed
		//number of tacks
	}
	
};

this.exports = sailing;