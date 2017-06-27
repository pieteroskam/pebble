var line = {
	RCB: {},
	PIN: {},
	bowOffset: Math.cos(45*0.017453)*4,
	length: 0,
	angle: 0,
	favored: "favored",
	distance: function(lat1,lon1,lat2,lon2){
	  var dLat = 111111*(lat2-lat1); 
	  var dLon = 111111*(lon2-lon1);
	  return Math.round(Math.sqrt(Math.pow(dLat, 2)+Math.pow(dLon, 2)));
    
	},
	distanceToStart: function(position){

		
		var x0 = position.lon*111111;
		var y0 = position.lat*111111;

		var x2=this.RCB.lon*111111;
		var y2=this.RCB.lat*111111;

		var x1=this.PIN.lon*111111;
		var y1=this.PIN.lat*111111;
		


		var Dx = (x2 - x1);
		var Dy = (y2 - y1);

		var numerator = Dy*x0 - Dx*y0 - x1*y2 + x2*y1;
		var denominator = Math.sqrt(Dx*Dx + Dy*Dy);
		
		if (denominator=== 0) {
			return this.distance(x1,y1,  x0,y0);
		}
		return Math.round(numerator/denominator-this.bowOffset);	
	},
	bearing: function(lat1,lon1,lat2,lon2){
		console.log("Calculating bearing");
		var startLat = lat1*0.0174532;
		var startLong = lon1*0.0174532;
		var endLat = lat2*0.0174532;
		var endLong = lon2*0.0174532;

		var dLong = endLong - startLong;

		var dPhi = Math.log(Math.tan(endLat/2.0+Math.PI/4.0)/Math.tan(startLat/2.0+Math.PI/4.0));
		if (Math.abs(dLong) > Math.PI){
		if (dLong > 0.0)
		dLong = -(2.0 * Math.PI - dLong);
		else
		dLong = (2.0 * Math.PI + dLong);
		}

		return Math.round(((Math.atan2(dLong, dPhi)/0.0174532) + 360.0) % 360.0);
	},
	setPIN: function(position){
		console.log("PIN SET");
		this.PIN.lat = position.lat;
		this.PIN.lon = position.lon;
		this.PIN.set = position.timestamp;
		this.calcLine(position.TWD);		
	},
	setRCB:function(position){
		console.log("RCB SET");
		this.RCB.lat = position.lat;
		this.RCB.lon = position.lon;
		this.RCB.set = position.timestamp;
		this.calcLine(position.TWD);
	},
	calcLine: function(TWD){
    console.log("Calculating line");
		this.length = this.distance(this.RCB.lat,this.RCB.lon,this.PIN.lat,this.PIN.lon);
        

		if(this.length>0 && this.length<2000){
			this.angle = this.bearing(this.RCB.lat,this.RCB.lon,this.PIN.lat,this.PIN.lon);
			var correctLineAngle = (TWD+270)%360; //IF it was 90 degrees to wind
			var favored = Math.round(Math.sin((correctLineAngle-this.angle)*0.0174532)*this.length);
			if(favored>=0)this.favored = "RCB:"+favored+"m";
			else this.favored = "PIN:"+Math.abs(favored)+"m";
      return "PIN:"+favored+"m";
		}else{
			console.log("No line yet");
		}
	}
};
line.calcLine();
this.exports = line;