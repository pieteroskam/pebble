module.exports = [
	{
		"type": "heading",
		"defaultValue": "RegattaWinner Settings"
	},
	{
    "type": "text",
    "defaultValue": "In order to make the app work, make sure to set the wind and use the timer. The windangle can be 20 degrees off at maximum. The app will only work if you are in racing mode. Racing mode is enabled when the timer reaches 0. Feedback can be sent to pieteroskam@gmail.com"
  },
  {
  "type": "section",
  "items": [
		{
			"type": "slider",
			"appKey": "bowOffset",
			"defaultValue": 4,
			"label": "Distance phone to bow(meters)",
			"min": 1,
			"max": 20,
		},
		{
		  "type": "toggle",
		  "appKey": "navigation",
		  "label": "Enable mark detection and layLines",
		  "defaultValue": true
	  },
		{
		  "type": "toggle",
		  "appKey": "player",
		  "label": "Simulate race (restart app)",
		  "defaultValue": false
	  },
		{
		  "type": "toggle",
		  "appKey": "analysys",
		  "label": "Send analysys after each race",
		  "defaultValue": false
	  },
		{
			"type": "input",
			"appKey": "email",
			"defaultValue": "",
			"label": "Email Address. For sending analysys",
			"attributes": {
				"placeholder": "eg: name@domain.com",
				"type": "email"
			}
		}, 
		{
			"type": "input",
			"appKey": "user_id",
			"defaultValue": "",
			"label": "user id",
			"attributes": {
					"readonly": "readonly"
				}
		}
	]
	},{
  "type": "section",
  "items": [
		 {
        "type": "heading",
        "defaultValue": "Alerts"
      },
		{
		  "type": "toggle",
		  "appKey": "ocsAlert",
		  "label": "Alert when OCS",
		  "defaultValue": true
	  },
		{
		  "type": "toggle",
		  "appKey": "clearStartAlert",
		  "label": "Alert when clear start",
		  "defaultValue": true
	  },
		{
		  "type": "toggle",
		  "appKey": "showShiftAlert",
		  "label": "Wind Shifts. Headers/Lifters",
		  "defaultValue": true
	  },
		{
			"type": "slider",
			"appKey": "shiftAlert",
			"defaultValue": 4,
			"label": "Alert shifts greather than",
			"min": 2,
			"max": 20,
		},
		{
		  "type": "toggle",
		  "appKey": "markAlert",
		  "label": "Mark rounding detected",
		  "defaultValue": true
	  },
		{
		  "type": "toggle",
		  "appKey": "tackAlert",
		  "label": "Tack analysys",
		  "defaultValue": true
	  },
		{
		  "type": "toggle",
		  "appKey": "laylineAlert",
		  "label": "Lay Lines",
		  "defaultValue": true
	  }
		
      
		]
	},
	{
		"type": "submit",
		"defaultValue": "Save"
	}
];