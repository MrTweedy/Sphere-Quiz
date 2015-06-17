$('head').append('<link rel="stylesheet" href="activities/auto-segregator/style.css" type="text/css" />')

$("#message").html("");
$("#pickerL").html("");
$("#pickerR").html("");

$("#go").click(function(){generate()})
$("#seg").click(function(){seg()})

var tinyPeople = new Array();
var tinyPeopleL = new Array();
var tinyPeopleR = new Array();

var posM = 25;
var posL = 0;
var posR = 52.174;

function generate(){
	$("#pickerR").removeClass("pointer").off();
	$("#pickerL").removeClass("pointer").off();
	$("#message").html("");
	var X = 1.739;
	var Y = 10;
	tinyPeople = new Array();
	$("#holder .tiny-person").each(function(){$(this).remove()});
	for(var i = 0; i < 100; i++){
		tinyPeople.push({"sex":dice(2), "money":dice(3), "skin":dice(3), "i":i})
		var sex, money, skin;
		if(tinyPeople[i].sex == 1) sex = "male";
			else sex = "female";
		if(tinyPeople[i].money == 1) money = "rich";
			else if(tinyPeople[i].money == 2) money = "middle";
			else money = "poor";
		if(tinyPeople[i].skin == 1) skin = "blue";
			else if(tinyPeople[i].skin == 2) skin = "green";
			else skin = "red";
		$("#holder").append("<div class='tiny-person " + sex + " " + skin + " " + money + " " + "i-" + i + "' style='display:none; left:" + (posM + X) + "%; top:" + Y + "px;'></div>");
		X += 4.348;
		if(X >= 43.478){
			X = 1.739;
			Y += 25;
		}
	}
	$(".tiny-person").fadeIn(function(){
		$(this).each(function(){
			$(this).addClass("transition");
		})
	});
}
function seg(){
	closeActivity(); // Triggers next question in Sphere Quiz app.
	tinyPeopleL = new Array();
	tinyPeopleR = new Array();
	var XL = 1.739;
	var XR = 1.739
	var YL = 10;
	var YR = 10;
	var male = 0;
	var female = 0;
	var rich = 0;
	var middle = 0;
	var poor = 0;
	var blue = 0;
	var green = 0;
	var red = 0;
	for(var i = 0; i < tinyPeople.length; i++){
		if(tinyPeople[i].sex == 1) male++;
			else female++;
		if(tinyPeople[i].money == 1) rich++;
			else if(tinyPeople[i].money == 2) middle++;
			else poor++;
		if(tinyPeople[i].skin == 1) blue++;
			else if(tinyPeople[i].skin == 2) green++;
			else red++;
	}
	var difs = new Array();
	difs[0] = getDif2(male, female);
	function getDif2(e, f){
		var dif;
		var which = 0;
		dif = Math.abs(e - f);
		if(dif == 0 || dif == tinyPeople.length) dif = Infinity
		if(dif < Infinity){
			if(e > f) which = 1;
				else which = 2;
		}
		return [dif, which];
	}
	difs[1] = getDif3(blue, green, red);
	difs[2] = getDif3(rich, middle, poor);
	function getDif3(a, b, c){
		var dif, e, f, g;
		var which = 0;
		var biggest = false;
		e = Math.abs(a - (b + c));
		f = Math.abs(b - (a + c));
		g = Math.abs(c - (a + b));
		if(e == 0 || e == tinyPeople.length) e = Infinity;
		if(f == 0 || f == tinyPeople.length) f = Infinity;
		if(g == 0 || g == tinyPeople.length) g = Infinity;
		dif = Math.min(e, f, g);
		if(dif < Infinity){
			if(dif == e){
				which = 1;
				if(a > b + c) biggest = true;
			}else if(dif == f){
				which = 2;
				if(b > a + c) biggest = true;
			}else{
				which = 3;
				if(c > a + b) biggest = true;
			}
		}
		return [dif, which, biggest];
	}
	if(Math.min(difs[0][0], difs[1][0], difs[2][0]) != Infinity){
		var divideBy, enemyIs, biggest;
		switch(Math.min(difs[0][0], difs[1][0], difs[2][0])){
			case difs[0][0]: divideBy = "sex"; enemyIs = difs[0][1]; biggest = difs[0][2]; break;
			case difs[1][0]: divideBy = "skin"; enemyIs = difs[1][1]; biggest = difs[1][2]; break;
			case difs[2][0]: divideBy = "money"; enemyIs = difs[2][1]; biggest = difs[2][2]; break;
		}
		for(var i = 0; i < tinyPeople.length; i++){
			var pushRight = false
			switch(divideBy){
				case "sex": if(tinyPeople[i].sex == enemyIs) pushRight = true; break;
				case "skin": if(tinyPeople[i].skin == enemyIs) pushRight = true; break;
				case "money": if(tinyPeople[i].money == enemyIs) pushRight = true; break;
			}
			if(pushRight){
				tinyPeopleR.push(tinyPeople[i]);
				$(".i-" + tinyPeople[i].i).attr("style", "left:" + (XR + posR) + "%; top:" + YR + "px;");
				XR += 4.348;
			} else {
				tinyPeopleL.push(tinyPeople[i]);
				$(".i-" + tinyPeople[i].i).attr("style", "left:" + (XL + posL) + "%; top:" + YL + "px;");
				XL += 4.348;
			}
			if(XL >= 43.478){
				XL = 1.739;
				YL += 25;
			}
			if(XR >= 43.478){
				XR = 1.739;
				YR += 25;
			}
		}
		prepForNextSeg(divideBy, enemyIs, biggest);
	} else {
		$("#message").html("<p style='display:none'>Group does not divide unevenly. Praise these people for their solidarity and promise to protect them from all outsiders.</p>");
		$("#message p").each(function(){$(this).fadeIn()});
	}
}
function prepForNextSeg(divideBy, enemyIs, biggest){
	var message1, message2;
	if(divideBy == "sex"){
		message1 = "This group divides by sex, with XXX in the minority.";
		if(enemyIs == 1){
			message1 = message1.replace(/XXX/, "women");
			message2 = "Insinuate that the family court system has pro-female bias. Promise reform to correct this.";
		} else {
			message1 = message1.replace(/XXX/, "men");
			message2 = "Mention recent incidents of violence against women. Promise harsher punishment for men who abuse or exploit women.";
		}
	} else if(divideBy == "skin"){
		message1 = "This group divides by race, with XXX in the minority."
		if(enemyIs == 1){
			message1 = message1.replace(/XXX/, "blue");
			if(biggest) message2 = "Insinuate that other colors are envious of blue's historical prosperity. Promise to protect the blues from their envious neighbors.";
				else message2 = "Mention that blues have practiced racism in the past. Promising to protect other colors from future racism.";
		} else if(enemyIs == 2){
			message1 = message1.replace(/XXX/, "green");
			if(biggest) message2 = "Mention that greens tend to hold lower-paying jobs than the other colors. Promise to help greens get a \"fair\" chance at better jobs.";
				else message2 = "Promise to protect jobs traditionally held by blues and reds from \"unfair\" competition.";
		} else {
			message1 = message1.replace(/XXX/, "red");
			if(biggest) message2 = "Mention that the reds are recent immigrants and insinuate that this gives the other colors an unfair advantage. Promise to make green and blue society more red-friendly.";
				else message2 = "Mention crimes and vices stereotypically associated with reds and promise to crack down on them.";
		}
	} else {
		message1 = "This group divides by wealth, with the XXX in the minority.";
		if(enemyIs == 1){
			message1 = message1.replace(/XXX/, "rich");
			if(biggest) message2 = "Insinuate that the other classes want to take the rich's money. Promise to protect the rich from their envious neighbors.";
				else message2 = "Mention the advantages the rich have. Promise to ensure that all classes are \"treated fairly\".";
		} else if(enemyIs == 2){
			message1 = message1.replace(/XXX/, "middle class");
			if(biggest) message2 = "Insinuate that both rich and poor want to exploit the middle class. Promise to stop the rich from sending jobs to other planets and the poor from exctracting too much in aid.";
				else message2 = "Insinuate that recent economic troubles were caused by middle class borrowing habits. Promise banking reforms to restrain them.";
		} else {
			message1 = message1.replace(/XXX/, "poor");
			if(biggest) message2 = "Express sympathy with the plight of poor and promise to help them get their \"fair share\" of Tiny World's wealth.";
				else message2 = "Insinuate that government aid for the poor is an economic drain on other classes. Promise to prevent its growth.";
		}
	}
	if(biggest) message1 = message1.replace(/minority/, "majority");
	$("#message").html("<p style='display:none'>" + message1 + "</p><p style='display:none'>" + message2 + "</p>");
	$("#message p").each(function(){$(this).fadeIn()});
	var useWhich ="R";
	setTimeout(function(){
		$("#pickerL").addClass("pointer").click(function(){
			tinyPeople = tinyPeopleL.slice(0);
			useWhich = "L";
			recenter();
		});
		$("#pickerR").addClass("pointer").click(function(){
			tinyPeople = tinyPeopleR.slice(0);
			recenter()
		});
	}, 500);
	function recenter(){
		var containerWidth = $("#holder").width() / 100;
		if(useWhich == "L"){
			for(var i = 0; i < tinyPeopleL.length; i++){
				var I = $(".i-" + tinyPeopleL[i].i);
				I.attr("style", "left:" + (I.css("left").substr(0, I.css("left").length - 2) / containerWidth - posL + posM) + "%; top:" + I.position().top + "px;");
			}
			for(var i = 0; i < tinyPeopleR.length; i++){
				$(".i-" + tinyPeopleR[i].i).removeClass("transition").fadeOut();
			}
		} else {
			for(var i = 0; i < tinyPeopleR.length; i++){
				var I = $(".i-" + tinyPeopleR[i].i);
				I.attr("style", "left:" + (I.css("left").substr(0, I.css("left").length - 2) / containerWidth - posR + posM) + "%; top:" + I.position().top + "px;");
			}
			for(var i = 0; i < tinyPeopleL.length; i++){
				$(".i-" + tinyPeopleL[i].i).removeClass("transition").fadeOut();
			}
		}
		$("#pickerR").removeClass("pointer").off();
		$("#pickerL").removeClass("pointer").off();
		$("#message p").each(function(){$(this).fadeOut()})
	}
}
function dice(e){	
	return Math.ceil(Math.random() * e);
}