
function InvLinear(AQIhigh, AQIlow, Conchigh, Conclow, a)
{
	var AQIhigh;
	var AQIlow;
	var Conchigh;
	var Conclow;
	var a;
	var c;
	c=((a-AQIlow)/(AQIhigh-AQIlow))*(Conchigh-Conclow)+Conclow;
	return c;
}
function ConcPM25(a)
	{
	if (a>=0 && a<=50)
	{
	ConcCalc=InvLinear(50,0,12,0,a);
	}
	else if (a>50 && a<=100)
	{
	ConcCalc=InvLinear(100,51,35.4,12.1,a);
	}
	else if (a>100 && a<=150)
	{
	ConcCalc=InvLinear(150,101,55.4,35.5,a);
	}
	else if (a>150 && a<=200)
	{
	ConcCalc=InvLinear(200,151,150.4,55.5,a);
	}
	else if (a>200 && a<=300)
	{
	ConcCalc=InvLinear(300,201,250.4,150.5,a);
	}
	else if (a>300 && a<=400)
	{
	ConcCalc=InvLinear(400,301,350.4,250.5,a);
	}
	else if (a>400 && a<=500)
	{
	ConcCalc=InvLinear(500,401,500.4,350.5,a);
	}
	else
	{
	ConcCalc="PM25message";
	}
	return ConcCalc;
}

function ConcPM10(a)
	{
	if (a>=0 && a<=50)
	{
	ConcCalc=InvLinear(50,0,54,0,a);
	}
	else if (a>50 && a<=100)
	{
	ConcCalc=InvLinear(100,51,154,55,a);
	}
	else if (a>100 && a<=150)
	{
	ConcCalc=InvLinear(150,101,254,155,a);
	}
	else if (a>150 && a<=200)
	{
	ConcCalc=InvLinear(200,151,354,255,a);
	}
	else if (a>200 && a<=300)
	{
	ConcCalc=InvLinear(300,201,424,355,a);
	}
	else if (a>300 && a<=400)
	{
	ConcCalc=InvLinear(400,301,504,425,a);
	}
	else if (a>400 && a<=500)
	{
	ConcCalc=InvLinear(500,401,604,505,a);
	}
	else
	{
	ConcCalc="PM10message";
	}
	return ConcCalc;
}

function ConcCO(a)
{
	if (a>=0 && a<=50)
	{
	ConcCalc=InvLinear(50,0,4.4,0,a);
	}
	else if (a>50 && a<=100)
	{
	ConcCalc=InvLinear(100,51,9.4,4.5,a);
	}
	else if (a>100 && a<=150)
	{
	ConcCalc=InvLinear(150,101,12.4,9.5,a);
	}
	else if (a>150 && a<=200)
	{
	ConcCalc=InvLinear(200,151,15.4,12.5,a);
	}
	else if (a>200 && a<=300)
	{
	ConcCalc=InvLinear(300,201,30.4,15.5,a);
	}
	else if (a>300 && a<=400)
	{
	ConcCalc=InvLinear(400,301,40.4,30.5,a);
	}
	else if (a>400 && a<=500)
	{
	ConcCalc=InvLinear(500,401,50.4,40.5,a);
	}
	else
	{
	ConcCalc="Out of Range";
	}
	return ConcCalc;
}
function ConcSO21hr(a)
{
	if (a>=0 && a<=50)
	{
	ConcCalc=InvLinear(50,0,35,0,a);
	}
	else if (a>50 && a<=100)
	{
	ConcCalc=InvLinear(100,51,75,36,a);
	}
	else if (a>100 && a<=150)
	{
	ConcCalc=InvLinear(150,101,185,76,a);
	}
	else if (a>150 && a<=200)
	{
	ConcCalc=InvLinear(200,151,304,186,a);
	}
	else
	{
	ConcCalc="Out of Range";
	}
	return ConcCalc;
}

function ConcSO224hr(a)
{
	if (a>=201 && a<=300)
	{
	ConcCalc=InvLinear(300,201,604,305,a);
	}
	else if (a>300 && a<=400)
	{
	ConcCalc=InvLinear(400,301,804,605,a);
	}
	else if (a>400 && a<=500)
	{
	ConcCalc=InvLinear(500,401,1004,805,a);
	}
	else
	{
	ConcCalc="Out of Range";
	}
	return ConcCalc;
}

function ConcOzone8hr(a)
	{
	if (a>=0 && a<=50)
	{
	ConcCalc=InvLinear(50,0,54,0,a);
	}
	else if (a>50 && a<=100)
	{
	ConcCalc=InvLinear(100,51,70,55,a);
	}
	else if (a>100 && a<=150)
	{
	ConcCalc=InvLinear(150,101,85,71,a);
	}
	else if (a>150 && a<=200)
	{
	ConcCalc=InvLinear(200,151,105,86,a);
	}
	else if (a>200 && a<=300)
	{
	ConcCalc=InvLinear(300,201,200,106,a);
	}
	else
	{
	ConcCalc="O3message";
	}
	return ConcCalc;
}

function ConcOzone1hr(a)
	{
	if (a>100 && a<=150)
	{
	ConcCalc=InvLinear(150,101,164,125,a);
	}
	else if (a>150 && a<=200)
	{
	ConcCalc=InvLinear(200,151,204,165,a);
	}
	else if (a>200 && a<=300)
	{
	ConcCalc=InvLinear(300,201,404,205,a);
	}
	else if (a>300 && a<=400)
	{
	ConcCalc=InvLinear(400,301,504,405,a);
	}
	else if (a>400 && a<=500)
	{
	ConcCalc=InvLinear(500,401,604,505,a);
	}
	else
	{
	ConcCalc="Out of Range";
	}
	return ConcCalc;
}

function ConcNO2(a)
	{
	if (a>=0 && a<=50)
	{
	ConcCalc=InvLinear(50,0,53,0,a);
	}
	else if (a>50 && a<=100)
	{
	ConcCalc=InvLinear(100,51,100,54,a);
	}
	else if (a>100 && a<=150)
	{
	ConcCalc=InvLinear(150,101,360,101,a);
	}
	else if (a>150 && a<=200)
	{
	ConcCalc=InvLinear(200,151,649,361,a);
	}
	else if (a>200 && a<=300)
	{
	ConcCalc=InvLinear(300,201,1244,650,a);
	}
	else if (a>300 && a<=400)
	{
	ConcCalc=InvLinear(400,301,1644,1245,a);
	}
	else if (a>400 && a<=500)
	{
	ConcCalc=InvLinear(500,401,2044,1645,a);
	}
	else
	{
	ConcCalc="Out of Range";
	}
	return ConcCalc;
}

function AQICategory(AQIndex)
{
	var AQI=parseFloat(AQIndex)
	var AQICategory;
	if (AQI<=50)
	{
		AQICategory="Good";
	}
	else if (AQI>50 && AQI<=100)
	{
		AQICategory="Moderate";
	}
	else if (AQI>100 && AQI<=150)
	{
		AQICategory="Unhealthy for Sensitive Groups";
	}
	else if (AQI>150 && AQI<=200)
	{
		AQICategory="Unhealthy";
	}
	else if (AQI>200 && AQI<=300)
	{
		AQICategory="Very Unhealthy";
	}
	else if (AQI>300 && AQI<=400)
	{
		AQICategory="Hazardous";
	}
	else if (AQI>400 && AQI<=500)
	{
		AQICategory="Hazardous";
	}
	else
	{
		AQICategory="Out of Range";
	}
	return AQICategory;
}
//316
